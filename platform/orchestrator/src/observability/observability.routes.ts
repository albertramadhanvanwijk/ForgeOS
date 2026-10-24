import { FastifyInstance } from 'fastify';
import {
  StructuredLogger,
  FailureExplainer,
  LimitEnforcer,
  StructuredLogInput,
  FailureExplanationInput,
  LogQueryFilter,
} from '@forgeos/observability';

export interface ObservabilityRoutesOptions {
  logger: StructuredLogger;
  explainer: FailureExplainer;
  limitEnforcer: LimitEnforcer;
}

export const registerObservabilityRoutes = (app: FastifyInstance, options: ObservabilityRoutesOptions) => {
  const { logger, explainer, limitEnforcer } = options;

  app.get('/api/observability/logs', async (request, reply) => {
    const query = request.query as LogQueryFilter;
    const logs = logger.query(query);
    return reply.status(200).send(logs);
  });

  app.post('/api/observability/logs', async (request, reply) => {
    const body = request.body as StructuredLogInput;
    if (!body || !body.component || !body.event || !body.message) {
      return reply.status(400).send({ error: 'Missing required log fields: component, event, message' });
    }

    const entry = logger.log(body);
    return reply.status(201).send(entry);
  });

  app.post('/api/observability/explain', async (request, reply) => {
    const body = request.body as FailureExplanationInput;
    if (!body || !body.runId || !body.errorCategory || !body.rawError) {
      return reply.status(400).send({ error: 'Missing required failure fields: runId, errorCategory, rawError' });
    }

    const explanation = explainer.explain(body);
    return reply.status(200).send(explanation);
  });

  app.get('/api/observability/limits', async (_request, reply) => {
    return reply.status(200).send({
      limits: limitEnforcer.limits,
      activeConcurrency: limitEnforcer.getActiveConcurrency(),
    });
  });
};
