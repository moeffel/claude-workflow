import Anthropic from "@anthropic-ai/sdk";
import type { AgentDefinition, BoardMessage } from "./types.js";
import { injectRuntimeVars } from "./agent-loader.js";

// Minimal type for PI's ModelRegistry (avoids importing PI internals)
interface ModelRegistry {
  getApiKeyForProvider(provider: string): Promise<string | undefined>;
}

async function createClient(modelRegistry?: ModelRegistry): Promise<{ client: Anthropic; isOAuth: boolean }> {
  // 1. If ANTHROPIC_API_KEY is set, the SDK picks it up automatically
  if (process.env.ANTHROPIC_API_KEY) {
    return { client: new Anthropic(), isOAuth: false };
  }

  // 2. Use PI's ModelRegistry to resolve the API key (handles OAuth refresh, env vars, etc.)
  if (modelRegistry) {
    const apiKey = await modelRegistry.getApiKeyForProvider("anthropic");
    if (apiKey) {
      const isOAuth = apiKey.includes("sk-ant-oat");
      if (isOAuth) {
        return {
          client: new Anthropic({
            apiKey: null,
            authToken: apiKey,
            dangerouslyAllowBrowser: true,
            defaultHeaders: {
              "accept": "application/json",
              "anthropic-dangerous-direct-browser-access": "true",
              "anthropic-beta": "claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14",
              "user-agent": "claude-cli/2.1.75",
              "x-app": "cli",
            },
          }),
          isOAuth: true,
        };
      }
      return { client: new Anthropic({ apiKey }), isOAuth: false };
    }
  }

  // 3. Fallback: let SDK throw its own error
  return { client: new Anthropic(), isOAuth: false };
}

export class ConversationManager {
  private messages: BoardMessage[] = [];
  private round = 0;
  private dryRun: boolean;
  private modelRegistry?: ModelRegistry;
  private client: Anthropic | null = null;
  private isOAuth = false;

  constructor(dryRun = false, modelRegistry?: ModelRegistry) {
    this.dryRun = dryRun;
    this.modelRegistry = modelRegistry;
  }

  private async getClient(): Promise<Anthropic> {
    if (!this.client) {
      const result = await createClient(this.modelRegistry);
      this.client = result.client;
      this.isOAuth = result.isOAuth;
    }
    return this.client;
  }

  async broadcast(
    fromAgent: AgentDefinition,
    message: string,
    toAgents: AgentDefinition[],
    runtimeContext: {
      briefContent: string;
      timeRemaining: string;
      budgetRemaining: string;
      roundNumber: number;
    }
  ): Promise<{ responses: BoardMessage[]; totalTokens: number; totalCost: number }> {
    this.round = runtimeContext.roundNumber;

    this.messages.push({
      round: this.round,
      from: fromAgent.name,
      to: "all",
      content: message,
      timestamp: new Date().toISOString(),
      tokens: 0,
      cost_usd: 0,
    });

    if (this.dryRun) {
      return this.mockResponses(toAgents);
    }

    const conversationHistory = this.messages
      .map((m) => `[${m.from} → ${m.to}]: ${m.content}`)
      .join("\n\n");

    const responsePromises = toAgents.map((agent) =>
      this.callAgent(agent, message, conversationHistory, runtimeContext)
    );

    const responses = await Promise.all(responsePromises);
    const boardMessages: BoardMessage[] = [];
    let totalTokens = 0;
    let totalCost = 0;

    for (const resp of responses) {
      const msg: BoardMessage = {
        round: this.round,
        from: resp.agentName,
        to: "all",
        content: resp.content,
        timestamp: new Date().toISOString(),
        tokens: resp.inputTokens + resp.outputTokens,
        cost_usd: resp.cost,
      };
      this.messages.push(msg);
      boardMessages.push(msg);
      totalTokens += msg.tokens;
      totalCost += resp.cost;
    }

    return { responses: boardMessages, totalTokens, totalCost };
  }

  private async callAgent(
    agent: AgentDefinition,
    ceoMessage: string,
    conversationHistory: string,
    runtimeContext: {
      briefContent: string;
      timeRemaining: string;
      budgetRemaining: string;
      roundNumber: number;
    }
  ): Promise<{
    agentName: string;
    content: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }> {
    const systemPrompt = injectRuntimeVars(agent.systemPrompt, {
      ...runtimeContext,
      expertiseContent: agent.expertiseContent,
    });

    const userMessage =
      `KONVERSATIONSVERLAUF:\n${conversationHistory}\n\n` +
      `AKTUELLE NACHRICHT VOM CEO:\n${ceoMessage}\n\n` +
      `Antworte in deiner Rolle als ${agent.name}. Befolge dein Report Format.`;

    try {
      const client = await this.getClient();

      // OAuth requires Claude Code identity prefix in system prompt
      const system = this.isOAuth
        ? [
            { type: "text" as const, text: "You are Claude Code, Anthropic's official CLI for Claude." },
            { type: "text" as const, text: systemPrompt },
          ]
        : systemPrompt;

      const makeCall = () => client.messages.create({
        model: this.mapModel(agent.model),
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: userMessage }],
      });

      let response;
      try {
        response = await makeCall();
      } catch (retryErr: any) {
        if (retryErr?.status >= 500) {
          console.warn(`Agent ${agent.name}: 500 error, retrying in 3s...`);
          await new Promise((r) => setTimeout(r, 3000));
          response = await makeCall();
        } else {
          throw retryErr;
        }
      }

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      const cost = (inputTokens * 3 + outputTokens * 15) / 1_000_000;

      return { agentName: agent.name, content, inputTokens, outputTokens, cost };
    } catch (err) {
      console.warn(`Agent ${agent.name} failed: ${err}`);
      return {
        agentName: agent.name,
        content: `[${agent.name} konnte nicht antworten: ${err}]`,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };
    }
  }

  private mapModel(model: string): string {
    const map: Record<string, string> = {
      "claude-opus-4-6": "claude-opus-4-6",
      "claude-sonnet-4-6": "claude-sonnet-4-6",
      "opus-4-6": "claude-opus-4-6",
      "sonnet-4-6": "claude-sonnet-4-6",
    };
    return map[model] || model;
  }

  private mockResponses(agents: AgentDefinition[]): {
    responses: BoardMessage[];
    totalTokens: number;
    totalCost: number;
  } {
    const responses = agents.map((agent) => ({
      round: this.round,
      from: agent.name,
      to: "all" as const,
      content: `[DRY RUN] ${agent.name}: Mock-Antwort für Runde ${this.round}. Position: BEDINGT.`,
      timestamp: new Date().toISOString(),
      tokens: 100,
      cost_usd: 0,
    }));
    responses.forEach((r) => this.messages.push(r));
    return { responses, totalTokens: 0, totalCost: 0 };
  }

  getMessages(): BoardMessage[] {
    return [...this.messages];
  }

  getMessagesForRound(round: number): BoardMessage[] {
    return this.messages.filter((m) => m.round === round);
  }

  async getClientInfo(): Promise<{ client: Anthropic; isOAuth: boolean }> {
    const client = await this.getClient();
    return { client, isOAuth: this.isOAuth };
  }
}
