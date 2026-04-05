import type { BudgetState, MeetingConfig } from "./types.js";

export class BudgetTracker {
  private startTime: number;
  private totalCostUsd = 0;
  private roundNumber = 0;
  private config: MeetingConfig;

  constructor(config: MeetingConfig) {
    this.config = config;
    this.startTime = Date.now();
  }

  addCost(costUsd: number): void {
    this.totalCostUsd += costUsd;
  }

  nextRound(): void {
    this.roundNumber++;
  }

  getState(): BudgetState {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const overTime = elapsedMinutes >= this.config.max_duration_minutes;
    const overBudget = this.totalCostUsd >= this.config.max_budget_usd;
    const overRounds = this.roundNumber >= this.config.max_rounds;
    const belowMinRounds = this.roundNumber < this.config.min_rounds;

    return {
      startTime: this.startTime,
      elapsedMinutes: Math.round(elapsedMinutes * 10) / 10,
      spentUsd: Math.round(this.totalCostUsd * 100) / 100,
      roundNumber: this.roundNumber,
      overTime,
      overBudget,
      shouldWrapUp: !belowMinRounds && (overTime || overBudget || overRounds),
    };
  }

  isHardStop(): boolean {
    return this.totalCostUsd >= this.config.max_budget_usd * 2;
  }

  formatStatus(): string {
    const s = this.getState();
    return (
      `💰 $${s.spentUsd.toFixed(2)}/$${this.config.max_budget_usd.toFixed(2)} | ` +
      `⏱ ${s.elapsedMinutes.toFixed(1)}/${this.config.max_duration_minutes}min | ` +
      `🔄 Runde ${s.roundNumber}/${this.config.max_rounds}`
    );
  }
}
