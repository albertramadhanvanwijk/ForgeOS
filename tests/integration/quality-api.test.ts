import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 2.5: Quality Engine API Integration (FR-060, FR-061, FR-063)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('fetches task-appropriate gate presets via GET /api/quality/presets/:type (FR-060)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/quality/presets/code',
    });

    expect(res.statusCode).toBe(200);
    const presets = JSON.parse(res.payload);
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBeGreaterThanOrEqual(2);
    expect(presets.some((p: any) => p.type === 'unit_test')).toBe(true);
  });

  it('evaluates quality suite and returns 200 when all mandatory gates pass', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/quality/evaluate',
      payload: {
        gates: [
          {
            id: 'gate-1',
            name: 'Passing Check',
            type: 'unit_test',
            severity: 'mandatory',
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.passed).toBe(true);
    expect(body.blockingViolations).toHaveLength(0);
  });

  it('evaluates quality suite and returns 422 with blocking violations when mandatory gate fails (FR-063)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/quality/evaluate',
      payload: {
        gates: [
          {
            id: 'gate-failing-tests',
            name: 'Failing Command Check',
            type: 'unit_test',
            severity: 'mandatory',
            command: 'node',
            args: ['-e', 'process.exit(1)'],
          },
        ],
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.payload);
    expect(body.passed).toBe(false);
    expect(body.blockingViolations.length).toBe(1);
    expect(body.blockingViolations[0].gateId).toBe('gate-failing-tests');
  });
});
