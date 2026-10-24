export interface ExecutionLogEntry {
  timestamp: Date;
  stream: 'stdout' | 'stderr' | 'system';
  text: string;
}

export interface ExecutionOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}

export interface ExecutionResult {
  exitCode: number;
  success: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  logs: ExecutionLogEntry[];
}

export interface RunnerPolicy {
  allowedCommands?: string[];
  blockedEnvKeys?: string[];
  defaultTimeoutMs?: number;
}

export interface IRunnerAdapter {
  execute(options: ExecutionOptions): Promise<ExecutionResult>;
}

export class SecurityPolicyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityPolicyViolationError';
  }
}
