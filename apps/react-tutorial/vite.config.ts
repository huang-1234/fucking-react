import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';
import path from 'path';
import { cdnResources } from '../../global/cdn/base';
// console.log('cdnResources', cdnResources)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
    viteImagemin({ // 图片压缩
      mozjpeg: { quality: 50 },
      pngquant: { quality: [0.8, 0.9] },
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'root-entry-name': 'default',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@@/global': path.resolve(__dirname, '../../global'),
      '@': path.resolve(__dirname, 'src'),
      '~antd': path.resolve(__dirname, 'node_modules/antd'),
      '~antd/es/style/themes/index.less': path.resolve(__dirname, 'node_modules/antd/es/style/themes/index.less'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          utils: ['lodash-es', 'axios'],
        },
      },
      external: cdnResources, // CDN 外部化
    },
  }
});