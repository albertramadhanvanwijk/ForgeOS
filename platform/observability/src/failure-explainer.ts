import {
  FailureExplanation,
  FailureExplanationInput,
  ErrorCategory,
} from './types.js';

export class FailureExplainer {
  public explain(input: FailureExplanationInput): FailureExplanation {
    const { runId, taskId, errorCategory, rawError } = input;

    switch (errorCategory) {
      case 'command_failure':
        return this.explainCommandFailure(runId, taskId, rawError);
      case 'budget_exceeded':
        return this.explainBudgetExceeded(runId, taskId, rawError);
      case 'timeout':
        return this.explainTimeout(runId, taskId, rawError);
      case 'policy_denial':
        return this.explainPolicyDenial(runId, taskId, rawError);
      default:
        return this.explainInternalError(runId, taskId, rawError);
    }
  }

  private explainCommandFailure(runId: string, taskId: string | undefined, rawError: string): FailureExplanation {
    if (rawError.includes('error TS') || rawError.includes('tsc')) {
      return {
        runId,
        taskId,
        errorCategory: 'command_failure',
        summary: 'TypeScript compilation failure during build verification',
        rootCause: rawError.split('\n')[0] || rawError,
        recommendedAction: 'Correct type declaration or interface contract mismatch.',
        recoveryStrategies: [
          'Verify variable type annotations match expected contract.',
          'Check that all imported modules and types are exported properly.',
          'Execute typecheck in runner workspace before triggering release.',
        ],
      };
    }

    if (rawError.includes('AssertionError') || rawError.includes('FAIL') || rawError.includes('test')) {
      return {
        runId,
        taskId,
        errorCategory: 'command_failure',
        summary: 'Automated test suite assertion failure',
        rootCause: rawError.split('\n')[0] || rawError,
        recommendedAction: 'Fix underlying implementation defect to satisfy failing test assertion.',
        recoveryStrategies: [
          'Inspect failure diff in test output logs.',
          'Ensure mock data matches production expectations.',
          'Run regression suite to verify complete remediation.',
        ],
      };
    }

    return {
      runId,
      taskId,
      errorCategory: 'command_failure',
      summary: 'Command execution exited with non-zero status',
      rootCause: rawError.substring(0, 200),
      recommendedAction: 'Review command arguments and runtime environment.',
      recoveryStrategies: [
        'Inspect structured runner execution logs for stderr output.',
        'Verify required dependencies and binaries exist in the environment.',
        'Retry task in an isolated workspace.',
      ],
    };
  }

  private explainBudgetExceeded(runId: string, taskId: string | undefined, rawError: string): FailureExplanation {
    return {
      runId,
      taskId,
      errorCategory: 'budget_exceeded',
      summary: 'Workflow execution exceeded assigned budget threshold',
      rootCause: rawError,
      recommendedAction: 'Optimize model tier selection or obtain approval for budget increase.',
      recoveryStrategies: [
        'Route non-critical tasks to "fast" tier models (e.g. Gemini 1.5 Flash).',
        'Compact prompt context and truncate redundant history.',
        'Request budget increase through Policy Engine approval gate.',
      ],
    };
  }

  private explainTimeout(runId: string, taskId: string | undefined, rawError: string): FailureExplanation {
    return {
      runId,
      taskId,
      errorCategory: 'timeout',
      summary: 'Task execution duration exceeded allowed timeout deadline',
      rootCause: rawError,
      recommendedAction: 'Decompose task or adjust timeout threshold.',
      recoveryStrategies: [
        'Decompose heavy monolithic task into smaller parallel sub-tasks.',
        'Check for hanging background loops or unclosed process handles.',
        'Increase timeoutMs in task definition if computation is legitimately long.',
      ],
    };
  }

  private explainPolicyDenial(runId: string, taskId: string | undefined, rawError: string): FailureExplanation {
    return {
      runId,
      taskId,
      errorCategory: 'policy_denial',
      summary: 'Action or command rejected by ForgeOS Policy Engine',
      rootCause: rawError,
      recommendedAction: 'Verify agent role permissions or request explicit approval.',
      recoveryStrategies: [
        'Ensure agent is assigned to a role authorized for this action.',
        'Submit formal approval request via ApprovalService.',
        'Verify target command is present in the runner allowlist.',
      ],
    };
  }

  private explainInternalError(runId: string, taskId: string | undefined, rawError: string): FailureExplanation {
    return {
      runId,
      taskId,
      errorCategory: 'internal_error',
      summary: 'Internal orchestrator error encountered',
      rootCause: rawError,
      recommendedAction: 'Inspect system logs and restart failed workflow stage.',
      recoveryStrategies: [
        'Check orchestrator health status.',
        'Resume workflow run from last saved persistent checkpoint.',
      ],
    };
  }
}
