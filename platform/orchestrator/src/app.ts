import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { projectsRoutes } from './projects/projects.routes.js';
import { ProjectsService } from './projects/projects.service.js';
import { InMemoryProjectStore } from './projects/project-store.js';

export interface ServerOptions {
  logger?: boolean;
  projectsService?: ProjectsService;
}

export async function createServer(opts: ServerOptions = { logger: false }): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'forgeos-orchestrator',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });

  // Shared in-memory store for instance lifecycle
  const projectsService =
    opts.projectsService ?? new ProjectsService(new InMemoryProjectStore());

  // Projects API routes
  await app.register(projectsRoutes, {
    prefix: '/api/projects',
    service: projectsService,
  });

  return app;
}
