import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('MEM-017: Memory Center UI & Context Integration API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists project memory items and enforces boundary isolation in query', async () => {
    // 1. Create a memory item in project-alpha
    await app.inject({
      method: 'POST',
      url: '/api/memory/items',
      payload: {
        workspaceId: 'ws-alpha',
        scopeType: 'project',
        scopeId: 'proj-alpha',
        title: 'Alpha Design Tokens',
        content: 'Brand primary color is #4f46e5',
        createdById: 'designer-01',
      },
    });

    // 2. Query project-alpha memory
    const queryAlphaRes = await app.inject({
      method: 'GET',
      url: '/api/memory/items',
      query: {
        scopeType: 'project',
        scopeId: 'proj-alpha',
      },
    });

    expect(queryAlphaRes.statusCode).toBe(200);
    const alphaItems = queryAlphaRes.json().items;
    expect(alphaItems.length).toBeGreaterThanOrEqual(1);
    expect(alphaItems[0].title).toBe('Alpha Design Tokens');

    // 3. Query project-beta memory (Boundary Isolation - MEM-007)
    const queryBetaRes = await app.inject({
      method: 'GET',
      url: '/api/memory/items',
      query: {
        scopeType: 'project',
        scopeId: 'proj-beta',
      },
    });

    expect(queryBetaRes.statusCode).toBe(200);
    const betaItems = queryBetaRes.json().items;
    // Beta must not see Alpha items!
    expect(betaItems.some((i: any) => i.title === 'Alpha Design Tokens')).toBe(false);
  });
});
