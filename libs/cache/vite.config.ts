import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// 根据命令行参数决定构建哪个包
const buildTarget = process.env.BUILD_TARGET || 'all';

// 主包配置
const mainConfig = {
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/__test__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'src/service-work/**/*'],
      outDir: 'dist/types'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WebCache',
      formats: ['es', 'umd'],
      fileName: (format) => `web-cache.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    target: 'es2020',
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
};

// 子包配置
const serviceWorkConfig = {
  plugins: [
    react(),
    dts({
      include: ['src/service-work/**/*.ts', 'src/service-work/**/*.tsx'],
      exclude: ['src/**/__test__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
      outDir: 'dist/types/service-work'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/service-work/index.ts'),
      name: 'WebServiceWork',
      formats: ['es', 'umd'],
      fileName: (format) => `service-work.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    target: 'es2020',
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
};

// 根据构建目标返回配置
export default defineConfig(() => {
  if (buildTarget === 'service-work') {
    return serviceWorkConfig;
  }
  if (buildTarget === 'main') {
    return mainConfig;
  }
  // 默认返回主包配置
  return mainConfig;
});