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
    visualizer({
      open: true,          // 构建后自动打开浏览器
      filename: 'stats.html', // 输出文件路径
      gzipSize: true,      // 显示 Gzip 压缩后体积
      brotliSize: true,   // 显示 Brotli 压缩后体积
      template: 'treemap', // 使用树状图模板
      title: 'Vite Bundle Analyzer', // 设置标题
    }),
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
      '@fucking-algorithm/algorithm': path.resolve(__dirname, '../../libs/algorithm/src'),
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