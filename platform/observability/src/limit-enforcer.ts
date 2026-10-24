import {
  ExecutionLimits,
  BudgetExceededError,
  TimeoutExceededError,
  ConcurrencyExceededError,
  LimitExceededError,
} from './types.js';

export class LimitEnforcer {
  private activeSlots = new Set<string>();

  constructor(public readonly limits: ExecutionLimits = {}) {}

  public checkBudget(runId: string, current: { currentCostUsd: number }): void {
    if (this.limits.maxCostUsd !== undefined && current.currentCostUsd > this.limits.maxCostUsd) {
      throw new BudgetExceededError(
        `Run ${runId} exceeded cost budget: $${current.currentCostUsd.toFixed(4)} > $${this.limits.maxCostUsd.toFixed(4)}`
      );
    }
  }

  public checkDuration(runId: string, current: { durationMs: number }): void {
    if (this.limits.maxDurationMs !== undefined && current.durationMs > this.limits.maxDurationMs) {
      throw new TimeoutExceededError(
        `Run ${runId} exceeded duration limit: ${current.durationMs}ms > ${this.limits.maxDurationMs}ms`
      );
    }
  }

  public acquireSlot(runId: string): void {
    if (this.limits.maxConcurrency !== undefined && this.activeSlots.size >= this.limits.maxConcurrency) {
      throw new ConcurrencyExceededError(
        `Concurrency limit reached (${this.activeSlots.size}/${this.limits.maxConcurrency}). Cannot schedule run ${runId}.`
      );
    }
    this.activeSlots.add(runId);
  }

  public releaseSlot(runId: string): void {
    this.activeSlots.delete(runId);
  }

  public getActiveConcurrency(): number {
    return this.activeSlots.size;
  }

  public checkRetries(runId: string, retryCount: number): void {
    const max = this.limits.maxRetries ?? 3;
    if (retryCount >= max) {
      throw new LimitExceededError(
        `Run ${runId} exceeded max retry limit (${retryCount}/${max})`
      );
    }
  }
}
