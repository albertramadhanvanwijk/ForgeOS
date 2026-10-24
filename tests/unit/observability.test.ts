import { describe, it, expect } from 'vitest';
import {
  StructuredLogger,
  LimitEnforcer,
  FailureExplainer,
  BudgetExceededError,
  TimeoutExceededError,
  ConcurrencyExceededError,
} from '../../platform/observability/src/index.js';

describe('Task 2.6: Observability & Structured Tracing (FR-090, FR-091, FR-092)', () => {
  describe('FR-090: Structured Workflow & Tool Logs', () => {
    it('records and queries structured events with context', () => {
      const logger = new StructuredLogger();

      logger.info({
        projectId: 'prj-100',
        runId: 'run-500',
        taskId: 'tsk-200',
        agentRoleId: 'software-engineer',
        component: 'workflow-engine',
        event: 'task_started',
        message: 'Started executing code generation task',
      });

      logger.error({
        projectId: 'prj-100',
        runId: 'run-500',
        taskId: 'tsk-200',
        component: 'local-runner',
        event: 'command_failed',
        message: 'Compilation failed with exit code 1',
        data: { exitCode: 1 },
      });

      const allLogs = logger.query({ runId: 'run-500' });
      expect(allLogs).toHaveLength(2);
      expect(allLogs[0].event).toBe('task_started');
      expect(allLogs[1].level).toBe('error');
      expect(allLogs[1].data?.exitCode).toBe(1);

      const errorLogs = logger.query({ level: 'error' });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].event).toBe('command_failed');
    });
  });

  describe('FR-091: Failure Explanation & Recovery Recommendations', () => {
    it('diagnoses command failures and recommends remediation', () => {
      const explainer = new FailureExplainer();

      const explanation = explainer.explain({
        runId: 'run-500',
        taskId: 'tsk-200',
        errorCategory: 'command_failure',
        rawError: 'tsc: src/server.ts(12,5): error TS2322: Type "string" is not assignable to type "number".',
      });

      expect(explanation.errorCategory).toBe('command_failure');
      expect(explanation.summary).toContain('TypeScript');
      expect(explanation.rootCause).toContain('Type');
      expect(explanation.recoveryStrategies.length).toBeGreaterThan(0);
      expect(explanation.recommendedAction).toBeDefined();
    });

    it('diagnoses budget and timeout failures', () => {
      const explainer = new FailureExplainer();

      const budgetExplanation = explainer.explain({
        runId: 'run-501',
        errorCategory: 'budget_exceeded',
        rawError: 'Workflow run exceeded spending limit of $5.00 (accumulated: $5.12)',
      });

      expect(budgetExplanation.errorCategory).toBe('budget_exceeded');
      expect(budgetExplanation.recoveryStrategies.some((s) => s.toLowerCase().includes('model') || s.toLowerCase().includes('tier') || s.toLowerCase().includes('budget'))).toBe(true);
    });
  });

  describe('FR-092: Budget, Time, Concurrency, and Retry Limits', () => {
    it('enforces cost and duration limits', () => {
      const enforcer = new LimitEnforcer({
        maxCostUsd: 1.0,
        maxDurationMs: 5000,
        maxConcurrency: 2,
        maxRetries: 3,
      });

      // Under limit
      expect(() => enforcer.checkBudget('run-1', { currentCostUsd: 0.5 })).not.toThrow();

      // Exceeded budget
      expect(() => enforcer.checkBudget('run-1', { currentCostUsd: 1.05 })).toThrow(BudgetExceededError);

      // Exceeded timeout
      expect(() => enforcer.checkDuration('run-1', { durationMs: 6000 })).toThrow(TimeoutExceededError);
    });

    it('enforces concurrency limit across active runs', () => {
      const enforcer = new LimitEnforcer({
        maxConcurrency: 2,
      });

      enforcer.acquireSlot('run-A');
      enforcer.acquireSlot('run-B');

      // 3rd concurrent run should be rejected
      expect(() => enforcer.acquireSlot('run-C')).toThrow(ConcurrencyExceededError);

      // Release slot and verify next slot can be acquired
      enforcer.releaseSlot('run-A');
      expect(() => enforcer.acquireSlot('run-C')).not.toThrow();
    });
  });
});
