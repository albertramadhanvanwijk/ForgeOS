import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { projectsRoutes } from './projects/projects.routes.js';
import { ProjectsService } from './projects/projects.service.js';
import { InMemoryProjectStore } from './projects/project-store.js';
import { registryRoutes } from './registry/registry.routes.js';
import { AgentRegistry } from '@forgeos/agent-registry';

export interface ServerOptions {
  logger?: boolean;
  projectsService?: ProjectsService;
  agentRegistry?: AgentRegistry;
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

  // Projects Service & Routes
  const projectsService =
    opts.projectsService ?? new ProjectsService(new InMemoryProjectStore());

  await app.register(projectsRoutes, {
    prefix: '/api/projects',
    service: projectsService,
  });

  // Agent Registry Routes (FR-020 - FR-024, FR-027)
  await app.register(registryRoutes, {
    prefix: '/api/registry',
    registry: opts.agentRegistry,
  });

  return app;
}
