import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../platform/orchestrator/src/app.js';
import type { FastifyInstance } from 'fastify';

describe('Workflow Engine HTTP API Integration (FR-011, FR-016, FR-017, FR-018)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs an end-to-end workflow execution cycle via REST API', async () => {
    // 1. Create a workflow run with DAG dependencies
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/workflows/runs',
      payload: {
        projectId: 'proj-e2e-01',
        definition: {
          id: 'def-e2e',
          name: 'CI/CD Pipeline',
          tasks: [
            { id: 'lint', name: 'Lint code', dependencies: [] },
            { id: 'build', name: 'Build code', dependencies: ['lint'] },
          ],
        },
      },
    });

    expect(createRes.statusCode).toBe(201);
    const run = JSON.parse(createRes.body);
    expect(run.id).toBeDefined();
    expect(run.state).toBe('running');

    // 2. Query run details: ready tasks should only be 'lint'
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/workflows/runs/${run.id}`,
    });
    expect(getRes.statusCode).toBe(200);
    const fetched = JSON.parse(getRes.body);
    expect(fetched.readyTaskIds).toEqual(['lint']);

    // 3. Complete 'lint' task
    const completeLintRes = await app.inject({
      method: 'POST',
      url: `/api/workflows/runs/${run.id}/complete-task`,
      payload: { taskId: 'lint', outputs: { lintPassed: true } },
    });
    expect(completeLintRes.statusCode).toBe(200);

    // 4. Create checkpoint
    const cpRes = await app.inject({
      method: 'POST',
      url: `/api/workflows/runs/${run.id}/checkpoint`,
      payload: { stepName: 'post-lint' },
    });
    expect(cpRes.statusCode).toBe(200);
    const cp = JSON.parse(cpRes.body);
    expect(cp.completedTasks).toContain('lint');

    // 5. Complete 'build' task
    const completeBuildRes = await app.inject({
      method: 'POST',
      url: `/api/workflows/runs/${run.id}/complete-task`,
      payload: { taskId: 'build', outputs: { buildArtifact: 'app.tar.gz' } },
    });
    expect(completeBuildRes.statusCode).toBe(200);
    const completedRun = JSON.parse(completeBuildRes.body);
    expect(completedRun.state).toBe('completed');
  });
});
