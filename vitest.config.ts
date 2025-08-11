import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.astro'],
    setupFiles: ['src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
      'astro:content': new URL('./src/test/mocks/astro-content.ts', import.meta.url).pathname,
    },
  },
});