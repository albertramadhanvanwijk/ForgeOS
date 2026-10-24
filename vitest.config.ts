import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'packages/**/*.spec.ts', 'platform/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/runtime-data/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/runtime-data/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@forgeos/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@forgeos/agent-registry': path.resolve(__dirname, 'platform/agent-registry/src/index.ts'),
      '@forgeos/workflow-engine': path.resolve(__dirname, 'platform/workflow-engine/src/index.ts'),
    },
  },
});
