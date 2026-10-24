import { describe, it, expect } from 'vitest';

describe('Task 1.6: Persistent Workflow Engine (FR-011, FR-016, FR-017, FR-018)', () => {
  it('verifies explicit workflow states and transitions (FR-016)', async () => {
    const { WorkflowEngine, InMemoryWorkflowStore } = await import(
      '../../platform/workflow-engine/src/index.js'
    );
    const store = new InMemoryWorkflowStore();
    const engine = new WorkflowEngine(store);

    const definition = {
      id: 'feature-pipeline',
      name: 'Feature Implementation Pipeline',
      tasks: [
        { id: 'spec', name: 'Write Specification', dependencies: [] },
        { id: 'code', name: 'Implement Code', dependencies: ['spec'] },
        { id: 'test', name: 'Run Tests', dependencies: ['code'] },
      ],
    };

    const run = await engine.createRun({
      projectId: 'proj-001',
      definition,
      initialContext: { feature: 'User Authentication' },
    });

    expect(run.id).toBeDefined();
    expect(run.state).toBe('pending');

    // Start execution
    await engine.startRun(run.id);
    const runningRun = await engine.getRun(run.id);
    expect(runningRun?.state).toBe('running');
  });

  it('resolves task dependency order (DAG) and executes tasks in sequence (FR-011)', async () => {
    const { WorkflowEngine, InMemoryWorkflowStore } = await import(
      '../../platform/workflow-engine/src/index.js'
    );
    const store = new InMemoryWorkflowStore();
    const engine = new WorkflowEngine(store);

    const definition = {
      id: 'build-and-test',
      name: 'Build & Test',
      tasks: [
        { id: 'task-build', name: 'Build project', dependencies: [] },
        { id: 'task-test', name: 'Run test suite', dependencies: ['task-build'] },
      ],
    };

    const run = await engine.createRun({
      projectId: 'proj-002',
      definition,
    });

    await engine.startRun(run.id);

    // Initial ready tasks should only be task-build (task-test has dependency)
    let readyTasks = await engine.getReadyTasks(run.id);
    expect(readyTasks.map((t: { id: string }) => t.id)).toEqual(['task-build']);

    // Complete task-build
    await engine.completeTask(run.id, 'task-build', { buildArtifact: 'dist/app.js' });

    // Now task-test should become ready
    readyTasks = await engine.getReadyTasks(run.id);
    expect(readyTasks.map((t: { id: string }) => t.id)).toEqual(['task-test']);

    // Complete task-test
    await engine.completeTask(run.id, 'task-test', { testResults: 'pass' });

    // Workflow should now be completed
    const finishedRun = await engine.getRun(run.id);
    expect(finishedRun?.state).toBe('completed');
  });

  it('creates checkpoints and resumes interrupted workflow from checkpoint (FR-017, FR-018)', async () => {
    const { WorkflowEngine, InMemoryWorkflowStore } = await import(
      '../../platform/workflow-engine/src/index.js'
    );
    const store = new InMemoryWorkflowStore();
    const engine = new WorkflowEngine(store);

    const definition = {
      id: 'resilient-pipeline',
      name: 'Resilient Pipeline',
      tasks: [
        { id: 'step-1', name: 'Download inputs', dependencies: [] },
        { id: 'step-2', name: 'Process data', dependencies: ['step-1'] },
        { id: 'step-3', name: 'Publish results', dependencies: ['step-2'] },
      ],
    };

    const run = await engine.createRun({
      projectId: 'proj-003',
      definition,
    });

    await engine.startRun(run.id);
    await engine.completeTask(run.id, 'step-1', { data: 'input-data' });

    // Explicit checkpoint (FR-018)
    const checkpoint = await engine.saveCheckpoint(run.id, 'after-step-1');
    expect(checkpoint.stepName).toBe('after-step-1');
    expect(checkpoint.completedTasks).toContain('step-1');

    // Simulate process crash / interruption: state set to paused/interrupted
    await engine.interruptRun(run.id, 'Simulated server restart');
    let interruptedRun = await engine.getRun(run.id);
    expect(interruptedRun?.state).toBe('paused');

    // Resume workflow from checkpoint (FR-017)
    await engine.resumeRun(run.id);
    const resumedRun = await engine.getRun(run.id);
    expect(resumedRun?.state).toBe('running');

    // Only step-2 should be ready (step-1 is preserved as completed)
    const readyTasks = await engine.getReadyTasks(run.id);
    expect(readyTasks.map((t: { id: string }) => t.id)).toEqual(['step-2']);
  });
});
