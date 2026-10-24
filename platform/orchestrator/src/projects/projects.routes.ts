import type { FastifyPluginAsync } from 'fastify';
import type { ProjectStatus } from '@forgeos/types';
import { ProjectsService } from './projects.service.js';
import { InMemoryProjectStore } from './project-store.js';

export interface ProjectsPluginOptions {
  service?: ProjectsService;
}

export const projectsRoutes: FastifyPluginAsync<ProjectsPluginOptions> = async (app, opts) => {
  const service = opts.service ?? new ProjectsService(new InMemoryProjectStore());

  // POST /api/projects - Create project
  app.post<{
    Body: {
      name?: string;
      goal?: string;
      description?: string;
      capabilityProfile?: Record<string, unknown>;
    };
  }>('/', async (request, reply) => {
    const { name, goal, description, capabilityProfile } = request.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Property "name" is required and must be a non-empty string',
      });
    }

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Property "goal" is required and must be a non-empty string',
      });
    }

    try {
      const project = await service.createProject({
        name,
        goal,
        description,
        capabilityProfile,
      });
      return reply.status(201).send(project);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(400).send({ error: 'Bad Request', message });
    }
  });

  // GET /api/projects - List projects (optional ?status=)
  app.get<{
    Querystring: {
      status?: ProjectStatus;
    };
  }>('/', async (request, reply) => {
    const { status } = request.query;
    const projects = await service.listProjects(status ? { status } : undefined);
    return reply.status(200).send(projects);
  });

  // GET /api/projects/:id - Get project by ID
  app.get<{
    Params: {
      id: string;
    };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const project = await service.getProject(id);

    if (!project) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Project with ID "${id}" was not found`,
      });
    }

    return reply.status(200).send(project);
  });

  // PATCH /api/projects/:id - Update project
  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      name?: string;
      goal?: string;
      description?: string;
      status?: ProjectStatus;
      capabilityProfile?: Record<string, unknown>;
    };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const updated = await service.updateProject(id, request.body || {});

    if (!updated) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Project with ID "${id}" was not found`,
      });
    }

    return reply.status(200).send(updated);
  });

  // DELETE /api/projects/:id - Soft archive project (FR-001)
  app.delete<{
    Params: {
      id: string;
    };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const archived = await service.archiveProject(id);

    if (!archived) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Project with ID "${id}" was not found`,
      });
    }

    return reply.status(200).send(archived);
  });
};
