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
      '@forgeos/policy-engine': path.resolve(__dirname, 'platform/policy-engine/src/index.ts'),
      '@forgeos/artifact-registry': path.resolve(__dirname, 'platform/artifact-registry/src/index.ts'),
      '@forgeos/model-gateway': path.resolve(__dirname, 'platform/model-gateway/src/index.ts'),
      '@forgeos/runner': path.resolve(__dirname, 'infrastructure/local-runner/src/index.ts'),
      '@forgeos/quality-engine': path.resolve(__dirname, 'platform/quality-engine/src/index.ts'),
      '@forgeos/observability': path.resolve(__dirname, 'platform/observability/src/index.ts'),
      '@forgeos/persistent-memory': path.resolve(__dirname, 'platform/persistent-memory/src/index.ts'),
      '@forgeos/design-studio': path.resolve(__dirname, 'platform/design-studio/src/index.ts'),
      '@forgeos/platform-builder': path.resolve(__dirname, 'platform/platform-builder/src/index.ts'),
    },
  },
});
