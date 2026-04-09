#!/bin/bash
# Claude Workflow — SessionStart Hook
# Runs on: startup, clear, compact
# Ensures all dependencies are available (Cloud + Local)
set -euo pipefail

FIRST_RUN_MARKER="${CLAUDE_PROJECT_DIR:-.}/.claude/.setup-done"
WARNINGS=""

# --- First-run setup (only once per environment) ---
if [ ! -f "$FIRST_RUN_MARKER" ]; then

    # Install MemPalace if not present
    if ! python3 -c "import mempalace" 2>/dev/null && ! python -c "import mempalace" 2>/dev/null; then
        PIP_CMD=$(command -v pip3 2>/dev/null || command -v pip 2>/dev/null || echo "")
        if [ -n "$PIP_CMD" ]; then
            $PIP_CMD install -q mempalace 2>/dev/null || true
        fi
    fi

    # Create required directories
    mkdir -p "${CLAUDE_PROJECT_DIR:-.}/docs/specs" 2>/dev/null || true
    mkdir -p "${CLAUDE_PROJECT_DIR:-.}/docs/superpowers/plans" 2>/dev/null || true

    # Mark setup as done for this environment
    touch "$FIRST_RUN_MARKER" 2>/dev/null || true
fi

# --- Check project config (every session) ---
CLAUDE_MD="${CLAUDE_PROJECT_DIR:-.}/CLAUDE.md"
if [ -f "$CLAUDE_MD" ]; then
    # Check if project sections are still empty (template defaults)
    if grep -q "^- \*\*Language\*\*:$" "$CLAUDE_MD" 2>/dev/null; then
        WARNINGS="${WARNINGS}Project sections in CLAUDE.md are empty — fill in Tech Stack, Dev Commands, Testing, and Architecture for best results. "
    fi
fi

# --- Check MemPalace availability ---
MEMPALACE_STATUS="unavailable"
if python3 -c "import mempalace" 2>/dev/null || python -c "import mempalace" 2>/dev/null; then
    MEMPALACE_STATUS="available"
fi

# --- Output context for Claude ---
CONTEXT="Session started. Run Session Start protocol: (1) load MemPalace context [status: ${MEMPALACE_STATUS}], (2) check open work, (3) git log --oneline -10, (4) check docs/superpowers/plans/ for active plan, (5) brief user. ${WARNINGS}"

echo "{\"hookSpecificOutput\":{\"additionalContext\":\"${CONTEXT}\"}}"
