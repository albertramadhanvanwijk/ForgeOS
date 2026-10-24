import { createHash, randomUUID } from 'node:crypto';
import type { CapabilityGraph } from './capability-graph.js';
import type {
  PlatformChangeSet,
  ChangeSetComponent,
  ApprovalRecord,
} from './types.js';

export class ChangeSetManager {
  private changeSets = new Map<string, PlatformChangeSet>();
  private versionHistory: PlatformChangeSet[] = [];

  constructor(private graph: CapabilityGraph) {}

  /**
   * Deterministic SHA-256 computation over canonical ChangeSet content
   */
  public computeExactVersionHash(params: {
    title: string;
    intent: string;
    author: string;
    version: string;
    components: ChangeSetComponent[];
  }): string {
    const canonicalPayload = JSON.stringify({
      title: params.title,
      intent: params.intent,
      author: params.author,
      version: params.version,
      components: params.components,
    });
    return createHash('sha256').update(canonicalPayload).digest('hex');
  }

  /**
   * FR-073: Versioned PlatformChangeSet
   */
  public createChangeSet(params: {
    title: string;
    intent: string;
    author: string;
    version: string;
    components: ChangeSetComponent[];
  }): PlatformChangeSet {
    const hash = this.computeExactVersionHash(params);
    const id = randomUUID();

    const changeSet: PlatformChangeSet = {
      id,
      title: params.title,
      intent: params.intent,
      author: params.author,
      version: params.version,
      status: 'draft',
      components: params.components,
      exactVersionHash: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.changeSets.set(id, changeSet);
    return changeSet;
  }

  public getChangeSet(id: string): PlatformChangeSet | undefined {
    return this.changeSets.get(id);
  }

  public getAllChangeSets(): PlatformChangeSet[] {
    return Array.from(this.changeSets.values());
  }

  public submitForReview(id: string): PlatformChangeSet {
    const cs = this.changeSets.get(id);
    if (!cs) throw new Error(`ChangeSet '${id}' not found.`);
    if (cs.status !== 'draft' && cs.status !== 'analyzed') {
      throw new Error(`Cannot submit ChangeSet in '${cs.status}' status for review.`);
    }

    cs.status = 'in_review';
    cs.updatedAt = new Date();
    return cs;
  }

  /**
   * FR-077: Approve/reject/request revisions
   */
  public approveChangeSet(id: string, approval: ApprovalRecord): PlatformChangeSet {
    const cs = this.changeSets.get(id);
    if (!cs) throw new Error(`ChangeSet '${id}' not found.`);
    if (cs.status !== 'in_review' && cs.status !== 'analyzed' && cs.status !== 'draft') {
      throw new Error(`Cannot approve ChangeSet in '${cs.status}' status.`);
    }

    cs.status = 'approved';
    cs.approvalRecord = approval;
    cs.updatedAt = new Date();
    return cs;
  }

  public rejectChangeSet(id: string, reason: string): PlatformChangeSet {
    const cs = this.changeSets.get(id);
    if (!cs) throw new Error(`ChangeSet '${id}' not found.`);

    cs.status = 'rejected';
    cs.updatedAt = new Date();
    return cs;
  }

  /**
   * Apply approved ChangeSet to production & update Capability Graph (FR-078)
   */
  public applyChangeSet(id: string): PlatformChangeSet {
    const cs = this.changeSets.get(id);
    if (!cs) throw new Error(`ChangeSet '${id}' not found.`);

    // Enforce FR-080: No silent production changes without approved status
    if (cs.status !== 'approved') {
      throw new Error(
        `[SECURITY_VIOLATION] Cannot apply ChangeSet '${id}' because it is in '${cs.status}' status. Only 'approved' ChangeSets can be applied (FR-080).`
      );
    }

    // Apply components to capability graph
    for (const comp of cs.components) {
      if (comp.action === 'create' || comp.action === 'modify') {
        this.graph.registerCapability({
          id: comp.targetCapabilityId,
          name: comp.targetCapabilityId,
          type: 'engine',
          version: cs.version,
          description: comp.diffSummary,
          dependencies: [],
        });
      } else if (comp.action === 'deprecate') {
        this.graph.deprecateCapability(comp.targetCapabilityId);
      }
    }

    cs.status = 'applied';
    cs.appliedAt = new Date();
    cs.updatedAt = new Date();

    this.versionHistory.push({ ...cs });
    return cs;
  }

  /**
   * FR-079: Version history and recovery (Rollback)
   */
  public rollbackChangeSet(id: string): PlatformChangeSet {
    const cs = this.changeSets.get(id);
    if (!cs) throw new Error(`ChangeSet '${id}' not found.`);
    if (cs.status !== 'applied') {
      throw new Error(`Cannot rollback ChangeSet in '${cs.status}' status.`);
    }

    cs.status = 'rolled_back';
    cs.rolledBackAt = new Date();
    cs.updatedAt = new Date();

    return cs;
  }

  public getVersionHistory(): PlatformChangeSet[] {
    return [...this.versionHistory];
  }

  /**
   * FR-080: Invariant check — No silent production changes
   */
  public assertNoSilentProductionChange(changeSetId: string, claimedHash: string): void {
    const cs = this.changeSets.get(changeSetId);
    if (!cs) {
      throw new Error(
        `[POLICY_BLOCK: FR-080] Silent modification blocked. ChangeSet '${changeSetId}' does not exist.`
      );
    }

    if (cs.status !== 'approved' && cs.status !== 'applied') {
      throw new Error(
        `[POLICY_BLOCK: FR-080] Silent modification blocked. ChangeSet '${changeSetId}' is in '${cs.status}' status, not approved.`
      );
    }

    if (cs.exactVersionHash !== claimedHash) {
      throw new Error(
        `[POLICY_BLOCK: FR-080] Silent modification blocked. Hash mismatch: claimed '${claimedHash}' != canonical '${cs.exactVersionHash}'.`
      );
    }
  }
}
