export interface BoardConfig {
  meeting: MeetingConfig;
  brief: BriefConfig;
  paths: PathsConfig;
  board: BoardRoster;
  tts: TtsConfig;
  output: OutputConfig;
}

export interface MeetingConfig {
  max_duration_minutes: number;
  max_budget_usd: number;
  min_rounds: number;
  max_rounds: number;
  dry_run: boolean;
  checkpoint_after_round: number;
  checkpoint_min_new_assumptions: number;
  research_enabled: boolean;
  research_max_searches: number;
  research_timeout_seconds: number;
}

export interface BriefConfig {
  required_sections: string[];
}

export interface PathsConfig {
  briefs: string;
  debates: string;
  memos: string;
  agents: string;
  expertise: string;
}

export interface RosterDefinition {
  description: string;
  members: AgentRef[];
}

export interface BoardRoster {
  ceo: AgentRef;
  active_roster?: string;
  rosters?: Record<string, RosterDefinition>;
  members: AgentRef[];
}

export interface AgentRef {
  name: string;
  file: string;
  model: string;
  skills?: string[];
}

export interface TtsConfig {
  enabled: boolean;
  provider: string;
}

export interface OutputConfig {
  open_memo_in_editor: boolean;
  generate_svg: boolean;
  generate_mp3: boolean;
}

export interface AgentDefinition {
  name: string;
  model: string;
  skills: string[];
  expertisePath: string;
  systemPrompt: string;
  expertiseContent: string;
  frontMatter: Record<string, unknown>;
}

export interface Brief {
  filename: string;
  title: string;
  content: string;
  sections: {
    situation: string;
    statusQuo: string;
    stakes: string;
    constraints: string;
    keyQuestions: string;
  };
  contextFiles: string[];
}

export interface BoardMessage {
  round: number;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  tokens: number;
  cost_usd: number;
}

export interface BudgetState {
  startTime: number;
  elapsedMinutes: number;
  spentUsd: number;
  roundNumber: number;
  overTime: boolean;
  overBudget: boolean;
  shouldWrapUp: boolean;
}

export interface DebateResult {
  brief: Brief;
  messages: BoardMessage[];
  finalStances: Map<string, string>;
  budgetState: BudgetState;
  config: BoardConfig;
}
