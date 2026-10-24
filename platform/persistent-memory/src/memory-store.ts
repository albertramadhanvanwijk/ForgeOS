import {
  MemoryItem,
  MemoryVersion,
  MemorySource,
  MemoryScopeType,
  MemoryType,
  MemoryStatus,
  MemorySensitivity,
} from '@forgeos/types';
import { SecretScrubber } from './secret-scrubber.js';

export interface CreateMemoryItemParams {
  workspaceId: string;
  scopeType: MemoryScopeType;
  scopeId: string;
  memoryType: MemoryType;
  title: string;
  content: string;
  createdById: string;
  confidence?: number;
  sensitivity?: MemorySensitivity;
  source?: {
    sourceType: string;
    sourceId: string;
    sourceVersion?: string;
    evidenceLocator?: string;
  };
}

export interface UpdateMemoryVersionParams {
  newContent: string;
  changeReason: string;
  createdById: string;
}

export interface MemoryQueryParams {
  scopeType: MemoryScopeType;
  scopeId: string;
  memoryType?: MemoryType;
  includeShared?: boolean;
}

export interface StoredMemoryRecord extends MemoryItem {
  versionNumber: number;
}

export class PersistentMemoryService {
  private scrubber: SecretScrubber;
  private items = new Map<string, StoredMemoryRecord>();
  private versions = new Map<string, MemoryVersion[]>();
  private sources = new Map<string, MemorySource[]>();

  constructor(options?: { scrubber?: SecretScrubber }) {
    this.scrubber = options?.scrubber || new SecretScrubber();
  }

  public async createMemoryItem(params: CreateMemoryItemParams): Promise<StoredMemoryRecord> {
    // 1. Scrub secrets before any persistence (MEM-007)
    const scrubResult = this.scrubber.scrub(params.content);
    const sanitizedContent = scrubResult.cleanContent;

    // 2. Deduplication check (MEM-012)
    const existing = this.findDuplicate(params.scopeType, params.scopeId, sanitizedContent);
    if (existing) {
      return existing;
    }

    const itemId = `mem-${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date();

    const record: StoredMemoryRecord = {
      id: itemId,
      workspaceId: params.workspaceId,
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      memoryType: params.memoryType,
      title: params.title,
      content: sanitizedContent,
      summary: null,
      status: 'active',
      confidence: params.confidence ?? 0.9,
      verificationStatus: 'empirically_tested',
      sensitivity: params.sensitivity ?? 'internal',
      createdById: params.createdById,
      versionNumber: 1,
      createdAt: now,
      updatedAt: now,
    };

    const initialVersion: MemoryVersion = {
      id: `ver-${Math.random().toString(36).substring(2, 10)}`,
      memoryItemId: itemId,
      versionNumber: 1,
      contentSnapshot: sanitizedContent,
      changeReason: 'Initial candidate creation',
      createdById: params.createdById,
      createdAt: now,
    };

    record.currentVersionId = initialVersion.id;

    this.items.set(itemId, record);
    this.versions.set(itemId, [initialVersion]);

    if (params.source) {
      const sourceRecord: MemorySource = {
        id: `src-${Math.random().toString(36).substring(2, 10)}`,
        memoryItemId: itemId,
        sourceType: params.source.sourceType,
        sourceId: params.source.sourceId,
        sourceVersion: params.source.sourceVersion,
        evidenceLocator: params.source.evidenceLocator,
        captureTime: now,
      };
      this.sources.set(itemId, [sourceRecord]);
    }

    return record;
  }

  public async getMemoryItem(id: string): Promise<StoredMemoryRecord | null> {
    return this.items.get(id) || null;
  }

  public async updateMemoryVersion(
    id: string,
    params: UpdateMemoryVersionParams
  ): Promise<StoredMemoryRecord> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Memory item not found: ${id}`);
    }

    // Scrub secrets in updated content
    const scrubResult = this.scrubber.scrub(params.newContent);
    const sanitizedContent = scrubResult.cleanContent;

    const existingVersions = this.versions.get(id) || [];
    const newVersionNumber = existingVersions.length + 1;
    const now = new Date();

    const newVersion: MemoryVersion = {
      id: `ver-${Math.random().toString(36).substring(2, 10)}`,
      memoryItemId: id,
      versionNumber: newVersionNumber,
      contentSnapshot: sanitizedContent,
      changeReason: params.changeReason,
      createdById: params.createdById,
      createdAt: now,
    };

    existingVersions.push(newVersion);
    this.versions.set(id, existingVersions);

    item.content = sanitizedContent;
    item.versionNumber = newVersionNumber;
    item.currentVersionId = newVersion.id;
    item.updatedAt = now;

    this.items.set(id, item);
    return item;
  }

  public async getVersionHistory(id: string): Promise<MemoryVersion[]> {
    return this.versions.get(id) || [];
  }

  public async query(params: MemoryQueryParams): Promise<StoredMemoryRecord[]> {
    const results: StoredMemoryRecord[] = [];

    for (const item of this.items.values()) {
      if (item.status === 'deleted' || item.status === 'archived') {
        continue;
      }

      // Strict Project Isolation (MEM-004)
      const matchesScope = item.scopeType === params.scopeType && item.scopeId === params.scopeId;
      const matchesShared = params.includeShared && item.scopeType === 'shared';

      if (!matchesScope && !matchesShared) {
        continue;
      }

      if (params.memoryType && item.memoryType !== params.memoryType) {
        continue;
      }

      results.push(item);
    }

    return results;
  }

  private findDuplicate(scopeType: MemoryScopeType, scopeId: string, content: string): StoredMemoryRecord | null {
    const normalizedTarget = content.trim().toLowerCase();
    for (const item of this.items.values()) {
      if (item.scopeType === scopeType && item.scopeId === scopeId) {
        if (item.content.trim().toLowerCase() === normalizedTarget) {
          return item;
        }
      }
    }
    return null;
  }
}
