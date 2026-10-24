import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('ForgeOS Foundation & Toolchain', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies essential root files exist', () => {
    const requiredFiles = [
      'README.md',
      'AGENTS.md',
      'CONTRIBUTING.md',
      '.env.example',
      '.gitignore',
      'package.json',
      'pnpm-workspace.yaml',
      'tsconfig.base.json',
      'docker-compose.yml',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath), `File ${file} should exist`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `File ${file} should not be empty`).toBeGreaterThan(0);
    }
  });

  it('verifies pnpm workspace packages configuration', () => {
    const workspaceContent = fs.readFileSync(path.join(rootDir, 'pnpm-workspace.yaml'), 'utf-8');
    expect(workspaceContent).toContain('apps/*');
    expect(workspaceContent).toContain('platform/*');
    expect(workspaceContent).toContain('packages/*');
  });

  it('verifies docker-compose defines postgres and minio services', () => {
    const composeContent = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf-8');
    expect(composeContent).toContain('postgres:');
    expect(composeContent).toContain('minio:');
    expect(composeContent).toContain('5432:5432');
    expect(composeContent).toContain('9000:9000');
  });

  it('verifies .env.example contains essential environment variables', () => {
    const envContent = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
    expect(envContent).toContain('DATABASE_URL=');
    expect(envContent).toContain('JWT_SECRET=');
    expect(envContent).toContain('STORAGE_DRIVER=');
  });
});
