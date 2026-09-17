import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // SWC emits decorator metadata, required by the Nest DI container.
    swc.vite({ module: { type: 'es6' } }),
  ],
  resolve: {
    alias: {
      src: resolve('src'),
      prisma: resolve('prisma'),
    },
  },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
