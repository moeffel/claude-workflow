# claude-workflow

Template repo for the Claude Code Standard Workflow. Drop into any project.

## Tech Stack

- **Type**: Configuration template (no runtime code)
- **Target**: Any Claude Code project (CLI, Desktop, IDE, Cloud)

## What This Contains

- `CLAUDE.md` — this file, with the full Standard Workflow
- `docs/CLAUDE.template.md` — same workflow as a fillable project template
- `docs/claude-setup.sh` — auto-setup script for any repo
- `docs/settings.local.template.json` — open permissions config
- `.claude/settings.local.json` — permissions for this repo

---

## Standard Workflow

Follow this workflow for ALL implementation tasks. Each step is mandatory unless explicitly skipped by the user.

### Step 0: Research & Reuse (before writing ANY new code)

Search for existing solutions before building. Use in this order:
1. `research-mode` → `search-first` — GitHub code search, existing implementations
2. `docs` / Context7 — Library docs, API behavior
3. `deep-research` → `exa-search` — Broader web research only if 1+2 insufficient
4. Check package registries (npm, PyPI, crates.io) — prefer battle-tested libraries

### Step 1: Brainstorm (mandatory before creative work)

1. Invoke `superpowers:brainstorming`
2. Then `spec-expander` (always AFTER brainstorming)
3. Optionally `spec-reviewer` for adversarial review

### Step 2: Plan

1. Invoke `superpowers:writing-plans`
2. Use **planner** agent to create implementation plan with phases, dependencies, risks
3. Plan goes to `docs/superpowers/plans/`

### Step 3: Implement

1. Invoke `superpowers:executing-plans`
2. Use `superpowers:subagent-driven-development` for parallel independent tasks
3. TDD is mandatory: `superpowers:test-driven-development` / `tdd`
   - RED: Write test first, verify it fails
   - GREEN: Write minimal implementation to pass
   - IMPROVE: Refactor, verify 80%+ coverage

### Step 4: Review

1. Invoke `superpowers:requesting-code-review`
2. Use language-specific reviewer: `python-reviewer` / `typescript-reviewer` / `go-reviewer` / `rust-reviewer`
3. Use `security-reviewer` when touching auth, user input, DB queries, API endpoints, crypto, payments

### Step 5: Verify

1. Invoke `superpowers:verification-before-completion` + `verify`
2. Never say "done" without running this step

### Step 6: Git

1. `superpowers:finishing-a-development-branch`
2. `superpowers:using-git-worktrees` for feature isolation
3. Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

## Model-Routing

MANDATORY for any agent spawning. Default: Sonnet. Escalate to Opus only for deep reasoning. Drop to Haiku for mechanical tasks.

| Task | Model | Cost/1M (in/out) |
|------|-------|-------------------|
| Classification, extraction, summaries | Haiku 4.5 | $0.80 / $4 |
| Code generation, reviews, research | Sonnet 4.6 | $3 / $15 |
| Architecture, synthesis, root-cause | Opus 4.6 | $15 / $75 |

## Design-Routing

MANDATORY for ANY UI/design task:

1. `superpowers:brainstorming` — generate ideas
2. `design-workflow` — orchestrator
3. `ui-ux-pro-max` — **WAS**: design decisions, layout, UX
4. `modern-web-builder` — **WIE**: code patterns
5. `frontend-patterns` — framework-specific patterns

## Cross-Model Workflow

For complex tasks:
1. **PLAN** → Claude (Opus) writes plan in `docs/superpowers/plans/`
2. **QA REVIEW** → Codex reviews plan against real code
3. **IMPLEMENT** → Claude executes with test gates
4. **VERIFY** → Codex verifies implementation

## Bei Problemen

| Situation | Skill |
|-----------|-------|
| Bug/Fehler | `superpowers:systematic-debugging` |
| Build bricht | `build-fix` / `build-error-resolver` Agent |
| Kontext wird voll | `superpowers:strategic-compact` |
| Loop stalled | `long-term-agent-ops` |

## Coding Standards

- **Immutability**: ALWAYS create new objects, NEVER mutate
- **Small files**: 200-400 lines, max 800. Functions < 50 lines
- **Error Handling**: Explicit at every level, never swallow
- **Input Validation**: Validate at boundaries, fail fast
- **Security**: No hardcoded secrets, parameterized queries, sanitized HTML

## Agent Orchestration

Use agents proactively without waiting for user prompt:

| Trigger | Agent |
|---------|-------|
| Complex feature request | **planner** |
| Code just written/modified | **code-reviewer** |
| Bug fix or new feature | **tdd-guide** |
| Architectural decision | **architect** |
| Security-sensitive code | **security-reviewer** |
| Build failure | **build-error-resolver** |

ALWAYS use parallel agent execution for independent operations.
