import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Brief } from "./types.js";

const QUERY_PROMPT = `Es ist {{DATE}}. Du bist ein Research-Analyst.

Leite aus diesem Brief 6-8 konkrete Web-Suchbegriffe ab die aktuelle, verifizierbare Fakten liefern.

Regeln:
- Mische englische UND deutsche Suchbegriffe
- Fokus auf: aktuelle Zahlen (2025-2026), Statistiken, Marktdaten, Trends
- Suche nach konkreten Datenpunkten die die Board-Debatte auf Fakten stützen
- Keine allgemeinen Begriffe wie "Karriere Tipps" — nur spezifische, datengetriebene Suchanfragen

Antworte NUR mit einer nummerierten Liste der Suchbegriffe, nichts anderes.`;

const COMPILE_PROMPT = `Es ist {{DATE}}. Du bist ein Research-Analyst. Kompiliere ein strukturiertes Fakten-Dokument aus den folgenden Web-Recherche-Ergebnissen.

Regeln:
- NUR verifizierbare Fakten mit Quellen-URLs
- Keine Empfehlungen, keine Meinungen, keine Interpretation
- Wenn eine Quelle widersprüchliche Daten liefert, nenne beide mit Quelle
- Datiere jeden Fakt (wann wurde er publiziert/erhoben?)
- Ignoriere irrelevante Suchergebnisse

Struktur:
## Fakten zum Thema
## Aktuelle Zahlen & Statistiken
## Relevante Entwicklungen (letzte 12 Monate)`;

interface SearchResult {
  query: string;
  results: { title: string; url: string; snippet: string }[];
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (research-agent)" },
    });
    if (!response.ok) return "";
    const text = await response.text();
    return text;
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 2000);
}

function parseDuckDuckGoResults(html: string): { title: string; url: string; snippet: string }[] {
  const results: { title: string; url: string; snippet: string }[] = [];
  // Match result links and snippets from DDG HTML
  const linkPattern = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetPattern = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  const links: { url: string; title: string }[] = [];
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const rawUrl = match[1];
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    // DDG wraps URLs in a redirect — extract the actual URL
    const urlMatch = rawUrl.match(/uddg=([^&]+)/);
    const url = urlMatch ? decodeURIComponent(urlMatch[1]) : rawUrl;
    links.push({ url, title });
  }

  const snippets: string[] = [];
  while ((match = snippetPattern.exec(html)) !== null) {
    snippets.push(match[1].replace(/<[^>]+>/g, "").trim());
  }

  for (let i = 0; i < links.length && i < 3; i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      snippet: snippets[i] || "",
    });
  }

  return results;
}

async function webSearch(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  const encoded = encodeURIComponent(query);
  const html = await fetchWithTimeout(
    `https://html.duckduckgo.com/html/?q=${encoded}`,
    5000
  );
  if (!html) return [];
  return parseDuckDuckGoResults(html);
}

async function fetchPageContent(url: string): Promise<string> {
  const html = await fetchWithTimeout(url, 5000);
  if (!html) return "";
  return extractTextFromHtml(html);
}

export async function runResearch(
  brief: Brief,
  client: Anthropic,
  isOAuth: boolean,
  outputDir: string,
  onStatus: (msg: string) => void,
  maxSearches: number = 15,
  timeoutSeconds: number = 180
): Promise<string> {
  const startTime = Date.now();
  const currentDate = new Date().toISOString().split("T")[0];

  const isTimedOut = () => (Date.now() - startTime) > timeoutSeconds * 1000;

  // Step 1: Derive search queries from brief
  onStatus("🔬 Research: Suchbegriffe werden abgeleitet...");

  const briefContext = [
    `Titel: ${brief.title}`,
    `Situation: ${brief.sections.situation}`,
    brief.sections.statusQuo ? `Status Quo: ${brief.sections.statusQuo}` : "",
    `Key Questions: ${brief.sections.keyQuestions}`,
  ].filter(Boolean).join("\n\n");

  const queryPrompt = QUERY_PROMPT.replace("{{DATE}}", currentDate);

  const system = isOAuth
    ? [
        { type: "text" as const, text: "You are Claude Code, Anthropic's official CLI for Claude." },
        { type: "text" as const, text: queryPrompt },
      ]
    : queryPrompt;

  let queries: string[] = [];
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: briefContext }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    queries = text
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 5)
      .slice(0, 8);
  } catch (err) {
    onStatus(`⚠️ Research: Suchbegriffe konnten nicht abgeleitet werden: ${err}`);
    return "";
  }

  if (queries.length === 0) return "";
  onStatus(`🔬 Research: ${queries.length} Suchbegriffe → Web-Suche läuft...`);

  // Step 2: Web search per query
  const allResults: SearchResult[] = [];
  let totalFetches = 0;

  for (const query of queries) {
    if (isTimedOut() || totalFetches >= maxSearches) break;

    const results = await webSearch(query);
    if (results.length > 0) {
      allResults.push({ query, results });
      totalFetches += results.length;
    }
  }

  onStatus(`🔬 Research: ${allResults.length} Suchen abgeschlossen, Seiten werden gelesen...`);

  // Step 3: Fetch top page contents
  const pageContents: { url: string; content: string }[] = [];

  for (const sr of allResults) {
    for (const result of sr.results) {
      if (isTimedOut() || pageContents.length >= maxSearches) break;

      const content = await fetchPageContent(result.url);
      if (content.length > 100) {
        pageContents.push({ url: result.url, content });
      }
    }
  }

  onStatus(`🔬 Research: ${pageContents.length} Seiten gelesen, Ergebnisse werden zusammengefasst...`);

  // Step 4: Compile research document
  const rawData = allResults.map((sr) => {
    const resultTexts = sr.results.map((r) => `- [${r.title}](${r.url}): ${r.snippet}`).join("\n");
    return `### Suche: "${sr.query}"\n${resultTexts}`;
  }).join("\n\n");

  const pageData = pageContents.map((p) =>
    `### ${p.url}\n${p.content.substring(0, 1500)}`
  ).join("\n\n---\n\n");

  const compilePrompt = COMPILE_PROMPT.replace("{{DATE}}", currentDate);
  const compileSystem = isOAuth
    ? [
        { type: "text" as const, text: "You are Claude Code, Anthropic's official CLI for Claude." },
        { type: "text" as const, text: compilePrompt },
      ]
    : compilePrompt;

  let researchDoc = "";
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: compileSystem,
      messages: [{
        role: "user",
        content: `BRIEF-KONTEXT:\n${briefContext}\n\n---\n\nSUCHERGEBNISSE:\n${rawData}\n\n---\n\nSEITENINHALTE:\n${pageData}`,
      }],
    });

    researchDoc = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    onStatus(`⚠️ Research: Zusammenfassung fehlgeschlagen: ${err}`);
    // Fall back to raw search results
    researchDoc = `## Rohdaten (Zusammenfassung fehlgeschlagen)\n\n${rawData}`;
  }

  // Step 5: Save research document
  const header =
    `# Research: ${brief.title}\n` +
    `**Datum**: ${currentDate}\n` +
    `**Suchbegriffe**: ${queries.join(", ")}\n` +
    `**Quellen**: ${pageContents.length} Seiten gelesen\n\n---\n\n`;

  const fullDoc = header + researchDoc;

  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  const filename = `${currentDate}_${brief.filename.replace(".md", "")}.md`;
  writeFileSync(join(outputDir, filename), fullDoc, "utf-8");

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  onStatus(`✅ Research abgeschlossen: ${queries.length} Suchen, ${pageContents.length} Seiten, ${elapsed}s`);

  return fullDoc;
}
