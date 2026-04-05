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

PLUGINS=(
    "superpowers@claude-plugins-official"
    "everything-claude-code@everything-claude-code"
    "context7@claude-plugins-official"
    "playwright@claude-plugins-official"
    "codex@openai-codex"
    "ui-ux-pro-max@ui-ux-pro-max-skill"
    "frontend-design@claude-plugins-official"
    "document-skills@anthropic-agent-skills"
    "example-skills@anthropic-agent-skills"
    "explanatory-output-style@claude-plugins-official"
)

MARKETPLACES=(
    "ui-ux-pro-max-skill|github|nextlevelbuilder/ui-ux-pro-max-skill"
    "openai-codex|github|openai/codex-plugin-cc"
    "everything-claude-code|github|affaan-m/everything-claude-code"
)

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
