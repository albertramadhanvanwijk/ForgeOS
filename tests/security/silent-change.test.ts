import { describe, it, expect, beforeEach } from 'vitest';
import {
  CapabilityGraph,
  ChangeSetManager,
} from '@forgeos/platform-builder';

describe('Task 4.3: Security Invariant — No Silent Production Changes (FR-080)', () => {
  let graph: CapabilityGraph;
  let manager: ChangeSetManager;

  beforeEach(() => {
    graph = new CapabilityGraph();
    manager = new ChangeSetManager(graph);
  });

  it('rejects applying ChangeSets that are not approved (FR-080)', () => {
    const cs = manager.createChangeSet({
      title: 'Unapproved Mutation',
      intent: 'Bypass approval gate',
      author: 'rogue-actor',
      version: '1.0.0',
      components: [
        {
          targetCapabilityId: 'engine.policy',
          action: 'modify',
          diffSummary: 'Disable all policy checks',
          fileChanges: [],
        },
      ],
    });

    expect(() => {
      manager.applyChangeSet(cs.id);
    }).toThrow(/SECURITY_VIOLATION.*FR-080/i);
  });

  it('assertNoSilentProductionChange blocks nonexistent or tampered changesets (FR-080)', () => {
    // 1. Non-existent ID
    expect(() => {
      manager.assertNoSilentProductionChange('non-existent-id', '0000000000000000000000000000000000000000000000000000000000000000');
    }).toThrow(/POLICY_BLOCK: FR-080.*does not exist/i);

    // 2. Draft changeset
    const cs = manager.createChangeSet({
      title: 'Draft Change',
      intent: 'Intent',
      author: 'dev',
      version: '1.0.0',
      components: [],
    });

    expect(() => {
      manager.assertNoSilentProductionChange(cs.id, cs.exactVersionHash);
    }).toThrow(/POLICY_BLOCK: FR-080.*not approved/i);

    // 3. Approved but hash mismatch
    manager.approveChangeSet(cs.id, {
      approvedBy: 'lead-architect',
      rationale: 'Approved for test',
      decidedAt: new Date(),
    });

    expect(() => {
      manager.assertNoSilentProductionChange(cs.id, 'tampered-hash-0000000000000000000000000000000000000000000000000000');
    }).toThrow(/POLICY_BLOCK: FR-080.*Hash mismatch/i);
  });

  it('permits production changes only when ChangeSet is approved with matching hash (FR-080)', () => {
    const cs = manager.createChangeSet({
      title: 'Valid Governed Change',
      intent: 'Governed change',
      author: 'dev',
      version: '1.0.0',
      components: [],
    });

    manager.approveChangeSet(cs.id, {
      approvedBy: 'security-lead@forgeos.local',
      rationale: 'Verified all quality gates pass',
      decidedAt: new Date(),
    });

    expect(() => {
      manager.assertNoSilentProductionChange(cs.id, cs.exactVersionHash);
    }).not.toThrow();
  });
});
