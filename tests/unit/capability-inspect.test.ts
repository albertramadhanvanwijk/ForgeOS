import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityGraph } from '@forgeos/platform-builder';

describe('Task 4.1: Capability Graph & Introspection (FR-071, FR-072)', () => {
  let graph: CapabilityGraph;

  beforeEach(() => {
    graph = new CapabilityGraph();
  });

  describe('FR-071: Inspect Existing Capabilities', () => {
    it('introspects all core ForgeOS engines, roles, and dependencies', () => {
      const nodes = graph.getAllNodes();
      expect(nodes.length).toBeGreaterThanOrEqual(12);

      const orchestrator = graph.getNode('engine.orchestrator');
      expect(orchestrator).toBeDefined();
      expect(orchestrator?.type).toBe('engine');
      expect(orchestrator?.version).toBe('2.2.0');

      const policyEngine = graph.getNode('engine.policy');
      expect(policyEngine).toBeDefined();

      const architectRole = graph.getNode('role.architect');
      expect(architectRole?.type).toBe('agent_role');
      expect(architectRole?.dependencies).toContain('engine.orchestrator');
    });

    it('queries downstream dependent capabilities correctly', () => {
      // Orchestrator has downstream dependents (workflow, artifact, memory, architect, engineer)
      const dependents = graph.getDownstreamDependents('engine.orchestrator');
      expect(dependents.length).toBeGreaterThan(0);
      expect(dependents).toContain('engine.workflow');
      expect(dependents).toContain('role.architect');
    });
  });

  describe('FR-072: Find Reuse and Gaps', () => {
    it('identifies existing reusable capabilities for matching intents', () => {
      const { reusableCapabilities } = graph.analyzeGapsAndReuse('Add user workflow step for checkout');
      expect(reusableCapabilities.some((c) => c.id === 'engine.workflow')).toBe(true);
    });

    it('detects capability gaps when intent requires unbuilt capabilities', () => {
      const { detectedGaps } = graph.analyzeGapsAndReuse('Automate production deployment to Kubernetes cluster');
      expect(detectedGaps.some((g) => g.includes('engine.deployment'))).toBe(true);
    });
  });
});
