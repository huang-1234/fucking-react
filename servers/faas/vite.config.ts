import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// 共享配置
const sharedConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
      'react-helmet-async': resolve(__dirname, 'node_modules/react-helmet-async'),
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const isSSR = process.env.SSR === 'true';

  // SSR 构建配置
  if (isBuild && isSSR) {
    return {
      ...sharedConfig,
      build: {
        ssr: true,
        outDir: 'dist/server',
        rollupOptions: {
          input: 'src/entry-server.tsx',
          output: {
            format: 'cjs'
          }
        }
      },
      ssr: {
        noExternal: ['react-helmet-async']
      }
    };
  }

  // 客户端构建配置
  if (isBuild) {
    return {
      ...sharedConfig,
      build: {
        outDir: 'dist/client',
        rollupOptions: {
          input: 'src/client/entry-client.tsx'
        }
      }
    };
  }

  // 开发配置
  return {
    ...sharedConfig,
    server: {
      port: 5174,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5174,
        clientPort: 5174,
        overlay: true,
        timeout: 30000
      },
      watch: {
        usePolling: true,
        interval: 1000,
      }
    }
  };
});