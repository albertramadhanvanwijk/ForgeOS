import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 4.5: Platform Builder HTTP API Integration (FR-070 - FR-080)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/platform-builder/capabilities returns registered capability graph (FR-071)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/platform-builder/capabilities',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.nodes).toBeDefined();
    expect(body.nodes.length).toBeGreaterThanOrEqual(12);
  });

  it('POST /api/platform-builder/changesets plans ChangeSet from conversational intent (FR-070, FR-073)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/platform-builder/changesets',
      payload: {
        intent: 'Add automated payment checkout subsystem',
        author: 'lead-dev@forgeos.local',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.changeSet).toBeDefined();
    expect(body.changeSet.status).toBe('draft');
    expect(body.isolatedBranch).toMatch(/^platform\/changeset-/);
  });

  it('POST /api/platform-builder/changesets/:id/approve and release gate (FR-076, FR-077, FR-078)', async () => {
    // 1. Create ChangeSet
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/platform-builder/changesets',
      payload: {
        intent: 'Add notification webhook service',
        author: 'dev@forgeos.local',
      },
    });
    const csId = JSON.parse(planRes.body).changeSet.id;

    // 2. Approve ChangeSet
    const approveRes = await app.inject({
      method: 'POST',
      url: `/api/platform-builder/changesets/${csId}/approve`,
      payload: {
        approvedBy: 'security-architect@forgeos.local',
        rationale: 'Impact assessment complete and isolation branch active',
      },
    });
    expect(approveRes.statusCode).toBe(200);
    expect(JSON.parse(approveRes.body).changeSet.status).toBe('approved');

    // 3. Release fails if tests did not pass (FR-076)
    const failRelease = await app.inject({
      method: 'POST',
      url: `/api/platform-builder/changesets/${csId}/release`,
      payload: {
        testsPassed: false,
        runnerExecutionRef: 'run-failed-789',
      },
    });
    expect(failRelease.statusCode).toBe(422);

    // 4. Release succeeds when verified (FR-078)
    const passRelease = await app.inject({
      method: 'POST',
      url: `/api/platform-builder/changesets/${csId}/release`,
      payload: {
        testsPassed: true,
        runnerExecutionRef: 'run-passed-789',
      },
    });
    expect(passRelease.statusCode).toBe(200);
    expect(JSON.parse(passRelease.body).changeSet.status).toBe('applied');
  });
});
