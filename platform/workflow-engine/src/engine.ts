import { randomUUID } from 'node:crypto';
import type {
  WorkflowRunInstance,
  CreateRunInput,
  RuntimeTask,
  CheckpointRecord,
} from './types.js';
import type { IWorkflowStore } from './store.js';

export class WorkflowEngine {
  constructor(private readonly store: IWorkflowStore) {}

  async createRun(input: CreateRunInput): Promise<WorkflowRunInstance> {
    const now = new Date();
    const tasksMap = new Map<string, RuntimeTask>();

    for (const taskDef of input.definition.tasks) {
      tasksMap.set(taskDef.id, {
        id: taskDef.id,
        name: taskDef.name,
        description: taskDef.description,
        assignedRole: taskDef.assignedRole,
        status: 'pending',
        dependencies: taskDef.dependencies,
        inputs: {},
      });
    }

    const run: WorkflowRunInstance = {
      id: randomUUID(),
      projectId: input.projectId,
      definitionId: input.definition.id,
      definition: input.definition,
      state: 'pending',
      context: input.initialContext ?? {},
      tasks: tasksMap,
      checkpoints: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.store.save(run);
    return run;
  }

  async getRun(runId: string): Promise<WorkflowRunInstance | null> {
    return this.store.findById(runId);
  }

  async listRuns(): Promise<WorkflowRunInstance[]> {
    if (this.store.listAll) {
      return this.store.listAll();
    }
    return [];
  }

  async startRun(runId: string): Promise<WorkflowRunInstance> {
    const run = await this.requireRun(runId);
    run.state = 'running';
    run.startedAt = new Date();
    run.updatedAt = new Date();

    await this.store.save(run);
    return run;
  }

  async getReadyTasks(runId: string): Promise<RuntimeTask[]> {
    const run = await this.requireRun(runId);
    const ready: RuntimeTask[] = [];

    const completedIds = new Set(
      Array.from(run.tasks.values())
        .filter((t) => t.status === 'completed' || t.status === 'skipped')
        .map((t) => t.id)
    );

    for (const task of run.tasks.values()) {
      if (task.status === 'pending') {
        const allDepsMet = task.dependencies.every((depId) => completedIds.has(depId));
        if (allDepsMet) {
          ready.push(task);
        }
      }
    }

    return ready;
  }

  async completeTask(
    runId: string,
    taskId: string,
    outputs?: Record<string, unknown>
  ): Promise<WorkflowRunInstance> {
    const run = await this.requireRun(runId);
    const task = run.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID "${taskId}" not found in run "${runId}"`);
    }

    task.status = 'completed';
    task.outputs = outputs;
    task.completedAt = new Date();
    run.updatedAt = new Date();

    // Check if all tasks in workflow are finished
    const allFinished = Array.from(run.tasks.values()).every(
      (t) => t.status === 'completed' || t.status === 'skipped'
    );

    if (allFinished) {
      run.state = 'completed';
      run.completedAt = new Date();
    }

    await this.store.save(run);
    return run;
  }

  async saveCheckpoint(runId: string, stepName: string): Promise<CheckpointRecord> {
    const run = await this.requireRun(runId);
    const completedTasks = Array.from(run.tasks.values())
      .filter((t) => t.status === 'completed')
      .map((t) => t.id);

    const checkpoint: CheckpointRecord = {
      id: randomUUID(),
      stepName,
      timestamp: new Date(),
      state: run.state,
      completedTasks,
      context: { ...run.context },
    };

    run.checkpoints.push(checkpoint);
    run.updatedAt = new Date();
    await this.store.save(run);

    return checkpoint;
  }

  async interruptRun(runId: string, reason?: string): Promise<WorkflowRunInstance> {
    const run = await this.requireRun(runId);
    run.state = 'paused';
    run.failureReason = reason;
    run.updatedAt = new Date();

    await this.store.save(run);
    return run;
  }

  async resumeRun(runId: string): Promise<WorkflowRunInstance> {
    const run = await this.requireRun(runId);
    run.state = 'running';
    run.updatedAt = new Date();

    await this.store.save(run);
    return run;
  }

  private async requireRun(runId: string): Promise<WorkflowRunInstance> {
    const run = await this.store.findById(runId);
    if (!run) {
      throw new Error(`Workflow run with ID "${runId}" not found`);
    }
    return run;
  }
}
