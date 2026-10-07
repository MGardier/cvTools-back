import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // SWC emits decorator metadata, required by the Nest DI container.
    swc.vite({ module: { type: 'es6' } }),
  ],
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    server: {
      deps: { external: [/node_modules/] },
    },
  },
});
