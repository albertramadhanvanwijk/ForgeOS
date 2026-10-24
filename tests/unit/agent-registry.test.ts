import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Task 1.5: Agent & Tool Registry (FR-020 - FR-024, FR-027)', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies core agent role definitions exist in agents/roles/', () => {
    const rolesDir = path.join(rootDir, 'agents/roles');
    expect(fs.existsSync(rolesDir), 'agents/roles directory should exist').toBe(true);

    const requiredRoles = [
      'orchestrator.json',
      'product-manager.json',
      'solution-architect.json',
      'software-engineer.json',
      'qa-engineer.json',
      'devops-engineer.json',
    ];

    for (const roleFile of requiredRoles) {
      const filePath = path.join(rolesDir, roleFile);
      expect(fs.existsSync(filePath), `Role file ${roleFile} should exist`).toBe(true);
      const role = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(role.id).toBeDefined();
      expect(role.name).toBeDefined();
      expect(Array.isArray(role.capabilities)).toBe(true);
      expect(Array.isArray(role.skills)).toBe(true);
      expect(Array.isArray(role.allowedTools)).toBe(true);
    }
  });

  it('verifies AgentRegistry loads catalog and registers roles, skills, and tools', async () => {
    const { AgentRegistry } = await import('../../platform/agent-registry/src/index.js');
    const registry = new AgentRegistry();
    await registry.loadFromDirectory(path.join(rootDir, 'agents/roles'));

    const roles = registry.listRoles();
    expect(roles.length).toBeGreaterThanOrEqual(6);

    const engineerRole = registry.getRole('software-engineer');
    expect(engineerRole).toBeDefined();
    expect(engineerRole?.capabilities).toContain('backend-development');

    const tools = registry.listTools();
    expect(tools.length).toBeGreaterThan(0);
  });

  it('selects appropriate agents and records selection rationale (FR-021, FR-024, FR-027)', async () => {
    const { AgentRegistry } = await import('../../platform/agent-registry/src/index.js');
    const registry = new AgentRegistry();
    await registry.loadFromDirectory(path.join(rootDir, 'agents/roles'));

    // Task needing backend engineering and testing
    const task = {
      id: 'task-101',
      name: 'Implement REST API endpoint and test coverage',
      requiredCapabilities: ['backend-development', 'test-automation'],
    };

    const decision = registry.selectAgentsForTask(task);

    // Should select software-engineer and qa-engineer
    expect(decision.selectedRoleIds).toContain('software-engineer');
    expect(decision.selectedRoleIds).toContain('qa-engineer');

    // Should skip irrelevant agents like devops-engineer
    expect(decision.skippedRoleIds).toContain('devops-engineer');

    // Must record rationale (FR-027)
    expect(decision.rationale).toBeDefined();
    expect(decision.rationale.length).toBeGreaterThan(0);
    const selectedReasons = decision.rationale.filter((r: { action: string }) => r.action === 'selected');
    expect(selectedReasons.length).toBe(decision.selectedRoleIds.length);
  });
});
