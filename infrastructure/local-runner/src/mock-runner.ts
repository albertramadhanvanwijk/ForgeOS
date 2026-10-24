import {
  IRunnerAdapter,
  ExecutionOptions,
  ExecutionResult,
} from './types.js';

export interface MockRunnerOptions {
  defaultExitCode?: number;
  defaultStdout?: string;
  defaultStderr?: string;
  defaultDurationMs?: number;
}

export class MockRunnerAdapter implements IRunnerAdapter {
  constructor(private readonly options: MockRunnerOptions = {}) {}

  public async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const exitCode = this.options.defaultExitCode ?? 0;
    const stdout = this.options.defaultStdout ?? `Mock output for: ${options.command}`;
    const stderr = this.options.defaultStderr ?? '';
    const durationMs = this.options.defaultDurationMs ?? 10;
    const success = exitCode === 0;

    return {
      exitCode,
      success,
      stdout,
      stderr,
      durationMs,
      timedOut: false,
      logs: [
        { timestamp: new Date(), stream: 'stdout', text: stdout },
        ...(stderr ? [{ timestamp: new Date(), stream: 'stderr' as const, text: stderr }] : []),
      ],
    };
  }
}
