import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    copy({
      targets: [
        { src: 'src/manifest.json', dest: 'dist/extension' },
        { src: 'src/assets', dest: 'dist/extension' },
        { src: 'src/pages/popup/index.html', dest: 'dist/extension/popup' },
        { src: 'src/pages/options/index.html', dest: 'dist/extension/options' },
        { src: 'src/pages/devtools/index.html', dest: 'dist/extension/devtools' }
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
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        popup: resolve(__dirname, 'src/pages/popup/index.tsx'),
        options: resolve(__dirname, 'src/pages/options/index.tsx'),
        devtools: resolve(__dirname, 'src/pages/devtools/index.tsx'),
        content: resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        // 为浏览器插件调整输出路径
        dir: 'dist/extension',
        entryFileNames: (chunkInfo) => {
          // 根据不同的入口文件生成不同的输出路径
          const name = chunkInfo.name;
          if (['popup', 'options', 'devtools'].includes(name)) {
            return `${name}/${name}.js`;
          }
          return '[name].js';
        },
        chunkFileNames: '[name].chunk.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: '/src/pages/popup/index.html'
  }
});