#!/bin/bash
# Claude Workflow — Plugin Installer
# Run once after cloning: bash setup.sh
# Installs all plugins referenced in the Standard Workflow.
# Already-installed plugins are skipped.

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║  Claude Workflow — Plugin Setup               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check if claude is available
if ! command -v claude &> /dev/null; then
    echo "✗  'claude' CLI not found. Install: https://docs.anthropic.com/en/docs/claude-code"
    exit 1
fi

# --- MemPalace (persistent memory across sessions) ---
echo "Setting up MemPalace..."
echo ""

if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
    PIP_CMD=$(command -v pip3 || command -v pip)
    echo -n "  mempalace... "
    if $PIP_CMD install mempalace 2>/dev/null; then
        echo "✓ installed"
    else
        echo "→ already installed or failed (Python 3.9+ required)"
    fi

    echo -n "  MCP server... "
    if claude mcp add mempalace -- python -m mempalace.mcp_server 2>/dev/null; then
        echo "✓ registered"
    else
        echo "→ already registered or unavailable"
    fi
else
    echo "  ⚠  pip not found — skipping MemPalace (install Python 3.9+ first)"
fi

echo ""

PLUGINS=(
    "superpowers@superpowers-marketplace"
    "everything-claude-code@everything-claude-code"
    "context7@claude-plugins-official"
    "playwright@claude-plugins-official"
    "codex@openai-codex"
    "ui-ux-pro-max@ui-ux-pro-max-skill"
    "frontend-design@claude-plugins-official"
    "document-skills@anthropic-agent-skills"
    "example-skills@anthropic-agent-skills"
    "explanatory-output-style@claude-plugins-official"
    "spec-kit@claude-night-market"
)

MARKETPLACES=(
    "obra/superpowers-marketplace"
    "nextlevelbuilder/ui-ux-pro-max-skill"
    "openai/codex-plugin-cc"
    "affaan-m/everything-claude-code"
    "athola/claude-night-market"
)

echo "Registering custom marketplaces..."
echo ""

for marketplace in "${MARKETPLACES[@]}"; do
    name="${marketplace##*/}"
    echo -n "  ${name}... "

    if claude plugin marketplace add "$marketplace" 2>/dev/null; then
        echo "✓ registered"
    else
        echo "→ already registered or unavailable"
    fi
done

echo ""
echo "Installing plugins..."
echo ""

for plugin in "${PLUGINS[@]}"; do
    name="${plugin%%@*}"
    echo -n "  ${name}... "

    # Try to install, ignore if already installed
    if claude plugins install "$plugin" 2>/dev/null; then
        echo "✓ installed"
    else
        echo "→ already installed or unavailable"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Done. Start Claude Code:                    ║"
echo "║    claude                                    ║"
echo "║                                              ║"
echo "║  The Standard Workflow in CLAUDE.md is now    ║"
echo "║  fully operational.                          ║"
echo "╚══════════════════════════════════════════════╝"
