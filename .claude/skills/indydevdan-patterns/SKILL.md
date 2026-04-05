---
name: indydevdan-patterns
description: Use when designing agent architectures, writing system prompts, or applying agentic engineering patterns — covers Core Four, PITER, ADWs, Agent Expertise, and Templated Engineering from IndyDevDan
---

# IndyDevDan Agentic Engineering Patterns

Reference skill for [IndyDevDan's](https://agenticengineer.com/) (github.com/disler) frameworks and design philosophy.

## Core Four (Fundamental Leverage Points)

Every agentic system has four dials. Change one → better results. Change all four → exponential leverage.

| Lever | What It Is | CEO Board Example |
|-------|-----------|-------------------|
| **Context** | Information fed to the agent | Briefs, expertise files, business metrics, product overview |
| **Model** | Which LLM powers the agent | Opus 4.6 for CEO, Sonnet 4.6 for board members |
| **Prompt** | System prompts + input structure | Custom front-matter, templated briefs, personality definitions |
| **Tools** | Capabilities beyond text generation | SVG creation, file I/O, TTS (ElevenLabs), expertise persistence |

**Key insight**: "If you're not building specialized agents — Context, Model, Prompt, Tools — you are in the normal distribution of what everyone is getting."

## PITER Framework

Transforms single prompts into autonomous problem-solving workflows:

1. **P**lan — Understand the problem, gather context, form strategy
2. **I**mplement — Execute the plan with available tools
3. **T**est — Validate the output against requirements
4. **E**valuate — Assess quality, identify gaps
5. **R**efine — Iterate based on evaluation

## ADWs (AI Developer Workflows)

Combines **deterministic code** with **non-deterministic agents**:
- Deterministic: config validation, brief section checking, budget enforcement, file I/O
- Non-deterministic: agent debate, strategic reasoning, memo creation
- The PI extension wraps non-deterministic agents in deterministic constraints

## Agent Expertise Pattern

The third innovation — persistent domain knowledge per agent:

```
expertise/
├── ceo.md           # CEO's accumulated decision patterns
├── revenue.md       # Revenue agent's financial observations
├── moonshot.md      # Moonshot's rejected-but-valuable ideas
└── contrarian.md    # Contrarian's identified blind spots
```

### How It Works
- Each agent reads + writes to its own expertise file every session
- Tracks: agreements/disagreements with other members, recurring patterns, domain knowledge
- **Expertise ≠ Memory**: Expertise is memory + patterns for a specific domain. Not vague "remember this" but structured domain knowledge
- Revenue agent naturally opposes Compounder (90-day vs multi-year horizon)
- With 1M context window, expertise files can grow to 10K+ tokens

### Why It Matters
- 20 briefs in → expertise becomes compounding advantage
- Agents develop "relationships" — know who they agree/disagree with
- Specialization stacks over time — your agents get better at YOUR problems

## Templated Engineering

> "If you template your engineering, your agents can repeat what you did."

- **Brief templates** → force quality prompt engineering (required sections)
- **System prompt templates** → consistent agent personality structure
- **Memo templates** → standardized output format
- **Config templates** → reproducible meeting setups

Anti-pattern: Free-form prompting without templates = inconsistent results every time.

## 7-Level Prompt Hierarchy

1. Simple prompts (chat-style)
2. Structured prompts (with sections)
3. Templated prompts (reusable patterns)
4. System prompts (agent personality)
5. Orchestrated prompts (multi-agent coordination)
6. Self-correcting prompts (closed-loop validation)
7. Self-improving meta-prompts (agents improve their own prompts)

CEO Board operates at **level 5-6**: orchestrated multi-agent with constraint-based correction.

## Three Phases of AI Evolution

| Phase | Name | What It Means |
|-------|------|---------------|
| 1 | **Augment** | AI Coding — agent helps you write code |
| 2 | **Automate** | Agentic Coding — agents run workflows autonomously ← **WE ARE HERE** |
| 3 | **Deprecate** | Agents replace entire workflow classes |

## ZTE (Zero-Touch Engineering)

The North Star: codebases that self-ship.
- Agents monitor, test, deploy, and fix without human intervention
- CEO Board is a step toward this — strategic decisions without manual research

## Key Philosophy

- "The prompt is the new fundamental unit of knowledge work & programming"
- "These are not coding agents — this is a CEO and board built to make strategic decisions"
- "Coding is just the beginning. It's really just the beginning."
- Specialization > normal distribution
- Multi-agent adversarial debate exposes flaws in mental models
- "Don't just use agents as worker bees — use them for strategic decisions"
- "If you get a bunch of Chads on your team, every Chad says use React" — diversity of perspective matters
- One-shot multi-agent systems > conversational back-and-forth

## Applying These Patterns

When building for this project:
1. **Always check Core Four** — which lever can you turn?
2. **Template everything** — if you do it once, make it repeatable
3. **Specialize agents** — generic agents produce generic results
4. **Accumulate expertise** — every session should make agents smarter
5. **Constrain wisely** — time + budget limits force decisive output
6. **Observe everything** — conversation logs, tool use, expertise growth

See `references/key-repos.md` for IndyDevDan's full repository list.
