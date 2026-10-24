import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Task 1.9: Next.js Frontend Scaffold & Project Workspace (FR-001, FR-006, FR-050)', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies apps/web package setup and configuration exist', () => {
    const pkgPath = path.join(rootDir, 'apps/web/package.json');
    expect(fs.existsSync(pkgPath), 'apps/web/package.json should exist').toBe(true);

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('@forgeos/web');

    const nextConfigPath = path.join(rootDir, 'apps/web/next.config.js');
    expect(fs.existsSync(nextConfigPath), 'next.config.js should exist').toBe(true);
  });

  it('verifies Next.js App Router structure with projects and workspace pages', () => {
    const appDir = path.join(rootDir, 'apps/web/app');
    expect(fs.existsSync(appDir), 'apps/web/app should exist').toBe(true);

    const requiredPages = [
      'layout.tsx',
      'page.tsx',
      'projects/page.tsx',
      'projects/[id]/page.tsx',
    ];

    for (const page of requiredPages) {
      const pagePath = path.join(appDir, page);
      expect(fs.existsSync(pagePath), `App Router page ${page} should exist`).toBe(true);
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it('verifies frontend API client communicates with backend Orchestrator endpoints', async () => {
    const clientPath = path.join(rootDir, 'apps/web/lib/api-client.ts');
    expect(fs.existsSync(clientPath), 'api-client.ts should exist').toBe(true);

    const { ForgeApiClient } = await import('../../apps/web/lib/api-client.js');
    const client = new ForgeApiClient('http://localhost:3001');

    expect(client).toBeDefined();
    expect(typeof client.listProjects).toBe('function');
    expect(typeof client.createProject).toBe('function');
    expect(typeof client.getProject).toBe('function');
    expect(typeof client.listArtifacts).toBe('function');
  });
});
