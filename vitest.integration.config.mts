import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    environment: 'node',
    server: {
      deps: { external: [/node_modules/] },
    },
    testTimeout: 30_000, // 0.5 minute
    fileParallelism: false,
  },
});
