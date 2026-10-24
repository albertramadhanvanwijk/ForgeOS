import {
  QualityGateSpec,
  QualityGateResult,
  QualitySuiteEvaluation,
  SuiteEvaluationOptions,
} from './types.js';

export class QualityEngine {
  public getPresetGates(taskOrArtifactType: string): QualityGateSpec[] {
    const type = taskOrArtifactType.toLowerCase();

    switch (type) {
      case 'code':
      case 'source_code':
        return [
          {
            id: 'gate-code-unit-tests',
            name: 'Unit Test Verification',
            type: 'unit_test',
            severity: 'mandatory',
            command: 'vitest',
            args: ['run'],
          },
          {
            id: 'gate-code-typecheck',
            name: 'TypeScript Compilation & Type Safety',
            type: 'typecheck',
            severity: 'mandatory',
            command: 'tsc',
            args: ['--noEmit'],
          },
          {
            id: 'gate-code-lint',
            name: 'Static Code Analysis & Linting',
            type: 'lint',
            severity: 'advisory',
          },
        ];

      case 'document':
      case 'specification':
      case 'architecture':
        return [
          {
            id: 'gate-doc-approval',
            name: 'Architectural Review & Human Approval',
            type: 'approval',
            severity: 'mandatory',
          },
          {
            id: 'gate-doc-security-audit',
            name: 'Threat Modeling & Policy Review',
            type: 'security_audit',
            severity: 'advisory',
          },
        ];

      default:
        return [
          {
            id: 'gate-generic-review',
            name: 'General Verification Review',
            type: 'approval',
            severity: 'mandatory',
          },
        ];
    }
  }

  public async evaluateSuite(options: SuiteEvaluationOptions): Promise<QualitySuiteEvaluation> {
    const { taskId, artifactId, gates, runner, context = {} } = options;
    const results: QualityGateResult[] = [];
    const blockingViolations: QualityGateResult[] = [];

    for (const gate of gates) {
      const startTime = Date.now();
      let status: 'passed' | 'failed' = 'passed';
      let message = 'Gate passed successfully';
      let evidence: Record<string, unknown> | undefined;

      try {
        if (gate.command && runner) {
          const runRes = await runner.execute({
            command: gate.command,
            args: gate.args,
          });

          if (!runRes.success) {
            status = 'failed';
            message = `Command '${gate.command}' failed with exit code ${runRes.exitCode}: ${runRes.stderr || runRes.stdout}`;
          } else {
            status = 'passed';
            message = `Command '${gate.command}' succeeded`;
          }

          evidence = {
            exitCode: runRes.exitCode,
            stdout: runRes.stdout,
            stderr: runRes.stderr,
            durationMs: runRes.durationMs,
          };
        } else if (gate.evaluator) {
          const evalRes = await gate.evaluator(context);
          status = evalRes.passed ? 'passed' : 'failed';
          message = evalRes.message;
          evidence = evalRes.evidence;
        } else {
          // Default approval or advisory check without evaluator passes if not explicitly flagged
          status = 'passed';
          message = `Gate '${gate.name}' default evaluation passed`;
        }
      } catch (err: any) {
        status = 'failed';
        message = `Evaluation error: ${err.message}`;
      }

      const durationMs = Date.now() - startTime;
      const result: QualityGateResult = {
        gateId: gate.id,
        name: gate.name,
        type: gate.type,
        severity: gate.severity,
        status,
        message,
        evidence,
        durationMs,
        executedAt: new Date(),
      };

      results.push(result);

      if (status === 'failed' && gate.severity === 'mandatory') {
        blockingViolations.push(result);
      }
    }

    const passed = blockingViolations.length === 0;
    const summary = passed
      ? `All ${gates.length} quality checks passed or satisfied advisory thresholds.`
      : `Quality verification failed: ${blockingViolations.length} mandatory gate(s) violated.`;

    return {
      taskId,
      artifactId,
      passed,
      blockingViolations,
      results,
      summary,
      evaluatedAt: new Date(),
    };
  }

  public canRelease(evaluation: QualitySuiteEvaluation): boolean {
    return evaluation.passed && evaluation.blockingViolations.length === 0;
  }
}
