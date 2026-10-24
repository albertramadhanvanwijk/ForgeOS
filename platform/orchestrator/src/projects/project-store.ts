import type { Project, ProjectStatus } from '@forgeos/types';
import { randomUUID } from 'node:crypto';

export interface CreateProjectInput {
  name: string;
  goal: string;
  description?: string | null;
  capabilityProfile?: Record<string, unknown> | null;
}

export interface UpdateProjectInput {
  name?: string;
  goal?: string;
  description?: string | null;
  status?: ProjectStatus;
  capabilityProfile?: Record<string, unknown> | null;
}

export interface IProjectStore {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findMany(filter?: { status?: ProjectStatus }): Promise<Project[]>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  archive(id: string): Promise<Project | null>;
}

export class InMemoryProjectStore implements IProjectStore {
  private projects: Map<string, Project> = new Map();

  async create(input: CreateProjectInput): Promise<Project> {
    const now = new Date();
    const project: Project = {
      id: randomUUID(),
      name: input.name,
      goal: input.goal,
      description: input.description ?? null,
      status: 'active',
      capabilityProfile: input.capabilityProfile ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    const project = this.projects.get(id);
    return project ? { ...project } : null;
  }

  async findMany(filter?: { status?: ProjectStatus }): Promise<Project[]> {
    const all = Array.from(this.projects.values());
    if (filter?.status) {
      return all.filter((p) => p.status === filter.status);
    }
    return all;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const existing = this.projects.get(id);
    if (!existing) {
      return null;
    }

    const updated: Project = {
      ...existing,
      name: input.name ?? existing.name,
      goal: input.goal ?? existing.goal,
      description: input.description !== undefined ? input.description : existing.description,
      status: input.status ?? existing.status,
      capabilityProfile:
        input.capabilityProfile !== undefined ? input.capabilityProfile : existing.capabilityProfile,
      updatedAt: new Date(),
    };

    this.projects.set(id, updated);
    return { ...updated };
  }

  async archive(id: string): Promise<Project | null> {
    return this.update(id, { status: 'archived' });
  }
}
