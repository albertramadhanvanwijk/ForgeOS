import type { WorkflowRunInstance } from './types.js';

export interface IWorkflowStore {
  save(run: WorkflowRunInstance): Promise<void>;
  findById(id: string): Promise<WorkflowRunInstance | null>;
  listByProject(projectId: string): Promise<WorkflowRunInstance[]>;
}

export class InMemoryWorkflowStore implements IWorkflowStore {
  private runs: Map<string, WorkflowRunInstance> = new Map();

  async save(run: WorkflowRunInstance): Promise<void> {
    this.runs.set(run.id, run);
  }

  async findById(id: string): Promise<WorkflowRunInstance | null> {
    const run = this.runs.get(id);
    return run ? run : null;
  }

  async listByProject(projectId: string): Promise<WorkflowRunInstance[]> {
    return Array.from(this.runs.values()).filter((r) => r.projectId === projectId);
  }
}
