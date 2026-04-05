# Agent Board — Multi-Agent Decision System + Claude Code Workflow

Two things in one template:

1. **Agent Board** — An Opus 4.6 CEO orchestrates 6 Sonnet 4.6 board members in adversarial debate to produce strategic decision memos. Built on [PI Agent Harness](https://github.com/badlogic/pi-mono).
2. **Claude Code Workflow** — A portable Standard Workflow (Research → Brainstorm → Plan → TDD → Review → Verify → Git) that works on CLI, Desktop, IDE, and Claude Cloud. Drop `CLAUDE.md` into any repo.

```
Brief → CEO reads → Board debates (2-10 rounds) → Memo with recommendations
```

---

## Quick Start: Agent Board

### Prerequisites

- [PI Agent Harness](https://github.com/badlogic/pi-mono) v0.62+ (`npm i -g @mariozechner/pi-coding-agent`)
- [Just](https://github.com/casey/just) task runner (`brew install just`)
- Node.js v22+
- Anthropic API key or PI OAuth login (`pi /login`)

### Setup

```bash
gh repo create my-board --template moeffel/agent-board --clone
cd my-board
npm install
```

### Run

```bash
just new-brief my-decision    # Create brief from template
# Edit ceo-agents/briefs/my-decision.md
just ceo                      # Start session → /begin
```

### Commands

```bash
just ceo              # Start CEO & Board session
just briefs           # List briefs
just new-brief NAME   # Create brief from template
just memos            # List decision memos
just roster           # Show board members
just expertise        # Show agent memory
just clean-debates    # Remove debate logs
```

---

## Quick Start: Claude Code Workflow

Use the Standard Workflow in **any repo** — no Agent Board needed.

### Option A: Setup Script

```bash
curl -sL https://raw.githubusercontent.com/moeffel/agent-board/main/docs/claude-setup.sh | bash
```

Auto-detects language/framework. Creates `CLAUDE.md` with full workflow + `.claude/settings.local.json` with open permissions.

### Option B: Copy Template

```bash
# Copy CLAUDE.md template and fill in project sections
curl -sO https://raw.githubusercontent.com/moeffel/agent-board/main/docs/CLAUDE.template.md
mv CLAUDE.template.md CLAUDE.md
mkdir -p .claude
curl -sO https://raw.githubusercontent.com/moeffel/agent-board/main/docs/settings.local.template.json
mv settings.local.template.json .claude/settings.local.json
```

### What's in the Workflow

| Step | Skills | Purpose |
|------|--------|---------|
| **0. Research** | `research-mode` → `search-first` → `docs` → `deep-research` | Find existing solutions before building |
| **1. Brainstorm** | `superpowers:brainstorming` → `spec-expander` | Mandatory before creative work |
| **2. Plan** | `superpowers:writing-plans` + **planner** agent | Structured plan with phases |
| **3. Implement** | `superpowers:executing-plans` + `tdd` | TDD: RED → GREEN → IMPROVE |
| **4. Review** | `superpowers:requesting-code-review` + language reviewer + `security-reviewer` | Quality + security |
| **5. Verify** | `superpowers:verification-before-completion` | Never "done" without this |
| **6. Git** | `superpowers:finishing-a-development-branch` | Conventional commits |

Plus: Model-Routing, Design-Routing, Cross-Model (Claude+Codex), Agent Orchestration, Debugging skills.

---

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

All agents have mandatory **cognitive bias checking**.

## Writing a Brief

```bash
just new-brief my-decision
```

Required sections:
- **Situation** — Facts, names, numbers, dates
- **Status Quo** — What you're currently doing
- **Stakes** — What's at risk, what if you do nothing
- **Constraints** — Time, budget, resources, legal
- **Key Questions** — What the board must answer

## How the Debate Works

```
1. CEO reads brief + config
2. CEO poses opening question
3. Board members respond IN PARALLEL (Sonnet 4.6)
4. CEO synthesizes, identifies disagreements
5. Follow-up round focusing on conflicts
6. Repeat until consensus OR limit reached
7. CEO writes memo: recommendation, dissent, risks, bias check, actions
```

**Budget controls**: Time (2-10 min), cost ($1-$20), rounds (2-10). All configurable in `config.yaml`.

**Dry run**: `meeting.dry_run: true` — mock responses, no API costs.

## Customization

### Add a board member

1. Create `ceo-agents/agents/my-agent.md` with front-matter (`model`, `skills`, `expertise`)
2. Write system prompt (see existing agents for structure)
3. Register in `config.yaml`
4. Create empty `ceo-agents/expertise/my-agent.md`

### Modify the debate

Edit `.pi/extensions/lib/orchestrator.ts` — parallel calls, synthesis strategy, consensus detection, escalation.

## Project Structure

```
├── CLAUDE.md                     # Project instructions + Standard Workflow
├── justfile                      # Task runner
├── package.json                  # Dependencies
├── .pi/extensions/               # PI extension (debate engine)
│   ├── ceo-board.ts              # Entry: /begin command
│   └── lib/                      # 11 TypeScript modules
├── ceo-agents/                   # Board configuration + data
│   ├── config.yaml               # Constraints, roster
│   ├── agents/                   # 7 agent prompts
│   ├── briefs/_template.md       # Brief template
│   ├── expertise/                # Persistent agent memory
│   ├── debates/                  # Session logs
│   └── memos/                    # Decision output
├── .claude/                      # Claude Code config
│   ├── settings.local.json       # Open permissions
│   ├── hooks/                    # Brief validator, budget guard
│   ├── agents/                   # Sub-agents
│   └── skills/                   # 5 domain skills
└── docs/
    ├── CLAUDE.template.md        # Universal CLAUDE.md template
    ├── claude-setup.sh           # Auto-setup script for any repo
    ├── settings.local.template.json
    ├── claude-config-template.md # Config guide
    └── pi-guide.md               # PI harness reference
```

## Dangerous Operations

| Action | Risk |
|--------|------|
| Running without budget limits | Burns API credits fast |
| `git reset --hard` | Destroys expertise + debate history |
| Deleting `ceo-agents/expertise/` | Agents lose accumulated knowledge |
| `dry_run: false` + high round limits | Expensive sessions |

## License

MIT
