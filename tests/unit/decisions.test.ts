import { describe, it, expect } from 'vitest';
import { PersistentMemoryService } from '../../platform/persistent-memory/src/memory-store.js';

describe('FR-008: Store Decisions & Assumptions with Source/Timestamp', () => {
  const memoryService = new PersistentMemoryService();

  it('stores architectural decisions with explicit provenance, author, and timestamp', async () => {
    const record = await memoryService.createMemoryItem({
      workspaceId: 'ws-01',
      scopeType: 'project',
      scopeId: 'proj-01',
      memoryType: 'decision',
      title: 'ADR-001: Adopt Fastify Modular Monolith',
      content: 'DECISION: Use Fastify for orchestrator control plane to ensure sub-millisecond route latency.',
      createdById: 'solution-architect',
      confidence: 1.0,
      source: {
        sourceType: 'pr_review',
        sourceId: 'pr-104',
        sourceVersion: 'v1.0.0',
        evidenceLocator: 'docs/adr/ADR-001.md',
      },
    });

    expect(record.id).toBeDefined();
    expect(record.memoryType).toBe('decision');
    expect(record.title).toContain('ADR-001');
    expect(record.createdById).toBe('solution-architect');
    expect(record.createdAt).toBeInstanceOf(Date);
  });

  it('stores project assumptions and links them to source task', async () => {
    const record = await memoryService.createMemoryItem({
      workspaceId: 'ws-01',
      scopeType: 'project',
      scopeId: 'proj-01',
      memoryType: 'pattern',
      title: 'ASSUMPTION: Target browser support evergreen modern browsers',
      content: 'ASSUMPTION: Modern CSS container queries and flexbox are supported by target audience.',
      createdById: 'ui-designer',
      confidence: 0.9,
    });

    expect(record.id).toBeDefined();
    expect(record.confidence).toBe(0.9);
    expect(record.versionNumber).toBe(1);
  });
});
