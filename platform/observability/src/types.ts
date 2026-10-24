export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface StructuredLogInput {
  level?: LogLevel;
  projectId?: string;
  runId?: string;
  taskId?: string;
  agentRoleId?: string;
  component: string;
  event: string;
  message: string;
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

export interface StructuredLogEntry extends StructuredLogInput {
  id: string;
  timestamp: Date;
  level: LogLevel;
}

export interface LogQueryFilter {
  projectId?: string;
  runId?: string;
  taskId?: string;
  component?: string;
  level?: LogLevel;
  limit?: number;
}

export type ErrorCategory =
  | 'timeout'
  | 'budget_exceeded'
  | 'command_failure'
  | 'policy_denial'
  | 'internal_error';

export interface FailureExplanationInput {
  runId: string;
  taskId?: string;
  errorCategory: ErrorCategory;
  rawError: string;
  context?: Record<string, unknown>;
}

export interface FailureExplanation {
  runId: string;
  taskId?: string;
  errorCategory: ErrorCategory;
  summary: string;
  rootCause: string;
  recommendedAction: string;
  recoveryStrategies: string[];
}

export interface ExecutionLimits {
  maxDurationMs?: number;
  maxCostUsd?: number;
  maxTokens?: number;
  maxRetries?: number;
  maxConcurrency?: number;
}

export class LimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LimitExceededError';
  }
}

export class BudgetExceededError extends LimitExceededError {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetExceededError';
  }
}

export class TimeoutExceededError extends LimitExceededError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutExceededError';
  }
}

export class ConcurrencyExceededError extends LimitExceededError {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyExceededError';
  }
}
