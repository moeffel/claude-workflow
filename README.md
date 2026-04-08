# claude-workflow

A portable **Claude Code Standard Workflow** template. Drop `CLAUDE.md` into any repo and Claude follows the full development process — on CLI, Desktop, IDE, and Claude Cloud.

Integrates **superpowers** + **Everything Claude Code (ECC)** skills into one coherent workflow.

## What's Inside

| File | Purpose |
|------|---------|
| `CLAUDE.md` | The workflow itself — Claude reads and follows this |
| **`setup.sh`** | **One-time plugin installer — run after cloning** |
| `docs/CLAUDE.template.md` | Same workflow with fillable project sections |
| `docs/claude-setup.sh` | Auto-setup for existing repos (creates CLAUDE.md + settings) |
| `docs/settings.local.template.json` | Open permissions (skip-permissions equivalent) |
| `.claude/settings.local.json` | Pre-configured open permissions |

## The Workflow (8 Steps)

| Step | Skills (superpowers + ECC) | What Happens |
|------|---------------------------|-------------|
| **Session Start** | **MemPalace** wake-up + git log + active plan | Load project memory, brief user on state |
| **0. Research** | `search-first` → `docs` → `deep-research` → `exa-search` | Find existing solutions before building |
| **1. Brainstorm & Spec** | `superpowers:brainstorming` → `spec-expander` → `spec-reviewer` | Generate ideas, write spec, adversarial review (KILL/FIX/SHIP) |
| **2. Plan** | `superpowers:writing-plans` + **planner** agent | Structured plan with phases and risks |
| **3. Implement** | `superpowers:executing-plans` + `tdd` + `quality-gate` | TDD: RED → GREEN → IMPROVE, auto quality checks |
| **4. Review** | `superpowers:requesting-code-review` + language reviewer + `security-reviewer` + `database-reviewer` | Quality + security + DB review |
| **5. Verify** | `superpowers:verification-before-completion` + `context-budget` | Verify completion + check token usage |
| **6. Git** | `superpowers:finishing-a-development-branch` | Conventional commits, worktrees |
| **7. Learn** | `learn` / `learn-eval` → `instinct-status` → `promote` | Extract patterns, build project instincts |
| **Session End** | **MemPalace** store decisions + state + handoff note | Persist everything for next session |

### Also Included

- **Model-Routing** — Haiku / Sonnet / Opus per task type with cost table
- **Design-Routing** — brainstorming → frontend-design → ui-ux-pro-max → frontend-patterns
- **Cross-Model** — Claude plans, Codex reviews (`/codex:review`), Claude implements, Codex verifies (`/codex:rescue`)
- **Context Management** — `strategic-compact`, `context-budget`, `save-session`, `resume-session` + **MemPalace** (persistent cross-session memory)
- **Quality & Learning** — `quality-gate`, `learn`, `instinct-status`, `promote`, `prune`, `eval`, `evolve`
- **11 Agents** — planner, code-reviewer, tdd-guide, architect, security-reviewer, build-error-resolver, database-reviewer, refactor-cleaner, doc-updater, e2e-runner, performance-optimizer
- **Multi-Agent Patterns** — `agent-harness-construction`, `claude-devfleet`, `autonomous-loops` (ECC)
- **Debugging** — `systematic-debugging`, `build-fix`, `codex:rescue`, `security-scan`

## Quick Start

### Option 1: Use as GitHub Template

Click **"Use this template"** on GitHub → creates a new repo with the workflow pre-configured. Then:

```bash
git clone https://github.com/YOUR_USER/YOUR_NEW_REPO.git
cd YOUR_NEW_REPO
bash setup.sh    # installs all plugins (superpowers, ECC, codex, ui-ux-pro-max, ...)
claude           # start working — workflow is active
```

### Option 2: Setup Script (any existing repo)

```bash
curl -sL https://raw.githubusercontent.com/moeffel/claude-workflow/main/docs/claude-setup.sh | bash
```

Auto-detects language (TypeScript/Python/Go/Rust/PHP) and framework (Next.js/Vite/FastAPI/Django/Express).

### Option 3: Manual Copy

```bash
curl -sO https://raw.githubusercontent.com/moeffel/claude-workflow/main/docs/CLAUDE.template.md
mv CLAUDE.template.md CLAUDE.md
mkdir -p .claude
curl -sO https://raw.githubusercontent.com/moeffel/claude-workflow/main/docs/settings.local.template.json
mv settings.local.template.json .claude/settings.local.json
```

## Permissions

Equivalent to `--dangerously-skip-permissions`:

```json
{
  "allow": ["Read", "Edit", "MultiEdit", "Write", "Bash(*)", "WebSearch", "WebFetch", "mcp__playwright__*"],
  "deny": ["Bash(rm -rf /)", "Bash(rm -rf ~)", "Bash(sudo rm -rf *)"]
}
```

Only catastrophic `rm -rf` and `sudo` are blocked.

## After Setup

1. Fill in project sections at the top of `CLAUDE.md` (Tech Stack, Commands, Architecture)
2. The workflow works immediately — Claude reads the mandatory steps and follows them
3. Add `.claude/skills/` for domain-specific knowledge (optional)
4. Add `.claude/hooks/` for project-specific validation (optional)

## Prerequisites

The workflow references skills from these plugins. Install them for the full experience:

| Plugin | Install | Provides |
|--------|---------|----------|
| **superpowers** | `claude plugin marketplace add obra/superpowers-marketplace` → `claude plugins install superpowers@superpowers-marketplace` | brainstorming, writing-plans, executing-plans, TDD, verification, debugging |
| **Everything Claude Code** | `claude plugins install everything-claude-code` | quality-gate, learn, instinct-status, context-budget, strategic-compact, build-fix, reviewers, agents |
| **Codex** | `claude plugins install codex` | `/codex:rescue`, `/codex:review`, `/codex:adversarial-review` |
| **ui-ux-pro-max** | `claude plugins install ui-ux-pro-max` | Design intelligence for UI tasks |
| **MemPalace** | `pip install mempalace` + `claude mcp add mempalace -- python -m mempalace.mcp_server` | Persistent cross-session memory (96.6% LongMemEval, local-first, free) |

The workflow degrades gracefully — skills that aren't installed are simply skipped.

## Works On

| Environment | CLAUDE.md | Settings | Plugins/Skills |
|-------------|-----------|----------|---------------|
| Claude Code CLI | Yes | Yes | Yes |
| Claude Desktop App | Yes | Yes | Yes |
| VS Code / JetBrains | Yes | Yes | Yes |
| Claude Cloud (claude.ai/code) | Yes | No* | Partial** |

\* Claude Cloud can't read `~/.claude/` (local). That's why the workflow lives in the repo's `CLAUDE.md`.
\*\* Plugins may not be available on Cloud. The workflow steps still guide Claude's behavior.

## License

MIT
