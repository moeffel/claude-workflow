# Spec Reviewer

## When to use

Activate this skill when:
- A spec has been written (by `spec-expander` or manually)
- Before moving from Step 1 (Brainstorm) to Step 2 (Plan)
- The user asks for a spec review or quality check
- A spec feels "too easy" or suspiciously complete

## Purpose

Adversarial review of specifications to catch gaps, wrong assumptions, and missing edge cases BEFORE any code is written. Fixing a spec costs minutes. Fixing code from a bad spec costs hours.

## Process

### Phase 1: Completeness Audit (7 dimensions)

Score each dimension A-F:

| Dimension | What to check | Grade |
|-----------|--------------|-------|
| **Clarity** | Can a developer implement this without asking questions? Any ambiguous words ("fast", "simple", "intuitive")? | |
| **Testability** | Does every MUST requirement have acceptance criteria? Can each be verified automatically? | |
| **Scope** | Is out-of-scope defined? Are boundaries sharp or fuzzy? Any scope creep hiding in SHOULD/COULD? | |
| **Feasibility** | Can this actually be built with the stated constraints? Any impossible combinations? | |
| **Consistency** | Do requirements contradict each other? Do non-functional requirements conflict with functional ones? | |
| **Security** | Are auth, input validation, data protection addressed? Any OWASP Top 10 risks unmentioned? | |
| **Completeness** | Missing error cases? Missing edge cases? What happens when things go wrong? | |

### Phase 2: Adversarial Challenges

For each MUST requirement, ask:
1. **What if it fails?** — Is the failure mode defined?
2. **What's the edge case?** — Empty input, max load, concurrent access, network failure
3. **What's the assumption?** — State it explicitly. Is it validated?
4. **Who disagrees?** — What would a skeptical stakeholder push back on?

### Phase 3: Kill/Fix/Ship Decision

Based on the audit:

- **KILL** (any dimension F) — Spec has a fatal gap. Must rewrite that section.
- **FIX** (any dimension C-D) — Spec has issues but they're fixable. List specific fixes.
- **SHIP** (all dimensions A-B) — Spec is ready for planning.

### Phase 4: Cross-Model Review (optional, recommended for complex specs)

If available, delegate review to a second model for independent perspective:
- Use `/codex:review` to get Codex's take on the spec file
- Or spawn a subagent with a different model (Opus for depth, Haiku for fresh eyes)
- Compare findings — disagreements between models reveal blind spots

## Output format

```markdown
## Spec Review: [Spec Name]

### Scores
| Dimension | Grade | Issues |
|-----------|-------|--------|
| Clarity | B | "fast" undefined in req #3 |
| ... | ... | ... |

### Critical Issues (must fix before planning)
1. ...

### Recommendations (should fix)
1. ...

### Verdict: KILL / FIX / SHIP
[Reasoning]
```

## Quality bar

A review is complete when:
- All 7 dimensions are scored
- Every MUST requirement has been challenged
- A clear KILL/FIX/SHIP verdict is given
- If FIX: specific changes are listed, not vague suggestions
