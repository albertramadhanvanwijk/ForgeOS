import { describe, it, expect } from 'vitest';
import {
  WorkflowEngine,
  InMemoryWorkflowStore,
  WorkflowDefinitionModel,
} from '../../platform/workflow-engine/src/index.js';

describe('FR-013: Safe Serial and Parallel Work Coordination', () => {
  it('correctly executes independent parallel tasks concurrently and dependent tasks serially', async () => {
    const engine = new WorkflowEngine(new InMemoryWorkflowStore());

    // Define DAG with parallel branches:
    // task-setup -> (task-ui-design & task-api-schema) -> task-integrate
    const definition: WorkflowDefinitionModel = {
      id: 'wf-parallel-01',
      name: 'Parallel Build Workflow',
      tasks: [
        { id: 'task-setup', name: 'Environment Setup', dependencies: [] },
        { id: 'task-ui-design', name: 'UI Components', dependencies: ['task-setup'] },
        { id: 'task-api-schema', name: 'API Schema', dependencies: ['task-setup'] },
        { id: 'task-integrate', name: 'Full Integration', dependencies: ['task-ui-design', 'task-api-schema'] },
      ],
    };

    const run = await engine.createRun({
      projectId: 'proj-par-01',
      definition,
    });

    await engine.startRun(run.id);

    // Initial state: only task-setup has 0 dependencies, so only task-setup is ready
    const readyInitial = await engine.getReadyTasks(run.id);
    expect(readyInitial.map((t) => t.id)).toEqual(['task-setup']);

    // Complete setup task -> both task-ui-design and task-api-schema can now run concurrently in parallel
    await engine.completeTask(run.id, 'task-setup', { envReady: true });
    const readyAfterSetup = await engine.getReadyTasks(run.id);
    expect(readyAfterSetup.map((t) => t.id).sort()).toEqual(['task-api-schema', 'task-ui-design']);

    // Complete task-ui-design only -> task-integrate still cannot run because task-api-schema is pending
    await engine.completeTask(run.id, 'task-ui-design', { designReady: true });
    const readyAfterUi = await engine.getReadyTasks(run.id);
    expect(readyAfterUi.map((t) => t.id)).toEqual(['task-api-schema']);

    // Complete task-api-schema -> now task-integrate is unblocked and ready
    await engine.completeTask(run.id, 'task-api-schema', { apiReady: true });
    const readyAfterApi = await engine.getReadyTasks(run.id);
    expect(readyAfterApi.map((t) => t.id)).toEqual(['task-integrate']);

    // Complete task-integrate -> entire run transitions to 'completed'
    await engine.completeTask(run.id, 'task-integrate', { allDone: true });
    const finalRun = await engine.getRun(run.id);
    expect(finalRun?.state).toBe('completed');
  });
});
