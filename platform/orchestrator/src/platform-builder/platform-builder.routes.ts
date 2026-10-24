import { FastifyInstance } from 'fastify';
import { PlatformBuilderService } from '@forgeos/platform-builder';

export interface PlatformBuilderRoutesOptions {
  builderService: PlatformBuilderService;
}

export function registerPlatformBuilderRoutes(
  app: FastifyInstance,
  options: PlatformBuilderRoutesOptions
) {
  const { builderService } = options;

  // GET /api/platform-builder/capabilities (FR-071)
  app.get('/api/platform-builder/capabilities', async (request, reply) => {
    const graph = builderService.getCapabilityGraph();
    return reply.send(graph);
  });

  // POST /api/platform-builder/changesets — Plan from intent (FR-070, FR-073, FR-075)
  app.post('/api/platform-builder/changesets', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body.intent || !body.author) {
        return reply.status(400).send({
          error: 'Missing required fields: intent, author',
        });
      }

      const result = builderService.planChangeFromIntent({
        intent: body.intent,
        author: body.author,
        version: body.version || '2.3.0',
      });

      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to plan ChangeSet' });
    }
  });

  // GET /api/platform-builder/changesets
  app.get('/api/platform-builder/changesets', async (request, reply) => {
    const changeSets = builderService.getAllChangeSets();
    return reply.send({ changeSets });
  });

  // GET /api/platform-builder/changesets/:id
  app.get('/api/platform-builder/changesets/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const changeSet = builderService.getChangeSet(id);
    if (!changeSet) {
      return reply.status(404).send({ error: `ChangeSet '${id}' not found` });
    }
    return reply.send({ changeSet });
  });

  // POST /api/platform-builder/changesets/:id/impact (FR-074)
  app.post('/api/platform-builder/changesets/:id/impact', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const report = builderService.analyzeChangeSetImpact(id);
      return reply.send({ report });
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });

  // POST /api/platform-builder/changesets/:id/approve (FR-077)
  app.post('/api/platform-builder/changesets/:id/approve', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      if (!body.approvedBy) {
        return reply.status(400).send({ error: 'Missing approvedBy field' });
      }

      const changeSet = builderService.approveChangeSet(id, {
        approvedBy: body.approvedBy,
        rationale: body.rationale || 'ChangeSet approved by policy gate',
        decidedAt: new Date(),
      });

      return reply.send({ changeSet });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/platform-builder/changesets/:id/release (FR-076, FR-078)
  app.post('/api/platform-builder/changesets/:id/release', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;

      const changeSet = builderService.releaseChangeSet(id, {
        testsPassed: Boolean(body?.testsPassed),
        runnerExecutionRef: body?.runnerExecutionRef || 'manual-override',
      });

      return reply.send({ changeSet });
    } catch (err: any) {
      return reply.status(422).send({ error: err.message });
    }
  });

  // POST /api/platform-builder/changesets/:id/rollback (FR-079)
  app.post('/api/platform-builder/changesets/:id/rollback', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const changeSet = builderService.rollbackChangeSet(id);
      return reply.send({ changeSet });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
