# claude-workflow

Standard development workflow for Claude. Works everywhere: CLI, Desktop, IDE, and Cloud.

On **CLI/Desktop**: Run `bash setup.sh` once after cloning to install plugins (superpowers, ECC, codex, etc.). Skills referenced below will activate automatically.

On **Claude Cloud**: No setup needed. This file IS the workflow — follow the instructions directly.

---

## Standard Workflow

Follow this workflow for ALL implementation tasks. Each step is mandatory unless explicitly skipped by the user. If a skill mentioned below is available, invoke it. If not, follow the written instructions directly.

### Step 0: Research & Reuse

**Before writing ANY new code**, search for existing solutions:

1. Search GitHub for existing implementations (`gh search code`, `gh search repos`)
2. Check library docs for API behavior and patterns (Context7 or official docs)
3. Search package registries (npm, PyPI, crates.io) — prefer battle-tested libraries over hand-rolled code
4. Search the web for broader context only if steps 1-3 are insufficient
5. Look for open-source projects that solve 80%+ of the problem

Prefer adopting a proven approach over writing from scratch.

> CLI skill chain: `research-mode` → `search-first` → `docs` → `deep-research` → `exa-search`

### Step 1: Brainstorm

**Mandatory before any creative or design work.** Do not jump to implementation.

1. Generate multiple approaches (at least 3). Consider trade-offs for each.
2. Expand the idea into a structured spec with:
   - Feature list with clear scope boundaries
   - User stories or acceptance criteria
   - Technical constraints and dependencies
   - Out of scope (explicitly state what NOT to build)
3. If the user provides only 1-4 sentences, expand into a full spec before planning.

> CLI skills: `superpowers:brainstorming` → `spec-expander` → `spec-reviewer`

### Step 2: Plan

1. Create a structured implementation plan before writing code:
   - Break into phases (each independently testable)
   - Identify dependencies between phases
   - List risks and mitigation strategies
   - Estimate complexity per phase
2. Write the plan to `docs/superpowers/plans/YYYY-MM-DD-name.md`
3. Get user confirmation before proceeding to implementation

> CLI skills: `superpowers:writing-plans` + **planner** agent

### Step 3: Implement

1. Execute the plan phase by phase. Do not skip ahead.
2. For each phase, follow TDD strictly:
   - **RED**: Write the test first. Run it. It MUST fail.
   - **GREEN**: Write the minimal code to make the test pass.
   - **IMPROVE**: Refactor while keeping tests green.
3. Target 80%+ test coverage.
4. Use parallel agents/subagents for independent tasks within a phase.
5. After each file edit, review your own change for obvious issues before moving on.

> CLI skills: `superpowers:executing-plans` + `superpowers:subagent-driven-development` + `tdd` + `quality-gate`

### Step 4: Review

1. Review all code changes before considering work done:
   - **Correctness**: Does it do what was asked? Edge cases handled?
   - **Security**: No hardcoded secrets? Inputs validated? Queries parameterized? Auth checked?
   - **Quality**: Functions < 50 lines? Files < 800 lines? No deep nesting? Immutable patterns?
   - **Tests**: Do tests cover the happy path AND error cases?
2. For security-sensitive code (auth, payments, user input, DB, crypto): do an explicit security review.
3. For database changes: review schema design, query performance, migration safety.

> CLI skills: `superpowers:requesting-code-review` + `python-reviewer` / `typescript-reviewer` / `go-reviewer` / `rust-reviewer` + `security-reviewer` + `database-reviewer`

### Step 5: Verify

**Never say "done" without this step.**

1. Re-read the original request. Does the implementation match?
2. Run all tests. Do they pass?
3. Check for regressions — did anything else break?
4. Verify the user can actually use what was built (not just that it compiles).
5. List any known limitations or follow-up items.

> CLI skills: `superpowers:verification-before-completion` + `verify` + `context-budget`

### Step 6: Git

1. Stage only relevant files (never `git add .` blindly).
2. Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`
3. Commit message: focus on WHY, not WHAT. The diff shows the what.
4. One logical change per commit.

> CLI skills: `superpowers:finishing-a-development-branch` + `superpowers:using-git-worktrees`

### Step 7: Learn

After completing a task, capture what was learned:

1. What patterns emerged that could be reused?
2. What was surprising or non-obvious?
3. What would you do differently next time?
4. Document decisions and their reasoning in commit messages or docs.

> CLI skills: `learn` / `learn-eval` → `instinct-status` → `promote` → `prune`

---

## Model-Routing

When spawning agents, choose the right model:

| Task type | Model | Why |
|-----------|-------|-----|
| Simple extraction, classification, formatting | **Haiku** | Fast, cheap ($0.80/M), 90% of Sonnet quality |
| Code generation, reviews, research, most work | **Sonnet** (default) | Best cost/quality for coding ($3/M) |
| Architecture, deep reasoning, root-cause analysis | **Opus** | Deepest reasoning ($15/M), use sparingly |

Default to Sonnet. Only escalate to Opus when reasoning depth matters. Drop to Haiku for mechanical tasks.

## Design-Routing

For ANY UI/design task (components, pages, styling, colors, typography, charts, layouts):

1. **Brainstorm** — generate 3+ design approaches with trade-offs
2. **Design decisions** — choose layout, hierarchy, spacing, color, typography. Decide WHAT the design should be.
3. **Implementation** — translate design into code. Choose HOW: CSS approach, animation library, component structure.
4. **Review** — check accessibility, responsiveness, performance, consistency.

> CLI skill chain: `superpowers:brainstorming` → `design-workflow` → `ui-ux-pro-max` → `modern-web-builder` → `frontend-patterns`

## Cross-Model Workflow

For complex tasks that benefit from a second perspective:

1. **PLAN** → Write a detailed plan in `docs/superpowers/plans/`
2. **QA REVIEW** → Have the plan reviewed against the actual codebase (a different model or agent catches things the planner missed)
3. **IMPLEMENT** → Execute phase by phase with test gates between phases
4. **VERIFY** → Verify the implementation matches the plan (pass/warn/fail per phase)

> CLI skills: `cross-model` + `codex:rescue`

## Context Management

| Situation | What to do |
|-----------|-----------|
| Context filling up | Summarize completed work, drop verbose tool outputs, keep only what's needed for current task |
| Long session | At natural milestones, offer to summarize progress and compress context |
| Resuming previous work | Read recent git log + any plan docs to reconstruct state |
| Multi-file refactoring | Break into smaller commits. Don't hold too many files in context at once. |

> CLI skills: `strategic-compact`, `context-budget`, `save-session`, `resume-session`

## Bei Problemen

| Situation | What to do |
|-----------|-----------|
| Bug or test failure | Read the error. Check assumptions. Reproduce minimally. Fix root cause, not symptoms. |
| Build breaks | Read the full error output. Fix incrementally. Verify after each fix. |
| Stuck on approach | Step back. Re-read the requirement. Try a fundamentally different approach. |
| Context too large | Summarize what's done, what's left. Start fresh section if needed. |
| Need second opinion | Explain the problem clearly, list what you've tried, ask for alternative approaches. |

> CLI skills: `superpowers:systematic-debugging`, `build-fix`, `codex:rescue`, `security-scan`

## Coding Standards

- **Immutability**: Create new objects, never mutate existing ones
- **Small files**: 200-400 lines typical, 800 max. Functions < 50 lines.
- **Error handling**: Explicit at every level. Never silently swallow errors.
- **Input validation**: Validate at system boundaries. Fail fast with clear messages.
- **Security**: No hardcoded secrets. Parameterized queries. Sanitized HTML. CSRF protection.
- **No over-engineering**: Don't add features, abstractions, or "improvements" beyond what was asked.

## Agent Orchestration

Use sub-agents proactively when the situation calls for it:

| Situation | Agent type |
|-----------|-----------|
| Complex feature with multiple phases | **planner** — create implementation plan |
| Code was just written or modified | **code-reviewer** — review for quality and bugs |
| New feature or bug fix | **tdd-guide** — enforce test-first methodology |
| System design decision needed | **architect** — evaluate trade-offs |
| Touching auth, payments, user data | **security-reviewer** — check for vulnerabilities |
| Build or type errors | **build-error-resolver** — fix incrementally |
| SQL or schema changes | **database-reviewer** — check query performance and safety |
| Unused code accumulating | **refactor-cleaner** — identify and remove dead code |

Run independent agents in **parallel**. Don't wait for one to finish if another can start.
