# PI Extension API Reference (v0.62+)

> Source of truth: [github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono) packages/coding-agent/src/core/extensions/types.ts

## Monorepo Structure

| Package | npm | Purpose |
|---------|-----|---------|
| `@mariozechner/pi-ai` | LLM layer | Multi-provider API (Anthropic, OpenAI, Google, etc.) |
| `@mariozechner/pi-agent-core` | Agent runtime | Tool calling, state management |
| `@mariozechner/pi-coding-agent` | CLI agent | Interactive coding agent, Extension API |
| `@mariozechner/pi-tui` | Terminal UI | Differential rendering, components |
| `@mariozechner/pi-web-ui` | Web components | AI chat interfaces |
| `@mariozechner/pi-mom` | Slack bot | Delegates to pi coding agent |
| `@mariozechner/pi-pods` | GPU pods | vLLM deployment management |

---

## Extension Entry Point

Extensions are TypeScript modules that export a default factory function:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI): void | Promise<void> {
  // All registration happens synchronously or via returned Promise
  // pi.on(), pi.registerTool(), pi.registerCommand(), etc.
}
```

**Type**: `ExtensionFactory = (pi: ExtensionAPI) => void | Promise<void>`

### Discovery & Loading

Extensions are discovered from (in order):
1. `cwd/.pi/extensions/` (project-local)
2. `~/.pi/agent/extensions/` (global, agentDir)
3. Explicitly configured paths

Within each directory:
- Direct `.ts` or `.js` files are loaded
- Subdirectories with `index.ts`/`index.js` are loaded
- Subdirectories with `package.json` containing `pi.extensions` field are loaded

### Available Module Aliases

Extensions can import from these aliased packages (bundled by PI):

```typescript
import { ... } from "@mariozechner/pi-coding-agent";
import { ... } from "@mariozechner/pi-agent-core";
import { ... } from "@mariozechner/pi-ai";
import { ... } from "@mariozechner/pi-ai/oauth";
import { ... } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
```

These are resolved via `virtualModules` (Bun binary) or `alias` (Node.js dev mode) in jiti.

---

## ExtensionAPI Interface

The `pi` object passed to the factory function provides:

### Event Subscription

```typescript
pi.on(event: string, handler: ExtensionHandler<Event, Result?>): void
```

**Handler type**: `(event: E, ctx: ExtensionContext) => Promise<R | void> | R | void`

**Exception**: `session_directory` handler receives NO ExtensionContext (fires at startup before context exists).

### Full Event List

| Event | Event Type | Return Type | When |
|-------|-----------|-------------|------|
| `resources_discover` | `ResourcesDiscoverEvent` | `ResourcesDiscoverResult` | After session_start, can provide skill/prompt/theme paths |
| `session_directory` | `SessionDirectoryEvent` | `SessionDirectoryResult` | Startup, custom session dir |
| `session_start` | `SessionStartEvent` | — | Initial session load |
| `session_before_switch` | `SessionBeforeSwitchEvent` | `SessionBeforeSwitchResult` | Before switch (cancellable) |
| `session_switch` | `SessionSwitchEvent` | — | After switch |
| `session_before_fork` | `SessionBeforeForkEvent` | `SessionBeforeForkResult` | Before fork (cancellable) |
| `session_fork` | `SessionForkEvent` | — | After fork |
| `session_before_compact` | `SessionBeforeCompactEvent` | `SessionBeforeCompactResult` | Before compaction (cancellable) |
| `session_compact` | `SessionCompactEvent` | — | After compaction |
| `session_shutdown` | `SessionShutdownEvent` | — | Process exit |
| `session_before_tree` | `SessionBeforeTreeEvent` | `SessionBeforeTreeResult` | Before tree navigation |
| `session_tree` | `SessionTreeEvent` | — | After tree navigation |
| `context` | `ContextEvent` | `ContextEventResult` | Before each LLM call, can modify messages |
| `before_provider_request` | `BeforeProviderRequestEvent` | payload replacement | Before API request sent |
| **`before_agent_start`** | `BeforeAgentStartEvent` | `BeforeAgentStartEventResult` | **After user prompt, before agent loop** |
| `agent_start` | `AgentStartEvent` | — | Agent loop starts |
| `agent_end` | `AgentEndEvent` | — | Agent loop ends |
| `turn_start` | `TurnStartEvent` | — | Each turn starts |
| `turn_end` | `TurnEndEvent` | — | Each turn ends |
| `message_start` | `MessageStartEvent` | — | Message begins |
| `message_update` | `MessageUpdateEvent` | — | Token-by-token streaming |
| `message_end` | `MessageEndEvent` | — | Message complete |
| `tool_execution_start` | `ToolExecutionStartEvent` | — | Tool starts executing |
| `tool_execution_update` | `ToolExecutionUpdateEvent` | — | Tool partial/streaming output |
| `tool_execution_end` | `ToolExecutionEndEvent` | — | Tool finished |
| `model_select` | `ModelSelectEvent` | — | Model changed |
| `tool_call` | `ToolCallEvent` | `ToolCallEventResult` | Before tool execution (can block) |
| `tool_result` | `ToolResultEvent` | `ToolResultEventResult` | After tool execution (can modify result) |
| `user_bash` | `UserBashEvent` | `UserBashEventResult` | User runs ! command |
| `input` | `InputEvent` | `InputEventResult` | User input received |

### Critical Event: `before_agent_start`

This is the key event for system prompt injection:

```typescript
pi.on("before_agent_start", async (event, ctx) => {
  // event.prompt — the user's input text
  // event.images — optional attached images
  // event.systemPrompt — the current system prompt (mutable!)
  return {
    systemPrompt?: string,    // Replace system prompt for this turn
    message?: {               // Inject a custom message
      customType: string,
      content: string,
      display?: string,
      details?: unknown
    }
  };
});
```

### Tool Registration

```typescript
import { Type } from "@sinclair/typebox";

pi.registerTool({
  name: "converse",
  label: "Board Discussion",           // Human-readable UI label
  description: "Send message to board", // LLM reads this
  promptSnippet?: string,              // One-liner for system prompt "Available tools" section
  promptGuidelines?: string[],         // Bullets appended to system prompt Guidelines
  parameters: Type.Object({            // TypeBox schema (NOT raw JSON Schema)
    message: Type.String({ description: "Message to send" }),
    targets: Type.Optional(Type.Array(Type.String()))
  }),
  execute: async (toolCallId, params, signal, onUpdate, ctx) => {
    // toolCallId: unique call identifier
    // params: validated arguments (typed from schema)
    // signal: AbortSignal for cancellation
    // onUpdate: callback for streaming partial results
    // ctx: ExtensionContext
    return {
      content: [{ type: "text", text: "result" }],
      isError: false,
      details?: any  // Custom details for renderResult
    };
  },
  renderCall?: (args, theme, context) => Component,    // Custom TUI for call display
  renderResult?: (result, options, theme, context) => Component  // Custom TUI for result
});
```

### Command Registration

```typescript
pi.registerCommand("begin", {
  description: "Start the CEO & Board session",
  getArgumentCompletions?: (prefix: string) => AutocompleteItem[] | null,
  handler: async (args: string, ctx: ExtensionCommandContext) => {
    // args = everything after /begin
    // ctx has extended methods: waitForIdle(), newSession(), fork(), reload(), etc.
  }
});
```

**ExtensionCommandContext** extends ExtensionContext with:
- `waitForIdle(): Promise<void>` — wait for agent to finish streaming
- `newSession(options?)` — start new session
- `fork(entryId)` — fork from entry
- `navigateTree(targetId, options?)` — navigate session tree
- `switchSession(sessionPath)` — switch session file
- `reload()` — reload extensions, skills, prompts, themes

### Shortcut & Flag Registration

```typescript
pi.registerShortcut("ctrl+b", {
  description: "Start board meeting",
  handler: async (ctx: ExtensionContext) => { /* ... */ }
});

pi.registerFlag("dry-run", {
  description: "Mock responses without API calls",
  type: "boolean",
  default: false
});

// Later: pi.getFlag("dry-run") => boolean | string | undefined
```

### Message Rendering

```typescript
pi.registerMessageRenderer<MyData>("board-vote", (message, options, theme) => {
  // Return a pi-tui Component for custom display
});
```

### Actions (available after runtime binding)

```typescript
// Send custom message to session
pi.sendMessage({ customType: "status", content: "Debate round 3...", display: "inline" },
  { triggerTurn?: boolean, deliverAs?: "steer" | "followUp" | "nextTurn" });

// Send user message (always triggers a turn)
pi.sendUserMessage("Continue the debate", { deliverAs?: "steer" | "followUp" });

// Append entry for persistence (NOT sent to LLM)
pi.appendEntry("debate-log", { round: 3, responses: [...] });

// Session metadata
pi.setSessionName("Board: CFA Decision");
pi.getSessionName();
pi.setLabel(entryId, "Key insight");

// Shell execution
const result = await pi.exec("node", ["script.js"], { cwd?: string, timeout?: number });

// Tool management
pi.getActiveTools();    // string[]
pi.getAllTools();        // ToolInfo[] (name, description, parameters, sourceInfo)
pi.setActiveTools(["bash", "read", "converse"]);

// Model & thinking
await pi.setModel(model);           // Returns false if no API key
pi.getThinkingLevel();               // ThinkingLevel
pi.setThinkingLevel("high");

// Provider registration (see section below)
pi.registerProvider(name, config);
pi.unregisterProvider(name);

// Inter-extension communication
pi.events.emit("custom-event", data);
pi.events.on("custom-event", handler);
```

---

## ExtensionContext (ctx)

Passed to all event handlers and tool execute functions:

```typescript
interface ExtensionContext {
  ui: ExtensionUIContext;           // UI methods
  hasUI: boolean;                   // false in print/RPC mode
  cwd: string;                     // Current working directory
  sessionManager: ReadonlySessionManager;
  modelRegistry: ModelRegistry;     // API key resolution
  model: Model<any> | undefined;   // Current model
  isIdle(): boolean;               // Agent not streaming
  abort(): void;                   // Cancel current operation
  hasPendingMessages(): boolean;
  shutdown(): void;                // Graceful exit
  getContextUsage(): ContextUsage | undefined;
  compact(options?: CompactOptions): void;
  getSystemPrompt(): string;       // Current effective system prompt
}
```

### UI Context (ctx.ui)

```typescript
interface ExtensionUIContext {
  // Dialogs
  select(title: string, options: string[], opts?: { signal?, timeout? }): Promise<string | undefined>;
  confirm(title: string, message: string, opts?): Promise<boolean>;
  input(title: string, placeholder?: string, opts?): Promise<string | undefined>;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  editor(title: string, prefill?: string): Promise<string | undefined>;

  // Status & widgets
  setStatus(key: string, text: string | undefined): void;
  setWorkingMessage(message?: string): void;
  setWidget(key: string, content: string[] | undefined, options?: { placement?: "aboveEditor" | "belowEditor" }): void;
  setWidget(key: string, componentFactory | undefined, options?): void;

  // Header/Footer customization
  setFooter(factory: ((tui, theme, footerData) => Component) | undefined): void;
  setHeader(factory: ((tui, theme) => Component) | undefined): void;
  setTitle(title: string): void;

  // Editor
  pasteToEditor(text: string): void;
  setEditorText(text: string): void;
  getEditorText(): string;
  setEditorComponent(factory | undefined): void;

  // Themes
  readonly theme: Theme;
  getAllThemes(): { name: string; path: string | undefined }[];
  getTheme(name: string): Theme | undefined;
  setTheme(theme: string | Theme): { success: boolean; error?: string };

  // Tool display
  getToolsExpanded(): boolean;
  setToolsExpanded(expanded: boolean): void;

  // Advanced
  onTerminalInput(handler: TerminalInputHandler): () => void;
  custom<T>(factory, options?): Promise<T>;
}
```

---

## Auth System

### Auth Resolution Priority

`AuthStorage.getApiKey(providerId)` resolves in this order:

1. **Runtime override** — `--api-key` CLI flag (`setRuntimeApiKey()`)
2. **API key from auth.json** — `type: "api_key"` credential
3. **OAuth token from auth.json** — `type: "oauth"` credential (auto-refreshed with file locking)
4. **Environment variable** — `getEnvApiKey(provider)`
5. **Fallback resolver** — `models.json` custom provider keys

### Auth Storage

Credentials stored in `~/.pi/agent/auth.json` (file-locked for concurrent access):

```json
{
  "anthropic": {
    "type": "oauth",
    "refresh": "...",
    "access": "sk-ant-oat-...",
    "expires": 1711800000000
  }
}
```

Or API key:
```json
{
  "anthropic": {
    "type": "api_key",
    "key": "sk-ant-api03-..."
  }
}
```

### Environment Variable Fallbacks

| Provider | Env Var(s) |
|----------|-----------|
| `anthropic` | `ANTHROPIC_OAUTH_TOKEN` (priority), `ANTHROPIC_API_KEY` |
| `openai` | `OPENAI_API_KEY` |
| `google` | `GEMINI_API_KEY` |
| `github-copilot` | `COPILOT_GITHUB_TOKEN`, `GH_TOKEN`, `GITHUB_TOKEN` |
| `groq` | `GROQ_API_KEY` |
| `xai` | `XAI_API_KEY` |
| `openrouter` | `OPENROUTER_API_KEY` |
| `mistral` | `MISTRAL_API_KEY` |
| `google-vertex` | `GOOGLE_CLOUD_API_KEY` (or ADC + project + location) |
| `amazon-bedrock` | `AWS_PROFILE`, `AWS_ACCESS_KEY_ID`+`AWS_SECRET_ACCESS_KEY`, `AWS_BEARER_TOKEN_BEDROCK` |

### ModelRegistry: Getting API Keys

```typescript
// From ExtensionContext:
const registry = ctx.modelRegistry;

// Get API key for current model's provider
const apiKey = await registry.getApiKeyForProvider("anthropic");

// Get API key + headers for a specific model (full resolution)
const auth = await registry.getApiKeyAndHeaders(model);
if (auth.ok) {
  // auth.apiKey: string | undefined
  // auth.headers: Record<string, string> | undefined
} else {
  // auth.error: string
}

// Check if auth is configured (fast, no token refresh)
registry.hasConfiguredAuth(model);

// Check if model uses OAuth (subscription)
registry.isUsingOAuth(model);

// Get all available models (with auth configured)
registry.getAvailable();

// Find specific model
registry.find("anthropic", "claude-sonnet-4-20250514");
```

---

## Making Direct Anthropic API Calls

### OAuth Token Detection

OAuth tokens are identified by the prefix `sk-ant-oat`. This triggers special handling:

### Client Construction (3 modes)

**1. API Key Auth** (standard):
```typescript
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
```

**2. OAuth Auth** (subscription via /login):
```typescript
const client = new Anthropic({
  apiKey: null,              // MUST be null
  authToken: oauthToken,     // Bearer token
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

**3. GitHub Copilot Auth** (Bearer, selective betas):
```typescript
const client = new Anthropic({
  apiKey: null,
  authToken: apiKey,
  baseURL: model.baseUrl,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "accept": "application/json",
    "anthropic-dangerous-direct-browser-access": "true"
    // NO fine-grained-tool-streaming beta
  }
});
```

### CRITICAL: OAuth System Prompt Requirement

When using OAuth tokens, the system prompt MUST start with Claude Code identity:

```typescript
params.system = [
  {
    type: "text",
    text: "You are Claude Code, Anthropic's official CLI for Claude.",
    cache_control: { type: "ephemeral" }
  },
  {
    type: "text",
    text: yourActualSystemPrompt,
    cache_control: { type: "ephemeral" }
  }
];
```

Without this prefix, OAuth requests will be rejected.

### Tool Name Translation (OAuth/Stealth Mode)

When using OAuth, PI translates tool names to match Claude Code's canonical casing:

```
read → Read, write → Write, edit → Edit, bash → Bash,
grep → Grep, glob → Glob, askuserquestion → AskUserQuestion, ...
```

This is done transparently in `convertTools()` and `fromClaudeCodeName()`.

### Thinking Configuration

**Adaptive thinking** (Opus 4.6 / Sonnet 4.6):
```typescript
params.thinking = { type: "adaptive" };
params.output_config = { effort: "high" }; // "low" | "medium" | "high" | "max" (Opus only)
```

**Budget-based thinking** (older models):
```typescript
params.thinking = { type: "enabled", budget_tokens: 4096 };
```

**Interleaved thinking beta**: Deprecated on Opus/Sonnet 4.6 (built-in). For older models:
```
anthropic-beta: interleaved-thinking-2025-05-14
```

### Cache Control

PI uses ephemeral cache by default. For `api.anthropic.com`, long TTL is available:
```typescript
cache_control: { type: "ephemeral", ttl: "1h" }  // Only on api.anthropic.com
```

---

## OAuth Flow Details

### Anthropic OAuth (Claude Pro/Max)

- **Client ID**: Base64-encoded in source (not secret, PKCE flow)
- **Authorize URL**: `https://claude.ai/oauth/authorize`
- **Token URL**: `https://platform.claude.com/v1/oauth/token`
- **Callback**: `http://localhost:53692/callback`
- **Scopes**: `org:create_api_key user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload`
- **Flow**: Authorization Code + PKCE (S256)
- **Token format**: `{ access_token, refresh_token, expires_in }`
- **Credentials stored as**: `{ refresh, access, expires: Date.now() + expires_in * 1000 - 5min buffer }`

### Token Refresh

Handled automatically by `AuthStorage.getApiKey()` with file locking to prevent race conditions when multiple PI instances run concurrently.

---

## Provider Registration (from Extensions)

```typescript
pi.registerProvider("my-proxy", {
  baseUrl: "https://proxy.example.com",
  apiKey: "PROXY_API_KEY",                // env var name or literal
  api: "anthropic-messages",               // API type
  headers?: Record<string, string>,
  authHeader?: boolean,                    // Adds Authorization: Bearer header
  streamSimple?: (model, context, options) => AssistantMessageEventStream,
  models: [
    {
      id: "claude-sonnet-4-20250514",
      name: "Claude 4 Sonnet (proxy)",
      reasoning: false,
      input: ["text", "image"],
      cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
      contextWindow: 200000,
      maxTokens: 16384,
      headers?: Record<string, string>,
      compat?: { ... }                     // OpenAI compatibility settings
    }
  ],
  oauth?: {
    name: "My Provider",
    login(callbacks): Promise<OAuthCredentials>,
    refreshToken(credentials): Promise<OAuthCredentials>,
    getApiKey(credentials): string,
    modifyModels?(models, credentials): Model[]
  }
});

// Override baseUrl for existing provider (no models needed)
pi.registerProvider("anthropic", {
  baseUrl: "https://my-anthropic-proxy.com"
});

pi.unregisterProvider("my-proxy"); // Restores built-in models
```

### API Types

Available `api` values: `"anthropic-messages"`, `"openai-completions"`, `"openai-responses"`, `"google-gemini"`, plus any custom registered APIs.

---

## Gotchas & Non-Obvious Patterns

1. **Action methods throw during loading** — `sendMessage()`, `sendUserMessage()`, etc. are stubs until `runner.bindCore()`. Only use them in event handlers and command handlers, NOT during factory execution.

2. **`registerTool()` IS safe during loading** — tool registration works immediately; `refreshTools()` is a no-op until bound.

3. **`session_directory` has NO context** — unlike all other events, this handler receives only the event (no `ctx`). It fires before the runtime is initialized.

4. **`tool_call` event.input is mutable** — mutate in place to patch tool arguments. No re-validation occurs after mutation.

5. **`before_agent_start` for system prompt** — return `{ systemPrompt: "..." }` to replace the system prompt for that turn. Multiple extensions chain their replacements.

6. **OAuth tool name translation** — when OAuth is active, PI renames tools to Claude Code casing (Read, Write, Bash, etc.) in API calls and reverses on response. Your extension tools keep their original names.

7. **models.json for custom providers** — place at `~/.pi/agent/models.json` for static provider configuration outside of extensions.

8. **Cost tracking** — `model.cost` uses per-million-token pricing. `calculateCost()` computes from usage stats.

9. **`pi.events` EventBus** — shared across all extensions for inter-extension communication. Fire custom events, not just PI lifecycle events.

10. **Parallel loading** — extensions load sequentially (for-loop in `loadExtensions`), but multiple instances of PI use file locking for auth.json access.

11. **Interleaved thinking beta** — skip for Opus 4.6 / Sonnet 4.6. The beta header is deprecated on these models (adaptive thinking is built-in).

12. **`resolveConfigValue()`** — API keys in models.json can reference env vars or commands. PI resolves them via `resolveConfigValueOrThrow()`.
