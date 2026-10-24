import { defineConfig } from 'vitest/config';

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
});
