import { FastifyInstance } from 'fastify';
import {
  StructuredLogger,
  FailureExplainer,
  LimitEnforcer,
  StructuredLogInput,
  FailureExplanationInput,
  LogQueryFilter,
  ContextCompactor,
  ConversationMessage,
} from '@forgeos/observability';

export interface ObservabilityRoutesOptions {
  logger: StructuredLogger;
  explainer: FailureExplainer;
  limitEnforcer: LimitEnforcer;
  compactor?: ContextCompactor;
}

export const registerObservabilityRoutes = (app: FastifyInstance, options: ObservabilityRoutesOptions) => {
  const { logger, explainer, limitEnforcer } = options;
  const compactor = options.compactor ?? new ContextCompactor();

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

  // POST /api/observability/compact (FR-092 Context Compaction)
  app.post('/api/observability/compact', async (request, reply) => {
    const body = request.body as {
      messages: ConversationMessage[];
      maxMessagesBeforeCompaction?: number;
      retainRecentMessages?: number;
    };

    if (!body || !Array.isArray(body.messages)) {
      return reply.status(400).send({ error: 'Missing required field: messages (array)' });
    }

    const activeCompactor =
      body.maxMessagesBeforeCompaction !== undefined
        ? new ContextCompactor({
            maxMessagesBeforeCompaction: body.maxMessagesBeforeCompaction,
            retainRecentMessages: body.retainRecentMessages,
          })
        : compactor;

    const result = activeCompactor.compact(body.messages);
    return reply.status(200).send(result);
  });
};
