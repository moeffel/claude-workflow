import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { AgentDefinition, AgentRef } from "./types.js";

/**
 * Parses YAML front-matter from a markdown file.
 * Format: ---\nkey: value\n---\nContent
 */
function parseFrontMatter(raw: string): {
  frontMatter: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontMatter: {}, body: raw };
  }

  const fmLines = match[1].split("\n");
  const frontMatter: Record<string, unknown> = {};
  let currentKey = "";
  let currentArray: string[] | null = null;

  for (const line of fmLines) {
    const keyValue = line.match(/^(\w[\w_]*)\s*:\s*(.*)$/);
    if (keyValue) {
      if (currentArray && currentKey) {
        frontMatter[currentKey] = currentArray;
        currentArray = null;
      }
      currentKey = keyValue[1];
      const value = keyValue[2].trim();
      if (value === "") {
        currentArray = [];
      } else {
        frontMatter[currentKey] = value;
      }
    } else if (line.match(/^\s+-\s+(.+)$/) && currentArray !== null) {
      const item = line.match(/^\s+-\s+(.+)$/)![1].trim();
      currentArray.push(item);
    }
  }
  if (currentArray && currentKey) {
    frontMatter[currentKey] = currentArray;
  }

  return { frontMatter, body: match[2] };
}

export function loadAgent(
  basePath: string,
  ref: AgentRef
): AgentDefinition {
  const agentPath = join(basePath, ref.file);
  if (!existsSync(agentPath)) {
    throw new Error(`Agent file not found: ${agentPath}`);
  }

  const raw = readFileSync(agentPath, "utf-8");
  const { frontMatter, body } = parseFrontMatter(raw);

  const expertisePath = (frontMatter.expertise as string) || "";
  let expertiseContent = "";
  if (expertisePath) {
    const fullExpertisePath = join(basePath, expertisePath);
    if (existsSync(fullExpertisePath)) {
      expertiseContent = readFileSync(fullExpertisePath, "utf-8");
    }
  }

  return {
    name: ref.name,
    model: (frontMatter.model as string) || ref.model,
    skills: (frontMatter.skills as string[]) || [],
    expertisePath,
    systemPrompt: body,
    expertiseContent,
    frontMatter,
  };
}

export function loadAllAgents(
  basePath: string,
  ceo: AgentRef,
  members: AgentRef[]
): { ceoAgent: AgentDefinition; boardMembers: AgentDefinition[] } {
  const ceoAgent = loadAgent(basePath, { ...ceo, name: "ceo" });
  const boardMembers: AgentDefinition[] = [];

  for (const member of members) {
    try {
      boardMembers.push(loadAgent(basePath, member));
    } catch (err) {
      console.warn(`Warning: Could not load agent '${member.name}': ${err}`);
    }
  }

  return { ceoAgent, boardMembers };
}

export function injectRuntimeVars(
  template: string,
  context: {
    briefContent: string;
    timeRemaining: string;
    budgetRemaining: string;
    roundNumber: number;
    expertiseContent: string;
    currentDate?: string;
  }
): string {
  return template
    .replace(/\{\{BRIEF_CONTENT\}\}/g, context.briefContent)
    .replace(/\{\{TIME_REMAINING\}\}/g, context.timeRemaining)
    .replace(/\{\{BUDGET_REMAINING\}\}/g, context.budgetRemaining)
    .replace(/\{\{ROUND_NUMBER\}\}/g, String(context.roundNumber))
    .replace(/\{\{EXPERTISE_CONTENT\}\}/g, context.expertiseContent)
    .replace(/\{\{CURRENT_DATE\}\}/g, context.currentDate || new Date().toISOString().split("T")[0]);
}
