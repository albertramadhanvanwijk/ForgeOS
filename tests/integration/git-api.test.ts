import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';
import { GitService } from '../../platform/orchestrator/src/git/git.service.js';
import { MockRunnerAdapter } from '@forgeos/runner';

describe('Task 2.4: Git Integration API (FR-040, FR-041, FR-046)', () => {
  let app: FastifyInstance;
  let mockRunner: MockRunnerAdapter;

  beforeEach(async () => {
    mockRunner = new MockRunnerAdapter({
      defaultExitCode: 0,
      defaultStdout: '## main...origin/main\n',
    });
    const gitService = new GitService(mockRunner);

    app = await createServer({
      logger: false,
      gitService,
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('retrieves git status via GET /api/git/status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/git/status',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.currentBranch).toBe('main');
    expect(body.isClean).toBe(true);
  });

  it('creates isolated worktree via POST /api/git/worktree', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/git/worktree',
      payload: {
        worktreePath: '.worktrees/wt-agent-test',
        branchName: 'agent/task-42',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.path).toBe('.worktrees/wt-agent-test');
    expect(body.branch).toBe('agent/task-42');
  });

  it('removes worktree via DELETE /api/git/worktree', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/git/worktree',
      payload: {
        worktreePath: '.worktrees/wt-agent-test',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.message).toContain('removed');
  });
});
