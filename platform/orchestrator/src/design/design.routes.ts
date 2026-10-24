import { FastifyInstance } from 'fastify';
import { DesignStudioEngine } from '@forgeos/design-studio';

export interface DesignRoutesOptions {
  designEngine: DesignStudioEngine;
}

export function registerDesignRoutes(
  app: FastifyInstance,
  options: DesignRoutesOptions
) {
  const { designEngine } = options;

  // POST /api/design/user-flows (FR-050)
  app.post('/api/design/user-flows', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body.projectId || !body.title || !body.actor || !body.steps) {
        return reply.status(400).send({
          error: 'Missing required fields: projectId, title, actor, steps',
        });
      }

      const flow = designEngine.createUserFlow({
        projectId: body.projectId,
        title: body.title,
        description: body.description,
        actor: body.actor,
        entryPoint: body.entryPoint || '/',
        successOutcome: body.successOutcome || '/completed',
        steps: body.steps,
      });

      return reply.status(201).send({ flow });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to create user flow' });
    }
  });

  // GET /api/design/user-flows
  app.get('/api/design/user-flows', async (request, reply) => {
    const { projectId } = request.query as { projectId?: string };
    if (!projectId) {
      return reply.status(400).send({ error: 'Missing projectId query param' });
    }
    const flows = designEngine.getUserFlowsByProject(projectId);
    return reply.send({ flows });
  });

  // POST /api/design/specs (FR-051)
  app.post('/api/design/specs', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body.projectId || !body.name || !body.version || !body.tokens) {
        return reply.status(400).send({
          error: 'Missing required fields: projectId, name, version, tokens',
        });
      }

      const spec = designEngine.createDesignSystemSpec({
        projectId: body.projectId,
        name: body.name,
        version: body.version,
        tokens: body.tokens,
        components: body.components || [],
        sitemap: body.sitemap || [],
      });

      return reply.status(201).send({ spec });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to create design spec' });
    }
  });

  // GET /api/design/specs/:id
  app.get('/api/design/specs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const spec = designEngine.getDesignSpec(id);
    if (!spec) {
      return reply.status(404).send({ error: 'Design spec not found' });
    }
    return reply.send({ spec });
  });

  // GET /api/design/specs
  app.get('/api/design/specs', async (request, reply) => {
    const { projectId } = request.query as { projectId?: string };
    if (!projectId) {
      return reply.status(400).send({ error: 'Missing projectId query param' });
    }
    const specs = designEngine.getDesignSpecsByProject(projectId);
    return reply.send({ specs });
  });

  // POST /api/design/specs/:id/approve (FR-052)
  app.post('/api/design/specs/:id/approve', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;

      if (!body.approvedBy) {
        return reply.status(400).send({ error: 'Missing approvedBy field' });
      }

      const spec = designEngine.approveDesignSpec(id, {
        approvedBy: body.approvedBy,
        rationale: body.rationale || 'Design specifications approved',
      });

      return reply.send({ spec });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to approve spec' });
    }
  });

  // POST /api/design/adherence (FR-053)
  app.post('/api/design/adherence', async (request, reply) => {
    const body = request.body as any;
    if (!body.specId || !body.claimedHash) {
      return reply.status(400).send({ error: 'Missing specId or claimedHash' });
    }

    const adherence = designEngine.verifyDesignAdherence(body.specId, body.claimedHash);
    return reply.send(adherence);
  });

  // POST /api/design/impact (FR-054)
  app.post('/api/design/impact', async (request, reply) => {
    const body = request.body as any;
    if (!body.v1SpecId || !body.v2SpecId) {
      return reply.status(400).send({ error: 'Missing v1SpecId or v2SpecId' });
    }

    const v1 = designEngine.getDesignSpec(body.v1SpecId);
    const v2 = designEngine.getDesignSpec(body.v2SpecId);

    if (!v1 || !v2) {
      return reply.status(404).send({ error: 'One or both design specs not found' });
    }

    const impact = designEngine.analyzeDesignImpact(v1, v2);
    return reply.send(impact);
  });

  // POST /api/design/validate (FR-055)
  app.post('/api/design/validate', async (request, reply) => {
    const body = request.body as any;
    if (!body.specId || !body.sourceCode) {
      return reply.status(400).send({ error: 'Missing specId or sourceCode' });
    }

    const spec = designEngine.getDesignSpec(body.specId);
    if (!spec) {
      return reply.status(404).send({ error: 'Design spec not found' });
    }

    const result = designEngine.validateUICompliance(body.sourceCode, spec);
    return reply.send(result);
  });
}
