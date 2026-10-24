import { CapabilityGraph } from './capability-graph.js';
import { ImpactAnalyzer } from './impact-analyzer.js';
import { ChangeSetManager } from './changeset-manager.js';
import type {
  PlatformChangeSet,
  PlatformImpactReport,
  CapabilityGraphData,
  ApprovalRecord,
} from './types.js';

export class PlatformBuilderService {
  private graph: CapabilityGraph;
  private impactAnalyzer: ImpactAnalyzer;
  private changeSetManager: ChangeSetManager;

  constructor(graph?: CapabilityGraph) {
    this.graph = graph ?? new CapabilityGraph();
    this.impactAnalyzer = new ImpactAnalyzer(this.graph);
    this.changeSetManager = new ChangeSetManager(this.graph);
  }

  public getCapabilityGraph(): CapabilityGraphData {
    return this.graph.exportGraph();
  }

  /**
   * FR-070: Conversational ForgeOS changes — Plan ChangeSet from intent
   */
  public planChangeFromIntent(params: {
    intent: string;
    author: string;
    version?: string;
  }): {
    changeSet: PlatformChangeSet;
    impactReport: PlatformImpactReport;
    isolatedBranch: string;
  } {
    const { intent, author, version = '2.3.0' } = params;

    // 1. Analyze reuse and gaps from graph (FR-071, FR-072)
    const { detectedGaps } = this.graph.analyzeGapsAndReuse(intent);

    // Determine target capability name
    let targetCapability = 'engine.custom-extension';
    if (detectedGaps.length > 0) {
      targetCapability = detectedGaps[0].split(' ')[0];
    } else if (intent.toLowerCase().includes('deploy')) {
      targetCapability = 'engine.deployment';
    } else if (intent.toLowerCase().includes('notification')) {
      targetCapability = 'engine.notification';
    }

    // 2. Formulate ChangeSet (FR-073)
    const changeSet = this.changeSetManager.createChangeSet({
      title: `Platform Extension: ${targetCapability}`,
      intent,
      author,
      version,
      components: [
        {
          targetCapabilityId: targetCapability,
          action: 'create',
          diffSummary: `Add capability '${targetCapability}' to address intent: "${intent}"`,
          fileChanges: [
            {
              path: `platform/${targetCapability.replace('.', '-')}/src/index.ts`,
              changeType: 'add',
              summary: 'Core service implementation',
            },
            {
              path: `tests/unit/${targetCapability.replace('.', '-')}.test.ts`,
              changeType: 'add',
              summary: 'Comprehensive verification test suite',
            },
          ],
        },
      ],
    });

    // 3. Compute Impact Analysis (FR-074)
    const impactReport = this.impactAnalyzer.analyzeImpact(changeSet);

    // 4. Isolated branch for implementation (FR-075)
    const isolatedBranch = `platform/changeset-${changeSet.id.slice(0, 8)}`;

    return {
      changeSet,
      impactReport,
      isolatedBranch,
    };
  }

  public getChangeSet(id: string): PlatformChangeSet | undefined {
    return this.changeSetManager.getChangeSet(id);
  }

  public getAllChangeSets(): PlatformChangeSet[] {
    return this.changeSetManager.getAllChangeSets();
  }

  public analyzeChangeSetImpact(id: string): PlatformImpactReport {
    const cs = this.changeSetManager.getChangeSet(id);
    if (!cs) throw new Error(`ChangeSet '${id}' not found.`);
    return this.impactAnalyzer.analyzeImpact(cs);
  }

  public submitForReview(id: string): PlatformChangeSet {
    return this.changeSetManager.submitForReview(id);
  }

  public approveChangeSet(id: string, approval: ApprovalRecord): PlatformChangeSet {
    return this.changeSetManager.approveChangeSet(id, approval);
  }

  public rejectChangeSet(id: string, reason: string): PlatformChangeSet {
    return this.changeSetManager.rejectChangeSet(id, reason);
  }

  /**
   * FR-076 & FR-078: Test validation and atomic release
   */
  public releaseChangeSet(
    id: string,
    verificationEvidence: { testsPassed: boolean; runnerExecutionRef: string }
  ): PlatformChangeSet {
    if (!verificationEvidence.testsPassed) {
      throw new Error(
        `[QUALITY_BLOCK: FR-076] ChangeSet '${id}' cannot be released because automated tests failed. Evidence: ${verificationEvidence.runnerExecutionRef}`
      );
    }

    return this.changeSetManager.applyChangeSet(id);
  }

  public rollbackChangeSet(id: string): PlatformChangeSet {
    return this.changeSetManager.rollbackChangeSet(id);
  }

  public assertNoSilentProductionChange(changeSetId: string, claimedHash: string): void {
    this.changeSetManager.assertNoSilentProductionChange(changeSetId, claimedHash);
  }
}
