import type { ApprovalRecord, ApprovalStatus, RiskLevel, AuditEvent } from '@forgeos/types';

export interface RolePolicy {
  roleId: string;
  allowedActions: string[];
  disallowedActions?: string[];
}

export interface AuthorizationRequest {
  actor: string;
  role: string;
  action: string;
  resource: string;
  correlationId: string;
  environment?: string;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

export interface RequestApprovalInput {
  projectId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  exactVersionHash: string;
  riskLevel?: RiskLevel;
  requestedBy: string;
  rationale: string;
  expiresAt?: Date | null;
}

export interface DecideApprovalInput {
  decision: 'approved' | 'rejected';
  decidedBy: string;
  notes?: string;
}

export interface ActionApprovalCheck {
  action: string;
  resourceId: string;
  exactVersionHash: string;
}
