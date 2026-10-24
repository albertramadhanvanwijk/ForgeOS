import { QualitySuiteEvaluation, QualityGateResult } from './types.js';

export interface DiagnosticReport {
  rootCause: string;
  failedGateIds: string[];
  suggestedScope?: string[];
  canAutoHeal: boolean;
  rawErrors: string[];
}

export interface PatchProposal {
  patchId: string;
  filePath: string;
  diff: string;
  rationale?: string;
}

export interface SelfHealingOptions {
  maxRetries?: number;
  allowedScope?: string[];
}

export interface HealingLoopExecutionOptions {
  evaluation: QualitySuiteEvaluation;
  generatePatch: (diagnostic: DiagnosticReport) => Promise<PatchProposal>;
  verify: (patch: PatchProposal) => Promise<{ passed: boolean; blockingViolations: QualityGateResult[] }>;
}

export interface HealingLoopResult {
  status: 'resolved' | 'escalated';
  attempts: number;
  appliedPatches: PatchProposal[];
  finalEvaluation: {
    passed: boolean;
    blockingViolations: QualityGateResult[];
  };
  escalationReason?: string;
}

export class SelfHealingEngine {
  private maxRetries: number;
  private allowedScope: string[];

  constructor(options: SelfHealingOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.allowedScope = options.allowedScope ?? ['src/', 'packages/', 'platform/'];
  }

  public diagnoseFailure(evaluation: QualitySuiteEvaluation): DiagnosticReport {
    const rawErrors: string[] = [];
    const failedGateIds: string[] = [];

    for (const v of evaluation.blockingViolations) {
      failedGateIds.push(v.gateId);
      if (v.message) rawErrors.push(v.message);
      if (v.evidence?.stderr) rawErrors.push(String(v.evidence.stderr));
      if (v.evidence?.stdout) rawErrors.push(String(v.evidence.stdout));
    }

    const combinedError = rawErrors.join('\n');
    let rootCause = 'Unknown failure in verification gates';

    if (combinedError.includes('AssertionError')) {
      rootCause = `Test Assertion Error: ${combinedError.match(/AssertionError:[^\n]+/)?.[0] || 'Assertion failed'}`;
    } else if (combinedError.includes('TS') || combinedError.includes('Cannot find module')) {
      rootCause = `TypeScript / Compilation Error: ${combinedError.slice(0, 200)}`;
    } else if (rawErrors.length > 0) {
      rootCause = rawErrors[0];
    }

    return {
      rootCause,
      failedGateIds,
      suggestedScope: this.allowedScope,
      canAutoHeal: true,
      rawErrors,
    };
  }

  public assertNoWeakenedThresholds(patch: PatchProposal): void {
    const dangerousPatterns = [
      /\btest\.skip\b/i,
      /\bit\.skip\b/i,
      /\bdescribe\.skip\b/i,
      /test deleted/i,
      /\/\/.*expect/i,
      /expect\(.*\)\.toBe\(.*\)\s*;\s*\/\//i,
      /\-\s*expect/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(patch.diff)) {
        throw new Error(
          `Security & Quality Policy Violation: Cannot lower quality thresholds or disable tests in patch '${patch.patchId}' (FR-064)`
        );
      }
    }
  }

  public assertWithinAllowedScope(filePath: string): void {
    const isAllowed = this.allowedScope.some((prefix) => filePath.startsWith(prefix));
    if (!isAllowed) {
      throw new Error(
        `Scope violation: File '${filePath}' is outside permitted repair scope [${this.allowedScope.join(', ')}] (FR-064)`
      );
    }
  }

  public async executeHealingLoop(options: HealingLoopExecutionOptions): Promise<HealingLoopResult> {
    const { evaluation, generatePatch, verify } = options;
    const appliedPatches: PatchProposal[] = [];

    let currentEvaluation = {
      passed: evaluation.passed,
      blockingViolations: evaluation.blockingViolations,
    };

    let attempt = 0;

    while (attempt < this.maxRetries) {
      attempt++;

      const diagnostic = this.diagnoseFailure({
        ...evaluation,
        passed: currentEvaluation.passed,
        blockingViolations: currentEvaluation.blockingViolations,
      });

      const patch = await generatePatch(diagnostic);

      this.assertWithinAllowedScope(patch.filePath);
      this.assertNoWeakenedThresholds(patch);

      appliedPatches.push(patch);

      const verifyResult = await verify(patch);
      currentEvaluation = {
        passed: verifyResult.passed,
        blockingViolations: verifyResult.blockingViolations,
      };

      if (verifyResult.passed) {
        return {
          status: 'resolved',
          attempts: attempt,
          appliedPatches,
          finalEvaluation: currentEvaluation,
        };
      }
    }

    return {
      status: 'escalated',
      attempts: attempt,
      appliedPatches,
      finalEvaluation: currentEvaluation,
      escalationReason: `Max repair attempts (${this.maxRetries}) exceeded without passing verification gates. Escalating to developer.`,
    };
  }
}
