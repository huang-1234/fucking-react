/**
 * Stream模块测试配置
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 测试文件匹配模式
    include: [
      '**/*.test.ts',
      '**/*.spec.ts'
    ],
    
    // 排除文件
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**'
    ],
    
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/Stream/**/*.ts'
      ],
      exclude: [
        'src/Stream/**/*.test.ts',
        'src/Stream/**/*.spec.ts',
        'src/Stream/__test__/**',
        'src/Stream/examples/**',
        'node_modules/**'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // 核心模块要求更高的覆盖率
        'src/Stream/core/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    
    // 设置文件
    setupFiles: [
      './setup.ts'
    ],
    
    // 报告器配置
    reporter: [
      'default',
      'json',
      'html'
    ],
    
    // 输出目录
    outputFile: {
      json: './test-results.json',
      html: './test-results.html'
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
      '@test': path.resolve(__dirname, './')
    }
  },
  
  // 定义全局变量
  define: {
    __TEST__: true,
    __VERSION__: JSON.stringify('1.0.0-test')
  }
});