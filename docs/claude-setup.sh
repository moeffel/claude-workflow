#!/bin/bash
# Claude Code — Repo Setup Script
# Erstellt CLAUDE.md + .claude/ Config mit vollem Standard-Workflow.
# Funktioniert auf CLI, Desktop, IDE UND Claude Cloud.
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/moeffel/ceo-board-template/main/docs/claude-setup.sh | bash
#   # oder lokal:
#   bash docs/claude-setup.sh

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║  Claude Code — Repo Config Setup             ║"
echo "╚══════════════════════════════════════════════╝"

# Check if CLAUDE.md already exists
if [ -f "CLAUDE.md" ]; then
    echo "⚠  CLAUDE.md exists. Backing up to CLAUDE.md.bak"
    cp CLAUDE.md CLAUDE.md.bak
fi

# Create .claude directory structure
mkdir -p .claude/{skills,hooks,agents}

# Create settings.local.json if not exists
if [ ! -f ".claude/settings.local.json" ]; then
cat > .claude/settings.local.json << 'SETTINGS'
{
  "permissions": {
    "allow": [
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)",
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(just *)",
      "Bash(curl *)",
      "Bash(chmod *)",
      "Bash(mkdir *)",
      "Bash(ls *)",
      "mcp__playwright__*"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo *)"
    ]
  }
}
SETTINGS
echo "✓  .claude/settings.local.json created"
else
    echo "→  .claude/settings.local.json already exists, skipping"
fi

# Detect project type
LANG=""
if [ -f "package.json" ]; then
    LANG="TypeScript/JavaScript"
elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
    LANG="Python"
elif [ -f "go.mod" ]; then
    LANG="Go"
elif [ -f "Cargo.toml" ]; then
    LANG="Rust"
elif [ -f "composer.json" ]; then
    LANG="PHP"
else
    LANG="[TODO: set language]"
fi

# Detect framework
FRAMEWORK=""
if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
    FRAMEWORK="Next.js"
elif [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    FRAMEWORK="Vite"
elif grep -q "fastapi" requirements.txt 2>/dev/null || grep -q "fastapi" pyproject.toml 2>/dev/null; then
    FRAMEWORK="FastAPI"
elif grep -q "django" requirements.txt 2>/dev/null || grep -q "django" pyproject.toml 2>/dev/null; then
    FRAMEWORK="Django"
elif grep -q "express" package.json 2>/dev/null; then
    FRAMEWORK="Express"
fi
[ -z "$FRAMEWORK" ] && FRAMEWORK="[TODO: set framework]"

# Get project name from directory
PROJECT_NAME=$(basename "$(pwd)")

cat > CLAUDE.md << CLAUDEMD
# ${PROJECT_NAME}

[TODO: 1-2 Sätze — Was macht dieses Projekt?]

## Tech Stack

- **Language**: ${LANG}
- **Framework**: ${FRAMEWORK}
- **Database**: [TODO: PostgreSQL / SQLite / ...]
- **Task Runner**: [TODO: just / npm scripts / make]

## Development

\`\`\`bash
# Start development
[TODO: ./scripts/dev.sh / npm run dev / just dev]
\`\`\`

## Testing

\`\`\`bash
# [TODO: Add test commands]
\`\`\`

## Architecture

[TODO: Key directories and their purpose]

## Constraints

- [TODO: What to NEVER do]
- [TODO: Required env vars]

## Coding Conventions

- [TODO: Language of comments/docs (DE/EN)]
- [TODO: File naming patterns]

---

## Skill-Workflow-Map

> Portabler Standard-Workflow — funktioniert auf CLI, Desktop, IDE UND Claude Cloud.

### Standard Development Workflow

| Step | Skills (in Reihenfolge) | Zweck |
|------|------------------------|-------|
| **0. Research** | \`research-mode\` → \`search-first\` → \`docs\`/Context7 → \`deep-research\` → \`exa-search\` | Bestehende Lösungen/Docs suchen vor Neubau |
| **1. Brainstorm** | \`superpowers:brainstorming\` → \`spec-expander\` → \`spec-reviewer\` *(optional)* | Pflicht vor kreativer Arbeit. Spec-Expander immer NACH brainstorming |
| **2. Plan** | \`superpowers:writing-plans\` + \`planner\` Agent | Strukturierter Plan, Phasen, Risiken |
| **3. Implement** | \`superpowers:executing-plans\` + \`superpowers:subagent-driven-development\` + \`superpowers:test-driven-development\` / \`tdd\` | Plan abarbeiten, TDD: RED → GREEN → IMPROVE |
| **4. Review** | \`superpowers:requesting-code-review\` + \`python-reviewer\` / \`typescript-reviewer\` + \`security-reviewer\` | Sprach-spezifisch + Security bei Auth/Input/DB |
| **5. Verify** | \`superpowers:verification-before-completion\` + \`verify\` | Bevor "fertig" gesagt wird |
| **6. Git** | \`superpowers:finishing-a-development-branch\` + \`superpowers:using-git-worktrees\` | Branch abschließen, Feature-Isolation |

### Model-Routing (MANDATORY)

| Task | Model | Cost/1M (in/out) |
|------|-------|-------------------|
| Classification, extraction, summaries | Haiku 4.5 | \$0.80 / \$4 |
| Code generation, reviews, research | Sonnet 4.6 | \$3 / \$15 |
| Architecture, synthesis, root-cause | Opus 4.6 | \$15 / \$75 |

### Design-Routing (bei UI-Aufgaben)

| # | Skill | Rolle |
|---|-------|-------|
| 1 | \`superpowers:brainstorming\` | Ideen generieren |
| 2 | \`design-workflow\` | Orchestrator |
| 3 | \`ui-ux-pro-max\` | **WAS** — Design-Entscheidungen, Layout, UX |
| 4 | \`modern-web-builder\` | **WIE** — Code-Patterns (Tailwind, Animations, Charts) |
| 5 | \`frontend-patterns\` | React/Framework Patterns |

### Cross-Model Workflow (komplexe Tasks)

| Phase | Skill | Wer |
|-------|-------|-----|
| 1. Plan | \`cross-model\` | Claude (Opus) |
| 2. QA Review | \`harness-patterns\` | Codex reviewt Plan |
| 3. Implement | \`superpowers:executing-plans\` | Claude |
| 4. Verify | \`cross-model\` | Codex verifiziert |

### Workflow Orchestration

| Situation | Pattern |
|-----------|---------|
| Single focused change | Sequential Pipeline (\`claude -p\`) |
| Interactive exploration | NanoClaw REPL (\`/claw\`) |
| Multi-day iterative + CI | Continuous Claude PR Loop |
| Parallel from specs | RFC-DAG (Ralphinho) with worktrees |
| Many creative variations | Infinite Agentic Loop |
| Post-implementation cleanup | De-Sloppify Pass (separate context) |

### Bei Problemen

| Situation | Skill |
|-----------|-------|
| Bug/Fehler | \`superpowers:systematic-debugging\` |
| Build bricht | \`build-fix\` / \`build-error-resolver\` Agent |
| Kontext wird voll | \`superpowers:strategic-compact\` |
| Loop stalled | \`long-term-agent-ops\` |

### Coding Standards

- **Immutability**: ALWAYS create new objects, NEVER mutate existing ones
- **File Organization**: Many small files > few large files (200-400 lines, max 800)
- **Error Handling**: Handle errors explicitly at every level, never silently swallow
- **Input Validation**: Validate at system boundaries, fail fast with clear messages
- **Functions**: < 50 lines, no deep nesting (> 4 levels)
- **Security**: No hardcoded secrets, parameterized queries, sanitized HTML, CSRF protection

### Agent Orchestration

| Trigger | Agent |
|---------|-------|
| Complex feature request | **planner** |
| Code just written/modified | **code-reviewer** |
| Bug fix or new feature | **tdd-guide** |
| Architectural decision | **architect** |
| Security-sensitive code | **security-reviewer** |
| Build failure | **build-error-resolver** |

ALWAYS use **parallel** agent execution for independent operations.
CLAUDEMD

echo "✓  CLAUDE.md created (with Standard Workflow)"
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Done! Next steps:                           ║"
echo "║                                              ║"
echo "║  1. Edit CLAUDE.md — fill in [TODO] sections ║"
echo "║  2. Edit .claude/settings.local.json         ║"
echo "║     — add project-specific permissions       ║"
echo "║  3. Optional: add .claude/skills/            ║"
echo "║     — domain-specific knowledge              ║"
echo "║  4. Optional: add .claude/hooks/             ║"
echo "║     — project-specific validation            ║"
echo "╚══════════════════════════════════════════════╝"
