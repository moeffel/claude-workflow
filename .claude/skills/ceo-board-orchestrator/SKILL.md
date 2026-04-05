---
name: ceo-board-orchestrator
description: Use when building, modifying, or debugging the CEO & Board multi-agent decision system — covers workflow, agent configuration, brief/memo formats, and PI extension architecture
---

# CEO & Board Orchestrator

The core skill for the multi-agent strategic decision-making system.

## Architecture

```
Uncertainty In → [CEO & Board System] → Decision Out

Brief (markdown)
  → CEO frames decision (Opus 4.6)
  → Board debates in parallel (6x Sonnet 4.6)
  → Constraints check (time + budget)
  → Final statements (one per member)
  → CEO creates Memo (decision map + recommendations)
```

This is a **one-shot multi-agent system** — not a conversation. The only command is `CEO begin`. The system selects a brief, runs the debate, and produces a memo.

## Workflow Steps

### 1. Brief Selection
- System scans `ceo-agents/briefs/` for available briefs
- User selects which brief to run
- System validates required sections exist

### 2. CEO Frames Decision
- CEO reads brief + all additional context files
- Updates personal scratch pad / expertise file
- Broadcasts opening statement to all board members
- "Board, we're here to make a call on [topic]"

### 3. Board Debates (Parallel)
- All board members respond simultaneously (not sequentially)
- Each forms opinion based on: system prompt + expertise + brief + context
- Members argue, challenge, create SVGs to support positions
- CEO monitors, updates notes, pushes discussion further

### 4. Constraints Check
- Extension checks time elapsed and budget spent
- If over limit: inject message to CEO "time/budget exceeded, wrap up"
- CEO calls for final statements

### 5. Final Statements
- Each board member gives one closing statement
- CEO collects all positions

### 6. Memo Creation
- CEO creates final memo with:
  - Decision Map (SVG visualization)
  - Top 3 Recommendations (ranked)
  - Board Member Stances (each member's position + reasoning)
  - Resolved Tensions (where consensus formed)
  - Unresolved Tensions (valuable disagreements)
  - Trade-offs and Risks
  - Next Actions (who, what, by when)

## Agent Front-Matter Schema

```yaml
---
model: sonnet-4-6              # LLM model to use
skills:                         # Attached capabilities
  - svg-generator
  - file-reader
expertise: expertise/name.md    # Path to persistent expertise file
---
```

The PI extension parses this front-matter and:
- Sets the model for this agent
- Loads skills into the system prompt
- Injects expertise file content into context

## System Prompt Structure

Every agent follows this structure (in order):

1. **Purpose** — Role identity + core mission (1-2 sentences)
2. **Variables**
   - Static: name, role
   - Runtime: brief_content, time_remaining, budget_remaining, round_number
3. **Instructions** — Behavioral rules, priorities
4. **Temperament** — How this agent approaches problems
5. **How This Role Thinks** — Mental models, frameworks
6. **Reasoning Patterns** — Primary reasoning style
7. **Decision Heuristics** — One-liner rule of thumb
8. **Workflow** — Per-turn process
9. **Report Format** — Output structure

Runtime variables are **dynamically injected** before each agent turn by the extension.

## Config Schema

See `references/config-schema.md` for full reference.

Key sections:
- `meeting` — time/budget constraints, min/max rounds
- `brief.required_sections` — validation rules
- `paths` — directory references
- `board` — CEO config + member roster
- `tts` — text-to-speech settings
- `output` — memo generation options

## Brief Requirements

Briefs MUST contain:
- `## Situation` — Context, background, current state
- `## Stakes` — What's at risk, consequences of inaction
- `## Constraints` — Time, budget, resources, legal
- `## Key Questions` — Specific questions board must answer

System rejects incomplete briefs. See brief-writer skill for templates.

## Memo Output Format

```markdown
# [Decision Title] — Board Memo

## Decision Map
[SVG visualization of the decision tree/outcome]

## Executive Summary
[CEO's 2-3 sentence summary with TTS narration]

## Top Recommendations
1. [Highest priority action]
2. [Second priority]
3. [Third priority]

## Board Stances
### Financial Realist: [DAFÜR/DAGEGEN/BEDINGT]
[Position + Zahlen + Reasoning]
### Career & Skills Advisor: [DAFÜR/DAGEGEN/BEDINGT]
[Position + reasoning]
[... all members ...]

## Resolved Tensions
- [Where the board found agreement]

## Unresolved Tensions
- [Valuable disagreements that remain]

## Trade-offs & Risks
- [What could go wrong]

## Next Actions
- [ ] [Action item] — Owner: [who] — Deadline: [when]
```

## Multi-Agent Orchestration

### Broadcast Mode (Default)
- CEO sends to ALL board members
- All respond to ALL (everyone sees everything)
- Simple, transparent, full context

### Backroom Mode (Future)
- Pairs of agents converse privately
- Compounder + Moonshot find middle ground
- Financial Realist + Contrarian stress-test assumptions
- Results shared back to full board

## Expertise Accumulation

Each agent maintains a persistent expertise file:
- Updated after every session
- Tracks cross-agent relationships (agree/disagree patterns)
- Builds domain-specific knowledge over time
- With 1M context: expertise files can be 10K+ tokens
- 20 briefs in → agents become domain experts for YOUR business

## Memo Quality Grading Criteria

Inspired by Anthropic's GAN-pattern harness design (Mar 2026): separate generation from evaluation. The CEO generates the memo, but these criteria can be used by a reviewer agent or the user to grade output quality.

Each criterion is scored 1-5. A memo should score ≥3 on all four to be considered actionable.

### 1. Actionability (weight: HIGH)
Can the reader act on this memo without further research? Strong memos have specific next actions with owners and deadlines. Weak memos end with vague "consider this" language. A 5 means: someone could execute the top recommendation tomorrow morning.

### 2. Tension Depth (weight: HIGH)
Did the board surface genuine disagreements, or did everyone politely agree? A 5 means: at least 2 unresolved tensions are documented with both sides' reasoning intact. A 1 means: all members converged on the same position in round 1 (brief was too easy, or agents weren't pushed hard enough).

### 3. Risk Coverage (weight: MEDIUM)
Are the trade-offs concrete and specific to THIS decision, or generic "there are risks" filler? Look for: second-order effects (Contrarian), financial downside scenarios with numbers (Financial Realist), opportunity costs of inaction (Compounder). A 5 means: you learn something about risk you hadn't considered.

### 4. Time-Horizon Balance (weight: MEDIUM)
Does the memo integrate short-term (Financial Realist, 1-2y), medium-term (Career Advisor, 3-5y), and long-term (Compounder/Moonshot, 5-10y+) perspectives? A weak memo collapses into one time horizon. A 5 means: the recommendations explicitly address what to do now vs. what to position for later.

### Using the Criteria
- **Self-review**: CEO agent can score its own memo before finalizing (but expect leniency — agents tend to overrate their own work)
- **External review**: Use the `memo-reviewer` subagent with these criteria for honest grading
- **Post-session**: User reviews and annotates for feedback into expertise files

## Gotchas

1. **Budget**: 1M context window with Opus = expensive. Always set budget limits in config
2. **Brief quality**: Garbage in = garbage out. Use brief-writer skill templates
3. **Agent consensus**: If all agents agree immediately, your brief isn't hard enough
4. **Moonshot dissent**: Expected and valuable — don't "fix" the Moonshot for agreeing too much
5. **Expertise file size**: With 1M context you can go big, but keep it structured
6. **Not a conversation**: This is a one-shot system. Don't try to prompt it interactively
7. **Model diversity**: Ideally use different providers per agent, but requires all to support 500K+ context
8. **SVG generation**: Agents can create SVGs to argue visually — encourage this in system prompts
