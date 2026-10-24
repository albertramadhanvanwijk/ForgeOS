import { describe, it, expect } from 'vitest';
import {
  LocalProcessRunner,
  MockRunnerAdapter,
  SecurityPolicyViolationError,
} from '../../infrastructure/local-runner/src/index.js';

describe('Task 2.3: Sandboxed Execution & Runner Policy (FR-042, FR-043, FR-044, FR-047, FR-048)', () => {
  describe('FR-042 & FR-047: Allowed Commands & Security Policy', () => {
    it('allows executing commands within the allowlist', async () => {
      const runner = new LocalProcessRunner({
        allowedCommands: ['node'],
      });

      const result = await runner.execute({
        command: 'node',
        args: ['-e', 'console.log("hello runner")'],
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('hello runner');
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('rejects disallowed commands with SecurityPolicyViolationError', async () => {
      const runner = new LocalProcessRunner({
        allowedCommands: ['node', 'git'],
      });

      await expect(
        runner.execute({
          command: 'curl',
          args: ['https://malicious.example.com'],
        })
      ).rejects.toThrow(SecurityPolicyViolationError);
    });

    it('sanitizes environment variables to prevent secret leakage (FR-047)', async () => {
      const runner = new LocalProcessRunner({
        allowedCommands: ['node'],
        blockedEnvKeys: ['FORGE_SECRET_TOKEN', 'AWS_SECRET_ACCESS_KEY'],
      });

      const result = await runner.execute({
        command: 'node',
        args: ['-e', 'console.log(process.env.FORGE_SECRET_TOKEN || "redacted")'],
        env: {
          FORGE_SECRET_TOKEN: 'super-secret-12345',
        },
      });

      expect(result.success).toBe(true);
      expect(result.stdout.trim()).toBe('redacted');
    });
  });

  describe('FR-048: Failed Commands Never Reported Successful', () => {
    it('marks command as failed when exit code is non-zero', async () => {
      const runner = new LocalProcessRunner({
        allowedCommands: ['node'],
      });

      const result = await runner.execute({
        command: 'node',
        args: ['-e', 'process.exit(42)'],
      });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(42);
    });

    it('marks command as failed when timed out', async () => {
      const runner = new LocalProcessRunner({
        allowedCommands: ['node'],
      });

      const result = await runner.execute({
        command: 'node',
        args: ['-e', 'setTimeout(() => {}, 5000)'],
        timeoutMs: 300,
      });

      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
    });

    it('verifies mock runner also enforces failure integrity', async () => {
      const mockRunner = new MockRunnerAdapter({
        defaultExitCode: 1,
        defaultStderr: 'Build error in src/index.ts',
      });

      const result = await mockRunner.execute({
        command: 'tsc',
        args: ['--noEmit'],
      });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Build error');
    });
  });

  describe('FR-043: Execution Logs with timestamps', () => {
    it('captures structured execution logs with stream and timestamps', async () => {
      const runner = new LocalProcessRunner({
        allowedCommands: ['node'],
      });

      const result = await runner.execute({
        command: 'node',
        args: ['-e', 'console.log("line 1"); console.error("error line"); console.log("line 2");'],
      });

      expect(result.logs.length).toBeGreaterThanOrEqual(2);
      expect(result.logs.some((l) => l.stream === 'stdout' && l.text.includes('line 1'))).toBe(true);
      expect(result.logs.some((l) => l.stream === 'stderr' && l.text.includes('error line'))).toBe(true);
      expect(result.logs[0].timestamp).toBeDefined();
    });
  });
});
