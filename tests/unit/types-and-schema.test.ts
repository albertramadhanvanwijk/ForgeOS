import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Task 1.2: Shared Types & Database Schema', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies packages/types package setup', () => {
    const pkgPath = path.join(rootDir, 'packages/types/package.json');
    expect(fs.existsSync(pkgPath), 'packages/types/package.json should exist').toBe(true);

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('@forgeos/types');
  });

  it('verifies Prisma schema exists and contains essential models', () => {
    const schemaPath = path.join(rootDir, 'infrastructure/database/schema.prisma');
    expect(fs.existsSync(schemaPath), 'schema.prisma should exist').toBe(true);

    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const requiredModels = [
      'model User',
      'model Project',
      'model Conversation',
      'model Requirement',
      'model Decision',
      'model WorkflowDefinition',
      'model WorkflowRun',
      'model Task',
      'model AgentRun',
      'model Artifact',
      'model ArtifactVersion',
      'model ApprovalRecord',
      'model QualityGateResult',
      'model AuditEvent',
      'model MemoryItem',
      'model MemoryVersion',
      'model PlatformChangeSet',
    ];

    for (const model of requiredModels) {
      expect(schema, `Schema should define ${model}`).toContain(model);
    }
  });

  it('verifies shared domain types export core entity contracts', async () => {
    const typesPath = path.join(rootDir, 'packages/types/src/index.ts');
    expect(fs.existsSync(typesPath), 'packages/types/src/index.ts should exist').toBe(true);

    const entitiesPath = path.join(rootDir, 'packages/types/src/entities.ts');
    expect(fs.existsSync(entitiesPath), 'entities.ts should exist').toBe(true);

    const entitiesContent = fs.readFileSync(entitiesPath, 'utf-8');
    expect(entitiesContent).toContain('export interface Project');
    expect(entitiesContent).toContain('export interface WorkflowRun');
    expect(entitiesContent).toContain('export interface Artifact');
    expect(entitiesContent).toContain('export interface ApprovalRecord');

    const memoryPath = path.join(rootDir, 'packages/types/src/memory.ts');
    const memoryContent = fs.readFileSync(memoryPath, 'utf-8');
    expect(memoryContent).toContain('export interface MemoryItem');

    const eventsPath = path.join(rootDir, 'packages/types/src/events.ts');
    const eventsContent = fs.readFileSync(eventsPath, 'utf-8');
    expect(eventsContent).toContain('export interface DomainEvent');
  });
});
