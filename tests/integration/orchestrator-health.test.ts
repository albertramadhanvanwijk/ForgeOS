import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Task 1.3: Orchestrator Backend & Health API', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies platform/orchestrator package setup exists', () => {
    const pkgPath = path.join(rootDir, 'platform/orchestrator/package.json');
    expect(fs.existsSync(pkgPath), 'platform/orchestrator/package.json should exist').toBe(true);

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('@forgeos/orchestrator');
  });

  it('verifies buildApp creates an HTTP server with GET /health endpoint', async () => {
    // Dynamic import of the orchestrator app factory
    const appModulePath = path.join(rootDir, 'platform/orchestrator/src/app.ts');
    expect(fs.existsSync(appModulePath), 'platform/orchestrator/src/app.ts should exist').toBe(true);

    const { createServer } = await import('../../platform/orchestrator/src/app.js');
    const app = await createServer();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('forgeos-orchestrator');
    expect(body.timestamp).toBeDefined();

    await app.close();
  });
});
