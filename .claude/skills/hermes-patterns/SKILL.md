---
name: hermes-patterns
description: Distilled agent patterns from Nous Research's Hermes Agent — self-improving skill creation, smart model routing, and subagent isolation. Apply during Step 7 (Learn), model selection, and agent orchestration.
source: https://github.com/NousResearch/hermes-agent
license: MIT
---

# Hermes Agent Patterns

Three production-proven patterns distilled from Nous Research's Hermes Agent (65k+ stars).

## 1. Self-Improving Skill Creation

Skills are procedural memory — they capture HOW to do a specific type of task based on proven experience.

**When to create a new skill:**
- A complex task succeeded (5+ tool calls) and the approach is reusable
- You overcame errors through a non-obvious debugging path
- A user-corrected approach worked better than your initial attempt
- A workflow pattern emerged that will recur across projects

**When NOT to create a skill:**
- The task was straightforward (< 5 tool calls)
- The solution is project-specific with no reuse potential
- An existing skill already covers the pattern

**How to create:**
1. After a successful complex task, ask: *"Would this save time in a future session?"*
2. If yes, extract the reusable pattern into `.claude/skills/<name>/SKILL.md`
3. Include: trigger conditions (when to activate), step-by-step procedure, verification criteria
4. Keep it under 200 lines — a skill is a recipe, not a textbook
5. If issues emerge after use, patch the skill immediately

**Skill structure:**
```
.claude/skills/<name>/
├── SKILL.md          # Main skill (frontmatter + instructions)
├── references/       # Reference docs, examples
├── templates/        # Reusable file templates
└── scripts/          # Helper scripts
```

## 2. Smart Model Routing

Route tasks to the right model based on concrete signals, not gut feeling.

**Route to Haiku (cheap/fast) when ALL true:**
- Message is under 160 characters / 28 words
- No code blocks, backticks, or multi-line content
- No URLs or file paths
- No complexity keywords: `debug`, `implement`, `refactor`, `architect`, `migrate`, `optimize`, `security`, `deploy`, `kubernetes`, `docker`, `database`, `schema`, `auth`, `crypto`, `performance`, `concurrency`, `race condition`

**Stay on Sonnet (default) when:**
- Code generation, editing, or review is needed
- Research or multi-step reasoning required
- Any of the cheap-route conditions above are NOT met

**Escalate to Opus when:**
- Root-cause analysis across multiple interacting systems
- Architectural decisions with long-term consequences
- Subtle bugs where the failure mode is non-obvious
- Adversarial review (spec challenges, security audits)

**Rule:** When in doubt, stay on Sonnet. Wrong routing wastes more than it saves.

## 3. Subagent Isolation

When delegating to subagents, enforce clean boundaries.

**Isolation principles:**
- **Fresh context**: Each subagent starts with zero parent history. Brief it explicitly — it knows nothing.
- **Restricted toolset**: Block tools the subagent shouldn't need. An evaluator shouldn't edit files. A researcher shouldn't commit code.
- **Depth limit**: Subagents must not spawn sub-subagents (max depth = 1 delegation level). This prevents runaway agent chains.
- **Scoped output**: Subagents return only a final summary. Intermediate tool calls stay internal — they don't pollute the parent context.

**Batch delegation:** When 2-3 independent tasks exist, delegate them in parallel in a single message. Don't serialize what can run concurrently.

**Result contract:** Every subagent result should include:
- Status: completed / failed / partial
- Summary: what was done and what was found
- Artifacts: file paths created or modified (if any)
- Follow-ups: anything the parent needs to act on
