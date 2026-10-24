export interface AgentTaskExecutionRecord {
  taskId: string;
  agentRole: string;
  outcome: 'success' | 'failed';
  firstTryPass: boolean;
  selfHealed?: boolean;
  schemaValid: boolean;
  toolCallsSucceeded: number;
  toolCallsFailed: number;
  tokensUsed: number;
  costUsd: number;
  durationMs: number;
  policyViolations: number;
  executedAt?: Date;
}

export interface AgentEvaluationReport {
  agentRole: string;
  totalTasks: number;
  successRate: number;
  firstTryPassRate: number;
  selfHealRate: number;
  schemaValidityRate: number;
  toolReliabilityRate: number;
  totalCostUsd: number;
  averageDurationMs: number;
  totalPolicyViolations: number;
  compositeScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  evaluatedAt: Date;
}

export class AgentEvaluator {
  private records: AgentTaskExecutionRecord[] = [];

  public recordExecution(record: AgentTaskExecutionRecord): void {
    this.records.push({
      ...record,
      executedAt: record.executedAt || new Date(),
    });
  }

  public getRecords(agentRole?: string): AgentTaskExecutionRecord[] {
    if (!agentRole) return [...this.records];
    return this.records.filter((r) => r.agentRole === agentRole);
  }

  public evaluateAgent(agentRole: string): AgentEvaluationReport {
    const roleRecords = this.getRecords(agentRole);

    if (roleRecords.length === 0) {
      return {
        agentRole,
        totalTasks: 0,
        successRate: 0,
        firstTryPassRate: 0,
        selfHealRate: 0,
        schemaValidityRate: 0,
        toolReliabilityRate: 0,
        totalCostUsd: 0,
        averageDurationMs: 0,
        totalPolicyViolations: 0,
        compositeScore: 0,
        grade: 'F',
        evaluatedAt: new Date(),
      };
    }

    const totalTasks = roleRecords.length;
    const successes = roleRecords.filter((r) => r.outcome === 'success').length;
    const firstTryPasses = roleRecords.filter((r) => r.firstTryPass).length;
    const selfHealed = roleRecords.filter((r) => r.selfHealed).length;
    const schemaValids = roleRecords.filter((r) => r.schemaValid).length;

    let totalTools = 0;
    let successfulTools = 0;
    let totalCostUsd = 0;
    let totalDurationMs = 0;
    let totalPolicyViolations = 0;

    for (const r of roleRecords) {
      totalTools += r.toolCallsSucceeded + r.toolCallsFailed;
      successfulTools += r.toolCallsSucceeded;
      totalCostUsd += r.costUsd;
      totalDurationMs += r.durationMs;
      totalPolicyViolations += r.policyViolations;
    }

    const successRate = successes / totalTasks;
    const firstTryPassRate = firstTryPasses / totalTasks;
    const selfHealRate = selfHealed / totalTasks;
    const schemaValidityRate = schemaValids / totalTasks;
    const toolReliabilityRate = totalTools > 0 ? successfulTools / totalTools : 1.0;
    const averageDurationMs = totalDurationMs / totalTasks;

    // Composite empirical score (0 - 100):
    // 35% Success rate + 25% First try pass + 20% Schema validity + 20% Tool reliability
    let rawScore =
      successRate * 35 +
      firstTryPassRate * 25 +
      schemaValidityRate * 20 +
      toolReliabilityRate * 20;

    // Strict penalty: Each policy violation deducts 35 points immediately
    if (totalPolicyViolations > 0) {
      rawScore = Math.max(0, rawScore - totalPolicyViolations * 35);
    }

    const compositeScore = Math.round(rawScore * 10) / 10;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (compositeScore >= 90) grade = 'A';
    else if (compositeScore >= 80) grade = 'B';
    else if (compositeScore >= 70) grade = 'C';
    else if (compositeScore >= 60) grade = 'D';

    return {
      agentRole,
      totalTasks,
      successRate,
      firstTryPassRate,
      selfHealRate,
      schemaValidityRate,
      toolReliabilityRate,
      totalCostUsd,
      averageDurationMs,
      totalPolicyViolations,
      compositeScore,
      grade,
      evaluatedAt: new Date(),
    };
  }
}
