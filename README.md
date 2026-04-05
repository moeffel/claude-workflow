# CEO & Board — Multi-Agent Decision System

An **Opus 4.6 CEO** orchestrates **6 Sonnet 4.6 board members** in adversarial debate to produce strategic decision memos. Built on the [PI Agent Harness](https://github.com/badlogic/pi-mono), inspired by [IndyDevDan's agentic architecture](https://agenticengineer.com/).

**Input:** A structured brief (situation, stakes, constraints, key questions).
**Output:** An actionable decision memo with bias analysis.

```
Brief → CEO reads → Board debates (2-10 rounds) → Memo with recommendations
```

## Board Members

| Agent | Role | Time Horizon |
|-------|------|-------------|
| **CEO** | Orchestrator, final decision | — |
| **Financial Realist** | Costs, opportunity costs, affordability | 1-2 years |
| **Career & Skills Advisor** | Skill building, career trajectory | 3-5 years |
| **Wellbeing Guardian** | Health, relationships, energy | Present + long-term |
| **Compounder** | Compound effects, moats, flywheels | 5-10 years |
| **Contrarian** | Blind spots, second-order effects | Cross-cutting |
| **Moonshot** | 10x thinking, paradigm shifts | Unlimited |

All agents have mandatory **cognitive bias checking** built into their system prompts.

## Prerequisites

- [PI Agent Harness](https://github.com/badlogic/pi-mono) v0.62+ (`npm i -g @mariozechner/pi-coding-agent`)
- [Just](https://github.com/casey/just) task runner (`brew install just`)
- Node.js v22+
- An Anthropic API key or PI OAuth login (`pi /login`)

## Quick Start

### 1. Use this template

Click **"Use this template"** on GitHub, or:

```bash
gh repo create my-board --template moeffel/ceo-board-template --clone
cd my-board
npm install
```

### 2. Configure your board

Edit `ceo-agents/config.yaml` to set budget, time limits, and board roster:

```yaml
meeting:
  max_time_minutes: 5
  max_budget_dollars: 5
  min_rounds: 2
  max_rounds: 5
  dry_run: false          # true = mock responses, no API costs
```

### 3. Customize agents (optional)

Each board member lives in `ceo-agents/agents/*.md` with:
- A **system prompt** defining personality, heuristics, and temperament
- **Front-matter** specifying model, skills, and expertise area

You can modify existing agents or add new ones. Register new agents in `config.yaml`.

### 4. Write a brief

```bash
just new-brief my-decision
# Edit ceo-agents/briefs/my-decision.md
```

A brief needs these sections:
- **Situation** — What's happening? Facts, names, numbers, dates.
- **Status Quo** — What are you currently doing?
- **Stakes** — What's at risk? What if you do nothing?
- **Constraints** — Time, budget, resources, legal.
- **Key Questions** — What must the board answer?

### 5. Run a session

```bash
just ceo
# Inside PI:
/begin
```

The CEO reads your brief, dispatches it to the board, and runs adversarial debate rounds until consensus or the round limit is reached. Output lands in `ceo-agents/memos/`.

## Commands

```bash
just ceo              # Start CEO & Board session (cd ceo-agents && pi)
just briefs           # List available briefs
just new-brief NAME   # Create brief from template
just memos            # List generated memos
just roster           # Show board members
just expertise        # Show agent expertise/memory
just clean-debates    # Remove debate artifacts (keeps memos)
```

## Project Structure

```
.
├── CLAUDE.md                     # Claude Code project instructions
├── justfile                      # Task runner commands
├── package.json                  # Dependencies (@anthropic-ai/sdk, yaml)
│
├── .pi/extensions/               # PI Agent Harness extension
│   ├── ceo-board.ts              # Entry point: /begin command
│   └── lib/
│       ├── types.ts              # Shared interfaces
│       ├── config-loader.ts      # Reads + validates config.yaml
│       ├── agent-loader.ts       # Parses agent markdown
│       ├── brief-parser.ts       # Validates briefs
│       ├── orchestrator.ts       # CEO debate loop (core)
│       ├── conversation.ts       # Parallel Anthropic API calls
│       ├── budget-tracker.ts     # Time/cost/round constraints
│       ├── memo-generator.ts     # Decision memo output
│       └── expertise-manager.ts  # Persistent agent memory
│
├── ceo-agents/
│   ├── config.yaml               # Board roster, constraints, paths
│   ├── agents/                   # 7 agent system prompts (markdown)
│   ├── briefs/                   # Input: decision briefs
│   │   └── _template.md          # Brief template
│   ├── expertise/                # Persistent per-agent knowledge
│   ├── debates/                  # Session logs (auto-generated)
│   └── memos/                    # Output: decision memos
│
├── .claude/                      # Claude Code configuration
│   ├── settings.local.json       # Project permissions
│   ├── hooks/                    # Brief validation, budget guard
│   ├── agents/                   # Claude Code sub-agents
│   └── skills/                   # Domain-specific skills
│
└── docs/
    ├── claude-config-template.md # Claude Code setup guide
    └── pi-guide.md               # PI harness reference
```

## How It Works

### Debate Loop

```
1. CEO reads brief + config
2. CEO formulates opening question for the board
3. All board members respond IN PARALLEL (Sonnet 4.6)
4. CEO synthesizes, identifies disagreements
5. CEO poses follow-up focusing on conflicts
6. Board responds again (round 2+)
7. Repeat until consensus OR round/budget/time limit
8. CEO writes decision memo with:
   - Recommendation
   - Dissenting opinions
   - Risk analysis
   - Bias check
   - Action items
```

### Budget Controls

Every session enforces:
- **Time limit**: 2-10 minutes (configurable)
- **Cost limit**: $1-$20 per session (configurable)
- **Round limit**: min 2, max 10

The `budget-tracker` monitors token usage per API call and stops the debate if limits are hit.

### Dry Run Mode

Set `meeting.dry_run: true` in `config.yaml` to test with mock responses (no API costs). Useful for debugging prompts and flow.

## Customization

### Add a new board member

1. Create `ceo-agents/agents/my-agent.md` with front-matter:
   ```yaml
   ---
   model: claude-sonnet-4-6
   skills: [domain-expertise]
   expertise: my-expertise-area
   ---
   ```
2. Write the system prompt (see existing agents for structure)
3. Add the agent to `config.yaml` board roster
4. Create `ceo-agents/expertise/my-agent.md` (empty, will accumulate knowledge)

### Modify the debate flow

The orchestrator lives in `.pi/extensions/lib/orchestrator.ts`. Key customization points:
- Number of parallel calls per round
- Synthesis strategy
- Consensus detection
- Escalation rules

## Claude Code Integration

This repo includes a full **Claude Code configuration** with:
- **CLAUDE.md** — Project architecture, commands, constraints, and a portable **Standard Workflow** (works on Claude Cloud too)
- **Skills** — Brief writing, board orchestration, agent personality design
- **Hooks** — Brief validation on write, budget guard on agent spawn
- **Sub-agents** — Brief analyst, memo reviewer, board member creator

See [`docs/claude-config-template.md`](docs/claude-config-template.md) for how to use this config pattern in your own repos.

## Dangerous Operations

| Action | Risk |
|--------|------|
| Running without budget limits | Burns API credits fast |
| `git reset --hard` | Destroys expertise files and debate history |
| Deleting `ceo-agents/expertise/` | Agents lose accumulated knowledge |
| Setting `dry_run: false` with high round limits | Expensive sessions |

## License

MIT
