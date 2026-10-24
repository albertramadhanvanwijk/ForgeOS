export interface AgentRole {
  id: string;
  name: string;
  description: string;
  category: 'coordination' | 'product' | 'design' | 'engineering' | 'quality' | 'operations' | 'specialized';
  capabilities: string[];
  skills: string[];
  allowedTools: string[];
  defaultModel?: string;
}

export interface TaskRequirement {
  id: string;
  name: string;
  requiredCapabilities: string[];
  requiredSkills?: string[];
}

export interface SelectionRationaleItem {
  roleId: string;
  action: 'selected' | 'skipped';
  reason: string;
  matchedCapabilities?: string[];
}

export interface AgentSelectionDecision {
  taskId: string;
  selectedRoleIds: string[];
  skippedRoleIds: string[];
  rationale: SelectionRationaleItem[];
}
