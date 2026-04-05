# claude-workflow

A portable **Claude Code Standard Workflow** template. Drop `CLAUDE.md` into any repo and Claude follows the full development process — on CLI, Desktop, IDE, and Claude Cloud.

## What's Inside

| File | Purpose |
|------|---------|
| `CLAUDE.md` | The workflow itself — Claude reads and follows this |
| `docs/CLAUDE.template.md` | Same workflow with fillable project sections |
| `docs/claude-setup.sh` | Auto-setup: detects language/framework, creates config |
| `docs/settings.local.template.json` | Open permissions (skip-permissions equivalent) |
| `.claude/settings.local.json` | Pre-configured open permissions |

## The Workflow

7 mandatory steps for every implementation task:

| Step | Skills | What Happens |
|------|--------|-------------|
| **0. Research** | `research-mode` → `search-first` → `docs` → `deep-research` | Find existing solutions before building |
| **1. Brainstorm** | `superpowers:brainstorming` → `spec-expander` | Generate ideas, expand spec |
| **2. Plan** | `superpowers:writing-plans` + **planner** agent | Structured plan with phases and risks |
| **3. Implement** | `superpowers:executing-plans` + `tdd` | TDD: RED → GREEN → IMPROVE, 80%+ coverage |
| **4. Review** | `superpowers:requesting-code-review` + language reviewer | Quality + security review |
| **5. Verify** | `superpowers:verification-before-completion` | Never "done" without this |
| **6. Git** | `superpowers:finishing-a-development-branch` | Conventional commits, worktrees |

Plus:
- **Model-Routing** — Haiku ($0.80) / Sonnet ($3) / Opus ($15) per task type
- **Design-Routing** — brainstorming → ui-ux-pro-max → modern-web-builder
- **Cross-Model** — Claude plans, Codex reviews, Claude implements, Codex verifies
- **Agent Orchestration** — planner, code-reviewer, tdd-guide, architect, security-reviewer
- **Debugging** — systematic-debugging, build-fix, strategic-compact

## Quick Start

### Option 1: Use as GitHub Template

Click **"Use this template"** → creates a new repo with the workflow pre-configured.

### Option 2: Setup Script (any existing repo)

```bash
curl -sL https://raw.githubusercontent.com/moeffel/claude-workflow/main/docs/claude-setup.sh | bash
```

Auto-detects language (TypeScript/Python/Go/Rust/PHP) and framework (Next.js/Vite/FastAPI/Django/Express). Creates `CLAUDE.md` + `.claude/settings.local.json`.

### Option 3: Manual Copy

```bash
curl -sO https://raw.githubusercontent.com/moeffel/claude-workflow/main/docs/CLAUDE.template.md
mv CLAUDE.template.md CLAUDE.md
mkdir -p .claude
curl -sO https://raw.githubusercontent.com/moeffel/claude-workflow/main/docs/settings.local.template.json
mv settings.local.template.json .claude/settings.local.json
```

## Permissions

The included `settings.local.json` grants full access — equivalent to `--dangerously-skip-permissions`:

```json
{
  "allow": ["Read", "Edit", "MultiEdit", "Write", "Bash(*)", "WebSearch", "WebFetch", "mcp__playwright__*"],
  "deny": ["Bash(rm -rf /)", "Bash(rm -rf ~)", "Bash(sudo rm -rf *)"]
}
```

Only catastrophic `rm -rf` and `sudo` are blocked.

## After Setup

1. Fill in the project sections at the top of `CLAUDE.md` (Tech Stack, Commands, Architecture)
2. The workflow works immediately — Claude reads the mandatory steps and follows them
3. Add `.claude/skills/` for domain-specific knowledge (optional)
4. Add `.claude/hooks/` for project-specific validation (optional)

## Works On

| Environment | CLAUDE.md | Settings | Skills/Hooks |
|-------------|-----------|----------|-------------|
| Claude Code CLI | Yes | Yes | Yes |
| Claude Desktop App | Yes | Yes | Yes |
| VS Code / JetBrains | Yes | Yes | Yes |
| Claude Cloud (claude.ai/code) | Yes | No* | Yes |

*Claude Cloud can't read `~/.claude/` (local only). That's why the workflow lives in the repo's `CLAUDE.md`.

## License

MIT
