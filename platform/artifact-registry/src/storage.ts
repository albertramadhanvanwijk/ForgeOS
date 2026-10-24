export interface IArtifactStorage {
  put(storageRef: string, content: string | Buffer): Promise<void>;
  get(storageRef: string): Promise<string | null>;
  delete(storageRef: string): Promise<void>;
}

export class InMemoryArtifactStorage implements IArtifactStorage {
  private files: Map<string, string> = new Map();

  async put(storageRef: string, content: string | Buffer): Promise<void> {
    this.files.set(storageRef, typeof content === 'string' ? content : content.toString('utf-8'));
  }

  async get(storageRef: string): Promise<string | null> {
    return this.files.get(storageRef) ?? null;
  }

  async delete(storageRef: string): Promise<void> {
    this.files.delete(storageRef);
  }
}
