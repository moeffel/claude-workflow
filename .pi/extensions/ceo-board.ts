import { join } from "path";
import { loadConfig } from "./lib/config-loader.js";
import { loadAllAgents } from "./lib/agent-loader.js";
import { listBriefs, parseBrief } from "./lib/brief-parser.js";
import { Orchestrator } from "./lib/orchestrator.js";

export default function (pi: any) {
  const basePath = join(process.cwd(), "ceo-agents");

  // Override system prompt via before_agent_start event
  pi.on("before_agent_start", (_event: any, _ctx: any) => {
    return {
      systemPrompt: [
        "Du bist der CEO eines strategischen Beratungsgremiums für persönliche Lebens- und Berufsentscheidungen.",
        "",
        "Dein einziger verfügbarer Befehl: /begin",
        "",
        "Dieses System ist ein ONE-SHOT Multi-Agent Entscheidungsinstrument.",
        "Du startest die Debate mit /begin, wählst einen Brief, und das Board debattiert bis ein Memo erstellt wird.",
        "",
        "Tippe /begin um zu starten.",
      ].join("\n"),
    };
  });

  // Register /begin command
  pi.registerCommand("begin", {
    description: "CEO & Board Session starten — wähle einen Brief und starte die Debate",
    handler: async (_args: string, ctx: any) => {
      try {
        // Load config
        const config = loadConfig(basePath);
        ctx.ui?.notify?.("Config geladen", "info");

        // List available briefs
        const briefsDir = join(basePath, config.paths.briefs);
        const briefFiles = listBriefs(briefsDir);

        if (briefFiles.length === 0) {
          ctx.ui?.notify?.("Keine Briefs gefunden in " + briefsDir, "error");
          return "Keine Briefs gefunden. Erstelle einen Brief in ceo-agents/briefs/";
        }

        // Let user select a brief
        let selectedFile: string;
        if (ctx.ui?.select) {
          const selected = await ctx.ui.select("Wähle einen Brief:", briefFiles);
          if (!selected) {
            return "Abgebrochen — kein Brief ausgewählt.";
          }
          selectedFile = selected;
        } else {
          // Fallback: use first brief
          selectedFile = briefFiles[0];
          console.log(`Verfügbare Briefs:\n${briefFiles.map((f: string, i: number) => `  ${i + 1}. ${f}`).join("\n")}`);
          console.log(`Auto-selected: ${selectedFile}`);
        }

        // Parse and validate brief
        const brief = parseBrief(briefsDir, selectedFile, config.brief.required_sections);
        ctx.ui?.notify?.(`Brief geladen: ${brief.title}`, "success");

        // Resolve roster: named roster > legacy members
        let activeMembers = config.board.members;
        const rosters = config.board.rosters;
        const activeRosterName = config.board.active_roster;

        if (rosters && activeRosterName) {
          if (activeRosterName === "auto" && ctx.ui?.select) {
            // Let user pick roster
            const rosterNames = Object.keys(rosters);
            const options = rosterNames.map(
              (name) => `${name} — ${rosters[name].description}`
            );
            const selected = await ctx.ui.select("Wähle ein Board-Roster:", options);
            if (selected) {
              const selectedName = selected.split(" — ")[0];
              activeMembers = rosters[selectedName].members;
              ctx.ui?.notify?.(`Roster: ${selectedName}`, "info");
            }
          } else if (rosters[activeRosterName]) {
            activeMembers = rosters[activeRosterName].members;
            ctx.ui?.notify?.(`Roster: ${activeRosterName}`, "info");
          }
        }

        // Load agents
        const { ceoAgent, boardMembers } = loadAllAgents(
          basePath,
          config.board.ceo,
          activeMembers
        );
        ctx.ui?.notify?.(
          `Board geladen: CEO + ${boardMembers.length} Members`,
          "info"
        );

        // Set status line for live tracking
        ctx.ui?.setStatus?.("ceo-board", "🏛 CEO & Board — Session aktiv");

        // Run orchestrator
        const orchestrator = new Orchestrator(
          config,
          basePath,
          ceoAgent,
          boardMembers,
          (status: string) => {
            console.log(status);
            ctx.ui?.notify?.(status, "info");
          },
          ctx,
          (agent: string, content: string, round: number) => {
            // Truncate for live display — full content is in the memo
            const preview = content.length > 600
              ? content.substring(0, 600) + "\n\n[... vollständige Antwort im Memo]"
              : content;
            console.log(`\n━━━ ${agent} (Runde ${round}) ━━━\n${preview}\n`);
          }
        );

        const memoPath = await orchestrator.run(brief);

        // Open memo in editor
        if (config.output.open_memo_in_editor) {
          try {
            const { execSync } = await import("child_process");
            execSync(`code "${memoPath}"`);
          } catch {
            console.log(`Memo erstellt: ${memoPath}`);
          }
        }

        return `✅ Board Session abgeschlossen.\nMemo: ${memoPath}`;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        ctx.ui?.notify?.(`Fehler: ${msg}`, "error");
        return `❌ Fehler: ${msg}`;
      }
    },
  });
}
