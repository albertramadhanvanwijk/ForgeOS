import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { projectsRoutes } from './projects/projects.routes.js';
import { ProjectsService } from './projects/projects.service.js';
import { InMemoryProjectStore } from './projects/project-store.js';
import { registryRoutes } from './registry/registry.routes.js';
import { AgentRegistry } from '@forgeos/agent-registry';
import { workflowsRoutes } from './workflows/workflows.routes.js';
import { WorkflowEngine, InMemoryWorkflowStore } from '@forgeos/workflow-engine';

export interface ServerOptions {
  logger?: boolean;
  projectsService?: ProjectsService;
  agentRegistry?: AgentRegistry;
  workflowEngine?: WorkflowEngine;
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

  // Projects Service & Routes (FR-001, FR-002)
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

  // Workflow Engine Routes (FR-011, FR-016, FR-017, FR-018)
  const workflowEngine =
    opts.workflowEngine ?? new WorkflowEngine(new InMemoryWorkflowStore());

  await app.register(workflowsRoutes, {
    prefix: '/api/workflows',
    engine: workflowEngine,
  });

  return app;
}
