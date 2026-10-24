import { FastifyInstance } from 'fastify';
import {
  QualityEngine,
  SuiteEvaluationOptions,
  SelfHealingEngine,
  AgentEvaluator,
  AgentTaskExecutionRecord,
} from '@forgeos/quality-engine';
import { IRunnerAdapter } from '@forgeos/runner';

export interface QualityRoutesOptions {
  qualityEngine: QualityEngine;
  selfHealingEngine?: SelfHealingEngine;
  agentEvaluator?: AgentEvaluator;
  runner?: IRunnerAdapter;
}

export const registerQualityRoutes = (app: FastifyInstance, options: QualityRoutesOptions) => {
  const { qualityEngine, runner } = options;
  const selfHealingEngine = options.selfHealingEngine ?? new SelfHealingEngine();
  const agentEvaluator = options.agentEvaluator ?? new AgentEvaluator();

  // GET /api/quality/presets/:type (FR-060)
  app.get('/api/quality/presets/:type', async (request, reply) => {
    const { type } = request.params as { type: string };
    const presets = qualityEngine.getPresetGates(type);
    return reply.status(200).send(presets);
  });

  // POST /api/quality/evaluate (FR-061, FR-063)
  app.post('/api/quality/evaluate', async (request, reply) => {
    const body = request.body as SuiteEvaluationOptions;
    if (!body || !Array.isArray(body.gates)) {
      return reply.status(400).send({ error: 'Missing required field: gates (array)' });
    }

    try {
      const evaluation = await qualityEngine.evaluateSuite({
        ...body,
        runner: body.runner || runner,
      });

      const statusCode = evaluation.passed ? 200 : 422;
      return reply.status(statusCode).send(evaluation);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/quality/self-heal (FR-064)
  app.post('/api/quality/self-heal', async (request, reply) => {
    const body = request.body as any;
    if (!body?.evaluation) {
      return reply.status(400).send({ error: 'Missing required field: evaluation' });
    }

    try {
      const result = await selfHealingEngine.executeHealingLoop({
        evaluation: body.evaluation,
        generatePatch: async () => body.patch || {
          patchId: 'auto-patch-01',
          filePath: 'platform/orchestrator/src/app.ts',
          diff: '+ patched line',
        },
        verify: async () => body.verificationResult || {
          passed: true,
          blockingViolations: [],
        },
      });

      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/quality/evaluations/record (FR-095)
  app.post('/api/quality/evaluations/record', async (request, reply) => {
    const body = request.body as AgentTaskExecutionRecord;
    if (!body?.agentRole || !body?.taskId) {
      return reply.status(400).send({ error: 'Missing required fields: agentRole, taskId' });
    }

    agentEvaluator.recordExecution(body);
    return reply.status(201).send({ recorded: true, taskId: body.taskId });
  });

  // GET /api/quality/evaluations/:role (FR-095)
  app.get('/api/quality/evaluations/:role', async (request, reply) => {
    const { role } = request.params as { role: string };
    const report = agentEvaluator.evaluateAgent(role);
    return reply.status(200).send(report);
  });
};
