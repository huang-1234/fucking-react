import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// 获取命令行参数，判断是开发模式还是构建模式
const isExample = process.env.EXAMPLE === 'true'
const exampleName = process.env.EXAMPLE_NAME || 'react-usage'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  // 根据模式配置不同的入口和输出
  build: isExample
    ? {
        // 示例模式构建配置
        outDir: 'dist/examples',
        rollupOptions: {
          input: {
            main: resolve(__dirname, `examples/${exampleName}.tsx`),
          },
        },
      }
    : {
        // 库模式构建配置
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'DomProxy',
          fileName: (format) => `dom-proxy.${format}.js`,
          formats: ['es', 'umd']
        },
        rollupOptions: {
          // 确保外部化处理那些你不想打包进库的依赖
          external: ['react', 'react-dom'],
          output: {
            // 在 UMD 构建模式下为这些外部化的依赖提供全局变量
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        },
        sourcemap: true,
        // 确保生成的类型声明文件
        emptyOutDir: false,
      },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
  },
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 开发模式下的入口配置
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
