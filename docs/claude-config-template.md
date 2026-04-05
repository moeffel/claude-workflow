# Claude Code — Repo-Bound Config Template

> Drop this structure into any new repo so Claude Code picks up your workflow,
> skills, hooks, and rules automatically — even on Claude Cloud (claude.ai/code).

## How It Works

```
Priorität (hoch → niedrig):
1. Projekt CLAUDE.md  (./CLAUDE.md)           ← repo-spezifisch
2. Global CLAUDE.md   (~/.claude/CLAUDE.md)   ← dein persönlicher Standard
3. Default System Prompt                      ← Claude Code built-in
```

Both CLAUDE.md files are loaded and **merged** — you don't need to duplicate content.
On **Claude Cloud**, only repo-bound config is available (`./CLAUDE.md`, `.claude/`).
The Standard Workflow below ensures it works everywhere.

## What Goes Where

### Global (`~/.claude/`) — already set up, works on every repo (CLI/Desktop only)

| Item | Path | Effect |
|------|------|--------|
| CLAUDE.md | `~/.claude/CLAUDE.md` | Workflow, Model-Routing, Cross-Model, Design-Routing |
| Settings | `~/.claude/settings.json` | Hooks, Plugins, Permissions, Env |
| Rules | `~/.claude/rules/common/` | coding-style, testing, security, agents, etc. |
| Skills | `~/.claude/skills/` | 100+ global skills (ECC, superpowers, harness, etc.) |

### Project (repo root) — for repo-specific config (works everywhere incl. Cloud)

| Item | Path | Effect |
|------|------|--------|
| CLAUDE.md | `./CLAUDE.md` | Project architecture, commands, conventions, **Standard Workflow** |
| Skills | `.claude/skills/` | Domain-specific skills |
| Hooks | `.claude/hooks/` | Project-specific validation |
| Agents | `.claude/agents/` | Custom sub-agent definitions |
| Settings | `.claude/settings.local.json` | Project permissions, overrides |

---

## Template: Full Repo Setup

### 1. `CLAUDE.md` (repo root) — with Standard Workflow

Copy and customize. The Standard Workflow section makes the global workflow portable.

```markdown
# PROJECT_NAME

One-line description of what this project does.

## Tech Stack

- **Language**: TypeScript / Python / Go / ...
- **Framework**: Next.js / FastAPI / ...
- **Database**: PostgreSQL / ...
- **Task Runner**: just / npm scripts / make

## Architecture

Brief description or ASCII diagram of key directories.

## Commands

\`\`\`bash
just dev          # Start development server
just test         # Run tests
just lint         # Lint + typecheck
\`\`\`

## Constraints

- What to NEVER do (e.g., "Never delete migrations/")
- Budget/time limits if applicable
- Required env vars

## Coding Conventions

- Language of comments/docs (DE/EN)
- File naming patterns
- Import conventions

---

## Standard Workflow

### Feature Implementation Workflow

0. **Research & Reuse** _(mandatory before any new implementation)_
   - **GitHub code search first:** Run `gh search repos` and `gh search code` to find existing implementations, templates, and patterns before writing anything new.
   - **Library docs second:** Use Context7 or primary vendor docs to confirm API behavior, package usage, and version-specific details before implementing.
   - **Exa only when the first two are insufficient:** Use Exa for broader web research or discovery after GitHub search and primary docs.
   - **Check package registries:** Search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions.
   - **Search for adaptable implementations:** Look for open-source projects that solve 80%+ of the problem and can be forked, ported, or wrapped.
   - Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.

1. **Plan First**
   - Use **planner** agent to create implementation plan
   - Generate planning docs before coding: PRD, architecture, system_design, tech_doc, task_list
   - Identify dependencies and risks
   - Break down into phases

2. **TDD Approach**
   - Use **tdd-guide** agent
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify 80%+ coverage

3. **Code Review**
   - Use **code-reviewer** agent immediately after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages using conventional commits: feat, fix, refactor, docs, test, chore, perf, ci
   - Follow `<type>: <description>` format

5. **Pre-Review Checks**
   - Verify all automated checks (CI/CD) are passing
   - Resolve any merge conflicts
   - Ensure branch is up to date with target branch
   - Only request review after these checks pass

### Model-Routing (MANDATORY)

**For ANY agent spawning or multi-model task:**
→ Default: Sonnet. Escalate to Opus only for deep reasoning. Drop to Haiku for mechanical tasks.

| Task | Model | Cost/1M (in/out) |
|------|-------|-------------------|
| Classification, extraction, summaries | Haiku 4.5 | $0.80 / $4 |
| Code generation, reviews, research | Sonnet 4.6 | $3 / $15 |
| Architecture, synthesis, root-cause | Opus 4.6 | $15 / $75 |

### Cross-Model Workflow (Claude + Codex)

**For complex implementation tasks**, use the 4-step pattern:
1. **PLAN** → Claude (Opus) writes plan in `docs/superpowers/plans/`
2. **QA REVIEW** → Codex reviews plan against real code (adds "Phase 2.5" findings)
3. **IMPLEMENT** → Claude executes phase-by-phase with test gates
4. **VERIFY** → Codex verifies implementation against plan (pass/warn/fail per phase)

### Workflow Orchestration

**When to use which loop pattern:**

| Situation | Pattern |
|-----------|---------|
| Single focused change | Sequential Pipeline (`claude -p`) |
| Interactive exploration | NanoClaw REPL (`/claw`) |
| Multi-day iterative + CI | Continuous Claude PR Loop |
| Parallel from specs | RFC-DAG (Ralphinho) with worktrees |
| Many creative variations | Infinite Agentic Loop |
| Post-implementation cleanup | De-Sloppify Pass (separate context) |

### Design-Routing (MANDATORY)

**For ANY UI/design task** (components, pages, styling, colors, typography, charts, layouts, responsive design):
→ Always invoke `design-workflow` skill FIRST
→ Flow: Brainstorm → Design System (ui-ux-pro-max) → Implement (modern-web-builder) → Review

### Coding Standards

- **Immutability**: ALWAYS create new objects, NEVER mutate existing ones
- **File Organization**: Many small files > few large files (200-400 lines typical, 800 max)
- **Error Handling**: Handle errors explicitly at every level, never silently swallow
- **Input Validation**: Validate at system boundaries, fail fast with clear messages
- **Functions**: < 50 lines, no deep nesting (> 4 levels)
- **Security**: No hardcoded secrets, parameterized queries, sanitized HTML, CSRF protection

### Agent Orchestration

Use agents proactively — no user prompt needed:

| Trigger | Agent |
|---------|-------|
| Complex feature request | **planner** |
| Code just written/modified | **code-reviewer** |
| Bug fix or new feature | **tdd-guide** |
| Architectural decision | **architect** |
| Security-sensitive code | **security-reviewer** |
| Build failure | **build-error-resolver** |

ALWAYS use **parallel** agent execution for independent operations.
```

### 2. `.claude/settings.local.json` (project permissions)

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run:*)",
      "Bash(just:*)"
    ]
  }
}
```

### 3. `.claude/skills/` (optional, domain-specific only)

Only create project skills for domain knowledge that doesn't exist globally.
Global skills (`~/.claude/skills/`) are auto-available everywhere.

```
.claude/skills/
└── my-domain-skill/
    ├── SKILL.md          # Frontmatter: name, description
    └── references/       # Supporting docs
```

### 4. `.claude/hooks/` (optional, project-specific validation)

```
.claude/hooks/
├── my-validator.py       # PostToolUse validation
└── my-guard.py           # PreToolUse guard
```

Register in `.claude/settings.local.json`:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "python3 .claude/hooks/my-validator.py" }]
      }
    ]
  }
}
```

### 5. `.claude/agents/` (optional, custom sub-agents)

```markdown
---
name: my-agent
description: One-line description
model: sonnet
---

You are a specialized agent that...
```

---

## Claude Cloud Compatibility

| Feature | CLI / Desktop | Claude Cloud |
|---------|---------------|--------------|
| `./CLAUDE.md` (incl. Standard Workflow) | Yes | Yes |
| `.claude/skills/` | Yes | Yes |
| `.claude/agents/` | Yes | Yes |
| `.claude/settings.local.json` | Yes | Yes |
| `~/.claude/CLAUDE.md` | Yes | No (local only) |
| `~/.claude/settings.json` hooks | Yes | No (no shell access) |
| `~/.claude/rules/` | Yes | No (local only) |
| MCP servers | Yes | Limited |

**For Claude Cloud**: Everything in the repo (CLAUDE.md, .claude/) works.
The Standard Workflow in CLAUDE.md ensures your process is available everywhere.
Global config (~/.claude/) does NOT sync — use a dotfiles repo to restore it.

---

## Quick Setup Script

```bash
#!/bin/bash
# Run in any new repo to scaffold Claude Code config
# Usage: bash <(curl -s URL) or copy-paste

set -e
mkdir -p .claude/{skills,hooks,agents}

# Create CLAUDE.md with Standard Workflow embedded
cat > CLAUDE.md << 'HEREDOC'
# PROJECT_NAME

## Tech Stack
- **Language**:
- **Framework**:

## Commands
```bash
# Add your commands here
```

## Constraints
- Never delete...

## Coding Conventions
- Comments in: DE / EN

---

## Standard Workflow

### Feature Implementation
0. **Research & Reuse** — GitHub search, docs, package registries before writing new code
1. **Plan First** — planner agent, break into phases
2. **TDD** — Write tests first (RED → GREEN → REFACTOR), 80%+ coverage
3. **Code Review** — code-reviewer agent after every change
4. **Commit** — Conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
5. **Pre-Review Checks** — CI green, no conflicts, branch up to date

### Model-Routing (MANDATORY)
| Task | Model |
|------|-------|
| Classification, extraction, summaries | Haiku 4.5 |
| Code generation, reviews, research | Sonnet 4.6 |
| Architecture, synthesis, root-cause | Opus 4.6 |

### Cross-Model Workflow (Claude + Codex)
1. PLAN (Claude Opus) → 2. QA REVIEW (Codex) → 3. IMPLEMENT (Claude) → 4. VERIFY (Codex)

### Design-Routing (MANDATORY)
For ANY UI task: Brainstorm → Design System (ui-ux-pro-max) → Implement (modern-web-builder) → Review

### Coding Standards
- Immutability: new objects, never mutate
- Small files (200-400 lines, max 800), small functions (< 50 lines)
- Explicit error handling, input validation at boundaries
- No hardcoded secrets, parameterized queries

### Agent Orchestration
| Trigger | Agent |
|---------|-------|
| Complex feature | planner |
| Code written | code-reviewer |
| Bug fix / new feature | tdd-guide |
| Architecture decision | architect |
| Security-sensitive code | security-reviewer |
| Build failure | build-error-resolver |

Always use parallel agent execution for independent tasks.
HEREDOC

cat > .claude/settings.local.json << 'HEREDOC'
{
  "permissions": {
    "allow": []
  }
}
HEREDOC

echo "Claude Code config scaffolded."
echo "  → Edit CLAUDE.md (replace PROJECT_NAME, add tech stack + commands)"
echo "  → Edit .claude/settings.local.json (add project permissions)"
```

---

## Dotfiles Sync (for ~/.claude/)

To make global config portable across machines:

```bash
cd ~/.claude
git init
git add CLAUDE.md settings.json rules/ skills/
# Exclude: plugins/ (installed per-machine), projects/ (memory, per-machine)
echo -e "plugins/\nprojects/\n*.log" > .gitignore
git commit -m "chore: initial claude config"
git remote add origin git@github.com:YOUR_USER/dotfiles-claude.git
git push -u origin main
```

Restore on new machine:
```bash
git clone git@github.com:YOUR_USER/dotfiles-claude.git ~/.claude
```
