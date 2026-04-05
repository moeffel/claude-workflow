# PI CEO AGENTS

A **CEO & Board Multi-Agent Decision-Making System** built on the [PI Agent Harness](https://github.com/badlogic/pi-mono). Based on [IndyDevDan's architecture](https://agenticengineer.com/).

## What This Is

An Opus 4.6 CEO agent orchestrates 6 Sonnet 4.6 board members in adversarial debate to produce strategic decision memos for **any type of decision** — career, business, investment, technology, strategy, personal life. All decisions are held to an objectivity standard with mandatory cognitive bias checking. Input: structured briefs. Output: actionable memos with bias analysis.

## Tech Stack

- **Runtime**: PI Agent Harness v0.62.0 (`@mariozechner/pi-coding-agent`)
- **Language**: TypeScript (modular PI extension)
- **LLM API**: `@anthropic-ai/sdk` (direct API calls for parallel board responses)
- **Config Parsing**: `yaml` (npm)
- **Task Runner**: [Just](https://github.com/casey/just) (`j ceo`)
- **Models**: Opus 4.6 (CEO), Sonnet 4.6 (Board Members)
- **Node**: v25.8.0

## Architecture

```
.pi/extensions/
├── ceo-board.ts              ← Entry point: /begin command
└── lib/
    ├── types.ts              ← Shared interfaces
    ├── config-loader.ts      ← Reads + validates config.yaml
    ├── agent-loader.ts       ← Parses agent markdown + front-matter
    ├── brief-parser.ts       ← Validates briefs, extracts sections
    ├── orchestrator.ts       ← CEO debate loop (HERZSTÜCK)
    ├── conversation.ts       ← Parallel Anthropic API calls + dry-run
    ├── budget-tracker.ts     ← Time/cost/round constraints
    ├── memo-generator.ts     ← Memo + debate log output
    └── expertise-manager.ts  ← Persistent agent memory
```

```
ceo-agents/
├── config.yaml    # Constraints, board roster, paths
├── agents/        # 7 agent system prompts (DE, markdown + front-matter)
├── briefs/        # Input (structured markdown)
├── debates/       # Per-session: conversation.json, cost-tracking.json
├── memos/         # Output: decision memos
└── expertise/     # Persistent per-agent knowledge
```

## Commands

```bash
just ceo              # cd ceo-agents && pi → then /begin
pi                    # Start PI interactive
pi -c                 # Continue last session
just briefs           # List available briefs
just new-brief NAME   # Create brief from template
just roster           # Show board members
```

## Constraints (config.yaml)

- **Time**: 2-10 minutes per session
- **Budget**: $1-$20 per session
- **Rounds**: min 2, max 10
- **Brief validation**: Must have Situation, Stakes, Constraints, Key Questions
- **Dry Run**: `meeting.dry_run: true` — mock responses, no API costs

## Board Members

| Agent | Role | Zeithorizont |
|-------|------|-------------|
| CEO | Orchestrator, final decision | — |
| Financial Realist | Kosten, Opportunitätskosten, Leistbarkeit | 1-2 Jahre |
| Career & Skills Advisor | Skill-Aufbau, Karriere-Trajektorie | 3-5 Jahre |
| Wellbeing Guardian | Gesundheit, Beziehungen, Energie | Gegenwart + langfristig |
| Compounder | Zinseszins-Effekt, Moats, Flywheels | 5-10 Jahre |
| Contrarian | Blinde Flecken, Second-Order Effects | Quer zu allen |
| Moonshot | 10x-Denken, Paradigmenwechsel | Unbegrenzt |

## Dangerous Commands

- Running without budget constraints burns API credits fast
- Never remove time/budget limits from config.yaml
- `git reset --hard` destroys expertise files and debate history
- Never delete `ceo-agents/expertise/` — agents lose accumulated knowledge

## Coding Conventions

- Agent system prompts: German, custom front-matter (`model`, `skills`, `expertise`)
- System prompt structure: Purpose → Variables → Instructions → Temperament → Heuristics → Workflow → Report
- Extension code: English TypeScript, modular in `.pi/extensions/lib/`
- Briefs: German, required sections enforced by brief-parser
- All repeatable commands in `justfile`
- Config paths are relative to `ceo-agents/` (basePath)
