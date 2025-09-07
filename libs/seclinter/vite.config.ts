import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SecLinter',
      fileName: (format) => `seclinter.${format}.js`
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['commander', 'axios', 'fs', 'path', 'child_process', 'express', 'express-rate-limit', 'node:crypto', 'node:buffer', 'node:net', 'file-type', 'uuid'],
      output: {
        // 提供全局变量以便在 UMD 构建模式下使用
        globals: {
          commander: 'commander',
          axios: 'axios',
          express: 'express',
          'express-rate-limit': 'rateLimit'
        }
      }
    },
    sourcemap: true,
    // 确保 CLI 脚本能正确执行
    target: 'node14',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
