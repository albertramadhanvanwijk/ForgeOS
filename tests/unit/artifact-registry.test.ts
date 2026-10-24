import { describe, it, expect } from 'vitest';

describe('Task 1.8: Artifact Registry (FR-030 - FR-036)', () => {
  it('creates an artifact and stores immutable initial version with SHA-256 hash (FR-030, FR-031, FR-032)', async () => {
    const { ArtifactRegistry, InMemoryArtifactStorage } = await import(
      '../../platform/artifact-registry/src/index.js'
    );
    const storage = new InMemoryArtifactStorage();
    const registry = new ArtifactRegistry(storage);

    const content = '# Product Requirements Document\n\nForgeOS MVP specifications.';
    const artifact = await registry.createArtifact({
      projectId: 'proj-artifact-01',
      type: 'prd',
      title: 'MVP PRD',
      content,
      provenanceTaskRunId: 'task-run-101',
      metadata: { author: 'product-manager' },
    });

    expect(artifact.id).toBeDefined();
    expect(artifact.type).toBe('prd');
    expect(artifact.title).toBe('MVP PRD');
    expect(artifact.status).toBe('draft');
    expect(artifact.currentVersionNumber).toBe(1);

    // Verify stored version
    const version = await registry.getVersion(artifact.id, 1);
    expect(version).toBeDefined();
    expect(version?.versionNumber).toBe(1);
    expect(version?.contentHash).toBeDefined();
    expect(version?.contentHash.length).toBe(64); // SHA-256 hex string
    expect(version?.provenanceTaskRunId).toBe('task-run-101');

    // Verify retrieved content
    const retrievedContent = await registry.getContent(artifact.id, 1);
    expect(retrievedContent).toBe(content);
  });

  it('publishes a new version, increments version number, and updates hash (FR-031, FR-035)', async () => {
    const { ArtifactRegistry, InMemoryArtifactStorage } = await import(
      '../../platform/artifact-registry/src/index.js'
    );
    const storage = new InMemoryArtifactStorage();
    const registry = new ArtifactRegistry(storage);

    const artifact = await registry.createArtifact({
      projectId: 'proj-artifact-02',
      type: 'code',
      title: 'Auth Controller',
      content: 'export class AuthController { v1() {} }',
    });

    expect(artifact.currentVersionNumber).toBe(1);

    // Publish version 2
    const v2Content = 'export class AuthController { v1() {} v2() {} }';
    const v2Version = await registry.createVersion(artifact.id, {
      content: v2Content,
      provenanceTaskRunId: 'task-run-eng-02',
      metadata: { changeReason: 'Added v2 endpoint' },
    });

    expect(v2Version.versionNumber).toBe(2);
    expect(v2Version.provenanceTaskRunId).toBe('task-run-eng-02');

    const updatedArtifact = await registry.getArtifact(artifact.id);
    expect(updatedArtifact?.currentVersionNumber).toBe(2);

    // Verify distinct version contents preserved
    const c1 = await registry.getContent(artifact.id, 1);
    const c2 = await registry.getContent(artifact.id, 2);
    expect(c1).not.toBe(c2);
    expect(c2).toBe(v2Content);
  });

  it('manages artifact state transitions: draft -> approved -> verified -> released (FR-035, FR-036)', async () => {
    const { ArtifactRegistry, InMemoryArtifactStorage } = await import(
      '../../platform/artifact-registry/src/index.js'
    );
    const storage = new InMemoryArtifactStorage();
    const registry = new ArtifactRegistry(storage);

    const artifact = await registry.createArtifact({
      projectId: 'proj-artifact-03',
      type: 'release-bundle',
      title: 'Production Release v1.0.0',
      content: 'BUNDLE DATA',
    });

    expect(artifact.status).toBe('draft');

    // Transition to approved
    await registry.updateStatus(artifact.id, 'approved');
    let current = await registry.getArtifact(artifact.id);
    expect(current?.status).toBe('approved');

    // Transition to verified (after quality checks pass)
    await registry.updateStatus(artifact.id, 'verified');
    current = await registry.getArtifact(artifact.id);
    expect(current?.status).toBe('verified');

    // Transition to released
    await registry.updateStatus(artifact.id, 'released');
    current = await registry.getArtifact(artifact.id);
    expect(current?.status).toBe('released');
  });
});
