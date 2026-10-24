import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';
import { MockRunnerAdapter } from '@forgeos/runner';

describe('Task 2.3: Sandboxed Execution Runner API (FR-042 - FR-044, FR-047, FR-048)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createServer({
      logger: false,
      runner: new MockRunnerAdapter({
        defaultExitCode: 0,
        defaultStdout: 'Tests passed: 10/10',
      }),
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('executes command via POST /api/runner/execute successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/runner/execute',
      payload: {
        command: 'pnpm',
        args: ['test'],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.exitCode).toBe(0);
    expect(body.stdout).toContain('Tests passed');
    expect(body.logs.length).toBeGreaterThan(0);
  });

  it('rejects disallowed command with 403 policy violation when using real LocalProcessRunner', async () => {
    const realApp = await createServer({ logger: false });
    await realApp.ready();

    const res = await realApp.inject({
      method: 'POST',
      url: '/api/runner/execute',
      payload: {
        command: 'curl',
        args: ['https://unauthorized.com'],
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.policyViolation).toBe(true);
    expect(body.error).toContain('denied');

    await realApp.close();
  });

  it('enforces required command field in request', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/runner/execute',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('command');
  });
});
