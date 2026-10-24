import { describe, it, expect } from 'vitest';
import {
  QualityEngine,
  QualityGateSpec,
} from '../../platform/quality-engine/src/index.js';
import { MockRunnerAdapter } from '@forgeos/runner';

describe('Task 2.5: Quality Engine & Verification Gates (FR-060, FR-061, FR-063)', () => {
  const engine = new QualityEngine();

  describe('FR-060: Task-Appropriate Quality Criteria Presets', () => {
    it('resolves appropriate gate presets based on task/artifact type', () => {
      const codeGates = engine.getPresetGates('code');
      expect(codeGates.length).toBeGreaterThanOrEqual(2);
      expect(codeGates.some((g) => g.type === 'unit_test' && g.severity === 'mandatory')).toBe(true);
      expect(codeGates.some((g) => g.type === 'typecheck' && g.severity === 'mandatory')).toBe(true);

      const docGates = engine.getPresetGates('document');
      expect(docGates.some((g) => g.type === 'approval')).toBe(true);
    });
  });

  describe('FR-061 & FR-063: Gate Execution & Release Blocking on Mandatory Failure', () => {
    it('passes release evaluation when all mandatory gates succeed', async () => {
      const gates: QualityGateSpec[] = [
        {
          id: 'gate-unit-test',
          name: 'Unit Test Verification',
          type: 'unit_test',
          severity: 'mandatory',
          evaluator: async () => ({ passed: true, message: 'All 25 unit tests passed' }),
        },
        {
          id: 'gate-advisory-lint',
          name: 'Style Lint Advisory',
          type: 'lint',
          severity: 'advisory',
          evaluator: async () => ({ passed: false, message: 'Minor trailing whitespace warning' }),
        },
      ];

      const evaluation = await engine.evaluateSuite({
        taskId: 'tsk-001',
        artifactId: 'art-001',
        gates,
      });

      expect(evaluation.passed).toBe(true);
      expect(evaluation.blockingViolations).toHaveLength(0);
      expect(evaluation.results).toHaveLength(2);
      expect(engine.canRelease(evaluation)).toBe(true);
    });

    it('strictly blocks release when a mandatory gate fails (FR-063)', async () => {
      const gates: QualityGateSpec[] = [
        {
          id: 'gate-unit-test',
          name: 'Unit Test Verification',
          type: 'unit_test',
          severity: 'mandatory',
          evaluator: async () => ({ passed: false, message: '3 test suites failed' }),
        },
        {
          id: 'gate-typecheck',
          name: 'Typecheck Verification',
          type: 'typecheck',
          severity: 'mandatory',
          evaluator: async () => ({ passed: true, message: 'Zero type errors' }),
        },
      ];

      const evaluation = await engine.evaluateSuite({
        taskId: 'tsk-002',
        artifactId: 'art-002',
        gates,
      });

      expect(evaluation.passed).toBe(false);
      expect(evaluation.blockingViolations).toHaveLength(1);
      expect(evaluation.blockingViolations[0].gateId).toBe('gate-unit-test');
      expect(engine.canRelease(evaluation)).toBe(false);
    });

    it('executes command-based gates via runner and records evidence', async () => {
      const mockRunner = new MockRunnerAdapter({
        defaultExitCode: 0,
        defaultStdout: 'vitest run: 45 passed',
      });

      const gates: QualityGateSpec[] = [
        {
          id: 'gate-cmd-test',
          name: 'Automated Vitest Command',
          type: 'unit_test',
          severity: 'mandatory',
          command: 'vitest',
          args: ['run'],
        },
      ];

      const evaluation = await engine.evaluateSuite({
        gates,
        runner: mockRunner,
      });

      expect(evaluation.passed).toBe(true);
      expect(evaluation.results[0].status).toBe('passed');
      expect(evaluation.results[0].evidence?.stdout).toContain('45 passed');
    });
  });
});
