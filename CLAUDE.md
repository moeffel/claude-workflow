# CEO & Board — Multi-Agent Decision System

A CEO agent (Opus 4.6) orchestrates 6 board members (Sonnet 4.6) in adversarial debate. Built on the PI Agent Harness. Input: structured briefs. Output: decision memos with bias analysis.

## Tech Stack

- **Runtime**: PI Agent Harness v0.62.0 (`@mariozechner/pi-coding-agent`)
- **Language**: TypeScript (modular PI extension)
- **LLM API**: `@anthropic-ai/sdk` (direct API calls for parallel board responses)
- **Config Parsing**: `yaml` (npm)
- **Task Runner**: [Just](https://github.com/casey/just) (`j ceo`)
- **Models**: Opus 4.6 (CEO), Sonnet 4.6 (Board Members)
- **Node**: v22+

## Commands

```bash
just ceo              # Start CEO & Board session
just briefs           # List available briefs
just new-brief NAME   # Create brief from template
just memos            # List generated memos
just roster           # Show board members
just expertise        # Show agent expertise/memory
just clean-debates    # Remove debate artifacts
```

## Architecture

```
.pi/extensions/
├── ceo-board.ts              ← Entry point: /begin command
└── lib/
    ├── types.ts              ← Shared interfaces
    ├── config-loader.ts      ← Reads + validates config.yaml
    ├── agent-loader.ts       ← Parses agent markdown + front-matter
    ├── brief-parser.ts       ← Validates briefs, extracts sections
    ├── orchestrator.ts       ← CEO debate loop (core)
    ├── conversation.ts       ← Parallel Anthropic API calls + dry-run
    ├── budget-tracker.ts     ← Time/cost/round constraints
    ├── memo-generator.ts     ← Memo + debate log output
    └── expertise-manager.ts  ← Persistent agent memory

ceo-agents/
├── config.yaml    # Constraints, board roster, paths
├── agents/        # 7 agent system prompts (DE, markdown + front-matter)
├── briefs/        # Input (structured markdown)
├── debates/       # Per-session: conversation.json, cost-tracking.json
├── memos/         # Output: decision memos
└── expertise/     # Persistent per-agent knowledge
```

## Constraints

- **Time**: 2-10 minutes per session (config.yaml)
- **Budget**: $1-$20 per session (config.yaml)
- **Rounds**: min 2, max 10
- **Brief validation**: Must have Situation, Stakes, Constraints, Key Questions
- **Dry Run**: `meeting.dry_run: true` — mock responses, no API costs
- Never remove time/budget limits from config.yaml
- Never delete `ceo-agents/expertise/` — agents lose accumulated knowledge

## Coding Conventions

- Agent system prompts: German, custom front-matter (`model`, `skills`, `expertise`)
- System prompt structure: Purpose → Variables → Instructions → Temperament → Heuristics → Workflow → Report
- Extension code: English TypeScript, modular in `.pi/extensions/lib/`
- Briefs: German, required sections enforced by brief-parser
- All repeatable commands in `justfile`
- Config paths are relative to `ceo-agents/` (basePath)

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
2. Use `typescript-reviewer` for extension code
3. Use `security-reviewer` when touching auth, API calls, budget logic

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
