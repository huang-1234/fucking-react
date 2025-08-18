import { type Plugin } from 'vite';
import { generateFormilySchema, ComponentPropsSchema } from './props-schema-core';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:formily-props';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

/**
 * 将组件的 Props 转换为 Formily 的 Schema
 * @returns Vite 插件
 */
export default function VitePropsToFormilyPlugin(): Plugin {
  let schemas: ComponentPropsSchema = {};

  return {
    name: 'vite-plugin-props-to-formily',

    // 1. 转换组件文件时提取 Props
    async transform(code, id) {
      if (!/\.(tsx|jsx)$/.test(id)) return;

      const schema = generateFormilySchema(id);
      if (schema) {
        schemas[id] = schema;
      }
      return code; // 不修改源码
    },

    // 2. 注册虚拟模块
    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_VIRTUAL_MODULE_ID : null;
    },

    // 3. 注入虚拟模块内容
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return `export default ${JSON.stringify(schemas)};`;
      }
    },

    // 4. 开发环境热更新处理
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.tsx') || ctx.file.endsWith('.jsx')) {
        const schema = generateFormilySchema(ctx.file);
        if (schema) {
          schemas[ctx.file] = schema;
          ctx.server.ws.send({
            type: 'custom',
            event: 'formily-schema-update',
            data: { file: ctx.file, schema },
          });
        }
      }
    }
  };
}