import Anthropic from "@anthropic-ai/sdk";
import type { BoardMessage } from "./types.js";

const EXTRACTION_PROMPT = `Du bist ein Fakten-Checker. Das Board debattiert über einen Brief-Autor. Finde FAKTISCHE ANNAHMEN über den Autor die falsch sein könnten.

EXTRAHIERE NUR Annahmen die:
1. Eine konkrete, überprüfbare Behauptung über den Autor machen
2. NICHT im Brief stehen (das Board hat sie hinzugefügt/vermutet)
3. Die Empfehlung wesentlich ändern würden wenn sie falsch sind

Formuliere als direkte Du-Aussage die der Autor mit "Stimmt" oder "Stimmt nicht" beantworten kann.

GUTE Annahmen (spezifisch, überprüfbar, über den Autor):
- "Du machst CFA und AI-Skills nicht gleichzeitig sondern entweder-oder"
- "Du hast kein berufliches Netzwerk in Frankreich"
- "Du bist finanziell von deinem aktuellen Gehalt abhängig"
- "Deine Partnerin ist bereit nach Lyon zu ziehen"

IGNORIERE (nicht extrahieren):
- Marktaussagen ("AI wird X ersetzen")
- Board-Empfehlungen ("Du solltest X tun")
- Allgemeinplätze ("Karrierewechsel sind riskant")
- Was bereits im Brief steht
- Meta-Kommentare des Boards über sich selbst

Max 6 Annahmen. NUR nummerierte Liste. Bei nichts Relevantem: "KEINE".`;

/**
 * Extract assumptions using a short LLM call.
 * Falls back to empty array if the API call fails.
 */
export async function extractAssumptions(
  messages: BoardMessage[],
  alreadyValidated: Set<string> = new Set(),
  client?: Anthropic,
  isOAuth?: boolean
): Promise<string[]> {
  if (!client) return [];

  const boardContent = messages
    .filter((m) => m.from !== "CEO")
    .map((m) => `[${m.from}]: ${m.content}`)
    .join("\n\n---\n\n");

  if (boardContent.length < 100) return [];

  try {
    const system = isOAuth
      ? [
          { type: "text" as const, text: "You are Claude Code, Anthropic's official CLI for Claude." },
          { type: "text" as const, text: EXTRACTION_PROMPT },
        ]
      : EXTRACTION_PROMPT;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: boardContent }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    if (text.includes("KEINE")) return [];

    // Parse numbered list
    const assumptions = text
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, "").trim())
      .filter((line) => line.length > 10 && !alreadyValidated.has(line));

    return assumptions;
  } catch (err) {
    console.warn("Assumption extraction failed:", err);
    return [];
  }
}
