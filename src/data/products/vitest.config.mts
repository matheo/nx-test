import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'products',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: { experimentalDecorators: true },
    },
  },
});
