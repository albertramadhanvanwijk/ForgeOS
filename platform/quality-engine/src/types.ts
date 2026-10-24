import { IRunnerAdapter } from '@forgeos/runner';

export type QualityGateType =
  | 'unit_test'
  | 'integration_test'
  | 'typecheck'
  | 'lint'
  | 'security_audit'
  | 'approval';

export type GateSeverity = 'mandatory' | 'advisory';

export type GateStatus = 'passed' | 'failed' | 'pending' | 'skipped';

export interface EvaluatorResult {
  passed: boolean;
  message: string;
  evidence?: Record<string, unknown>;
}

export interface QualityGateSpec {
  id: string;
  name: string;
  type: QualityGateType;
  severity: GateSeverity;
  command?: string;
  args?: string[];
  evaluator?: (context: any) => Promise<EvaluatorResult>;
}

export interface QualityGateResult {
  gateId: string;
  name: string;
  type: QualityGateType;
  severity: GateSeverity;
  status: GateStatus;
  message: string;
  evidence?: Record<string, unknown>;
  durationMs: number;
  executedAt: Date;
}

export interface SuiteEvaluationOptions {
  taskId?: string;
  artifactId?: string;
  gates: QualityGateSpec[];
  runner?: IRunnerAdapter;
  context?: Record<string, unknown>;
}

export interface QualitySuiteEvaluation {
  taskId?: string;
  artifactId?: string;
  passed: boolean;
  blockingViolations: QualityGateResult[];
  results: QualityGateResult[];
  summary: string;
  evaluatedAt: Date;
}
