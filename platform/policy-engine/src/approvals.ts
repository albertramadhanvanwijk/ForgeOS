import { randomUUID } from 'node:crypto';
import type { ApprovalRecord } from '@forgeos/types';
import type { RequestApprovalInput, DecideApprovalInput, ActionApprovalCheck } from './types.js';

export interface IApprovalStore {
  save(record: ApprovalRecord): Promise<void>;
  findById(id: string): Promise<ApprovalRecord | null>;
  findApproved(action: string, resourceId: string, versionHash: string): Promise<ApprovalRecord | null>;
  listByProject(projectId: string): Promise<ApprovalRecord[]>;
}

export class InMemoryApprovalStore implements IApprovalStore {
  private records: Map<string, ApprovalRecord> = new Map();

  async save(record: ApprovalRecord): Promise<void> {
    this.records.set(record.id, { ...record });
  }

  async findById(id: string): Promise<ApprovalRecord | null> {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }

  async findApproved(
    action: string,
    resourceId: string,
    versionHash: string
  ): Promise<ApprovalRecord | null> {
    for (const record of this.records.values()) {
      if (
        record.action === action &&
        record.resourceId === resourceId &&
        record.exactVersionHash === versionHash &&
        record.status === 'approved'
      ) {
        if (record.expiresAt && record.expiresAt < new Date()) {
          continue; // expired
        }
        return { ...record };
      }
    }
    return null;
  }

  async listByProject(projectId: string): Promise<ApprovalRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.projectId === projectId);
  }
}

export class ApprovalService {
  constructor(private readonly store: IApprovalStore) {}

  async requestApproval(input: RequestApprovalInput): Promise<ApprovalRecord> {
    const record: ApprovalRecord = {
      id: randomUUID(),
      projectId: input.projectId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      exactVersionHash: input.exactVersionHash,
      status: 'pending',
      riskLevel: input.riskLevel ?? 'medium',
      requestedBy: input.requestedBy,
      rationale: input.rationale,
      expiresAt: input.expiresAt ?? null,
      createdAt: new Date(),
    };

    await this.store.save(record);
    return record;
  }

  async decideApproval(id: string, input: DecideApprovalInput): Promise<ApprovalRecord> {
    const record = await this.store.findById(id);
    if (!record) {
      throw new Error(`Approval record with ID "${id}" was not found`);
    }

    record.status = input.decision;
    record.approvedBy = input.decidedBy;
    record.decidedAt = new Date();

    await this.store.save(record);
    return record;
  }

  async isActionApproved(check: ActionApprovalCheck): Promise<boolean> {
    const approved = await this.store.findApproved(
      check.action,
      check.resourceId,
      check.exactVersionHash
    );
    return approved !== null;
  }

  async getApproval(id: string): Promise<ApprovalRecord | null> {
    return this.store.findById(id);
  }
}
