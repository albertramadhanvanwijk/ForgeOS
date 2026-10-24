export type CapabilityType =
  | 'engine'
  | 'agent_role'
  | 'tool'
  | 'workflow'
  | 'policy'
  | 'api_route'
  | 'ui_workspace';

export interface CapabilityNode {
  id: string;
  name: string;
  type: CapabilityType;
  version: string;
  description: string;
  dependencies: string[];
  metadata?: Record<string, unknown>;
}

export interface CapabilityEdge {
  from: string;
  to: string;
  relationship: 'depends_on' | 'calls' | 'governs' | 'renders';
}

export interface CapabilityGraphData {
  nodes: CapabilityNode[];
  edges: CapabilityEdge[];
}

export type ChangeSetStatus =
  | 'draft'
  | 'analyzed'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'applied'
  | 'rolled_back';

export interface FileChange {
  path: string;
  changeType: 'add' | 'modify' | 'delete';
  summary: string;
}

export interface ChangeSetComponent {
  targetCapabilityId: string;
  action: 'create' | 'modify' | 'deprecate';
  diffSummary: string;
  fileChanges: FileChange[];
}

export interface ApprovalRecord {
  approvedBy: string;
  rationale: string;
  decidedAt: Date;
}

export interface PlatformChangeSet {
  id: string;
  title: string;
  intent: string;
  author: string;
  version: string;
  status: ChangeSetStatus;
  components: ChangeSetComponent[];
  exactVersionHash: string;
  approvalRecord?: ApprovalRecord;
  appliedAt?: Date;
  rolledBackAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformImpactReport {
  changeSetId: string;
  affectedCapabilities: string[];
  breakingChanges: Array<{ capabilityId: string; reason: string }>;
  requiredTestSuites: string[];
  policyRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
}
