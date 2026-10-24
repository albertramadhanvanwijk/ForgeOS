import { IntentAnalysis, AdaptivePlan, DAGTaskDefinition } from './types.js';

export interface PlanOptions {
  projectId: string;
  analysis: IntentAnalysis;
}

export class AdaptivePlanner {
  public generateWorkflowDAG(options: PlanOptions): AdaptivePlan {
    const { projectId, analysis } = options;
    const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tasks = this.buildDAGTasks(analysis);

    return {
      id: planId,
      projectId,
      workflowName: analysis.suggestedWorkflow,
      goal: analysis.extractedGoals[0] || 'Execute adaptive workflow',
      tasks,
      createdAt: new Date(),
    };
  }

  private buildDAGTasks(analysis: IntentAnalysis): DAGTaskDefinition[] {
    const tasks: DAGTaskDefinition[] = [];

    switch (analysis.intentType) {
      case 'create': {
        const t1Id = `task-arch-${Math.random().toString(36).substring(2, 6)}`;
        const t2Id = `task-impl-${Math.random().toString(36).substring(2, 6)}`;
        const t3Id = `task-qa-${Math.random().toString(36).substring(2, 6)}`;

        tasks.push({
          id: t1Id,
          name: 'Architecture & Interface Specification',
          description: 'Design system boundary, contracts, and data models.',
          assignedRole: 'solution-architect',
          dependencies: [],
          inputs: { goals: analysis.extractedGoals },
          expectedOutputs: ['spec.md', 'interfaces.ts'],
        });

        tasks.push({
          id: t2Id,
          name: 'Production Core Implementation',
          description: 'Implement system logic according to architectural specification.',
          assignedRole: 'software-engineer',
          dependencies: [t1Id],
          inputs: { upstreamTaskId: t1Id },
          expectedOutputs: ['source_code'],
        });

        tasks.push({
          id: t3Id,
          name: 'Comprehensive Quality & Verification Suite',
          description: 'Verify system with unit, integration, and security checks.',
          assignedRole: 'qa-engineer',
          dependencies: [t2Id],
          inputs: { upstreamTaskId: t2Id, criteria: analysis.acceptanceCriteria },
          expectedOutputs: ['test_report.json'],
        });
        break;
      }

      case 'modify': {
        const t1Id = `task-spec-${Math.random().toString(36).substring(2, 6)}`;
        const t2Id = `task-impl-${Math.random().toString(36).substring(2, 6)}`;
        const t3Id = `task-qa-${Math.random().toString(36).substring(2, 6)}`;

        tasks.push({
          id: t1Id,
          name: 'Feature Impact & Requirements Analysis',
          description: 'Evaluate existing contracts and specify modifications.',
          assignedRole: 'product-manager',
          dependencies: [],
          inputs: { goals: analysis.extractedGoals },
          expectedOutputs: ['impact_analysis.md'],
        });

        tasks.push({
          id: t2Id,
          name: 'Target Feature Implementation',
          description: 'Apply modifications and update relevant components.',
          assignedRole: 'software-engineer',
          dependencies: [t1Id],
          inputs: { upstreamTaskId: t1Id },
          expectedOutputs: ['modified_files'],
        });

        tasks.push({
          id: t3Id,
          name: 'Regression & Contract Verification',
          description: 'Ensure existing functionality remains intact.',
          assignedRole: 'qa-engineer',
          dependencies: [t2Id],
          inputs: { upstreamTaskId: t2Id },
          expectedOutputs: ['regression_report.json'],
        });
        break;
      }

      case 'investigate': {
        const t1Id = `task-spike-${Math.random().toString(36).substring(2, 6)}`;
        const t2Id = `task-findings-${Math.random().toString(36).substring(2, 6)}`;

        tasks.push({
          id: t1Id,
          name: 'Spike Benchmark & Hypothesis Testing',
          description: 'Profile runtime behavior and measure bottlenecks.',
          assignedRole: 'solution-architect',
          dependencies: [],
          inputs: { goals: analysis.extractedGoals },
          expectedOutputs: ['benchmark_metrics.json'],
        });

        tasks.push({
          id: t2Id,
          name: 'Findings & Remediation Proposal',
          description: 'Summarize insights and recommend architecture changes.',
          assignedRole: 'qa-engineer',
          dependencies: [t1Id],
          inputs: { upstreamTaskId: t1Id },
          expectedOutputs: ['investigation_report.md'],
        });
        break;
      }

      case 'troubleshoot': {
        const t1Id = `task-reproduce-${Math.random().toString(36).substring(2, 6)}`;
        const t2Id = `task-remediate-${Math.random().toString(36).substring(2, 6)}`;

        tasks.push({
          id: t1Id,
          name: 'Incident Reproduction & Root Cause Isolation',
          description: 'Reproduce failing behavior with isolated test harness.',
          assignedRole: 'software-engineer',
          dependencies: [],
          inputs: { goals: analysis.extractedGoals },
          expectedOutputs: ['reproduction_test.ts'],
        });

        tasks.push({
          id: t2Id,
          name: 'Defect Remediation & Verification',
          description: 'Apply minimal fix and verify resolution.',
          assignedRole: 'qa-engineer',
          dependencies: [t1Id],
          inputs: { upstreamTaskId: t1Id },
          expectedOutputs: ['fix_verification.json'],
        });
        break;
      }
    }

    return tasks;
  }
}
