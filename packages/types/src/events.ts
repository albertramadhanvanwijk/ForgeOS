/**
 * ForgeOS Domain Events (Versioned)
 */

export type DomainEventType =
  | 'ProjectCreated'
  | 'ProjectArchived'
  | 'PlanProposed'
  | 'PlanApproved'
  | 'TaskStarted'
  | 'TaskCompleted'
  | 'TaskFailed'
  | 'ArtifactCreated'
  | 'ArtifactVersioned'
  | 'ApprovalRequested'
  | 'ApprovalGranted'
  | 'ApprovalDenied'
  | 'QualityGatePassed'
  | 'QualityGateFailed'
  | 'WorkflowResumed'
  | 'WorkflowCheckpointed'
  | 'MemoryCaptured'
  | 'MemoryRetrieved'
  | 'PlatformChangeReleased'
  | 'DeploymentVerified';

export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  type: DomainEventType;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: T;
  occurredAt: Date;
  correlationId: string;
}
