import { describe, it, expect } from 'vitest';
import {
  AgentEvaluator,
  AgentTaskExecutionRecord,
} from '../../platform/quality-engine/src/agent-evaluator.js';

describe('Task 5.2: Outcome-Based Agent Evaluation (FR-095)', () => {
  const evaluator = new AgentEvaluator();

  it('records execution records and calculates aggregate performance metrics', () => {
    const engineerRecords: AgentTaskExecutionRecord[] = [
      {
        taskId: 'tsk-01',
        agentRole: 'engineer',
        outcome: 'success',
        firstTryPass: true,
        schemaValid: true,
        toolCallsSucceeded: 5,
        toolCallsFailed: 0,
        tokensUsed: 1200,
        costUsd: 0.02,
        durationMs: 4200,
        policyViolations: 0,
      },
      {
        taskId: 'tsk-02',
        agentRole: 'engineer',
        outcome: 'success',
        firstTryPass: false,
        selfHealed: true,
        schemaValid: true,
        toolCallsSucceeded: 8,
        toolCallsFailed: 1,
        tokensUsed: 2500,
        costUsd: 0.04,
        durationMs: 7800,
        policyViolations: 0,
      },
      {
        taskId: 'tsk-03',
        agentRole: 'engineer',
        outcome: 'failed',
        firstTryPass: false,
        selfHealed: false,
        schemaValid: false,
        toolCallsSucceeded: 2,
        toolCallsFailed: 3,
        tokensUsed: 900,
        costUsd: 0.015,
        durationMs: 3100,
        policyViolations: 0,
      },
    ];

    engineerRecords.forEach((r) => evaluator.recordExecution(r));

    const report = evaluator.evaluateAgent('engineer');

    expect(report.agentRole).toBe('engineer');
    expect(report.totalTasks).toBe(3);
    expect(report.successRate).toBeCloseTo(0.666, 2);
    expect(report.firstTryPassRate).toBeCloseTo(0.333, 2);
    expect(report.schemaValidityRate).toBeCloseTo(0.666, 2);
    expect(report.totalCostUsd).toBeCloseTo(0.075, 3);
    expect(report.compositeScore).toBeGreaterThan(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(report.grade);
  });

  it('awards grade A for flawless agent execution (100% first-pass, 0 violations)', () => {
    const qaRecord: AgentTaskExecutionRecord = {
      taskId: 'tsk-qa-01',
      agentRole: 'qa',
      outcome: 'success',
      firstTryPass: true,
      schemaValid: true,
      toolCallsSucceeded: 10,
      toolCallsFailed: 0,
      tokensUsed: 800,
      costUsd: 0.01,
      durationMs: 2000,
      policyViolations: 0,
    };

    evaluator.recordExecution(qaRecord);
    const report = evaluator.evaluateAgent('qa');

    expect(report.firstTryPassRate).toBe(1.0);
    expect(report.grade).toBe('A');
    expect(report.compositeScore).toBeGreaterThanOrEqual(90);
  });

  it('penalizes grade heavily if any policy violations occurred', () => {
    const rogueRecord: AgentTaskExecutionRecord = {
      taskId: 'tsk-rogue-01',
      agentRole: 'rogue-agent',
      outcome: 'failed',
      firstTryPass: false,
      schemaValid: false,
      toolCallsSucceeded: 1,
      toolCallsFailed: 2,
      tokensUsed: 500,
      costUsd: 0.01,
      durationMs: 1500,
      policyViolations: 2, // Rogue permissions attempt
    };

    evaluator.recordExecution(rogueRecord);
    const report = evaluator.evaluateAgent('rogue-agent');

    expect(report.totalPolicyViolations).toBe(2);
    expect(report.grade).toBe('F');
    expect(report.compositeScore).toBeLessThan(50);
  });
});
