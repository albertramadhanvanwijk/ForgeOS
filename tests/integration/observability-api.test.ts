import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 2.6: Observability & Structured Tracing API (FR-090, FR-091, FR-092)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('records and retrieves structured logs via /api/observability/logs (FR-090)', async () => {
    const postRes = await app.inject({
      method: 'POST',
      url: '/api/observability/logs',
      payload: {
        component: 'workflow-engine',
        event: 'stage_completed',
        message: 'Stage 1 architecture finalized',
        projectId: 'prj-alpha',
        runId: 'run-99',
      },
    });

    expect(postRes.statusCode).toBe(201);
    const entry = JSON.parse(postRes.payload);
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();

    const getRes = await app.inject({
      method: 'GET',
      url: '/api/observability/logs?runId=run-99',
    });

    expect(getRes.statusCode).toBe(200);
    const logs = JSON.parse(getRes.payload);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].event).toBe('stage_completed');
  });

  it('diagnoses failure via POST /api/observability/explain (FR-091)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/observability/explain',
      payload: {
        runId: 'run-101',
        errorCategory: 'budget_exceeded',
        rawError: 'Cost limit reached for project prj-alpha ($10.05 / $10.00)',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.errorCategory).toBe('budget_exceeded');
    expect(body.summary).toContain('budget');
    expect(body.recommendedAction).toBeDefined();
    expect(body.recoveryStrategies.length).toBeGreaterThan(0);
  });

  it('retrieves active limits via GET /api/observability/limits (FR-092)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/observability/limits',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.limits.maxCostUsd).toBe(10);
    expect(body.limits.maxConcurrency).toBe(10);
    expect(typeof body.activeConcurrency).toBe('number');
  });
});
