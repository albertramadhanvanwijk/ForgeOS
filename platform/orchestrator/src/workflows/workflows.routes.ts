import type { FastifyPluginAsync } from 'fastify';
import { WorkflowEngine, InMemoryWorkflowStore, WorkflowDefinitionModel } from '@forgeos/workflow-engine';

export interface WorkflowsPluginOptions {
  engine?: WorkflowEngine;
}

export const workflowsRoutes: FastifyPluginAsync<WorkflowsPluginOptions> = async (app, opts) => {
  const engine = opts.engine ?? new WorkflowEngine(new InMemoryWorkflowStore());

  // POST /api/workflows/runs - Create new workflow run
  app.post<{
    Body: {
      projectId?: string;
      definition?: WorkflowDefinitionModel;
      initialContext?: Record<string, unknown>;
    };
  }>('/runs', async (request, reply) => {
    const { projectId, definition, initialContext } = request.body || {};

    if (!projectId || !definition || !definition.id || !Array.isArray(definition.tasks)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Properties "projectId" and valid "definition" with tasks are required',
      });
    }

    const run = await engine.createRun({
      projectId,
      definition,
      initialContext,
    });

    await engine.startRun(run.id);
    const startedRun = await engine.getRun(run.id);

    return reply.status(201).send({
      id: startedRun!.id,
      projectId: startedRun!.projectId,
      state: startedRun!.state,
      definitionId: startedRun!.definitionId,
      tasks: Array.from(startedRun!.tasks.values()),
      checkpoints: startedRun!.checkpoints,
    });
  });

  // GET /api/workflows/runs - List all workflow runs
  app.get('/runs', async () => {
    const runs = await engine.listRuns();
    return runs.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      state: r.state,
      definitionId: r.definitionId,
      name: r.definition.name,
      tasksCount: r.tasks.size,
      tasks: Array.from(r.tasks.values()),
      checkpointsCount: r.checkpoints.length,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  });

  // GET /api/workflows/runs/:id - Get run details
  app.get<{
    Params: {
      id: string;
    };
  }>('/runs/:id', async (request, reply) => {
    const { id } = request.params;
    const run = await engine.getRun(id);

    if (!run) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Workflow run with ID "${id}" was not found`,
      });
    }

    const readyTasks = await engine.getReadyTasks(id);

    return reply.status(200).send({
      id: run.id,
      projectId: run.projectId,
      state: run.state,
      definitionId: run.definitionId,
      tasks: Array.from(run.tasks.values()),
      readyTaskIds: readyTasks.map((t) => t.id),
      checkpoints: run.checkpoints,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
    });
  });

  // POST /api/workflows/runs/:id/complete-task - Complete a task step
  app.post<{
    Params: {
      id: string;
    };
    Body: {
      taskId?: string;
      outputs?: Record<string, unknown>;
    };
  }>('/runs/:id/complete-task', async (request, reply) => {
    const { id } = request.params;
    const { taskId, outputs } = request.body || {};

    if (!taskId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Property "taskId" is required',
      });
    }

    try {
      const run = await engine.completeTask(id, taskId, outputs);
      return reply.status(200).send({
        id: run.id,
        state: run.state,
        tasks: Array.from(run.tasks.values()),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(400).send({ error: 'Bad Request', message });
    }
  });

  // POST /api/workflows/runs/:id/checkpoint - Create persistent checkpoint (FR-018)
  app.post<{
    Params: {
      id: string;
    };
    Body: {
      stepName?: string;
    };
  }>('/runs/:id/checkpoint', async (request, reply) => {
    const { id } = request.params;
    const { stepName } = request.body || {};

    if (!stepName) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Property "stepName" is required',
      });
    }

    try {
      const checkpoint = await engine.saveCheckpoint(id, stepName);
      return reply.status(200).send(checkpoint);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(404).send({ error: 'Not Found', message });
    }
  });

  // POST /api/workflows/runs/:id/resume - Resume after interruption (FR-017)
  app.post<{
    Params: {
      id: string;
    };
  }>('/runs/:id/resume', async (request, reply) => {
    const { id } = request.params;
    try {
      const run = await engine.resumeRun(id);
      return reply.status(200).send({
        id: run.id,
        state: run.state,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(404).send({ error: 'Not Found', message });
    }
  });
};
