import { FastifyInstance } from 'fastify';
import { IRunnerAdapter, ExecutionOptions, SecurityPolicyViolationError } from '@forgeos/runner';

export interface RunnerRoutesOptions {
  runner: IRunnerAdapter;
}

export const registerRunnerRoutes = (app: FastifyInstance, options: RunnerRoutesOptions) => {
  const { runner } = options;

  app.post('/api/runner/execute', async (request, reply) => {
    const body = request.body as ExecutionOptions;
    if (!body || !body.command) {
      return reply.status(400).send({ error: 'Missing required field: command' });
    }

    try {
      const result = await runner.execute(body);
      return reply.status(200).send(result);
    } catch (err: any) {
      if (err instanceof SecurityPolicyViolationError || err.name === 'SecurityPolicyViolationError') {
        return reply.status(403).send({ error: err.message, policyViolation: true });
      }
      return reply.status(500).send({ error: err.message });
    }
  });
};
