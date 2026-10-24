import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../platform/orchestrator/src/app.js';
import type { FastifyInstance } from 'fastify';

describe('Task 1.4: Project Management API (FR-001, FR-002)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects project creation if name or goal is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        description: 'Missing required fields',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBeDefined();
  });

  it('creates a project with valid name and goal (FR-001, FR-002)', async () => {
    const payload = {
      name: 'E-Commerce Platform',
      goal: 'Build an AI-orchestrated microservices e-commerce system',
      description: 'Production storefront with payment integration',
      capabilityProfile: {
        frontend: 'Next.js',
        backend: 'Fastify',
        database: 'PostgreSQL',
      },
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload,
    });

    expect(res.statusCode).toBe(201);
    const project = JSON.parse(res.body);
    expect(project.id).toBeDefined();
    expect(project.name).toBe(payload.name);
    expect(project.goal).toBe(payload.goal);
    expect(project.status).toBe('active');
    expect(project.capabilityProfile).toEqual(payload.capabilityProfile);
    expect(project.createdAt).toBeDefined();
    expect(project.updatedAt).toBeDefined();
  });

  it('retrieves an existing project by ID', async () => {
    // 1. Create a project
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        name: 'Mobile App Project',
        goal: 'Deliver cross-platform mobile client',
      },
    });
    const created = JSON.parse(createRes.body);

    // 2. Fetch by ID
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/projects/${created.id}`,
    });

    expect(getRes.statusCode).toBe(200);
    const fetched = JSON.parse(getRes.body);
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe('Mobile App Project');
  });

  it('returns 404 when project is not found', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/projects/non-existent-id-999',
    });

    expect(res.statusCode).toBe(404);
  });

  it('updates project properties with PATCH /api/projects/:id', async () => {
    // 1. Create a project
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        name: 'Initial Name',
        goal: 'Initial Goal',
      },
    });
    const created = JSON.parse(createRes.body);

    // 2. Update project
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/projects/${created.id}`,
      payload: {
        name: 'Updated Name',
        status: 'paused',
      },
    });

    expect(patchRes.statusCode).toBe(200);
    const updated = JSON.parse(patchRes.body);
    expect(updated.name).toBe('Updated Name');
    expect(updated.status).toBe('paused');
    expect(updated.goal).toBe('Initial Goal'); // preserved
  });

  it('archives a project with DELETE /api/projects/:id (FR-001)', async () => {
    // 1. Create a project
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        name: 'Project to Archive',
        goal: 'Testing soft archive',
      },
    });
    const created = JSON.parse(createRes.body);

    // 2. Archive it
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/projects/${created.id}`,
    });

    expect(deleteRes.statusCode).toBe(200);
    const archived = JSON.parse(deleteRes.body);
    expect(archived.status).toBe('archived');

    // 3. Confirm it still exists with archived status
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/projects/${created.id}`,
    });
    expect(getRes.statusCode).toBe(200);
    expect(JSON.parse(getRes.body).status).toBe('archived');
  });

  it('lists projects with optional status filtering', async () => {
    // List all projects
    const allRes = await app.inject({
      method: 'GET',
      url: '/api/projects',
    });
    expect(allRes.statusCode).toBe(200);
    const allProjects = JSON.parse(allRes.body);
    expect(Array.isArray(allProjects)).toBe(true);
    expect(allProjects.length).toBeGreaterThanOrEqual(3);

    // List only archived projects
    const archivedRes = await app.inject({
      method: 'GET',
      url: '/api/projects?status=archived',
    });
    expect(archivedRes.statusCode).toBe(200);
    const archivedProjects = JSON.parse(archivedRes.body);
    expect(Array.isArray(archivedProjects)).toBe(true);
    expect(archivedProjects.every((p: { status: string }) => p.status === 'archived')).toBe(true);
  });
});
