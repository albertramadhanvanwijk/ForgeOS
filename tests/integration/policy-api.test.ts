import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../platform/orchestrator/src/app.js';
import type { FastifyInstance } from 'fastify';

describe('Policy & Approvals API Integration (FR-015, FR-025, FR-028, FR-093)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('evaluates authorization request and logs audit event', async () => {
    // 1. Authorize an unconfigured role (should default-deny)
    const authRes = await app.inject({
      method: 'POST',
      url: '/api/policy/authorize',
      payload: {
        actor: 'untrusted-agent-01',
        role: 'guest',
        action: 'write_code',
        resource: 'main.ts',
        correlationId: 'corr-api-01',
      },
    });

    expect(authRes.statusCode).toBe(200);
    const authBody = JSON.parse(authRes.body);
    expect(authBody.allowed).toBe(false);

    // 2. Check audit log has recorded the denial
    const auditRes = await app.inject({
      method: 'GET',
      url: '/api/policy/audit?correlationId=corr-api-01',
    });

    expect(auditRes.statusCode).toBe(200);
    const logs = JSON.parse(auditRes.body);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].outcome).toBe('denied');
  });

  it('handles approval request and decision workflow via REST API (FR-015)', async () => {
    // 1. Request approval
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/policy/approvals',
      payload: {
        projectId: 'proj-gateway-01',
        action: 'deploy_production',
        resourceType: 'service',
        resourceId: 'api-gateway',
        exactVersionHash: 'hash-release-v1.0.0',
        riskLevel: 'high',
        requestedBy: 'release-manager',
        rationale: 'All quality gates passed, requesting production rollout',
      },
    });

    expect(reqRes.statusCode).toBe(201);
    const record = JSON.parse(reqRes.body);
    expect(record.id).toBeDefined();
    expect(record.status).toBe('pending');

    // 2. Decide approval (grant)
    const decideRes = await app.inject({
      method: 'POST',
      url: `/api/policy/approvals/${record.id}/decide`,
      payload: {
        decision: 'approved',
        decidedBy: 'tech-lead@forgeos.dev',
      },
    });

    expect(decideRes.statusCode).toBe(200);
    const decided = JSON.parse(decideRes.body);
    expect(decided.status).toBe('approved');
    expect(decided.approvedBy).toBe('tech-lead@forgeos.dev');
  });
});
