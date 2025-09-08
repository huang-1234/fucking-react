import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    nodePolyfills({
      // 是否在浏览器环境中模拟Node.js全局变量
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // 是否模拟Node.js内置模块
      protocolImports: true,
    }),
    copy({
      targets: [
        { src: 'src/media', dest: 'dist' },
        { src: 'src/webview', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/extension.ts'),
      formats: ['cjs'],
      fileName: () => 'extension.js'
    },
    rollupOptions: {
      external: ['vscode', 'path', 'fs', 'events', 'os', 'util', 'crypto', 'child_process'],
      output: {
        entryFileNames: 'extension.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    emptyOutDir: false,
    commonjsOptions: {
      sourceMap: false
    },
    target: 'node16',
    minify: false
  },
  optimizeDeps: {
    exclude: ['vscode']
  }
});