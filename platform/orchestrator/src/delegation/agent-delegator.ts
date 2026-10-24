export interface DelegationRequest {
  delegationId: string;
  fromRole: string;
  toRole: string;
  taskGoal: string;
  parentDelegationId?: string;
  delegationChain: string[];
  allocatedBudgetUsd: number;
  timeoutMs: number;
  grantedPermissions: string[];
}

export interface DelegationRecord extends DelegationRequest {
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  deliverableRef?: string;
  costUsd?: number;
  durationMs?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface DelegationOptions {
  maxDelegationDepth?: number;
}

export class AgentDelegator {
  private maxDepth: number;
  private delegations: Map<string, DelegationRecord> = new Map();

  constructor(options: DelegationOptions = {}) {
    this.maxDepth = options.maxDelegationDepth ?? 3;
  }

  public validateDelegationPermissions(
    request: DelegationRequest,
    delegatorPermissions: string[]
  ): void {
    const delegatorPermSet = new Set(delegatorPermissions);
    for (const perm of request.grantedPermissions) {
      if (!delegatorPermSet.has(perm)) {
        throw new Error(
          `Permission escalation denied: Delegator role '${request.fromRole}' cannot grant '${perm}' which it does not possess (FR-028)`
        );
      }
    }
  }

  public createDelegation(request: DelegationRequest): DelegationRecord {
    const updatedChain = [...request.delegationChain, request.toRole];

    if (updatedChain.length > this.maxDepth) {
      throw new Error(
        `Maximum delegation depth (${this.maxDepth}) exceeded by chain [${updatedChain.join(' -> ')}]`
      );
    }

    const record: DelegationRecord = {
      ...request,
      delegationChain: updatedChain,
      status: 'active',
      createdAt: new Date(),
    };

    this.delegations.set(request.delegationId, record);
    return record;
  }

  public completeDelegation(
    delegationId: string,
    outcome: {
      success: boolean;
      deliverableRef?: string;
      costUsd?: number;
      durationMs?: number;
    }
  ): DelegationRecord {
    const record = this.delegations.get(delegationId);
    if (!record) {
      throw new Error(`Delegation '${delegationId}' not found`);
    }

    record.status = outcome.success ? 'completed' : 'failed';
    record.deliverableRef = outcome.deliverableRef;
    record.costUsd = outcome.costUsd;
    record.durationMs = outcome.durationMs;
    record.completedAt = new Date();

    return record;
  }

  public getDelegation(delegationId: string): DelegationRecord | undefined {
    return this.delegations.get(delegationId);
  }

  public getAllDelegations(): DelegationRecord[] {
    return Array.from(this.delegations.values());
  }
}
