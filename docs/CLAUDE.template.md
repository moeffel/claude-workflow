# PROJECT_NAME

One-line description.

## Tech Stack

- **Language**:
- **Framework**:
- **Database**:
- **Task Runner**:

## Development

```bash
# dev commands here
```

## Testing

```bash
# test commands here
```

## Architecture

Describe key directories.

## Constraints

- List what to never do.

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
4. After each file edit, `quality-gate` runs automatically (PostToolUse hook if configured)

### Step 4: Review

1. Invoke `superpowers:requesting-code-review`
2. Use language-specific reviewer: `python-reviewer` / `typescript-reviewer` / `go-reviewer` / `rust-reviewer` / `cpp-reviewer` / `kotlin-reviewer` / `java-reviewer` / `flutter-reviewer`
3. Use `security-reviewer` when touching auth, user input, DB queries, API endpoints, crypto, payments
4. Use `database-reviewer` when writing SQL, creating migrations, or designing schemas

### Step 5: Verify

1. Invoke `superpowers:verification-before-completion` + `verify`
2. Run `context-budget` to check token consumption before wrapping up
3. Never say "done" without running this step

### Step 6: Git

1. `superpowers:finishing-a-development-branch`
2. `superpowers:using-git-worktrees` for feature isolation
3. Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

### Step 7: Learn (after completing a task)

1. Run `learn` / `learn-eval` to extract reusable patterns from the session
2. Instincts are saved per-project and can be promoted to global with `promote`
3. Run `instinct-status` to see accumulated learnings
4. Run `prune` periodically to clean stale instincts

---

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
2. **QA REVIEW** → Codex reviews plan against real code (`codex:rescue`)
3. **IMPLEMENT** → Claude executes with test gates
4. **VERIFY** → Codex verifies implementation

Invoke `cross-model` skill for handoff protocols.

## Context & Session Management

| Situation | Skill |
|-----------|-------|
| Context window filling up | `strategic-compact` — suggests manual compaction at logical intervals |
| Token budget unclear | `context-budget` — audits consumption across agents, skills, MCPs |
| End of session | `save-session` — persist session state for resume |
| Resume previous work | `resume-session` — load last session file |
| Multi-session work | `long-term-agent-ops` — loop selection, checkpoints, stall detection |

## Quality & Learning

| Trigger | Skill |
|---------|-------|
| After each file edit | `quality-gate` — automated quality check (PostToolUse) |
| After completing a task | `learn` / `learn-eval` — extract reusable patterns |
| View learned patterns | `instinct-status` — show instincts with confidence |
| Promote to global | `promote` — move project instincts to global scope |
| Clean stale patterns | `prune` — delete pending instincts older than 30 days |
| Evaluate session quality | `eval` — formal evaluation of session against goals |
| Evolve patterns | `evolve` — analyze instincts and suggest improvements |

## Bei Problemen

| Situation | Skill |
|-----------|-------|
| Bug/Fehler | `superpowers:systematic-debugging` |
| Build bricht | `build-fix` / `build-error-resolver` Agent |
| Kontext wird voll | `strategic-compact` + `context-budget` |
| Loop stalled | `long-term-agent-ops` |
| Need second opinion | `codex:rescue` — delegate to Codex for investigation |
| Security concern | `security-scan` — scan .claude/ config for vulnerabilities |

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
| Database changes | **database-reviewer** |
| Dead code / cleanup | **refactor-cleaner** |
| Documentation updates | **doc-updater** |
| E2E test needed | **e2e-runner** |
| Performance issue | **performance-optimizer** |

ALWAYS use parallel agent execution for independent operations.

## Multi-Agent Patterns

For complex multi-agent work, consult these skills:

| Pattern | Skill |
|---------|-------|
| Team composition | `team-builder` — interactive agent picker |
| Orchestration strategy | `orchestrate` — sequential vs tmux/worktree guidance |
| Parallel agents from plan | `superpowers:dispatching-parallel-agents` |
| DevFleet (parallel Claude instances) | `devfleet` / `claude-devfleet` |
| Harness design | `harness-designer` — build new agent systems from scratch |
| Battle-tested patterns | `harness-patterns` — GAN-evaluator, sprint contracts, bias elimination |
| Autonomous loops | `autonomous-loops` — continuous agent loop architectures |
