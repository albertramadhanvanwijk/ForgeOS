import { describe, it, expect, vi } from 'vitest';
import {
  SelfHealingEngine,
  DiagnosticReport,
  RepairAttemptResult,
} from '../../platform/quality-engine/src/self-healing.js';
import { QualitySuiteEvaluation, QualityGateResult } from '../../platform/quality-engine/src/types.js';

describe('Task 5.1: Self-Healing Repair Loops (FR-064)', () => {
  const engine = new SelfHealingEngine({
    maxRetries: 3,
    allowedScope: ['apps/web/src', 'platform/'],
  });

  const sampleFailureGate: QualityGateResult = {
    gateId: 'gate-unit-tests',
    name: 'Unit Tests',
    type: 'unit_test',
    severity: 'mandatory',
    status: 'failed',
    message: 'AssertionError: expected false to be true',
    evidence: {
      stdout: 'FAIL tests/components/button.test.tsx > renders correctly',
      stderr: 'AssertionError: expected false to be true at button.test.tsx:24:12',
    },
    durationMs: 450,
    executedAt: new Date(),
  };

  const sampleFailedEvaluation: QualitySuiteEvaluation = {
    taskId: 'tsk-repair-01',
    passed: false,
    blockingViolations: [sampleFailureGate],
    results: [sampleFailureGate],
    summary: '1 mandatory gate failed',
    evaluatedAt: new Date(),
  };

  it('diagnoses failure logs and extracts structured root cause', () => {
    const diagnostic = engine.diagnoseFailure(sampleFailedEvaluation);

    expect(diagnostic.rootCause).toContain('AssertionError');
    expect(diagnostic.failedGateIds).toContain('gate-unit-tests');
    expect(diagnostic.suggestedScope).toBeDefined();
    expect(diagnostic.canAutoHeal).toBe(true);
  });

  it('executes self-healing repair loop and succeeds when repair passes verification', async () => {
    let attemptCount = 0;

    const mockPatchGenerator = vi.fn().mockImplementation(async (diag: DiagnosticReport) => {
      attemptCount++;
      return {
        patchId: `patch-${attemptCount}`,
        filePath: 'platform/orchestrator/src/app.ts',
        diff: '+ fix assertion',
      };
    });

    const mockVerifier = vi.fn().mockImplementation(async () => {
      // First attempt fails, second attempt succeeds
      if (attemptCount < 2) {
        return { passed: false, blockingViolations: [sampleFailureGate] };
      }
      return { passed: true, blockingViolations: [] };
    });

    const result = await engine.executeHealingLoop({
      evaluation: sampleFailedEvaluation,
      generatePatch: mockPatchGenerator,
      verify: mockVerifier,
    });

    expect(result.status).toBe('resolved');
    expect(result.attempts).toBe(2);
    expect(result.appliedPatches).toHaveLength(2);
    expect(result.finalEvaluation.passed).toBe(true);
  });

  it('halts and escalates when max retries are exhausted without passing', async () => {
    const mockPatchGenerator = vi.fn().mockResolvedValue({
      patchId: 'patch-failing',
      filePath: 'platform/orchestrator/src/app.ts',
      diff: '+ attempted fix',
    });

    const mockAlwaysFailingVerifier = vi.fn().mockResolvedValue({
      passed: false,
      blockingViolations: [sampleFailureGate],
    });

    const result = await engine.executeHealingLoop({
      evaluation: sampleFailedEvaluation,
      generatePatch: mockPatchGenerator,
      verify: mockAlwaysFailingVerifier,
    });

    expect(result.status).toBe('escalated');
    expect(result.attempts).toBe(3); // Hit maxRetries = 3
    expect(result.escalationReason).toContain('Max repair attempts (3) exceeded');
  });

  it('strictly rejects patches modifying files outside allowed scope', async () => {
    const mockOutOfScopePatch = vi.fn().mockResolvedValue({
      patchId: 'patch-rogue',
      filePath: 'etc/passwd', // Outside allowedScope
      diff: 'malicious change',
    });

    const mockVerifier = vi.fn().mockResolvedValue({ passed: true, blockingViolations: [] });

    await expect(
      engine.executeHealingLoop({
        evaluation: sampleFailedEvaluation,
        generatePatch: mockOutOfScopePatch,
        verify: mockVerifier,
      })
    ).rejects.toThrow(/Scope violation/i);
  });

  it('enforces safety invariant: refuses to weaken thresholds or delete test assertions (FR-064)', () => {
    const weakenedPatch = {
      patchId: 'patch-cheat',
      filePath: 'platform/app.test.ts',
      diff: '- expect(res).toBe(true);\n+ // test deleted to force pass',
    };

    expect(() => engine.assertNoWeakenedThresholds(weakenedPatch)).toThrow(
      /Cannot lower quality thresholds or disable tests/i
    );
  });
});
