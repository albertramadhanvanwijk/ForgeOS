import { randomUUID, createHash } from 'node:crypto';
import type { Artifact, ArtifactVersion, ArtifactStatus } from '@forgeos/types';
import type { CreateArtifactInput, CreateVersionInput, ArtifactFilter } from './types.js';
import type { IArtifactStorage } from './storage.js';

export class ArtifactRegistry {
  private artifacts: Map<string, Artifact> = new Map();
  private versions: Map<string, ArtifactVersion[]> = new Map(); // artifactId -> versions

  constructor(private readonly storage: IArtifactStorage) {}

  async createArtifact(input: CreateArtifactInput): Promise<Artifact> {
    const artifactId = randomUUID();
    const now = new Date();

    const artifact: Artifact = {
      id: artifactId,
      projectId: input.projectId,
      type: input.type,
      title: input.title,
      status: 'draft',
      currentVersionNumber: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.artifacts.set(artifactId, artifact);
    this.versions.set(artifactId, []);

    // Store version 1
    await this.createVersion(artifactId, {
      content: input.content,
      provenanceTaskRunId: input.provenanceTaskRunId,
      metadata: input.metadata,
    });

    return artifact;
  }

  async createVersion(artifactId: string, input: CreateVersionInput): Promise<ArtifactVersion> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error(`Artifact with ID "${artifactId}" not found`);
    }

    const versionsList = this.versions.get(artifactId) ?? [];
    const nextVersionNumber = versionsList.length + 1;

    // Calculate SHA-256 content hash
    const contentHash = createHash('sha256').update(input.content, 'utf-8').digest('hex');
    const storageRef = `artifacts/${artifact.projectId}/${artifactId}/v${nextVersionNumber}`;

    // Write content to storage driver
    await this.storage.put(storageRef, input.content);

    const version: ArtifactVersion = {
      id: randomUUID(),
      artifactId,
      versionNumber: nextVersionNumber,
      storageRef,
      contentHash,
      provenanceTaskRunId: input.provenanceTaskRunId ?? null,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    };

    versionsList.push(version);
    this.versions.set(artifactId, versionsList);

    // Update artifact pointer
    artifact.currentVersionNumber = nextVersionNumber;
    artifact.updatedAt = new Date();

    return version;
  }

  async getArtifact(id: string): Promise<Artifact | null> {
    const artifact = this.artifacts.get(id);
    return artifact ? { ...artifact } : null;
  }

  async getVersion(artifactId: string, versionNumber: number): Promise<ArtifactVersion | null> {
    const list = this.versions.get(artifactId);
    if (!list) return null;
    const version = list.find((v) => v.versionNumber === versionNumber);
    return version ? { ...version } : null;
  }

  async getLatestVersion(artifactId: string): Promise<ArtifactVersion | null> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) return null;
    return this.getVersion(artifactId, artifact.currentVersionNumber);
  }

  async getContent(artifactId: string, versionNumber?: number): Promise<string | null> {
    const targetVersion = versionNumber
      ? await this.getVersion(artifactId, versionNumber)
      : await this.getLatestVersion(artifactId);

    if (!targetVersion) return null;
    return this.storage.get(targetVersion.storageRef);
  }

  async listArtifacts(filter?: ArtifactFilter): Promise<Artifact[]> {
    let list = Array.from(this.artifacts.values());

    if (filter?.projectId) {
      list = list.filter((a) => a.projectId === filter.projectId);
    }
    if (filter?.type) {
      list = list.filter((a) => a.type === filter.type);
    }
    if (filter?.status) {
      list = list.filter((a) => a.status === filter.status);
    }

    return list.map((a) => ({ ...a }));
  }

  async updateStatus(artifactId: string, status: ArtifactStatus): Promise<Artifact> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error(`Artifact with ID "${artifactId}" not found`);
    }

    artifact.status = status;
    artifact.updatedAt = new Date();
    return { ...artifact };
  }
}
