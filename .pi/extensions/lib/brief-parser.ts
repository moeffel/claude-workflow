import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import type { Brief } from "./types.js";

export function listBriefs(briefsDir: string): string[] {
  if (!existsSync(briefsDir)) return [];
  return readdirSync(briefsDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();
}

export function parseBrief(
  briefsDir: string,
  filename: string,
  requiredSections: string[]
): Brief {
  const filePath = join(briefsDir, filename);
  const content = readFileSync(filePath, "utf-8");

  // Validate required sections
  const missing = requiredSections.filter((s) => !content.includes(s));
  if (missing.length > 0) {
    const names = missing.map((s) => s.replace("## ", "")).join(", ");
    throw new Error(`Brief "${filename}" is missing required sections: ${names}`);
  }

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : basename(filename, ".md");

  // Extract sections
  const situation = extractSection(content, "## Situation");
  const statusQuo = extractSection(content, "## Status Quo");
  const stakes = extractSection(content, "## Stakes");
  const constraints = extractSection(content, "## Constraints");
  const keyQuestions = extractSection(content, "## Key Questions");

  // Find referenced context files
  const contextFiles: string[] = [];
  const contextRefs = content.matchAll(/See:\s*\[([^\]]+\.md)\]/g);
  for (const match of contextRefs) {
    const ctxPath = join(briefsDir, match[1]);
    if (existsSync(ctxPath)) {
      contextFiles.push(readFileSync(ctxPath, "utf-8"));
    }
  }

  return {
    filename,
    title,
    content,
    sections: { situation, statusQuo, stakes, constraints, keyQuestions },
    contextFiles,
  };
}

function extractSection(content: string, heading: string): string {
  const pattern = new RegExp(
    `${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`
  );
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}
