import * as path from 'path';
import * as webpack from 'webpack';
import { createSchemaGenerator } from './schema-generator';

/**
 * Webpack插件配置选项
 */
interface WebpackPropsToFormilyOptions {
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
}

/**
 * Webpack插件：将React组件的Props转换为Formily Schema
 */
export class WebpackPropsToFormilyPlugin {
  private options: WebpackPropsToFormilyOptions;

  constructor(options: Partial<WebpackPropsToFormilyOptions> = {}) {
    this.options = {
      include: ['src/**/*.{tsx,jsx}'],
      outputDir: 'src/plugins/props-to-schema/demos',
      outputFileName: 'formily-schemas.json',
      debug: false,
      ...options,
    };
  }

  apply(compiler: webpack.Compiler) {
    // 在编译开始时生成Schema
    compiler.hooks.beforeCompile.tapAsync(
      'WebpackPropsToFormilyPlugin',
      async (_, callback) => {
        try {
          const generator = createSchemaGenerator(this.options);
          await generator.generate();

          if (this.options.debug) {
            console.log('[WebpackPropsToFormilyPlugin] Schema生成完成');
          }
          callback();
        } catch (error) {
          console.error('[WebpackPropsToFormilyPlugin] Schema生成失败:', error);
          callback();
        }
      }
    );

    // 在文件变化时更新Schema
    compiler.hooks.watchRun.tapAsync(
      'WebpackPropsToFormilyPlugin',
      async (compilation, callback) => {
        try {
          // 获取变化的文件
          const changedFiles = (compilation as any).modifiedFiles;
          if (!changedFiles) {
            callback();
            return;
          }

          // 过滤出.tsx和.jsx文件
          const changedTsxFiles = Array.from(changedFiles).filter(
            (file: string) => /\.(tsx|jsx)$/.test(file)
          );

          if (changedTsxFiles.length > 0) {
            const generator = createSchemaGenerator(this.options);
            await generator.generate(); // 重新生成所有Schema

            if (this.options.debug) {
              console.log('[WebpackPropsToFormilyPlugin] Schema已更新');
            }
          }
          callback();
        } catch (error) {
          console.error('[WebpackPropsToFormilyPlugin] Schema更新失败:', error);
          callback();
        }
      }
    );
  }
}

export default WebpackPropsToFormilyPlugin;