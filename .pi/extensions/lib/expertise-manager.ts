import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { BoardMessage } from "./types.js";

const EXTRACTION_PROMPT = `Du bist ein Analyst. Extrahiere aus den Beiträgen dieses Board-Members eine kompakte Zusammenfassung für sein Expertise-File.

Das Expertise-File dient als GEDÄCHTNIS: Bei zukünftigen Sessions liest der Agent sein Expertise-File und erinnert sich an frühere Positionen, Argumente und Learnings.

Extrahiere:
1. **Position**: DAFÜR / DAGEGEN / BEDINGT + ein Satz warum
2. **Kernargumente**: 2-3 Bullet Points mit den stärksten Argumenten
3. **Was ich gelernt habe**: 1-2 Sätze was der Agent aus dieser Debatte mitnimmt (neue Einsichten, revidierte Meinungen, blinde Flecken die aufgedeckt wurden)
4. **Cross-Agent**: Wo stimmte dieser Agent mit wem überein/nicht überein?

Schreibe kompakt, in der Ich-Perspektive des Agents. Max 150 Wörter total.`;

export class ExpertiseManager {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  read(expertisePath: string): string {
    const fullPath = join(this.basePath, expertisePath);
    if (!existsSync(fullPath)) return "";
    return readFileSync(fullPath, "utf-8");
  }

  async updateAfterSessionWithInsights(
    expertisePath: string,
    agentName: string,
    briefTitle: string,
    agentMessages: BoardMessage[],
    allMessages: BoardMessage[],
    sessionNotes: string,
    client: Anthropic,
    isOAuth: boolean
  ): Promise<void> {
    if (!expertisePath || agentMessages.length === 0) return;

    const fullPath = join(this.basePath, expertisePath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Extract insights via LLM
    let insights = "";
    try {
      const agentContent = agentMessages
        .map((m) => `[Runde ${m.round}]: ${m.content}`)
        .join("\n\n---\n\n");

      // Include other agents' messages for cross-agent analysis
      const otherContent = allMessages
        .filter((m) => m.from !== agentName && m.from !== "ceo")
        .map((m) => `[${m.from}, Runde ${m.round}]: ${m.content.substring(0, 300)}...`)
        .join("\n\n");

      const system = isOAuth
        ? [
            { type: "text" as const, text: "You are Claude Code, Anthropic's official CLI for Claude." },
            { type: "text" as const, text: EXTRACTION_PROMPT },
          ]
        : EXTRACTION_PROMPT;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system,
        messages: [{
          role: "user",
          content:
            `AGENT: ${agentName}\nBRIEF: ${briefTitle}\n\n` +
            `BEITRÄGE VON ${agentName}:\n${agentContent}\n\n` +
            `ANDERE BOARD MEMBERS (Kontext):\n${otherContent}`,
        }],
      });

      insights = response.content[0].type === "text" ? response.content[0].text : "";
    } catch (err) {
      console.warn(`Expertise extraction failed for ${agentName}: ${err}`);
      insights = `Position: Siehe Debate-Log\n${sessionNotes}`;
    }

    const date = new Date().toISOString().split("T")[0];
    const entry = `\n## Session ${date}: ${briefTitle}\n${insights}\n`;

    let existing = "";
    if (existsSync(fullPath)) {
      existing = readFileSync(fullPath, "utf-8");
    } else {
      existing = `# ${agentName} — Expertise\n`;
    }

    writeFileSync(fullPath, existing + entry, "utf-8");
  }

  // Legacy method for backwards compatibility / dry-run mode
  updateAfterSession(
    expertisePath: string,
    agentName: string,
    briefTitle: string,
    position: string,
    sessionNotes: string
  ): void {
    if (!expertisePath) return;

    const fullPath = join(this.basePath, expertisePath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const date = new Date().toISOString().split("T")[0];
    const entry = `\n## Session ${date}: ${briefTitle}\n- Position: ${position}\n- ${sessionNotes}\n`;

    let existing = "";
    if (existsSync(fullPath)) {
      existing = readFileSync(fullPath, "utf-8");
    } else {
      existing = `# ${agentName} — Expertise\n`;
    }

    writeFileSync(fullPath, existing + entry, "utf-8");
  }
}
