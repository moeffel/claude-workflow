import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { BoardMessage, BudgetState, Brief } from "./types.js";

/**
 * Extract inline SVGs from markdown content, save as separate files,
 * and replace with image references.
 */
function extractSvgs(
  content: string,
  outputDir: string,
  baseName: string
): string {
  const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
  let index = 0;

  return content.replace(svgRegex, (svgMatch) => {
    index++;
    const svgFilename = `${baseName}_chart_${index}.svg`;
    const svgPath = join(outputDir, svgFilename);
    writeFileSync(svgPath, svgMatch, "utf-8");
    return `![Chart ${index}](./${svgFilename})`;
  });
}

export function generateMemo(
  memosDir: string,
  brief: Brief,
  messages: BoardMessage[],
  budgetState: BudgetState,
  ceoSummary: string
): string {
  if (!existsSync(memosDir)) mkdirSync(memosDir, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const baseName = `${date}_${brief.filename.replace(".md", "")}`;
  const filename = `${baseName}.md`;
  const filePath = join(memosDir, filename);

  // Extract SVGs from board member responses into separate files
  const processedSummary = extractSvgs(ceoSummary, memosDir, baseName);

  const memo =
    `# ${brief.title} — Board Memo\n\n` +
    `**Datum**: ${date}\n` +
    `**Brief**: ${brief.filename}\n` +
    `**Dauer**: ${budgetState.elapsedMinutes} Minuten | ` +
    `**Kosten**: $${budgetState.spentUsd.toFixed(2)} | ` +
    `**Runden**: ${budgetState.roundNumber}\n\n` +
    `---\n\n` +
    `${processedSummary}\n`;

  writeFileSync(filePath, memo, "utf-8");
  return filePath;
}

export function saveDebateLogs(
  debatesDir: string,
  brief: Brief,
  messages: BoardMessage[],
  budgetState: BudgetState
): string {
  const date = new Date().toISOString().split("T")[0];
  const sessionDir = join(debatesDir, `${date}_${brief.filename.replace(".md", "")}`);

  if (!existsSync(sessionDir)) mkdirSync(sessionDir, { recursive: true });

  writeFileSync(
    join(sessionDir, "conversation.json"),
    JSON.stringify(messages, null, 2),
    "utf-8"
  );

  const perAgent: Record<string, { tokens: number; cost_usd: number; turns: number }> = {};
  for (const msg of messages) {
    if (!perAgent[msg.from]) {
      perAgent[msg.from] = { tokens: 0, cost_usd: 0, turns: 0 };
    }
    perAgent[msg.from].tokens += msg.tokens;
    perAgent[msg.from].cost_usd += msg.cost_usd;
    perAgent[msg.from].turns++;
  }

  writeFileSync(
    join(sessionDir, "cost-tracking.json"),
    JSON.stringify(
      {
        session: sessionDir,
        total_cost_usd: budgetState.spentUsd,
        total_tokens: messages.reduce((sum, m) => sum + m.tokens, 0),
        duration_minutes: budgetState.elapsedMinutes,
        rounds: budgetState.roundNumber,
        per_agent: perAgent,
      },
      null,
      2
    ),
    "utf-8"
  );

  return sessionDir;
}
