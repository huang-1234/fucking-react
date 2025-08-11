import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { createHtmlPlugin } from 'vite-plugin-html'

// 将 https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js 加载script中去

function getInjectScript() {
  let script = `<script type="module" prefetch="true" src="https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js"></script>`
  return script
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //  将 https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js 加载html标签中中去
    createHtmlPlugin({
      minify: true,
      /**
       * After writing entry here, you will not need to add script tags in `index.html`, the original tags need to be deleted
       * @default src/main.ts
       */
      entry: 'src/main.tsx',
      /**
       * If you want to store `index.html` in the specified folder, you can modify it, otherwise no configuration is required
       * @default index.html
       */
      template: 'index.html',

      /**
       * Data that needs to be injected into the index.html ejs template
       */
      inject: {
        data: {
          title: 'index',
          injectScript: getInjectScript(),
        },
        tags: [
          {
            injectTo: 'body-prepend',
            tag: 'div',
            attrs: {
              id: 'tag',
            },
          },
        ],
      },
    }),
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
