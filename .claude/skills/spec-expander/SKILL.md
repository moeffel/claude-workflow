# Spec Expander

## When to use

Activate this skill when:
- The user describes a feature, product, or idea in 1-4 sentences
- Requirements are vague, incomplete, or ambiguous
- Before any planning or implementation begins
- After `superpowers:brainstorming` has generated initial approaches

## Purpose

Transform vague ideas into production-grade specifications. A great spec is the foundation of project success — without it, planning and implementation drift.

## Process

### Phase 1: Interview (if input is < 5 sentences)

Ask the user focused questions to fill gaps. Do NOT guess — ask. Cover:

1. **Problem**: What specific problem does this solve? Who has this problem?
2. **Users**: Who are the primary users? What are their skill levels?
3. **Scope**: What's the MVP? What's explicitly out of scope?
4. **Constraints**: Performance requirements? Budget? Timeline? Tech stack?
5. **Success**: How will we know this works? What metrics matter?

Keep it to 5-8 questions max. Don't interrogate — fill gaps efficiently.

### Phase 2: Expand into structured spec

Write the spec with these sections (skip sections that don't apply):

```markdown
# [Feature/Product Name] — Specification

## Problem Statement
What problem are we solving and why does it matter?
One paragraph, concrete, measurable impact.

## Users & Personas
| Persona | Description | Primary need |
|---------|-------------|-------------|

## Functional Requirements
Numbered list. Each requirement is:
- Testable (has clear pass/fail criteria)
- Scoped (one behavior per requirement)
- Prioritized (MUST / SHOULD / COULD)

### MUST have
1. ...

### SHOULD have
1. ...

### COULD have (future)
1. ...

## Non-Functional Requirements
- Performance: response times, throughput, limits
- Security: auth, data protection, compliance
- Scalability: expected load, growth assumptions
- Accessibility: WCAG level, supported devices

## Technical Constraints
- Stack/framework requirements
- Integration points and dependencies
- Data model highlights (entities, relationships)
- API surface (endpoints, contracts)

## Acceptance Criteria
For each MUST requirement, define:
- Given [context]
- When [action]
- Then [expected result]

## Out of Scope
Explicitly list what we are NOT building. This prevents scope creep.

## Open Questions
Things we don't know yet that need answers before implementation.

## Success Metrics
How we measure success post-launch. Concrete numbers.
```

### Phase 3: Validate with user

Present the spec and ask:
1. Does this match your vision?
2. Anything missing or wrong?
3. Are the priorities (MUST/SHOULD/COULD) correct?

Iterate until the user confirms.

## Output

Write the final spec to `docs/specs/YYYY-MM-DD-[name].md`.

## Quality bar

A spec is ready when:
- Every MUST requirement has acceptance criteria
- Out of scope is explicitly defined
- No open questions remain that block implementation
- The user has confirmed the spec
