export type IntentType = 'create' | 'modify' | 'investigate' | 'troubleshoot';

export interface ContextReferences {
  projectIds?: string[];
  taskIds?: string[];
  artifactIds?: string[];
  runIds?: string[];
}

export interface IntentAnalysis {
  intentType: IntentType;
  confidence: number;
  summary: string;
  isAmbiguous: boolean;
  clarifyingQuestions: string[];
  extractedGoals: string[];
  acceptanceCriteria: string[];
  suggestedWorkflow: string;
  suggestedRoles: string[];
  contextReferences?: ContextReferences;
}

export interface DAGTaskDefinition {
  id: string;
  name: string;
  description: string;
  assignedRole: string;
  dependencies: string[];
  inputs: Record<string, unknown>;
  expectedOutputs: string[];
}

export interface AdaptivePlan {
  id: string;
  projectId: string;
  workflowName: string;
  goal: string;
  tasks: DAGTaskDefinition[];
  createdAt: Date;
}
