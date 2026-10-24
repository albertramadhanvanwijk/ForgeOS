import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../platform/orchestrator/src/app.js';
import type { FastifyInstance } from 'fastify';

describe('Artifact Registry HTTP API Integration (FR-030 - FR-036)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an artifact with initial version and content via REST API', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/artifacts',
      payload: {
        projectId: 'proj-api-artifact-01',
        type: 'test-report',
        title: 'Integration Test Report v1',
        content: 'PASS: 32 tests passed cleanly.',
        provenanceTaskRunId: 'task-run-qa-99',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.id).toBeDefined();
    expect(body.status).toBe('draft');
    expect(body.latestVersion).toBeDefined();
    expect(body.latestVersion.versionNumber).toBe(1);
    expect(body.latestVersion.contentHash).toBeDefined();
  });

  it('publishes version 2 and retrieves versioned content', async () => {
    // 1. Create artifact
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/artifacts',
      payload: {
        projectId: 'proj-api-artifact-02',
        type: 'architecture-doc',
        title: 'System Context Diagram',
        content: 'Version 1 C4 Context',
      },
    });
    const created = JSON.parse(createRes.body);

    // 2. Publish version 2
    const v2Res = await app.inject({
      method: 'POST',
      url: `/api/artifacts/${created.id}/versions`,
      payload: {
        content: 'Version 2 C4 Context with Security Boundaries',
      },
    });
    expect(v2Res.statusCode).toBe(201);
    const v2Data = JSON.parse(v2Res.body);
    expect(v2Data.version.versionNumber).toBe(2);

    // 3. Retrieve version 1 content
    const v1ContentRes = await app.inject({
      method: 'GET',
      url: `/api/artifacts/${created.id}/versions/1`,
    });
    expect(v1ContentRes.statusCode).toBe(200);
    expect(JSON.parse(v1ContentRes.body).content).toBe('Version 1 C4 Context');

    // 4. Retrieve version 2 content
    const v2ContentRes = await app.inject({
      method: 'GET',
      url: `/api/artifacts/${created.id}/versions/2`,
    });
    expect(v2ContentRes.statusCode).toBe(200);
    expect(JSON.parse(v2ContentRes.body).content).toBe(
      'Version 2 C4 Context with Security Boundaries'
    );
  });

  it('updates artifact status with PATCH /api/artifacts/:id/status', async () => {
    // 1. Create artifact
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/artifacts',
      payload: {
        projectId: 'proj-api-artifact-03',
        type: 'deliverable',
        title: 'Final Client Deliverable',
        content: 'Exported Production Package',
      },
    });
    const created = JSON.parse(createRes.body);

    // 2. Mark verified
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/artifacts/${created.id}/status`,
      payload: {
        status: 'verified',
      },
    });
    expect(patchRes.statusCode).toBe(200);
    expect(JSON.parse(patchRes.body).status).toBe('verified');
  });
});
