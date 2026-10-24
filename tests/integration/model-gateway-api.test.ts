import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 2.2: Model Gateway API Integration (FR-094)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists available models and capabilities via GET /api/models', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(res.statusCode).toBe(200);
    const models = JSON.parse(res.payload);
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThanOrEqual(2);
    expect(models.some((m: any) => m.tier === 'fast')).toBe(true);
    expect(models.some((m: any) => m.tier === 'deep_reasoning')).toBe(true);
  });

  it('executes model completion via POST /api/models/complete and records metrics', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/models/complete',
      payload: {
        tier: 'fast',
        messages: [{ role: 'user', content: 'Generate high-level system spec' }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.content).toBeDefined();
    expect(body.provider).toBe('mock');
    expect(body.modelUsed).toBe('mock-fast');
    expect(body.usage.totalTokens).toBeGreaterThan(0);
    expect(body.costEstimateUsd).toBeGreaterThan(0);

    // Verify metrics updated
    const metricsRes = await app.inject({
      method: 'GET',
      url: '/api/models/metrics',
    });

    expect(metricsRes.statusCode).toBe(200);
    const metrics = JSON.parse(metricsRes.payload);
    expect(metrics.totalCalls).toBeGreaterThanOrEqual(1);
    expect(metrics.totalTokens).toBeGreaterThan(0);
    expect(metrics.callsByProvider.mock).toBeGreaterThanOrEqual(1);
  });

  it('validates required fields on POST /api/models/complete', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/models/complete',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('messages');
  });
});
