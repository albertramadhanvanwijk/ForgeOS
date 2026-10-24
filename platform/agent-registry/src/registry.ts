import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AgentRole, TaskRequirement, AgentSelectionDecision, SelectionRationaleItem } from './types.js';

export class AgentRegistry {
  private roles: Map<string, AgentRole> = new Map();
  private tools: Set<string> = new Set();
  private skills: Set<string> = new Set();

  registerRole(role: AgentRole): void {
    this.roles.set(role.id, role);
    for (const tool of role.allowedTools) {
      this.tools.add(tool);
    }
    for (const skill of role.skills) {
      this.skills.add(skill);
    }
  }

  getRole(id: string): AgentRole | undefined {
    return this.roles.get(id);
  }

  listRoles(): AgentRole[] {
    return Array.from(this.roles.values());
  }

  listTools(): string[] {
    return Array.from(this.tools);
  }

  listSkills(): string[] {
    return Array.from(this.skills);
  }

  async loadFromDirectory(directoryPath: string): Promise<void> {
    if (!fs.existsSync(directoryPath)) {
      return;
    }

    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const fullPath = path.join(directoryPath, file);
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const role: AgentRole = JSON.parse(content);
          if (role.id && role.name && role.capabilities) {
            this.registerRole(role);
          }
        } catch {
          // ignore invalid json files
        }
      }
    }
  }

  /**
   * Adaptive Agent Selection (FR-021, FR-024, FR-027)
   * Matches required capabilities to agent roles, skips irrelevant ones, and records rationale.
   */
  selectAgentsForTask(task: TaskRequirement): AgentSelectionDecision {
    const selectedRoleIds: string[] = [];
    const skippedRoleIds: string[] = [];
    const rationale: SelectionRationaleItem[] = [];

    const neededCapabilities = new Set(task.requiredCapabilities);

    for (const role of this.roles.values()) {
      const matches = role.capabilities.filter((cap) => neededCapabilities.has(cap));

      if (matches.length > 0) {
        selectedRoleIds.push(role.id);
        rationale.push({
          roleId: role.id,
          action: 'selected',
          reason: `Matches required capability: ${matches.join(', ')}`,
          matchedCapabilities: matches,
        });
      } else {
        skippedRoleIds.push(role.id);
        rationale.push({
          roleId: role.id,
          action: 'skipped',
          reason: `Irrelevant to task: none of the role capabilities (${role.capabilities.join(', ')}) match required (${task.requiredCapabilities.join(', ')})`,
        });
      }
    }

    return {
      taskId: task.id,
      selectedRoleIds,
      skippedRoleIds,
      rationale,
    };
  }
}
