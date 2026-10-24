/**
 * ForgeOS Core Domain Entities
 */

export type ProjectStatus = 'active' | 'archived' | 'paused' | 'completed';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  goal: string;
  status: ProjectStatus;
  capabilityProfile?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationType = 'orchestrator' | 'agent' | 'platform_builder' | 'review';

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  type: ConversationType;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export type RequirementPriority = 'P0' | 'P1' | 'P2';
export type RequirementStatus = 'draft' | 'approved' | 'implemented' | 'verified' | 'rejected';

export interface Requirement {
  id: string;
  projectId: string;
  code: string;
  title: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  acceptanceCriteria: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  alternativesConsidered: string[];
  status: 'proposed' | 'accepted' | 'superseded' | 'rejected';
  decidedBy: string;
  decidedAt: Date;
}

export type WorkflowState =
  | 'pending'
  | 'running'
  | 'waiting_approval'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description?: string | null;
  graph: Record<string, unknown>; // task nodes, edges, dependencies
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowRun {
  id: string;
  projectId: string;
  workflowDefinitionId: string;
  state: WorkflowState;
  context: Record<string, unknown>;
  checkpoints: Record<string, unknown>[];
  currentTaskId?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus =
  | 'pending'
  | 'assigned'
  | 'running'
  | 'review'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface Task {
  id: string;
  workflowRunId: string;
  name: string;
  description?: string | null;
  assignedRole?: string | null;
  status: TaskStatus;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown> | null;
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRun {
  id: string;
  taskId: string;
  roleId: string;
  agentInstanceId: string;
  modelUsed: string;
  tokensUsed?: number | null;
  costEstimate?: number | null;
  status: 'running' | 'completed' | 'failed' | 'interrupted';
  executionLogRef?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
}

export type ArtifactStatus =
  | 'draft'
  | 'approved'
  | 'verified'
  | 'released'
  | 'superseded'
  | 'failed';

export interface Artifact {
  id: string;
  projectId: string;
  type: string;
  title: string;
  status: ArtifactStatus;
  currentVersionNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  versionNumber: number;
  storageRef: string;
  contentHash: string;
  provenanceTaskRunId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'superseded';

export interface ApprovalRecord {
  id: string;
  projectId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  exactVersionHash: string;
  status: ApprovalStatus;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  approvedBy?: string | null;
  rationale: string;
  expiresAt?: Date | null;
  decidedAt?: Date | null;
  createdAt: Date;
}

export type QualityGateStatus =
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'skipped_with_reason'
  | 'not_applicable';

export interface QualityGateResult {
  id: string;
  taskId: string;
  artifactVersionId?: string | null;
  gateType: string;
  status: QualityGateStatus;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  evidenceRef: string;
  evaluatedAt: Date;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: 'allowed' | 'denied' | 'error';
  correlationId: string;
  details?: Record<string, unknown> | null;
  timestamp: Date;
}
