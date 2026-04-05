# PI Agent Harness — Vollständiger Guide

Von den Grundlagen bis zur Multi-Agent Orchestration.

---

## 1. Was ist PI?

PI ist ein **Open-Source Agent Harness** von Mario Zechner ([badlogic](https://github.com/badlogic/pi-mono)). Es ist quasi ein **programmierbares Claude Code** — du kannst alles überschreiben: System Prompts, den Agent-Loop, die UI, und sogar eigene Micro-Applikationen als Extensions bauen.

### PI vs. andere Tools

| Feature | Claude Code | Cursor | Codex CLI | **PI** |
|---------|-------------|--------|-----------|--------|
| System Prompt | Teilweise anpassbar | Nicht anpassbar | Via AGENTS.md | **Komplett überschreibbar** |
| Agent Loop | Fest | Fest | Fest | **Programmierbar (TypeScript)** |
| Multi-Agent | Subagents (isoliert) | Nein | Experimental | **Agent Teams, Chains, Widgets** |
| Custom UI | Status Lines, Hooks | Nein | Nein | **Widgets, Footer, Overlays, Themes** |
| Extensions | Hooks + Skills | Nein | Skills (TOML) | **Volle TypeScript Extension API** |
| Eigene Apps | Nicht möglich | Nein | Nein | **Micro-Applications als Extensions** |

**Kern-Philosophie**: "There are many coding agents, but this one is mine." — PI passt sich deinem Workflow an, nicht umgekehrt.

---

## 2. Installation

### Voraussetzungen
- **Node.js** v18+ (empfohlen: v25+)
- **npm** (kommt mit Node)
- Optional: **Bun** (schnellerer Runtime)

### Installation
```bash
npm install -g @mariozechner/pi-coding-agent
```

### Überprüfung
```bash
which pi        # Sollte Pfad zeigen
pi --version    # Aktuelle Version (z.B. 0.62.0)
```

### API Key einrichten
```bash
# Option 1: Environment Variable (empfohlen)
export ANTHROPIC_API_KEY=sk-ant-...

# Option 2: In .zshrc / .bashrc dauerhaft setzen
echo 'export ANTHROPIC_API_KEY=sk-ant-...' >> ~/.zshrc

# Option 3: OAuth Login innerhalb von PI
pi
/login  # Provider auswählen
```

### Unterstützte Provider
PI unterstützt viele LLM-Anbieter:
- **Anthropic** (Claude) — Primär für dieses Projekt
- **OpenAI** (GPT)
- **Google** (Gemini)
- **xAI** (Grok)
- **Groq**, **Cerebras** — Schnelle Inference
- **OpenRouter** — Gateway zu vielen Modellen
- Jeder OpenAI-kompatible Endpoint

---

## 3. Erste Schritte

### PI starten
```bash
pi                    # Interaktive Session starten
pi -c                 # Letzte Session fortsetzen
pi -r                 # Vergangene Sessions durchsuchen
pi --no-session       # Ephemeral Mode (nichts wird gespeichert)
pi --print "Frage"    # Nicht-interaktiv, Ausgabe direkt
```

### Verzeichnisstruktur

PI sucht Konfiguration in zwei Orten:

```
~/.pi/agent/              # Globale Konfiguration (für alle Projekte)
├── extensions/           # Globale Extensions
├── skills/               # Globale Skills
├── prompts/              # Globale Prompt Templates
└── themes/               # Globale Themes

.pi/                      # Projekt-spezifisch (im Arbeitsverzeichnis)
├── extensions/           # Projekt-Extensions
├── skills/               # Projekt-Skills
├── prompts/              # Projekt-Prompts
└── themes/               # Projekt-Themes
```

**Priorität**: Projekt-Konfiguration überschreibt globale.

### Built-in Tools
PI kommt mit 4 grundlegenden Tools:
1. **read** — Dateien lesen
2. **write** — Dateien schreiben
3. **edit** — Dateien bearbeiten
4. **bash** — Shell-Befehle ausführen

Alles darüber hinaus kommt durch Extensions, Skills oder MCP-Server.

### Sessions
PI hat ein mächtiges Session-System:
- **Branching**: Sessions können verzweigen (wie Git-Branches)
- **Navigation**: Zwischen Branches wechseln
- **Compaction**: Lange Sessions werden automatisch komprimiert
- **Persistenz**: Alles wird gespeichert, fortgesetzt mit `pi -c`

---

## 4. Konfiguration

### Provider wechseln
```bash
# In einer PI-Session:
/model anthropic/claude-sonnet-4-6    # Zu Sonnet wechseln
/model openai/gpt-5.4                # Zu GPT wechseln
/model google/gemini-3.1-pro         # Zu Gemini wechseln
```

### Skills installieren
Skills sind "On-demand Capability Packages":

```bash
# Skills aus einem Git-Repo installieren
# Einfach den Ordner nach .pi/skills/ kopieren

# Oder PI Skills von Mario Zechner:
git clone https://github.com/badlogic/pi-skills.git
cp -r pi-skills/youtube-transcript .pi/skills/
```

Skills werden mit `/skill:name` aufgerufen oder automatisch vom Agent erkannt.

### Prompt Templates
Wiederverwendbare Prompts in `.pi/prompts/`:

```markdown
<!-- .pi/prompts/analyze.md -->
Analysiere die folgende Datei auf Sicherheitslücken:
@{{file}}
Fokussiere auf OWASP Top 10.
```

Aufruf: `/analyze` in der PI-Session.

### Themes
CSS-basierte Themes in `.pi/themes/`:
- Anpassbare Farben, Fonts, Layout
- Hot-Reload Support
- Wechsel mit `/theme name`

---

## 5. Extensions (Mittelstufe)

Extensions sind das Herzstück von PI — TypeScript-Module die PIs Verhalten komplett verändern können.

### Erste Extension (Hello World)

```typescript
// .pi/extensions/hello.ts
export default function (pi: ExtensionAPI) {
  pi.registerCommand("hello", {
    description: "Sagt Hallo",
    handler: async (args, ctx) => {
      return "Hallo von meiner ersten PI Extension!";
    }
  });
}
```

Speichern → PI neu starten → `/hello` eingeben.

### Tools registrieren

```typescript
export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "calculate-budget",
    description: "Berechnet verbleibendes Budget für die Session",
    parameters: {
      type: "object",
      properties: {
        spent: { type: "number", description: "Bereits ausgegebener Betrag" }
      },
      required: ["spent"]
    },
    handler: async (args, ctx) => {
      const remaining = MAX_BUDGET - args.spent;
      return { remaining, percentage: (remaining / MAX_BUDGET * 100).toFixed(1) };
    }
  });
}
```

Das Modell kann jetzt `calculate-budget` als Tool aufrufen.

### Events abfangen

```typescript
export default function (pi: ExtensionAPI) {
  // Vor jeder Tool-Ausführung
  pi.on("tool_call", async (event, ctx) => {
    console.log(`Tool aufgerufen: ${event.tool_name}`);
    // Blockieren wenn gefährlich:
    if (event.tool_name === "bash" && event.args.command.includes("rm -rf")) {
      return { blocked: true, reason: "Gefährlicher Befehl blockiert!" };
    }
  });

  // Nach jeder Modell-Nachricht
  pi.on("message", async (event, ctx) => {
    // Conversation loggen
    appendToLog(event);
  });

  // Am Ende eines Turns
  pi.on("turn_end", async (event, ctx) => {
    // Constraints prüfen
    if (isOverBudget()) {
      injectMessage("Budget überschritten — bitte abschließen.");
    }
  });
}
```

### System Prompt überschreiben

```typescript
export default function (pi: ExtensionAPI) {
  pi.setSystemPrompt(`
    Du bist der CEO eines strategischen Beratungsgremiums.
    Du kontrollierst die Diskussion und triffst finale Entscheidungen.

    Deine einzige verfügbare Aktion: /begin

    Du bist KEIN Coding-Agent. Du bist ein Entscheidungsträger.
  `);
}
```

**Das ist der Schlüssel**: Du kannst PI komplett umfunktionieren. Es muss kein Coding-Agent sein.

### UI anpassen

```typescript
export default function (pi: ExtensionAPI) {
  // Custom Footer mit Live-Daten
  pi.setFooter(() => {
    return `Budget: $${spent}/$${max} | Zeit: ${elapsed}m/${limit}m | Runde: ${round}`;
  });

  // Widget hinzufügen
  pi.addWidget({
    type: "progress",
    label: "Board Responses",
    value: respondedCount,
    max: totalMembers
  });

  // Editor komplett ersetzen (für One-Shot-Systeme)
  pi.replaceEditor(() => {
    return "CEO & Board — Strategisches Entscheidungssystem\nNur Befehl: /begin";
  });
}
```

---

## 6. Multi-Agent Orchestration (Fortgeschritten)

Hier wird es spannend — PI's größter Vorteil gegenüber Claude Code.

### Pattern 1: Agent Teams (Dispatcher)

Ein Dispatcher-Agent verteilt Arbeit an Spezialisten:

```
CEO (Dispatcher)
├─→ Revenue Agent      ──→ Finanzielle Perspektive
├─→ Technical Architect ──→ Technische Machbarkeit
├─→ Compounder         ──→ Langfristiger Vorteil
├─→ Product Strategist ──→ Markt & Kunden
├─→ Contrarian         ──→ Gegenargumente
└─→ Moonshot           ──→ 10x-Denkweise
```

Implementation:
- Teams in Config definieren
- Custom `converse` Tool registrieren
- CEO sendet Nachrichten an Board Members
- Alle antworten parallel
- Extension sammelt Antworten und gibt sie an CEO

### Pattern 2: Agent Chains (Sequential)

Output eines Agents wird Input des nächsten:

```
Analyst → Strategist → Writer → Reviewer
```

```typescript
// $INPUT = Output des vorherigen Agents
// $ORIGINAL = Ursprünglicher User-Prompt
pi.registerCommand("chain", {
  handler: async (args, ctx) => {
    let input = args;
    for (const agent of chain) {
      input = await runAgent(agent, input);
    }
    return input;
  }
});
```

### Pattern 3: Subagent Widgets (Background)

Agents laufen im Hintergrund mit Live-Updates:

```typescript
pi.addWidget({
  type: "agent-status",
  agents: [
    { name: "Revenue", status: "thinking", progress: 60 },
    { name: "Moonshot", status: "done", progress: 100 }
  ]
});
```

### Das CEO & Board Pattern (Unser Projekt!)

Kombination aus Agent Teams + Constraints:

1. **CEO** (Opus 4.6) ist der Dispatcher
2. **6 Board Members** (Sonnet 4.6) sind Spezialisten
3. **Broadcast Mode**: CEO → Alle, Alle → CEO
4. **Constraint Engine**: Zeit + Budget prüfen nach jedem Turn
5. **Expertise Accumulation**: Jeder Agent lernt über Sessions

```
Brief Input
  ↓
CEO liest Brief + Kontext
  ↓
CEO framed Entscheidung → Broadcast an Board
  ↓
Board debattiert (parallel, mehrere Runden)
  ↓
[Constraint Check: Zeit? Budget?]
  ↓
CEO: "Finale Statements bitte"
  ↓
Board gibt finale Positionen
  ↓
CEO erstellt Memo (SVG + Empfehlungen + Stances)
  ↓
Memo Output (+ optional TTS Summary)
```

### Broadcast vs. Backroom

**Broadcast** (Default): Jeder sieht alles. Transparent, einfach.

**Backroom** (Fortgeschritten): Agents können privat kommunizieren:
- Revenue + Contrarian stresstesten Annahmen
- Compounder + Moonshot finden Mittelweg
- Ergebnisse werden dem Board präsentiert

---

## 7. Agent Expertise (Fortgeschritten)

Die dritte große Innovation neben 1M Context und Custom Harness.

### Was ist Expertise?

**Expertise ≠ Memory**. Memory ist vage ("merke dir X"). Expertise ist **strukturiertes Domänenwissen** + **Patterns** zu einem spezifischen Thema.

```markdown
# Revenue Agent — Expertise

## Session Notes
- 2026-03-25: Acquisition Brief — Positon ACCEPT bei $12M/11x ARR.
  Grund: 5 Quartale decelerating growth, $12M ist exzellent.
- 2026-03-26: FDA Warning Brief — Position CONDITIONAL.
  Erst Compliance fixen, dann Umsatz-Impact bewerten.

## Cross-Agent Observations
- Compounder und ich sind fast immer uneins (90-Tage vs. Multi-Jahr)
- Moonshot hat manchmal gute Ideen, lehnt aber zu reflexhaft ab
- Technical Architect ist mein zuverlässigster Verbündeter bei pragmatischen Entscheidungen

## Domain Patterns
- Bei Acquisition Offers: Immer declining growth als Signal gewichten
- Regulatorische Risiken: Erst Compliance, dann Revenue-Optimierung
- Churn > 5% macht jede Wachstumsstrategie fragwürdig
```

### Warum das funktioniert
- 1M Context Window erlaubt riesige Expertise-Files (10K+ Tokens)
- Nach 20 Briefs werden Agents zu echten Domänen-Experten DEINES Business
- Agents entwickeln "Beziehungen" — wissen wer wann zustimmt/widerspricht
- Spezialisierung compoundiert über Zeit

### Best Practices
1. Expertise-Files nach JEDER Session aktualisieren (im Agent-Workflow eingebaut)
2. Structured Sections: Session Notes, Cross-Agent Observations, Domain Patterns
3. Nicht alles speichern — nur was für zukünftige Entscheidungen relevant ist
4. Expertise-Files NIEMALS löschen (im Damage Control schützen)

---

## 8. Damage Control & Safety

### Regeln definieren

```yaml
# .pi/damage-control-rules.yaml
blocked_patterns:
  - "rm -rf"
  - "git reset --hard"
  - "git push --force"
  - "DROP TABLE"
  - "DELETE FROM"

read_only_paths:
  - ".env"
  - "~/.ssh/"
  - "*.key"

no_delete_paths:
  - "ceo-agents/expertise/"
  - "ceo-agents/memos/"
  - "ceo-agents/config.yaml"
```

### Implementation via Extension

```typescript
pi.on("tool_call", async (event, ctx) => {
  if (event.tool_name === "bash") {
    for (const pattern of blockedPatterns) {
      if (event.args.command.includes(pattern)) {
        return { blocked: true, reason: `Blockiert: ${pattern}` };
      }
    }
  }
});
```

### Budget-Limits

```typescript
let totalSpent = 0;
pi.on("message", async (event, ctx) => {
  totalSpent += event.cost || 0;
  if (totalSpent > config.meeting.max_budget_usd) {
    injectMessage("Budget-Limit erreicht. Bitte Session beenden.");
  }
});
```

---

## 9. Best Practices

### Spezialisierung > Generalisierung
"If you're not building specialized agents, you're in the normal distribution of what everyone is getting." — IndyDevDan

### Templated Engineering
Wenn du etwas einmal machst, mach es zum Template:
- Brief Templates → Konsistente Qualität
- Agent Templates → Schnelle neue Board Members
- Memo Templates → Standardisierte Outputs

### Observability
```
ceo-agents/debates/
├── conversation.json       # Vollständige Konversation
├── tool-use.json          # Alle Tool-Aufrufe
├── cost-tracking.json     # Token & Kosten pro Agent
└── svgs/                  # Visuelle Argumente
```

Wenn du es nicht misst, kannst du es nicht verbessern.

### Just Task Runner
```bash
# just installieren (falls nicht vorhanden)
brew install just

# Alias setzen
echo 'alias j="just"' >> ~/.zshrc

# Dann einfach:
j ceo          # CEO & Board starten
j new-brief x  # Neues Brief erstellen
j roster       # Board Members anzeigen
```

---

## 10. Referenzen

- **PI Monorepo**: [github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono)
- **PI Skills**: [github.com/badlogic/pi-skills](https://github.com/badlogic/pi-skills)
- **PI vs Claude Code**: [github.com/disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code)
- **npm Package**: [@mariozechner/pi-coding-agent](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- **IndyDevDan**: [agenticengineer.com](https://agenticengineer.com/) | [YouTube @IndyDevDan](https://youtube.com/@IndyDevDan)
- **PI Extension Docs**: `pi-mono/docs/extensions.md`
- **PI Providers**: `pi-mono/docs/providers.md`
