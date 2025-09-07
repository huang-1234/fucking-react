import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,js}'],
        exclude: ['src/**/*.d.ts', 'tests/**', '**/index.ts'],
      },
      include: ['tests/unit/**/*.{test,spec}.{ts,js}'],
    }
  })
);
