import * as fs from 'fs';
import * as path from 'path';
import { generateFormilySchema, ComponentPropsSchema } from './props-schema-core';
import * as glob from 'glob';

// Schema生成器配置
interface SchemaGeneratorOptions {
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
 * 扫描指定目录下的React组件并生成Schema
 */
export class SchemaGenerator {
  private options: SchemaGeneratorOptions;
  private schemas: ComponentPropsSchema = {};

  constructor(options: SchemaGeneratorOptions) {
    this.options = {
      debug: false,
      ...options,
    };
  }

  /**
   * 扫描组件并生成Schema
   */
  public async generate(): Promise<ComponentPropsSchema> {
    this.schemas = {};

    // 处理每个include模式
    for (const pattern of this.options.include) {
      const files = glob.sync(pattern, {
        ignore: this.options.exclude,
        absolute: true,
      });

      if (this.options.debug) {
        console.log(`[SchemaGenerator] 找到文件: ${files.length}个`);
      }

      // 处理每个文件
      for (const file of files) {
        if (!/\.(tsx|jsx)$/.test(file)) continue;

        const schema = generateFormilySchema(file);
        if (schema) {
          const relativePath = path.relative(process.cwd(), file);
          this.schemas[relativePath] = schema;

          if (this.options.debug) {
            console.log(`[SchemaGenerator] 生成Schema: ${relativePath}`);
          }
        }
      }
    }

    // 生成结果对象
    const result = {
      schemas: this.schemas,
      timestamp: new Date().toISOString(),
      count: Object.keys(this.schemas).length
    };

    // 写入文件
    const outputPath = path.resolve(this.options.outputDir, this.options.outputFileName);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    if (this.options.debug) {
      console.log(`[SchemaGenerator] Schema已保存到: ${outputPath}`);
    }

    return this.schemas;
  }

  /**
   * 更新单个文件的Schema
   */
  public updateFile(filePath: string): boolean {
    if (!/\.(tsx|jsx)$/.test(filePath)) return false;

    const schema = generateFormilySchema(filePath);
    if (schema) {
      const relativePath = path.relative(process.cwd(), filePath);
      this.schemas[relativePath] = schema;

      // 重新生成结果并保存
      const result = {
        schemas: this.schemas,
        timestamp: new Date().toISOString(),
        count: Object.keys(this.schemas).length
      };

      const outputPath = path.resolve(this.options.outputDir, this.options.outputFileName);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

      if (this.options.debug) {
        console.log(`[SchemaGenerator] 更新Schema: ${relativePath}`);
      }
      return true;
    }
    return false;
  }
}

/**
 * 创建一个Schema生成器实例
 */
export function createSchemaGenerator(options: SchemaGeneratorOptions): SchemaGenerator {
  return new SchemaGenerator(options);
}
