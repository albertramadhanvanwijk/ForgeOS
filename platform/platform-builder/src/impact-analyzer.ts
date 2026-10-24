import type { CapabilityGraph } from './capability-graph.js';
import type { PlatformChangeSet, PlatformImpactReport } from './types.js';

export class ImpactAnalyzer {
  constructor(private graph: CapabilityGraph) {}

  /**
   * FR-074: Impact across roles/skills/workflows/data/API/UI/policy/tests
   */
  public analyzeImpact(changeSet: PlatformChangeSet): PlatformImpactReport {
    const affected = new Set<string>();
    const breakingChanges: Array<{ capabilityId: string; reason: string }> = [];
    const requiredTestSuites = new Set<string>();

    for (const comp of changeSet.components) {
      affected.add(comp.targetCapabilityId);

      // Traversal: Add all downstream capabilities that depend on this target
      const dependents = this.graph.getDownstreamDependents(comp.targetCapabilityId);
      for (const dep of dependents) {
        affected.add(dep);
      }

      // Detect breaking changes
      if (comp.action === 'deprecate') {
        if (dependents.length > 0) {
          breakingChanges.push({
            capabilityId: comp.targetCapabilityId,
            reason: `Deprecating capability has ${dependents.length} active downstream dependents: [${dependents.join(', ')}]`,
          });
        }
      }

      // Map required test suites based on affected capabilities
      if (comp.targetCapabilityId.includes('policy')) {
        requiredTestSuites.add('tests/security/policy-engine.test.ts');
        requiredTestSuites.add('tests/security/silent-change.test.ts');
      }
      if (comp.targetCapabilityId.includes('workflow')) {
        requiredTestSuites.add('tests/unit/workflow-engine.test.ts');
      }
      if (comp.targetCapabilityId.includes('memory')) {
        requiredTestSuites.add('tests/unit/persistent-memory.test.ts');
        requiredTestSuites.add('tests/integration/memory-api.test.ts');
      }
      if (comp.targetCapabilityId.includes('design')) {
        requiredTestSuites.add('tests/unit/design-studio.test.ts');
      }
      if (comp.targetCapabilityId.includes('orchestrator')) {
        requiredTestSuites.add('tests/integration/orchestrator-health.test.ts');
      }
    }

    // Default mandatory regression suite
    requiredTestSuites.add('tests/unit/foundation.test.ts');

    // Compute policy risk level
    let policyRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const affectedList = Array.from(affected);

    if (affectedList.some((id) => id.includes('policy')) || breakingChanges.length > 0) {
      policyRiskLevel = 'critical';
    } else if (affectedList.some((id) => id.includes('orchestrator') || id.includes('workflow'))) {
      policyRiskLevel = 'high';
    } else if (changeSet.components.some((c) => c.action === 'create')) {
      policyRiskLevel = 'medium';
    }

    const requiresApproval = policyRiskLevel !== 'low';

    return {
      changeSetId: changeSet.id,
      affectedCapabilities: affectedList,
      breakingChanges,
      requiredTestSuites: Array.from(requiredTestSuites),
      policyRiskLevel,
      requiresApproval,
    };
  }
}
