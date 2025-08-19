import { type Plugin } from 'vite';
import { createSchemaGenerator } from './schema-generator';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Vite插件配置选项
 */
interface VitePropsToFormilyOptions {
  // 要扫描的组件目录或文件
  include: string[];
  // 要排除的文件模式
  exclude?: string[];
  // 输出目录，相对于项目根目录
  outputDir: string;
  // 输出文件名
  outputFileName: string;
  // 是否在控制台打印调试信息
  debug?: boolean;
  // 虚拟模块ID
  virtualModuleId?: string;
}

/**
 * 将组件的Props转换为Formily的Schema
 */
export function VitePropsToFormilyPlugin(options: Partial<VitePropsToFormilyOptions> = {}): Plugin {
  const resolvedOptions: VitePropsToFormilyOptions = {
    include: ['src/**/*.{tsx,jsx}'],
    outputDir: 'src/plugins/props-to-schema/demos',
    outputFileName: 'formily-schemas.json',
    debug: false,
    virtualModuleId: 'virtual:formily-props',
    ...options,
  };

  const VIRTUAL_MODULE_ID = resolvedOptions.virtualModuleId;
  const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

  // 创建Schema生成器
  const generator = createSchemaGenerator(resolvedOptions);

  // 确保输出目录存在
  const outputPath = path.resolve(resolvedOptions.outputDir, resolvedOptions.outputFileName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  return {
    name: 'vite-plugin-props-to-formily',

    // 构建开始时生成Schema
    async buildStart() {
      try {
        await generator.generate();
        if (resolvedOptions.debug) {
          console.log('[VitePropsToFormilyPlugin] Schema生成完成');
        }
      } catch (error) {
        console.error('[VitePropsToFormilyPlugin] Schema生成失败:', error);
      }
    },

    // 转换组件文件时提取Props
    async transform(code, id) {
      if (!/\.(tsx|jsx)$/.test(id)) return;

      try {
        const updated = generator.updateFile(id);
        if (updated && resolvedOptions.debug) {
          console.log(`[VitePropsToFormilyPlugin] 更新文件Schema: ${id}`);
        }
      } catch (error) {
        console.error(`[VitePropsToFormilyPlugin] 处理文件失败: ${id}`, error);
      }

      return code; // 不修改源码
    },

    // 注册虚拟模块
    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_VIRTUAL_MODULE_ID : null;
    },

    // 注入虚拟模块内容
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        try {
          // 从文件中读取生成的Schema
          const schemaPath = path.resolve(resolvedOptions.outputDir, resolvedOptions.outputFileName);
          if (fs.existsSync(schemaPath)) {
            const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
            return `export default ${schemaContent};`;
          } else {
            console.warn(`[VitePropsToFormilyPlugin] Schema文件不存在: ${schemaPath}`);
            return 'export default { schemas: {}, timestamp: "", count: 0 };';
          }
        } catch (error) {
          console.error('[VitePropsToFormilyPlugin] 加载Schema失败:', error);
          return 'export default { schemas: {}, timestamp: "", count: 0 };';
        }
      }
    },

    // 开发环境热更新处理
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.tsx') || ctx.file.endsWith('.jsx')) {
        try {
          const updated = generator.updateFile(ctx.file);
          if (updated) {
            // 通知客户端Schema已更新
            ctx.server.ws.send({
              type: 'custom',
              event: 'formily-schema-update',
              data: { file: ctx.file },
            });

            if (resolvedOptions.debug) {
              console.log(`[VitePropsToFormilyPlugin] 热更新Schema: ${ctx.file}`);
            }
          }
        } catch (error) {
          console.error(`[VitePropsToFormilyPlugin] 热更新处理失败: ${ctx.file}`, error);
        }
      }
    }
  };
}

export default VitePropsToFormilyPlugin;