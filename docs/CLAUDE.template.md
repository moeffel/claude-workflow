# PROJECT_NAME

> **Anleitung:** Kopiere diese Datei als `CLAUDE.md` ins Root deines Repos.
> Ersetze alle `PROJECT_NAME` und `[PLACEHOLDER]` Abschnitte.
> Lösche diesen Anleitung-Block danach.

## Project Overview

[1-2 Sätze: Was macht dieses Projekt?]

**Domain reference:** `[Spec.md / docs/spec.md]` is the source of truth for [domain-specific rules]. Always consult it before implementing or changing business logic.

## Tech Stack

- **Language**: [TypeScript / Python / Go / Rust / ...]
- **Framework**: [Next.js / FastAPI / Express / ...]
- **Database**: [PostgreSQL / SQLite / ...]
- **Task Runner**: [just / npm scripts / make]
- **Node**: [version]

## Development

```bash
# Start development
[./scripts/dev.sh / npm run dev / just dev]

# Reset/seed database (if applicable)
[./scripts/dev.sh --reset-db]
```

## Testing

```bash
# Backend
[cd backend && pytest]
[pytest tests/test_file.py -v]

# Frontend
[cd frontend && npm test]
[npm run lint]
[npm run build]
```

**Test infrastructure:**
- [Test DB strategy: in-memory SQLite / test containers / ...]
- [Auth in tests: how to authenticate in test requests]
- [Key fixtures: what's available]

## Database Migrations

```bash
[alembic upgrade head / prisma migrate dev / ...]
[alembic revision --autogenerate -m "description"]
```

## Architecture

### Backend

- `backend/main.py` — [Entry point, router registration]
- `backend/models/` — [ORM models]
- `backend/routers/` — [Route modules]
- `backend/services/` — [Business logic]

**Key patterns:**
- [Async/sync, auth strategy, DI pattern, ...]

### Frontend

- `frontend/src/App.tsx` — [Router, layout]
- `frontend/src/pages/` — [Page components]
- `frontend/src/components/` — [Shared UI]
- `frontend/src/hooks/` — [Custom hooks]
- `frontend/src/types/` — [TypeScript interfaces]

**Key patterns:**
- [State management: React Query / Zustand / ...]
- [UI toolkit: Tailwind / shadcn / ...]
- [Path alias: @/* → src/*]

### [Domain Model (if applicable)]

```
[Status flow, entity relationships, core domain concepts]
```

### Roles & Access

[Role hierarchy, permission model]

## Project-Specific Notes

### Before implementing business logic
[Where to find domain rules — spec file, config, etc.]

### Security model
- [Auth strategy: session cookies / JWT / ...]
- [CSRF, rate limiting, password hashing]
- [Role enforcement pattern]

### Design system
- [Brand color(s) with hex codes]
- [Icon library]
- [Custom animations/tokens]

### Large files — read targeted sections
- [List files > 500 lines with guidance on how to navigate them]

## Constraints

- [What to NEVER do]
- [Budget/time/resource limits]
- [Required env vars]

## Dangerous Operations

| Action | Risk |
|--------|------|
| [destructive command] | [what gets lost] |
| [another dangerous op] | [consequence] |

---

## Skill-Workflow-Map

> Dieser Abschnitt macht den Standard-Workflow portabel —
> funktioniert auf CLI, Desktop, IDE UND Claude Cloud.

### Standard Development Workflow

| Step | Skills (in Reihenfolge) | Zweck |
|------|------------------------|-------|
| **0. Research** | `research-mode` → `search-first` → `docs`/Context7 → `deep-research` → `exa-search` | Bestehende Lösungen/Docs suchen vor Neubau |
| **1. Brainstorm** | `superpowers:brainstorming` → `spec-expander` → `spec-reviewer` *(optional)* | Pflicht vor kreativer Arbeit. Spec-Expander immer NACH brainstorming |
| **2. Plan** | `superpowers:writing-plans` + `planner` Agent | Strukturierter Plan, Phasen, Risiken |
| **3. Implement** | `superpowers:executing-plans` + `superpowers:subagent-driven-development` + `superpowers:test-driven-development` / `tdd` | Plan abarbeiten, TDD: RED → GREEN → IMPROVE |
| **4. Review** | `superpowers:requesting-code-review` + `python-reviewer` / `typescript-reviewer` + `security-reviewer` | Sprach-spezifisch + Security bei Auth/Input/DB |
| **5. Verify** | `superpowers:verification-before-completion` + `verify` | Bevor "fertig" gesagt wird |
| **6. Git** | `superpowers:finishing-a-development-branch` + `superpowers:using-git-worktrees` | Branch abschließen, Feature-Isolation |

### Model-Routing (MANDATORY)

**For ANY agent spawning or multi-model task:**
→ Default: Sonnet. Escalate to Opus only for deep reasoning. Drop to Haiku for mechanical tasks.

| Task | Model | Cost/1M (in/out) |
|------|-------|-------------------|
| Classification, extraction, summaries | Haiku 4.5 | $0.80 / $4 |
| Code generation, reviews, research | Sonnet 4.6 | $3 / $15 |
| Architecture, synthesis, root-cause | Opus 4.6 | $15 / $75 |

### Design-Routing (bei UI-Aufgaben)

| # | Skill | Rolle |
|---|-------|-------|
| 1 | `superpowers:brainstorming` | Ideen generieren |
| 2 | `design-workflow` | Orchestrator |
| 3 | `ui-ux-pro-max` | **WAS** — Design-Entscheidungen, Layout, UX |
| 4 | `modern-web-builder` | **WIE** — Code-Patterns (Tailwind, Animations, Charts) |
| 5 | `frontend-patterns` | React/Framework Patterns |

### Cross-Model Workflow (komplexe Tasks)

| Phase | Skill | Wer |
|-------|-------|-----|
| 1. Plan | `cross-model` | Claude (Opus) |
| 2. QA Review | `harness-patterns` | Codex reviewt Plan |
| 3. Implement | `superpowers:executing-plans` | Claude |
| 4. Verify | `cross-model` | Codex verifiziert |

### Workflow Orchestration

| Situation | Pattern |
|-----------|---------|
| Single focused change | Sequential Pipeline (`claude -p`) |
| Interactive exploration | NanoClaw REPL (`/claw`) |
| Multi-day iterative + CI | Continuous Claude PR Loop |
| Parallel from specs | RFC-DAG (Ralphinho) with worktrees |
| Many creative variations | Infinite Agentic Loop |
| Post-implementation cleanup | De-Sloppify Pass (separate context) |

### Bei Problemen

| Situation | Skill |
|-----------|-------|
| Bug/Fehler | `superpowers:systematic-debugging` |
| Build bricht | `build-fix` / `build-error-resolver` Agent |
| Kontext wird voll | `superpowers:strategic-compact` |
| Loop stalled | `long-term-agent-ops` |

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

## Deployment

```bash
[docker compose up / vercel deploy / ...]
```
