---
name: pi-harness-guide
description: Use when writing PI extensions, configuring PI agents, or working with PI's Extension API — covers TypeScript extension patterns, front-matter schema, multi-agent orchestration, skills, themes, and best practices
---

# PI Agent Harness Guide

[PI](https://github.com/badlogic/pi-mono) is an open-source customizable agent harness by Mario Zechner. Think of it as **programmable Claude Code** — you can override everything.

## Why PI (not Claude Code)

| Feature | Claude Code | PI |
|---------|-------------|-----|
| System prompt | Limited override | **Full override** via `before_agent_start` event |
| Agent loop | Fixed | **Programmable** via Extension API |
| Multi-agent | Subagents (isolated) | **Extensions as micro-applications** |
| UI | Terminal (fixed) | **Custom TUI** (widgets, footers, overlays, custom editors) |
| Provider routing | Anthropic only | **Any provider** via registerProvider() |
| Tool system | Built-in tools | **Custom tools** + intercept built-in via tool_call/tool_result |

## Quick Reference

```bash
pi                    # Start interactive session
pi -c                 # Continue most recent session
pi -r                 # Browse past sessions
pi --no-session       # Ephemeral mode
pi --print "prompt"   # Non-interactive output
```

## Extension API

Extensions are TypeScript modules in `.pi/extensions/` (project) or `~/.pi/agent/extensions/` (global):

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

export default function (pi: ExtensionAPI) {
  // Register custom tools the model can call
  pi.registerTool({
    name: "converse",
    label: "Board Discussion",
    description: "Send message to board members",
    parameters: Type.Object({
      message: Type.String({ description: "Message to send" }),
      targets: Type.Optional(Type.Array(Type.String()))
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      // params is typed from schema
      return { content: [{ type: "text", text: "response" }], isError: false };
    }
  });

  // Register slash commands
  pi.registerCommand("begin", {
    description: "Start CEO & Board session",
    handler: async (args, ctx) => {
      // ctx is ExtensionCommandContext (extended with waitForIdle, newSession, etc.)
    }
  });

  // Inject/replace system prompt per turn
  pi.on("before_agent_start", async (event, ctx) => {
    return { systemPrompt: "You are the CEO of a strategic advisory board..." };
  });

  // Intercept tool calls (can block)
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash" && event.input.command.includes("rm -rf")) {
      return { block: true, reason: "Blocked by damage control" };
    }
  });

  // Track turns for budget/constraint enforcement
  pi.on("turn_end", async (event, ctx) => { /* check constraints */ });

  // UI customization
  pi.on("session_start", async (event, ctx) => {
    ctx.ui.setStatus("budget", "$0.00/$20.00");
    ctx.ui.setWidget("progress", ["Round 1/10", "Members: 0/6 responded"]);
    ctx.ui.setFooter((tui, theme, footerData) => {
      // Return a pi-tui Component
    });
  });
}
```

### Available Module Imports

Extensions can import from these bundled packages:

```typescript
import { ... } from "@mariozechner/pi-coding-agent";
import { ... } from "@mariozechner/pi-agent-core";
import { ... } from "@mariozechner/pi-ai";
import { ... } from "@mariozechner/pi-ai/oauth";
import { ... } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
```

### Key Events

| Event | When | Return | Use For |
|-------|------|--------|---------|
| `before_agent_start` | After user prompt, before agent loop | `{ systemPrompt?, message? }` | System prompt injection |
| `tool_call` | Before tool execution | `{ block?, reason? }` | Intercept, validate, block |
| `tool_result` | After tool execution | `{ content?, isError? }` | Modify results |
| `turn_end` | After model responds | — | Check constraints, track usage |
| `context` | Before each LLM call | `{ messages? }` | Modify message history |
| `agent_start/end` | Agent lifecycle | — | Track agent runs |
| `session_start` | Session loaded | — | Initialize UI, state |
| `input` | User input received | `{ action, text? }` | Transform/intercept input |
| `model_select` | Model changed | — | React to model switches |

### Important Gotchas

1. **Action methods (`sendMessage`, `sendUserMessage`) throw during factory execution** — only use them inside event handlers and command handlers
2. **`registerTool()` IS safe during factory execution** — tool registration works immediately
3. **`session_directory` handler has NO ctx** — it fires before runtime initialization
4. **`tool_call` event.input is mutable** — mutate in place to patch arguments
5. **OAuth active = tool names translated** — PI renames to Claude Code casing (Read, Write, Bash) transparently

## Auth System

### Priority Chain (highest to lowest)

1. Runtime override (`--api-key` CLI flag)
2. API key from `~/.pi/agent/auth.json`
3. OAuth token from auth.json (auto-refreshed with file locking)
4. Environment variable (`ANTHROPIC_API_KEY`, `ANTHROPIC_OAUTH_TOKEN`)
5. Fallback resolver (models.json custom providers)

### Accessing Auth from Extensions

```typescript
pi.on("session_start", async (event, ctx) => {
  const registry = ctx.modelRegistry;
  const apiKey = await registry.getApiKeyForProvider("anthropic");
  const auth = await registry.getApiKeyAndHeaders(ctx.model!);
  // auth.ok ? { apiKey, headers } : { error }
});
```

### Making Direct Anthropic API Calls

```typescript
import Anthropic from "@anthropic-ai/sdk";

// With API key:
const client = new Anthropic({
  apiKey: apiKey,
  baseURL: model.baseUrl,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "accept": "application/json",
    "anthropic-dangerous-direct-browser-access": "true",
    "anthropic-beta": "fine-grained-tool-streaming-2025-05-14"
  }
});

// With OAuth token (starts with "sk-ant-oat"):
const client = new Anthropic({
  apiKey: null,
  authToken: oauthToken,
  baseURL: model.baseUrl,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "accept": "application/json",
    "anthropic-dangerous-direct-browser-access": "true",
    "anthropic-beta": "claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14",
    "user-agent": "claude-cli/2.1.75",
    "x-app": "cli"
  }
});
```

**CRITICAL**: OAuth requests MUST include this system prompt prefix:
```typescript
system: [
  { type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." },
  { type: "text", text: yourActualSystemPrompt }
]
```

## Multi-Agent Patterns

### 1. Extension as Orchestrator
```
CEO Extension → registers /begin command
  → reads brief, loads agent configs
  → makes parallel Anthropic API calls (one per board member)
  → collects responses, runs debate rounds
  → generates memo
```

The extension owns the entire multi-agent loop. PI's built-in agent handles the CEO; board members are direct API calls.

### 2. Provider Registration (custom routing)
```typescript
pi.registerProvider("board-proxy", {
  baseUrl: "https://api.anthropic.com",
  apiKey: "ANTHROPIC_API_KEY",
  api: "anthropic-messages",
  models: [{ id: "claude-sonnet-4-20250514", name: "Board Member", ... }]
});
```

## Directory Structure

```
.pi/
  extensions/          # TypeScript extensions (auto-discovered)
    ceo-board.ts       # Entry point
    lib/               # Modular code (imported by entry point)

~/.pi/agent/           # Global PI config
  auth.json            # Credentials (file-locked)
  models.json          # Custom provider/model config
  extensions/          # Global extensions
```

## Best Practices

1. **One extension per micro-application** — CEO Board is one extension, not five
2. **Use `before_agent_start` for system prompts** — return `{ systemPrompt }` to override per turn
3. **TypeBox for tool schemas** — `Type.Object()`, not raw JSON Schema
4. **Budget constraints are essential** — track via `turn_end` event and token usage
5. **`ctx.ui.setStatus()` for live feedback** — status bar key/value pairs
6. **Use `ctx.ui.select()` signature correctly** — `select(title, options[], opts?)`

See `references/extension-api.md` for the complete TypeScript API reference with all interfaces, types, and auth details.
