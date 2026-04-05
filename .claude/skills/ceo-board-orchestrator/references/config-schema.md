# Config.yaml Schema Reference

## meeting
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `max_duration_minutes` | int | 5 | Max time for entire debate session |
| `max_budget_usd` | float | 5.00 | Max API spend per session |
| `min_rounds` | int | 2 | Minimum debate rounds before CEO can end |
| `max_rounds` | int | 10 | Hard stop on rounds |

## brief
| Field | Type | Description |
|-------|------|-------------|
| `required_sections` | list[str] | Markdown headers that must exist in every brief |

## paths
| Field | Type | Description |
|-------|------|-------------|
| `briefs` | str | Directory for input briefs |
| `debates` | str | Directory for mid-state debate files |
| `memos` | str | Directory for output memos |
| `agents` | str | Directory for agent system prompts |
| `expertise` | str | Directory for persistent agent expertise |

## board.ceo
| Field | Type | Description |
|-------|------|-------------|
| `file` | str | Path to CEO system prompt (relative to ceo-agents/) |
| `model` | str | LLM model identifier |
| `skills` | list[str] | CEO-specific capabilities |

## board.members[]
| Field | Type | Description |
|-------|------|-------------|
| `name` | str | Board member identifier |
| `file` | str | Path to system prompt |
| `model` | str | LLM model identifier |

## tts
| Field | Type | Description |
|-------|------|-------------|
| `enabled` | bool | Enable TTS summary generation |
| `provider` | str | elevenlabs / openai / pyttsx3 |

## output
| Field | Type | Description |
|-------|------|-------------|
| `open_memo_in_editor` | bool | Auto-open memo in VS Code |
| `generate_svg` | bool | Allow agents to create SVG arguments |
| `generate_mp3` | bool | Generate MP3 summary of memo |
