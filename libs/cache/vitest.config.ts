import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/service-work/__test__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/*.d.ts',
        'tests/**',
        '**/index.ts',
        'src/service-work/__test__/**'
      ],
    },
    include: [
      'tests/unit/**/*.{test,spec}.{ts,js}',
      'src/service-work/__test__/**/*.{test,spec}.{ts,tsx,js,jsx}'
    ]
  }
});