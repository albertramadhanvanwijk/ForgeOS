import type { Project, ProjectStatus } from '@forgeos/types';
import { IProjectStore, CreateProjectInput, UpdateProjectInput } from './project-store.js';

export class ProjectsService {
  constructor(private readonly store: IProjectStore) {}

  async createProject(input: CreateProjectInput): Promise<Project> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Project name is required and cannot be empty');
    }
    if (!input.goal || input.goal.trim().length === 0) {
      throw new Error('Project goal is required and cannot be empty');
    }

    return this.store.create({
      ...input,
      name: input.name.trim(),
      goal: input.goal.trim(),
    });
  }

  async getProject(id: string): Promise<Project | null> {
    return this.store.findById(id);
  }

  async listProjects(filter?: { status?: ProjectStatus }): Promise<Project[]> {
    return this.store.findMany(filter);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project | null> {
    return this.store.update(id, input);
  }

  async archiveProject(id: string): Promise<Project | null> {
    return this.store.archive(id);
  }
}
