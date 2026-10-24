import type { Artifact, ArtifactVersion, ArtifactStatus } from '@forgeos/types';

export interface CreateArtifactInput {
  projectId: string;
  type: string;
  title: string;
  content: string;
  provenanceTaskRunId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateVersionInput {
  content: string;
  provenanceTaskRunId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ArtifactFilter {
  projectId?: string;
  type?: string;
  status?: ArtifactStatus;
}
