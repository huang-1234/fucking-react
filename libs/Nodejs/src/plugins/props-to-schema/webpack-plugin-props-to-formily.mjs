import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

/**
 * Webpack插件配置选项
 */
export class WebpackPropsToFormilyPlugin {
  constructor(options = {}) {
    this.options = {
      include: ['src/**/*.{tsx,jsx}'],
      outputDir: 'src/plugins/props-to-schema/demos',
      outputFileName: 'formily-schemas.json',
      debug: false,
      ...options,
    };
  }

  apply(compiler) {
    const pluginName = 'WebpackPropsToFormilyPlugin';

    // 在编译开始时生成Schema
    compiler.hooks.beforeCompile.tapAsync(
      pluginName,
      async (_, callback) => {
        try {
          await this.generateSchemas();

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
      pluginName,
      async (compilation, callback) => {
        try {
          // 获取变化的文件
          const changedFiles = compilation.modifiedFiles;
          if (!changedFiles) {
            callback();
            return;
          }

          // 过滤出.tsx和.jsx文件
          const changedTsxFiles = Array.from(changedFiles).filter(
            (file) => /\.(tsx|jsx)$/.test(file)
          );

          if (changedTsxFiles.length > 0) {
            await this.generateSchemas(); // 重新生成所有Schema

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

  async generateSchemas() {
    const schemas = {};

    // 处理每个include模式
    for (const pattern of this.options.include) {
      const files = glob.sync(pattern, {
        ignore: this.options.exclude,
        absolute: true,
      });

      if (this.options.debug) {
        console.log(`[WebpackPropsToFormilyPlugin] 找到文件: ${files.length}个`);
      }

      // 处理每个文件 - 这里简化处理，只提取基本信息
      for (const file of files) {
        if (!/\.(tsx|jsx)$/.test(file)) continue;

        try {
          // 读取文件内容
          const content = fs.readFileSync(file, 'utf-8');

          // 简单解析Props - 这里是一个非常简化的版本
          const props = this.extractProps(content, file);
          if (Object.keys(props).length > 0) {
            const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
            schemas[relativePath] = {
              type: 'object',
              properties: props
            };

            if (this.options.debug) {
              console.log(`[WebpackPropsToFormilyPlugin] 生成Schema: ${relativePath}`);
            }
          }
        } catch (error) {
          console.error(`[WebpackPropsToFormilyPlugin] 处理文件失败: ${file}`, error);
        }
      }
    }

    // 生成结果对象
    const result = {
      schemas,
      timestamp: new Date().toISOString(),
      count: Object.keys(schemas).length
    };

    // 写入文件
    const outputPath = path.resolve(this.options.outputDir, this.options.outputFileName);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    if (this.options.debug) {
      console.log(`[WebpackPropsToFormilyPlugin] Schema已保存到: ${outputPath}`);
    }

    return schemas;
  }

  // 简单提取Props - 这是一个非常简化的实现
  extractProps(content, filePath) {
    const props = {};

    // 从接口定义中提取属性
    const interfaceMatch = content.match(/interface\s+(\w+)Props\s*{([^}]*)}/);
    if (interfaceMatch) {
      const propsContent = interfaceMatch[2];

      // 提取属性定义
      const propMatches = propsContent.matchAll(/\/\*\*\s*(.*?)\s*\*\/\s*(\w+)(\?)?:\s*([^;]*);/gs);

      for (const match of propMatches) {
        const description = match[1].trim();
        const name = match[2];
        const optional = match[3] === '?';
        const type = match[4].trim();

        props[name] = {
          title: description || name,
          type: this.mapTypeToJsonType(type),
          ...(this.getEnumValues(type)),
          'x-component': this.mapTypeToFormilyComponent(type),
          'x-decorator': 'FormItem'
        };
      }
    }

    return props;
  }

  // 映射TypeScript类型到JSON Schema类型
  mapTypeToJsonType(tsType) {
    if (tsType.includes('string')) return 'string';
    if (tsType.includes('number')) return 'number';
    if (tsType.includes('boolean')) return 'boolean';
    if (tsType.includes('[]')) return 'array';
    if (tsType.includes('Record') || tsType.includes('object')) return 'object';
    return 'string';
  }

  // 提取枚举值
  getEnumValues(type) {
    if (type.includes('|')) {
      const values = type.split('|').map(t => t.trim().replace(/['"]/g, ''));
      return { enum: values };
    }
    return {};
  }

  // 映射类型到Formily组件
  mapTypeToFormilyComponent(type) {
    if (type.includes('string')) {
      if (type.includes('|')) return 'Select';
      return 'Input';
    }
    if (type.includes('number')) return 'NumberPicker';
    if (type.includes('boolean')) return 'Switch';
    if (type.includes('[]')) return 'ArrayItems';
    if (type.includes('Record') || type.includes('object')) return 'ObjectField';
    return 'Input';
  }
}
export default WebpackPropsToFormilyPlugin;