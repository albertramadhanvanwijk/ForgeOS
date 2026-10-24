import type { Project, Artifact, ProjectStatus } from '@forgeos/types';

export interface CreateProjectPayload {
  name: string;
  goal: string;
  description?: string;
  capabilityProfile?: Record<string, unknown>;
}

export class ForgeApiClient {
  constructor(private readonly baseUrl: string = 'http://localhost:3001') {}

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Request failed with status ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async listProjects(status?: ProjectStatus): Promise<Project[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Project[]>(`/api/projects${query}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async archiveProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async listArtifacts(projectId?: string): Promise<Artifact[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request<Artifact[]>(`/api/artifacts${query}`);
  }

  async getHealth(): Promise<{ status: string; service: string; version: string }> {
    return this.request('/health');
  }
}
