import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../platform/orchestrator/src/app.js';
import { AgentRegistry } from '../../platform/agent-registry/src/index.js';
import type { FastifyInstance } from 'fastify';
import * as path from 'node:path';

describe('Agent Registry HTTP API Integration (FR-020 - FR-024, FR-027)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const registry = new AgentRegistry();
    const rolesDir = path.resolve(__dirname, '../../agents/roles');
    await registry.loadFromDirectory(rolesDir);

    app = await createServer({ agentRegistry: registry });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/registry/roles returns all registered agent roles', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/registry/roles',
    });

    expect(res.statusCode).toBe(200);
    const roles = JSON.parse(res.body);
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.length).toBeGreaterThanOrEqual(6);
    expect(roles.some((r: { id: string }) => r.id === 'orchestrator')).toBe(true);
  });

  it('GET /api/registry/skills and tools return distinct capabilities', async () => {
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/registry/skills',
    });
    expect(skillsRes.statusCode).toBe(200);
    const skills = JSON.parse(skillsRes.body);
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);

    const toolsRes = await app.inject({
      method: 'GET',
      url: '/api/registry/tools',
    });
    expect(toolsRes.statusCode).toBe(200);
    const tools = JSON.parse(toolsRes.body);
    expect(Array.isArray(tools)).toBe(true);
    expect(tools).toContain('read_file');
    expect(tools).toContain('git_commit');
  });

  it('POST /api/registry/select adaptively selects agents with rationale', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/registry/select',
      payload: {
        taskId: 'deploy-k8s-01',
        name: 'Deploy containerized services to production',
        requiredCapabilities: ['containerization', 'release-deployment'],
      },
    });

    expect(res.statusCode).toBe(200);
    const decision = JSON.parse(res.body);
    expect(decision.selectedRoleIds).toContain('devops-engineer');
    expect(decision.skippedRoleIds).toContain('product-manager');
    expect(decision.rationale.length).toBeGreaterThanOrEqual(6);
  });
});
