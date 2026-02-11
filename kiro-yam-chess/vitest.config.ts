import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@ai': path.resolve(__dirname, './src/ai'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
