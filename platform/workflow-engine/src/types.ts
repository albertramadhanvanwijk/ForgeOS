import type { WorkflowState, TaskStatus } from '@forgeos/types';

export interface WorkflowTaskDefinition {
  id: string;
  name: string;
  description?: string;
  assignedRole?: string;
  dependencies: string[];
}

export interface WorkflowDefinitionModel {
  id: string;
  name: string;
  description?: string;
  tasks: WorkflowTaskDefinition[];
}

export interface RuntimeTask {
  id: string;
  name: string;
  description?: string;
  assignedRole?: string;
  status: TaskStatus;
  dependencies: string[];
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  completedAt?: Date;
}

export interface CheckpointRecord {
  id: string;
  stepName: string;
  timestamp: Date;
  state: WorkflowState;
  completedTasks: string[];
  context: Record<string, unknown>;
}

export interface WorkflowRunInstance {
  id: string;
  projectId: string;
  definitionId: string;
  definition: WorkflowDefinitionModel;
  state: WorkflowState;
  context: Record<string, unknown>;
  tasks: Map<string, RuntimeTask>;
  checkpoints: CheckpointRecord[];
  startedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRunInput {
  projectId: string;
  definition: WorkflowDefinitionModel;
  initialContext?: Record<string, unknown>;
}
