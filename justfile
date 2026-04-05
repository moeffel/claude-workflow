# PI CEO AGENTS — Task Runner
# Usage: just <command> or j <command> (if aliased)

# Default: show available commands
default:
    @just --list

# Start CEO & Board session
ceo:
    cd ceo-agents && pi

# Start PI agent (interactive)
pi:
    pi

# Continue last PI session
pi-continue:
    pi -c

# List all briefs
briefs:
    @ls -la ceo-agents/briefs/*.md 2>/dev/null || echo "No briefs found"

# List all memos
memos:
    @ls -la ceo-agents/memos/*.md 2>/dev/null || echo "No memos found"

# Create new brief from template
new-brief name:
    cp ceo-agents/briefs/_template.md "ceo-agents/briefs/{{name}}.md"
    @echo "Created brief: ceo-agents/briefs/{{name}}.md"

# Review a brief before running
review-brief name:
    @echo "Reviewing brief: {{name}}"
    @cat "ceo-agents/briefs/{{name}}.md"

# Clean debate artifacts (keeps memos and briefs)
clean-debates:
    rm -rf ceo-agents/debates/*
    @echo "Debates cleaned"

# Show board member roster
roster:
    @echo "=== CEO & Board Roster ==="
    @ls ceo-agents/agents/*.md 2>/dev/null | xargs -I {} basename {} .md

# Show agent expertise files
expertise:
    @echo "=== Agent Expertise ==="
    @for f in ceo-agents/expertise/*.md; do echo "--- $$(basename $$f .md) ---"; head -5 "$$f" 2>/dev/null; echo; done
