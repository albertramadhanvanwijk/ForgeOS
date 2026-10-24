import { FastifyInstance } from 'fastify';
import {
  PersistentMemoryService,
  ContextPackager,
} from '@forgeos/persistent-memory';

export interface MemoryRoutesOptions {
  memoryService: PersistentMemoryService;
  contextPackager: ContextPackager;
}

export function registerMemoryRoutes(
  app: FastifyInstance,
  options: MemoryRoutesOptions
) {
  const { memoryService, contextPackager } = options;

  // POST /api/memory/items — Store new candidate memory item
  app.post('/api/memory/items', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body.scopeId || !body.title || !body.content) {
        return reply.status(400).send({
          error: 'Missing required fields: scopeId, title, content',
        });
      }

      const item = await memoryService.createMemoryItem({
        workspaceId: body.workspaceId || 'ws-default',
        scopeType: body.scopeType || 'project',
        scopeId: body.scopeId,
        memoryType: body.memoryType || 'project',
        title: body.title,
        content: body.content,
        createdById: body.createdById || 'agent',
        confidence: body.confidence,
        sensitivity: body.sensitivity,
        source: body.source,
      });

      return reply.status(201).send(item);
    } catch (err: any) {
      return reply.status(400).send({
        error: err.message || 'Failed to create memory item',
      });
    }
  });

  // GET /api/memory/items — Query memory items
  app.get('/api/memory/items', async (request, reply) => {
    const query = request.query as any;
    if (!query.scopeId) {
      return reply.status(400).send({ error: 'Missing required query param: scopeId' });
    }

    const items = await memoryService.query({
      scopeType: query.scopeType || 'project',
      scopeId: query.scopeId,
      memoryType: query.memoryType,
      includeShared: query.includeShared === 'true',
    });

    return reply.send({
      items,
      count: items.length,
    });
  });

  // GET /api/memory/items/:id — Get item by ID
  app.get('/api/memory/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await memoryService.getMemoryItem(id);
    if (!item) {
      return reply.status(404).send({ error: 'Memory item not found' });
    }
    return reply.send(item);
  });

  // GET /api/memory/query — Query memory items with strict project isolation
  app.get('/api/memory/query', async (request, reply) => {
    const query = request.query as any;
    if (!query.scopeId) {
      return reply.status(400).send({ error: 'Missing required query param: scopeId' });
    }

    const items = await memoryService.query({
      scopeType: query.scopeType || 'project',
      scopeId: query.scopeId,
      memoryType: query.memoryType,
      includeShared: query.includeShared === 'true',
    });

    return reply.send({
      items,
      count: items.length,
    });
  });

  // POST /api/memory/context — Assemble bounded context for LLM prompt
  app.post('/api/memory/context', async (request, reply) => {
    const body = request.body as any;
    if (!body.scopeId) {
      return reply.status(400).send({ error: 'Missing required field: scopeId' });
    }

    const contextPackage = await contextPackager.assembleContext({
      scopeType: body.scopeType || 'project',
      scopeId: body.scopeId,
      role: body.role,
      maxTokens: body.maxTokens,
    });

    return reply.send(contextPackage);
  });

  // POST /api/memory/items/:id/versions — Create updated immutable version
  app.post('/api/memory/items/:id/versions', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      if (!body.newContent || !body.changeReason) {
        return reply.status(400).send({
          error: 'Missing required fields: newContent, changeReason',
        });
      }

      const updated = await memoryService.updateMemoryVersion(id, {
        newContent: body.newContent,
        changeReason: body.changeReason,
        createdById: body.createdById || 'agent',
      });

      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({
        error: err.message || 'Failed to update memory version',
      });
    }
  });
}
