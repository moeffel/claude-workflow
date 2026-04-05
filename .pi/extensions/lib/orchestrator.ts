import type { BoardConfig, AgentDefinition, Brief, BoardMessage } from "./types.js";
import { BudgetTracker } from "./budget-tracker.js";
import { ConversationManager } from "./conversation.js";
import { ExpertiseManager } from "./expertise-manager.js";
import { extractAssumptions } from "./assumption-extractor.js";
import { runResearch } from "./researcher.js";
import { generateMemo, saveDebateLogs } from "./memo-generator.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export class Orchestrator {
  private config: BoardConfig;
  private basePath: string;
  private ceoAgent: AgentDefinition;
  private boardMembers: AgentDefinition[];
  private budget: BudgetTracker;
  private conversation: ConversationManager;
  private expertise: ExpertiseManager;
  private onStatusUpdate: (status: string) => void;
  private onBoardMessage: (agent: string, content: string, round: number) => void;
  private ui: any;
  private validatedAssumptions = new Set<string>();
  private researchContent = "";

  constructor(
    config: BoardConfig,
    basePath: string,
    ceoAgent: AgentDefinition,
    boardMembers: AgentDefinition[],
    onStatusUpdate: (status: string) => void = () => {},
    ctx?: any,
    onBoardMessage: (agent: string, content: string, round: number) => void = () => {}
  ) {
    this.config = config;
    this.basePath = basePath;
    this.ceoAgent = ceoAgent;
    this.boardMembers = boardMembers;
    this.budget = new BudgetTracker(config.meeting);
    this.conversation = new ConversationManager(config.meeting.dry_run, ctx?.modelRegistry);
    this.expertise = new ExpertiseManager(basePath);
    this.onStatusUpdate = onStatusUpdate;
    this.onBoardMessage = onBoardMessage;
    this.ui = ctx?.ui;
  }

  private async runCheckpoint(roundMessages: BoardMessage[]): Promise<string | null> {
    if (!this.ui?.confirm || !this.ui?.input) {
      return null;
    }

    const { client, isOAuth } = await this.conversation.getClientInfo();
    const assumptions = await extractAssumptions(roundMessages, this.validatedAssumptions, client, isOAuth);

    if (assumptions.length === 0) {
      this.onStatusUpdate("✓ Keine neuen Annahmen erkannt — Debate geht weiter");
      return null;
    }

    this.onStatusUpdate(`🔍 ${assumptions.length} Annahmen erkannt — User-Checkpoint`);

    const corrections: string[] = [];

    for (const assumption of assumptions) {
      const isCorrect = await this.ui.confirm(
        "Stimmt diese Annahme?",
        assumption
      );

      if (isCorrect) {
        this.validatedAssumptions.add(assumption);
      } else {
        const correction = await this.ui.input(
          "Was stimmt stattdessen?",
          "Deine Korrektur..."
        );
        if (correction) {
          corrections.push(
            `❌ Annahme: "${assumption}"\n   ✅ Korrektur: "${correction}"`
          );
        }
        this.validatedAssumptions.add(assumption);
      }
    }

    if (corrections.length === 0) {
      this.onStatusUpdate("✓ Alle Annahmen bestätigt — Debate geht weiter");
      return null;
    }

    // Auto-update profil.md with corrections
    this.appendCorrectionsToProfile(corrections);

    return (
      `⚠️ WICHTIGE KORREKTUR VOM BRIEF-AUTOR:\n\n` +
      `Die folgenden Annahmen wurden vom Autor korrigiert:\n\n` +
      corrections.map((c, i) => `${i + 1}. ${c}`).join("\n\n") +
      `\n\nBoard: Berücksichtigt diese Korrekturen ab sofort in eurer Analyse. ` +
      `Argumente die auf den falschen Annahmen aufgebaut wurden, müssen revidiert werden.`
    );
  }

  private appendCorrectionsToProfile(corrections: string[]): void {
    const profilPath = join(this.basePath, "profil.md");
    if (!existsSync(profilPath)) return;

    try {
      let content = readFileSync(profilPath, "utf-8");
      const date = new Date().toISOString().split("T")[0];
      const newCorrections = corrections
        .map((c) => `- ${c.replace(/\n\s*/g, " ")}`)
        .join("\n");

      // Append to existing WICHTIGE KORREKTUREN section or create it
      if (content.includes("## WICHTIGE KORREKTUREN")) {
        content = content.replace(
          /## WICHTIGE KORREKTUREN.*?\n/,
          `## WICHTIGE KORREKTUREN (zuletzt aktualisiert: ${date})\n`
        );
        // Find end of the section (next ## or end of file)
        const sectionStart = content.indexOf("## WICHTIGE KORREKTUREN");
        const nextSection = content.indexOf("\n## ", sectionStart + 1);
        const insertPos = nextSection === -1 ? content.length : nextSection;
        content =
          content.substring(0, insertPos) +
          `\n### Checkpoint ${date}\n${newCorrections}\n` +
          content.substring(insertPos);
      } else {
        // Add section after the header
        const firstSection = content.indexOf("\n## ");
        if (firstSection !== -1) {
          content =
            content.substring(0, firstSection) +
            `\n\n## WICHTIGE KORREKTUREN (zuletzt aktualisiert: ${date})\n${newCorrections}\n` +
            content.substring(firstSection);
        }
      }

      writeFileSync(profilPath, content, "utf-8");
      this.onStatusUpdate("📝 Profil aktualisiert mit Checkpoint-Korrekturen");
    } catch (err) {
      console.warn("Failed to update profile:", err);
    }
  }

  async run(brief: Brief): Promise<string> {
    this.onStatusUpdate("📋 Brief geladen: " + brief.title);

    // Phase 0: RESEARCH
    if (this.config.meeting.research_enabled) {
      try {
        this.onStatusUpdate("🔬 Researcher sammelt aktuelle Daten...");
        const { client, isOAuth } = await this.conversation.getClientInfo();
        const researchDir = join(this.basePath, "research");
        this.researchContent = await runResearch(
          brief, client, isOAuth, researchDir, this.onStatusUpdate,
          this.config.meeting.research_max_searches,
          this.config.meeting.research_timeout_seconds
        );
      } catch (err) {
        this.onStatusUpdate(`⚠️ Research fehlgeschlagen: ${err} — Debate startet ohne Research`);
      }
    }

    // Phase 1: FRAME
    this.onStatusUpdate("🎯 CEO framed die Entscheidung...");
    const framingPrompt = this.buildFramingPrompt(brief);

    // Phase 2: DEBATE
    this.budget.nextRound();
    let ceoMessage = framingPrompt;
    const checkpointRound = this.config.meeting.checkpoint_after_round;
    const minNewAssumptions = this.config.meeting.checkpoint_min_new_assumptions;

    while (!this.budget.getState().shouldWrapUp && !this.budget.isHardStop()) {
      this.onStatusUpdate(this.budget.formatStatus());

      const runtimeCtx = {
        briefContent: brief.content,
        timeRemaining: String(
          Math.max(0, this.config.meeting.max_duration_minutes - this.budget.getState().elapsedMinutes).toFixed(1)
        ),
        budgetRemaining: String(
          Math.max(0, this.config.meeting.max_budget_usd - this.budget.getState().spentUsd).toFixed(2)
        ),
        roundNumber: this.budget.getState().roundNumber,
        currentDate: new Date().toISOString().split("T")[0],
      };

      const { responses, totalCost } = await this.conversation.broadcast(
        this.ceoAgent,
        ceoMessage,
        this.boardMembers,
        runtimeCtx
      );

      // Live output of board responses
      for (const r of responses) {
        this.onBoardMessage(r.from, r.content, r.round);
      }

      this.budget.addCost(totalCost);

      const state = this.budget.getState();
      if (state.shouldWrapUp || this.budget.isHardStop()) {
        this.onStatusUpdate("⏰ Constraints erreicht — finale Statements...");
        ceoMessage =
          "Wir haben unsere Zeit- und Budget-Grenzen erreicht. " +
          "Bitte gebt jetzt eure finale Position ab: Ein Statement, eine klare Empfehlung. " +
          "Runde " + state.roundNumber + " war die letzte Debate-Runde.";

        await this.conversation.broadcast(
          this.ceoAgent,
          ceoMessage,
          this.boardMembers,
          runtimeCtx
        );
        break;
      }

      // User checkpoint: first after configured round, then dynamically
      if (state.roundNumber >= checkpointRound) {
        const isFirstCheckpoint = state.roundNumber === checkpointRound;
        const currentRoundMessages = this.conversation.getMessagesForRound(state.roundNumber);

        let shouldCheckpoint = isFirstCheckpoint;

        // For subsequent rounds, check if enough new assumptions warrant a checkpoint
        if (!isFirstCheckpoint) {
          const { client: chkClient, isOAuth: chkOAuth } = await this.conversation.getClientInfo();
          const newAssumptions = await extractAssumptions(currentRoundMessages, this.validatedAssumptions, chkClient, chkOAuth);
          shouldCheckpoint = newAssumptions.length >= minNewAssumptions;
        }

        if (shouldCheckpoint) {
          // First checkpoint scans all messages, subsequent only the latest round
          const messagesToScan = isFirstCheckpoint
            ? this.conversation.getMessages()
            : currentRoundMessages;

          const correction = await this.runCheckpoint(messagesToScan);
          if (correction) {
            ceoMessage = correction;
            this.budget.nextRound();
            continue;
          }
        }
      }

      this.budget.nextRound();
      const responseSummary = responses
        .map((r) => `${r.from}: ${r.content.substring(0, 200)}...`)
        .join("\n");

      ceoMessage =
        `Runde ${state.roundNumber} abgeschlossen. Zusammenfassung der Positionen:\n\n` +
        responseSummary +
        "\n\nIch sehe Spannungen zwischen den Positionen. " +
        "Geht tiefer auf die Gegenargumente ein. " +
        "Wo sind eure blinden Flecken? Was habt ihr noch nicht bedacht?";
    }

    // Phase 3: DECIDE — CEO synthesizes (actual LLM call, not copy-paste)
    this.onStatusUpdate("📝 CEO synthetisiert Memo...");
    const budgetState = this.budget.getState();
    const allMessages = this.conversation.getMessages();

    const ceoSummary = await this.synthesizeMemo(brief, allMessages);

    const debatesDir = join(this.basePath, this.config.paths.debates);
    saveDebateLogs(debatesDir, brief, allMessages, budgetState);

    const memosDir = join(this.basePath, this.config.paths.memos);
    const memoPath = generateMemo(memosDir, brief, allMessages, budgetState, ceoSummary);

    // Update expertise with LLM-extracted insights
    this.onStatusUpdate("🧠 Expertise-Files werden mit Insights aktualisiert...");
    try {
      const { client: expClient, isOAuth: expOAuth } = await this.conversation.getClientInfo();
      for (const member of this.boardMembers) {
        const agentMessages = allMessages.filter((m) => m.from === member.name);
        if (agentMessages.length > 0 && member.expertisePath) {
          await this.expertise.updateAfterSessionWithInsights(
            member.expertisePath,
            member.name,
            brief.title,
            agentMessages,
            allMessages,
            `Runden: ${budgetState.roundNumber}, Kosten: $${budgetState.spentUsd.toFixed(2)}`,
            expClient,
            expOAuth
          );
        }
      }
    } catch (err) {
      console.warn("Expertise update failed, using fallback:", err);
      for (const member of this.boardMembers) {
        if (member.expertisePath) {
          this.expertise.updateAfterSession(
            member.expertisePath,
            member.name,
            brief.title,
            "Siehe Debate-Log",
            `Runden: ${budgetState.roundNumber}, Kosten: $${budgetState.spentUsd.toFixed(2)}`
          );
        }
      }
    }

    this.onStatusUpdate(`✅ Memo erstellt: ${memoPath}`);
    return memoPath;
  }

  private buildFramingPrompt(brief: Brief): string {
    const contextStr = brief.contextFiles.length > 0
      ? "\n\nZUSÄTZLICHER KONTEXT:\n" + brief.contextFiles.join("\n---\n")
      : "";

    // Load user profile if available
    const profilPath = join(this.basePath, "profil.md");
    const profilStr = existsSync(profilPath)
      ? `\n\nPROFIL DES BRIEF-AUTORS:\n${readFileSync(profilPath, "utf-8")}`
      : "";

    // Inject research if available
    const researchStr = this.researchContent
      ? `\n\nAKTUELLE RECHERCHE-ERGEBNISSE (heute recherchiert, ${new Date().toISOString().split("T")[0]}):\n${this.researchContent}`
      : "";

    return (
      `Board, wir sind hier um eine wichtige Entscheidung zu treffen.\n\n` +
      `BRIEF: ${brief.title}\n\n` +
      `${brief.content}` +
      contextStr +
      profilStr +
      researchStr +
      `\n\nIch möchte eure ehrliche, ungeschönte Einschätzung. ` +
      `Gebt eure Position klar an (DAFÜR/DAGEGEN/BEDINGT) und begründet sie mit konkreten Argumenten. ` +
      `Scheut euch nicht vor Widerspruch — genau das brauchen wir.`
    );
  }

  /**
   * CEO synthesizes a structured memo from the full debate.
   * This is an actual Opus API call — the CEO reads ALL messages
   * and produces a decision, not a copy-paste of board stances.
   */
  private async synthesizeMemo(brief: Brief, messages: BoardMessage[]): Promise<string> {
    const { client, isOAuth } = await this.conversation.getClientInfo();

    // Build the full debate transcript for the CEO
    const transcript = messages
      .map((m) => `[Runde ${m.round}] ${m.from}:\n${m.content}`)
      .join("\n\n---\n\n");

    const synthesisPrompt =
      `Du bist der CEO. Die Board-Debate ist beendet. Lies den gesamten Debate-Verlauf und erstelle das Memo.\n\n` +
      `BRIEF: ${brief.title}\n${brief.content}\n\n` +
      `VOLLSTÄNDIGER DEBATE-VERLAUF (${messages.length} Nachrichten, ${this.budget.getState().roundNumber} Runden):\n\n` +
      `${transcript}\n\n` +
      `---\n\n` +
      `Erstelle jetzt das Memo. Halte dich EXAKT an die Memo-Struktur aus deinen Instructions:\n` +
      `1. Executive Summary (3-5 Sätze, DEINE Empfehlung)\n` +
      `2. Top 3 Empfehlungen (konkret, mit Deadlines)\n` +
      `3. Resolved Tensions (wo Konsens entstand)\n` +
      `4. Unresolved Tensions (wertvolle Disagreements)\n` +
      `5. Board Stances (Kurzform: Name | Position | 1-2 Sätze)\n` +
      `6. Trade-offs & Risiken (synthetisiert, nicht pro Mitglied)\n` +
      `7. Cognitive Bias Check (welche Biases wurden erkannt, wo, wie gegengesteuert)\n` +
      `8. Next Actions (Checkliste mit Owner + Deadline)\n\n` +
      `WICHTIG: Du FASST ZUSAMMEN. Du kopierst NICHT. Du ENTSCHEIDEST. Objektivität ist Pflicht — benenne erkannte Biases. Zielgröße: 500-900 Wörter.`;

    try {
      const model = this.ceoAgent.model || "claude-opus-4-6";
      const headers: Record<string, string> = {};
      if (isOAuth) {
        headers["anthropic-beta"] = "claude-code-20250219,oauth-2025-04-20";
      }

      this.onStatusUpdate("🧠 CEO liest Debate und synthetisiert...");

      const response = await client.messages.create(
        {
          model,
          max_tokens: 4096,
          system: this.ceoAgent.systemPrompt || "Du bist der CEO und Entscheidungsleiter.",
          messages: [{ role: "user", content: synthesisPrompt }],
        },
        isOAuth ? { headers } : undefined
      );

      const textBlock = response.content.find(
        (b): b is { type: "text"; text: string } => b.type === "text"
      );

      if (textBlock?.text) {
        this.budget.addCost(
          ((response.usage?.input_tokens || 0) * 5 + (response.usage?.output_tokens || 0) * 25) / 1_000_000
        );
        return textBlock.text;
      }
    } catch (err) {
      this.onStatusUpdate(`⚠️ CEO-Synthese fehlgeschlagen: ${err} — Fallback auf Board Stances`);
    }

    // Fallback: old behavior if synthesis fails
    return this.buildCeoSummaryFallback(messages);
  }

  /** Fallback: raw board stances if CEO synthesis API call fails */
  private buildCeoSummaryFallback(messages: BoardMessage[]): string {
    const stances = new Map<string, string>();
    for (const member of this.boardMembers) {
      const memberMsgs = messages.filter((m) => m.from === member.name);
      const lastMsg = memberMsgs[memberMsgs.length - 1];
      stances.set(member.name, lastMsg?.content || "[Keine Antwort]");
    }

    let summary = "## Board Stances (unsynthetisiert — CEO-Synthese fehlgeschlagen)\n\n";
    for (const [name, content] of stances) {
      summary += `### ${name}\n${content}\n\n`;
    }

    return summary;
  }
}
