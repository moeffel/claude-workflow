import { readFileSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";
import type { BoardConfig } from "./types.js";

export function loadConfig(basePath: string): BoardConfig {
  const configPath = join(basePath, "config.yaml");
  const raw = readFileSync(configPath, "utf-8");
  const config = parseYaml(raw) as BoardConfig;
  validateConfig(config);

  // Apply defaults for optional checkpoint fields
  config.meeting.checkpoint_after_round ??= 2;
  config.meeting.checkpoint_min_new_assumptions ??= 3;
  config.meeting.research_enabled ??= true;
  config.meeting.research_max_searches ??= 15;
  config.meeting.research_timeout_seconds ??= 180;

  return config;
}

function validateConfig(config: BoardConfig): void {
  const errors: string[] = [];

  if (!config.meeting) errors.push("Missing 'meeting' section");
  if (!config.brief?.required_sections?.length)
    errors.push("Missing 'brief.required_sections'");
  if (!config.paths) errors.push("Missing 'paths' section");
  if (!config.board?.ceo) errors.push("Missing 'board.ceo'");
  if (!config.board?.members?.length) errors.push("No board members defined");

  if (config.meeting) {
    if (config.meeting.max_duration_minutes <= 0)
      errors.push("max_duration_minutes must be > 0");
    if (config.meeting.max_budget_usd <= 0)
      errors.push("max_budget_usd must be > 0");
    if (config.meeting.min_rounds < 1) errors.push("min_rounds must be >= 1");
  }

  if (errors.length > 0) {
    throw new Error(
      `Config validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }
}
