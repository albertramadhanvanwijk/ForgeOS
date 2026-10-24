import { FastifyInstance } from 'fastify';
import { QualityEngine, SuiteEvaluationOptions } from '@forgeos/quality-engine';
import { IRunnerAdapter } from '@forgeos/runner';

export interface QualityRoutesOptions {
  qualityEngine: QualityEngine;
  runner?: IRunnerAdapter;
}

export const registerQualityRoutes = (app: FastifyInstance, options: QualityRoutesOptions) => {
  const { qualityEngine, runner } = options;

  app.get('/api/quality/presets/:type', async (request, reply) => {
    const { type } = request.params as { type: string };
    const presets = qualityEngine.getPresetGates(type);
    return reply.status(200).send(presets);
  });

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
};
