import { spawn } from 'node:child_process';
import {
  IRunnerAdapter,
  ExecutionOptions,
  ExecutionResult,
  ExecutionLogEntry,
  RunnerPolicy,
  SecurityPolicyViolationError,
} from './types.js';

export class LocalProcessRunner implements IRunnerAdapter {
  private readonly defaultBlockedEnvKeys = [
    'AWS_SECRET_ACCESS_KEY',
    'GITHUB_TOKEN',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'DATABASE_URL',
  ];

  constructor(private readonly policy: RunnerPolicy = {}) {}

  public async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { command, args = [], cwd, env = {}, timeoutMs = this.policy.defaultTimeoutMs || 30000 } = options;

    // 1. Validate Command against Allowed List (FR-042)
    if (this.policy.allowedCommands && this.policy.allowedCommands.length > 0) {
      if (!this.policy.allowedCommands.includes(command)) {
        throw new SecurityPolicyViolationError(
          `Execution of command '${command}' is denied by runner security policy. Allowed: [${this.policy.allowedCommands.join(', ')}]`
        );
      }
    }

    // 2. Sanitize Environment (FR-047)
    const blockedKeys = new Set([...this.defaultBlockedEnvKeys, ...(this.policy.blockedEnvKeys || [])]);
    const cleanEnv: Record<string, string> = {};

    // Copy process.env without blocked keys
    for (const [k, v] of Object.entries(process.env)) {
      if (v !== undefined && !blockedKeys.has(k)) {
        cleanEnv[k] = v;
      }
    }

    // Overlay user env without blocked keys
    for (const [k, v] of Object.entries(env)) {
      if (!blockedKeys.has(k)) {
        cleanEnv[k] = v;
      }
    }

    // 3. Spawn child process
    const startTime = Date.now();
    const logs: ExecutionLogEntry[] = [];
    let stdoutAcc = '';
    let stderrAcc = '';
    let timedOut = false;

    logs.push({
      timestamp: new Date(),
      stream: 'system',
      text: `Executing: ${command} ${args.join(' ')}`,
    });

    return new Promise<ExecutionResult>((resolve) => {
      let timer: NodeJS.Timeout | null = null;

      const child = spawn(command, args, {
        cwd: cwd || process.cwd(),
        env: cleanEnv,
        shell: false,
      });

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          timedOut = true;
          logs.push({
            timestamp: new Date(),
            stream: 'system',
            text: `Command timed out after ${timeoutMs}ms. Terminating.`,
          });
          child.kill();
        }, timeoutMs);
      }

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString('utf-8');
        stdoutAcc += text;
        logs.push({
          timestamp: new Date(),
          stream: 'stdout',
          text,
        });
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString('utf-8');
        stderrAcc += text;
        logs.push({
          timestamp: new Date(),
          stream: 'stderr',
          text,
        });
      });

      child.on('error', (err: Error) => {
        if (timer) clearTimeout(timer);
        logs.push({
          timestamp: new Date(),
          stream: 'system',
          text: `Process error: ${err.message}`,
        });
        resolve({
          exitCode: 1,
          success: false,
          stdout: stdoutAcc,
          stderr: stderrAcc + `\n${err.message}`,
          durationMs: Date.now() - startTime,
          timedOut,
          logs,
        });
      });

      child.on('close', (code: number | null) => {
        if (timer) clearTimeout(timer);
        const exitCode = timedOut ? 124 : (code ?? 1);
        const success = exitCode === 0 && !timedOut;

        logs.push({
          timestamp: new Date(),
          stream: 'system',
          text: `Command finished with exit code ${exitCode}. Success: ${success}`,
        });

        resolve({
          exitCode,
          success,
          stdout: stdoutAcc,
          stderr: stderrAcc,
          durationMs: Date.now() - startTime,
          timedOut,
          logs,
        });
      });
    });
  }
}
