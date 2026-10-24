import { describe, it, expect } from 'vitest';
import {
  AgentDelegator,
  DelegationRequest,
} from '../../platform/orchestrator/src/delegation/agent-delegator.js';

describe('Task 5.6: Agent-to-Agent Delegation (FR-026)', () => {
  const delegator = new AgentDelegator({
    maxDelegationDepth: 3,
  });

  const validRequest: DelegationRequest = {
    delegationId: 'del-001',
    fromRole: 'architect',
    toRole: 'engineer',
    taskGoal: 'Implement the database schema for projects and memory records',
    parentDelegationId: undefined,
    delegationChain: ['orchestrator', 'architect'],
    allocatedBudgetUsd: 0.15,
    timeoutMs: 30000,
    grantedPermissions: ['fs:read', 'fs:write', 'git:branch'],
  };

  it('approves and registers valid hierarchical delegation request', () => {
    const record = delegator.createDelegation(validRequest);

    expect(record.delegationId).toBe('del-001');
    expect(record.status).toBe('active');
    expect(record.delegationChain).toEqual(['orchestrator', 'architect', 'engineer']);
  });

  it('rejects delegation that exceeds maximum recursion/delegation depth', () => {
    const deepRequest: DelegationRequest = {
      ...validRequest,
      delegationId: 'del-deep',
      delegationChain: ['orchestrator', 'architect', 'tech-lead', 'engineer'], // Depth = 4 > max 3
    };

    expect(() => delegator.createDelegation(deepRequest)).toThrow(
      /Maximum delegation depth \(3\) exceeded/i
    );
  });

  it('rejects permission escalation: delegated permissions cannot exceed delegator profile (FR-028)', () => {
    const delegatorAllowedPermissions = ['fs:read', 'fs:write'];

    const escalatedRequest: DelegationRequest = {
      ...validRequest,
      delegationId: 'del-escalate',
      grantedPermissions: ['fs:read', 'fs:write', 'env:secrets:bypass'], // Escalation attempt
    };

    expect(() =>
      delegator.validateDelegationPermissions(
        escalatedRequest,
        delegatorAllowedPermissions
      )
    ).toThrow(/Permission escalation denied/i);
  });

  it('completes delegation with outcome and records execution trail', () => {
    delegator.createDelegation(validRequest);

    const completed = delegator.completeDelegation('del-001', {
      success: true,
      deliverableRef: 'art-schema-001',
      costUsd: 0.08,
      durationMs: 4500,
    });

    expect(completed.status).toBe('completed');
    expect(completed.deliverableRef).toBe('art-schema-001');
    expect(completed.completedAt).toBeDefined();
  });
});
