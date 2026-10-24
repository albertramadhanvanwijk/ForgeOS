/**
 * ForgeOS Persistent Memory Types (MEM-001 - MEM-018)
 */

export type MemoryScopeType = 'task' | 'role' | 'project' | 'workspace' | 'shared';
export type MemoryType = 'project' | 'role' | 'episodic' | 'knowledge' | 'procedural' | 'preference';
export type MemoryStatus = 'candidate' | 'validated' | 'active' | 'superseded' | 'archived' | 'rejected' | 'deleted';
export type MemoryVerificationStatus = 'unverified' | 'model_inferred' | 'empirically_tested' | 'human_approved';
export type MemorySensitivity = 'public' | 'internal' | 'confidential' | 'restricted';

export interface MemoryItem {
  id: string;
  workspaceId: string;
  scopeType: MemoryScopeType;
  scopeId: string;
  memoryType: MemoryType;
  title: string;
  content: string;
  summary?: string | null;
  status: MemoryStatus;
  confidence: number;
  verificationStatus: MemoryVerificationStatus;
  sensitivity: MemorySensitivity;
  createdById: string;
  currentVersionId?: string | null;
  reviewAfter?: Date | null;
  lastValidatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryVersion {
  id: string;
  memoryItemId: string;
  versionNumber: number;
  contentSnapshot: string;
  changeReason: string;
  sourceEventId?: string | null;
  createdById: string;
  createdAt: Date;
}

export interface MemorySource {
  id: string;
  memoryItemId: string;
  sourceType: string;
  sourceId: string;
  sourceVersion?: string | null;
  evidenceLocator?: string | null;
  captureTime: Date;
}

export type MemoryRelationType =
  | 'supports'
  | 'contradicts'
  | 'duplicates'
  | 'supersedes'
  | 'derived_from'
  | 'related_to';

export interface MemoryRelation {
  id: string;
  fromMemoryId: string;
  toMemoryId: string;
  relationType: MemoryRelationType;
  createdAt: Date;
}

export type MemoryFeedbackType = 'helpful' | 'irrelevant' | 'incorrect' | 'stale' | 'unsafe';

export interface MemoryFeedback {
  id: string;
  memoryItemId: string;
  userId?: string | null;
  feedbackType: MemoryFeedbackType;
  notes?: string | null;
  createdAt: Date;
}
