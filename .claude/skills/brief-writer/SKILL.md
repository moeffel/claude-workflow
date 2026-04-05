---
name: brief-writer
description: Use when writing, reviewing, or validating strategic decision briefs for the CEO & Board system — provides templates, required sections, and quality guidelines
---

# Brief Writer

Briefs are the **input interface** to the CEO & Board system. Quality of brief = quality of memo.

## What Is a Brief?

A structured markdown document presenting a decision/question to the multi-agent team. The system validates briefs against required sections and rejects incomplete ones.

## Required Sections

The system **rejects briefs** missing any of these:

| Section | Purpose | Example |
|---------|---------|---------|
| `## Situation` | What's happening? Context, background, current state | "Neutra Holdings offered $12M to acquire BlendStack" |
| `## Stakes` | What's at risk? What if we do nothing? | "Offer expires in 30 days. 5 quarters of declining growth" |
| `## Constraints` | Time, budget, resources, legal limits | "Non-negotiable price. 30-day deadline. No counter-offer" |
| `## Key Questions` | Specific questions the board must answer | "Should we accept at 11x ARR given decelerating growth?" |

## Quality Guidelines

### DO
- Be specific: "Should we invest $50K in YouTube Shorts given our 6.2% churn?"
- Include real numbers: ARR, churn rates, growth metrics, team size
- Reference additional context files (business metrics, product overview)
- Think before you brief — if you can't articulate the question, agents can't answer it
- Provide 2-3 key questions, not 10

### DON'T
- Write lazy 2-sentence prompts — serious input = serious output
- Ask vague questions: "Should we grow?" or "What's the best strategy?"
- Omit financial data — agents need numbers to make concrete recommendations
- Forget constraints — unconstrained decisions are meaningless

## Additional Context Files

Place alongside the brief in `ceo-agents/briefs/`:

- **business-metrics.md** — Revenue (ARR, MRR, growth, churn), customers, product details
- **product-overview.md** — What you build, for whom, how, key differentiator
- **market-data.md** — Competitors, trends, opportunities, threats

All board members load these files — everyone starts on the same page.

## Example Brief Topics

| Domain | Example Brief |
|--------|--------------|
| M&A | "Should we accept Neutra's $12M acquisition offer at 11x ARR?" |
| Marketing | "Which shorts platform should we lead with for BlendStack?" |
| Product | "Should we pivot from D2C to B2B given enterprise interest?" |
| Regulatory | "How should we respond to FDA warning about supplement claims?" |
| Hiring | "Should we hire 3 engineers or outsource the mobile app?" |
| Pricing | "Should we raise prices 20% and risk 8% churn increase?" |
| Investment | "Should we take $2M seed at 15% dilution to accelerate growth?" |

## Template

See `templates/brief-template.md` for the standard template.
See `templates/context-template.md` for business context template.

## Gotchas

- A brief without numbers produces a memo without actionable recommendations
- Board members debate better with specific trade-offs, not abstract questions
- The CEO agent treats the brief as the single source of truth — everything not in the brief doesn't exist
- Multiple briefs per domain compound expertise — your 20th brief gets better answers than your 1st
