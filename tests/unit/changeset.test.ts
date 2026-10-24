import { describe, it, expect, beforeEach } from 'vitest';
import {
  CapabilityGraph,
  ChangeSetManager,
  ImpactAnalyzer,
} from '@forgeos/platform-builder';

describe('Task 4.2: Versioned PlatformChangeSet & Impact Analysis (FR-073, FR-074)', () => {
  let graph: CapabilityGraph;
  let manager: ChangeSetManager;
  let analyzer: ImpactAnalyzer;

  beforeEach(() => {
    graph = new CapabilityGraph();
    manager = new ChangeSetManager(graph);
    analyzer = new ImpactAnalyzer(graph);
  });

  describe('FR-073: Versioned PlatformChangeSet', () => {
    it('creates a ChangeSet in draft status with deterministic exactVersionHash', () => {
      const cs = manager.createChangeSet({
        title: 'Add Billing Subsystem',
        intent: 'Stripe subscription billing integration',
        author: 'lead-dev@forgeos.local',
        version: '2.3.0',
        components: [
          {
            targetCapabilityId: 'engine.billing',
            action: 'create',
            diffSummary: 'Initial Stripe webhook and billing ledger',
            fileChanges: [
              { path: 'platform/billing/src/index.ts', changeType: 'add', summary: 'Billing engine' },
            ],
          },
        ],
      });

      expect(cs.id).toBeDefined();
      expect(cs.status).toBe('draft');
      expect(cs.exactVersionHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('generates distinct exactVersionHash when components change', () => {
      const cs1 = manager.createChangeSet({
        title: 'Change A',
        intent: 'Intent A',
        author: 'dev',
        version: '1.0.0',
        components: [],
      });

      const cs2 = manager.createChangeSet({
        title: 'Change A',
        intent: 'Intent A',
        author: 'dev',
        version: '1.0.0',
        components: [
          {
            targetCapabilityId: 'engine.billing',
            action: 'create',
            diffSummary: 'Diff',
            fileChanges: [],
          },
        ],
      });

      expect(cs1.exactVersionHash).not.toEqual(cs2.exactVersionHash);
    });
  });

  describe('FR-074: Impact Analysis across Capabilities & Policy', () => {
    it('computes affected capabilities and marks critical risk for policy mutations', () => {
      const cs = manager.createChangeSet({
        title: 'Update RBAC Rules',
        intent: 'Revise role permission rules',
        author: 'security@forgeos.local',
        version: '2.3.0',
        components: [
          {
            targetCapabilityId: 'engine.policy',
            action: 'modify',
            diffSummary: 'Update authorization matrix',
            fileChanges: [],
          },
        ],
      });

      const report = analyzer.analyzeImpact(cs);
      expect(report.affectedCapabilities).toContain('engine.policy');
      expect(report.policyRiskLevel).toBe('critical');
      expect(report.requiresApproval).toBe(true);
      expect(report.requiredTestSuites).toContain('tests/security/policy-engine.test.ts');
    });

    it('flags breaking changes when deprecating a capability with active downstream dependents', () => {
      const cs = manager.createChangeSet({
        title: 'Deprecate Orchestrator',
        intent: 'Retire legacy orchestrator',
        author: 'dev',
        version: '3.0.0',
        components: [
          {
            targetCapabilityId: 'engine.orchestrator',
            action: 'deprecate',
            diffSummary: 'Deprecate core control plane',
            fileChanges: [],
          },
        ],
      });

      const report = analyzer.analyzeImpact(cs);
      expect(report.breakingChanges.length).toBeGreaterThan(0);
      expect(report.breakingChanges[0].reason).toMatch(/downstream dependents/i);
    });
  });
});
