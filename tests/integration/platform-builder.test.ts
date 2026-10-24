import { describe, it, expect, beforeEach } from 'vitest';
import { PlatformBuilderService } from '@forgeos/platform-builder';

describe('Task 4.4: Platform Builder End-to-End Lifecycle (FR-070, FR-075, FR-076, FR-077, FR-078, FR-079)', () => {
  let service: PlatformBuilderService;

  beforeEach(() => {
    service = new PlatformBuilderService();
  });

  it('orchestrates end-to-end self-modification lifecycle from conversational intent to verified release', () => {
    // 1. Conversational intent -> Plan ChangeSet (FR-070)
    const plan = service.planChangeFromIntent({
      intent: 'Add automated multi-channel notification dispatcher engine',
      author: 'lead-engineer@forgeos.local',
      version: '2.3.0',
    });

    expect(plan.changeSet.id).toBeDefined();
    expect(plan.changeSet.status).toBe('draft');
    expect(plan.impactReport.requiresApproval).toBe(true);

    // 2. Isolated implementation branch (FR-075)
    expect(plan.isolatedBranch).toMatch(/^platform\/changeset-[a-f0-9]{8}$/);

    // 3. Submit for review & approve (FR-077)
    service.submitForReview(plan.changeSet.id);
    const approved = service.approveChangeSet(plan.changeSet.id, {
      approvedBy: 'platform-architect@forgeos.local',
      rationale: 'Impact verified and isolation branch created',
      decidedAt: new Date(),
    });
    expect(approved.status).toBe('approved');

    // 4. Attempting release without passing test evidence blocks (FR-076)
    expect(() => {
      service.releaseChangeSet(plan.changeSet.id, {
        testsPassed: false,
        runnerExecutionRef: 'run-failed-001',
      });
    }).toThrow(/QUALITY_BLOCK: FR-076/i);

    // 5. Releasing with verified tests passes and updates capability graph (FR-078)
    const released = service.releaseChangeSet(plan.changeSet.id, {
      testsPassed: true,
      runnerExecutionRef: 'run-passed-001',
    });
    expect(released.status).toBe('applied');

    // Verify capability graph was updated with the new engine
    const graph = service.getCapabilityGraph();
    expect(graph.nodes.some((n) => n.id === 'engine.notification')).toBe(true);

    // 6. Rollback capability (FR-079)
    const rolledBack = service.rollbackChangeSet(plan.changeSet.id);
    expect(rolledBack.status).toBe('rolled_back');
  });
});
