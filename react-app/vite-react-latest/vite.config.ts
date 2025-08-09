import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    mdx({
      remarkPlugins: [remarkGfm], // 支持表格、任务列表等GitHub风格
      rehypePlugins: [rehypeHighlight], // 代码高亮
      providerImportSource: "@mdx-js/react", // 确保MDX组件作用域[1,6](@ref)
    }),
  ],
  optimizeDeps: {
    include: ["@mdx-js/react"], // 避免HMR重复刷新[7](@ref)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "./src/styles/variables.less";'
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
