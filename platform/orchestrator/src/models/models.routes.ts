import { FastifyInstance } from 'fastify';
import { ModelGateway, CompletionRequest } from '@forgeos/model-gateway';

export interface ModelRoutesOptions {
  gateway: ModelGateway;
}

export const registerModelRoutes = (app: FastifyInstance, options: ModelRoutesOptions) => {
  const { gateway } = options;

  // List available models and capabilities
  app.get('/api/models', async (_request, reply) => {
    const models = gateway.listModels();
    return reply.status(200).send(models);
  });

  // Get gateway token and cost metrics (FR-092, FR-094)
  app.get('/api/models/metrics', async (_request, reply) => {
    const metrics = gateway.getMetrics();
    return reply.status(200).send(metrics);
  });

  // Route completion request
  app.post('/api/models/complete', async (request, reply) => {
    const body = request.body as CompletionRequest;
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return reply.status(400).send({ error: 'Missing required field: messages' });
    }

    try {
      const response = await gateway.complete(body);
      return reply.status(200).send(response);
    } catch (err: any) {
      return reply.status(502).send({ error: err.message });
    }
  });
};
