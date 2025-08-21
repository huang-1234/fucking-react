import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
      '@': path.resolve(__dirname, 'src'),
      '~antd': path.resolve(__dirname, 'node_modules/antd'),
      '~antd/es/style/themes/index.less': path.resolve(__dirname, 'node_modules/antd/es/style/themes/index.less'),
    },
  },
});