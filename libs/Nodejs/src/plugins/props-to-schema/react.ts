/* cspell:disable */
/**
 * props-to-schema - 将组件 props 转换为 Formily 表单协议
 *
 * 支持 Webpack 和 Vite 构建环境
 * 可以提取 React 组件的 props 定义
 * 自动生成 JSON Schema 和 Formily Schema
 */
import { Compiler } from "webpack";
import { Plugin, ResolvedConfig } from "vite";

let babelParse: any, traverse: any, t: any;

try {
  babelParse = require('@babel/parser').parse;
  traverse = require('@babel/traverse').default;
  t = require('@babel/types');
} catch (error) {
  console.warn('Babel dependencies not found. Props parsing will be disabled.', error);
  // 提供简单的备用解析逻辑
  babelParse = null;
  traverse = null;
  t = null;
}


/**
 * 解析 Vue 组件的 props
 * @param {string} source Vue组件源代码
 * @returns {Object} 解析后的 props 对象
 */
function parseVueComponentProps(source: string): Record<string, PropConfig> {
  const props: Record<string, PropConfig> = {};

  // 1. 尝试解析<script> 块
  const scriptMatch = /<script(\s+setup)?[^>]*>([\s\S]*?)<\/script>/i.exec(source);
  if (!scriptMatch) return props;

  const scriptContent = scriptMatch[2];

  // 2. 如果 Babel 不可用，使用简单的正则解析
  if (!babelParse || !traverse || !t) {
    return parseVuePropsWithRegex(scriptContent);
  }

  // 3. 尝试解析 props 定义
  try {
    const ast = babelParse(scriptContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    // 3. 遍历 AST 寻找 props 定义
    traverse(ast, {
      ObjectProperty(path: any) {
        if (path.node.key.name === 'props' && path.parent.type === 'ObjectExpression') {
          const propsNode = path.node.value;
          if (t.isObjectExpression(propsNode)) {
            propsNode.properties.forEach((prop: any) => {
              if (t.isObjectProperty(prop)) {
                const propName = prop.key.name || prop.key.value;
                const propConfig: PropConfig = {};// 提取 prop 配置
                if (t.isObjectExpression(prop.value)) {
                  prop.value.properties.forEach((configProp: any) => {
                    if (t.isObjectProperty(configProp)) {
                      const configKey = configProp.key.name || configProp.key.value;

                      // 处理不同类型的值
                      if (t.isStringLiteral(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = configProp.value.value;
                      } else if (t.isNumericLiteral(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = configProp.value.value;
                      } else if (t.isBooleanLiteral(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = configProp.value.value;
                      } else if (t.isIdentifier(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = configProp.value.name;
                      } else if (t.isArrayExpression(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = [];
                      } else if (t.isObjectExpression(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = {};
                      }
                    }
                  });
                } else if (t.isIdentifier(prop.value)) {
                  propConfig.type = prop.value.name;
                }

                props[propName] = propConfig;
              }
            });
          }
        }
      },
      // 处理 defineProps 的情况 (Vue3Setup)
      CallExpression(path: any) {
        if (path.node.callee.name === 'defineProps') {
          const arg = path.node.arguments[0];
          if (t.isObjectExpression(arg)) {
            arg.properties.forEach((prop: any) => {
              if (t.isObjectProperty(prop)) {
                const propName = prop.key.name || prop.key.value;
                const propConfig: PropConfig = {};

                if (t.isObjectExpression(prop.value)) {
                  prop.value.properties.forEach((configProp: any) => {
                    if (t.isObjectProperty(configProp)) {
                      const configKey = configProp.key.name;
                      if (t.isStringLiteral(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = configProp.value.value;
                      } else if (t.isIdentifier(configProp.value)) {
                        propConfig[configKey as keyof PropConfig] = configProp.value.name;
                      }
                    }
                  });
                } props[propName] = propConfig;
              }
            });
          }
        }
      }
    });
  } catch (error) {
    console.error('解析Vue组件props失败:', error);
  }

  return props;
}

/**
 * 使用正则表达式解析 Vue 组件的 props（备用方法）
 * @param {string} scriptContent Vue 组件的 script 内容
 * @returns {Object} 解析后的 props 对象
 */
function parseVuePropsWithRegex(scriptContent: string): Record<string, PropConfig> {
  const props: Record<string, PropConfig> = {};

  try {
    // 查找 props 对象
    const propsMatch = /props\s*:\s*\{([\s\S]*?)\}/m.exec(scriptContent);
    if (!propsMatch) return props;

    const propsContent = propsMatch[1];

    // 简单解析每个 prop使用 React
    const propRegex = /(\w+)\s*:\s*\{([^}]*)\}/g;
    let match;

    while ((match = propRegex.exec(propsContent)) !== null) {
      const propName = match[1];
      const propConfig = match[2];

      const config: PropConfig = {};

      // 解析 type
      const typeMatch = /type\s*:\s*(\w+)/i.exec(propConfig);
      if (typeMatch) {
        config.type = typeMatch[1];
      }

      // 解析 default
      const defaultMatch = /default\s*:\s*['"`]([^'"`]+)['"`]|default\s*:\s*(true|false|\d+)/i.exec(propConfig);
      if (defaultMatch) {
        config.default = defaultMatch[1] || defaultMatch[2];
        if (config.default === 'true') config.default = true;
        if (config.default === 'false') config.default = false;
        if (/^\d+$/.test(config.default)) config.default = parseInt(config.default);
      }

      // 解析 description
      const descMatch = /description\s*:\s*['"`]([^'"`]+)['"`]/i.exec(propConfig);
      if (descMatch) {
        config.description = descMatch[1];
      }

      props[propName] = config;
    }
  } catch (error) {
    console.error('正则解析 Vue props 失败:', error);
  }

  return props;
}

/**
 * 解析 React 组件的 props
 * @param {string} source React组件源代码
 * @returns {Object} 解析后的 props 对象
 */
function parseReactComponentProps(source: string): Record<string, PropConfig> {
  const props: Record<string, PropConfig> = {};
  try {
    // 解析 JSX/TSX 代码
    const ast = babelParse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });// 提取 PropTypes 定义
    traverse(ast, {
      // 检查 Component.propTypes = { ... }
      AssignmentExpression(path: any) {
        if (
          t.isMemberExpression(path.node.left) &&
          path.node.left.property.name === 'propTypes' &&
          t.isObjectExpression(path.node.right)
        ) {
          extractPropTypesFromObject(path.node.right, props);
        }
      },
      // 检查 static propTypes = { ... }
      ClassProperty(path: any) {
        if (
          path.node.key.name === 'propTypes' &&
          t.isObjectExpression(path.node.value)
        ) {
          extractPropTypesFromObject(path.node.value, props);
        }
      },// 检查 TypeScript 接口定义
      TSInterfaceDeclaration(path: any  ) {
        if (path.node.id.name.includes('Props')) {
          path.node.body.body.forEach((property: any) => {
            if (t.isTSPropertySignature(property)) {
              const propName = property.key.name;
              const propConfig: PropConfig = {};

              // 解析TS类型
              if (t.isTSTypeAnnotation(property.typeAnnotation)) {
                const typeNode = property.typeAnnotation.typeAnnotation;
                propConfig.type = extractTypeFromTSType(typeNode);
              }

              // 是否可选
              propConfig.required = !property.optional;

              props[propName] = propConfig;
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('解析React组件props失败:', error);
  }

  return props;
}

/**
 * 从对象表达式中提取PropTypes 定义
 * @param {Object} objectExpr PropTypes对象表达式节点
 * @param {Object} props 结果props对象
 */
function extractPropTypesFromObject(objectExpr: any, props: Record<string, PropConfig>) {
  objectExpr.properties.forEach((prop: any) => {
    if (t.isObjectProperty(prop)) {
      const propName = prop.key.name || prop.key.value;
      const propConfig: PropConfig = {};

      // 解析PropTypes表达式
      if (t.isMemberExpression(prop.value)) {
        // 例如: PropTypes.string
        propConfig.type = prop.value.property.name;
      } else if (t.isCallExpression(prop.value)) {
        // 例如: PropTypes.string.isRequired
        if (
          t.isMemberExpression(prop.value.callee) &&
          prop.value.callee.property.name === 'isRequired'
        ) {
          propConfig.required = true;
          propConfig.type = prop.value.callee.object.property.name;
        }
      }

      props[propName] = propConfig;
    }
  });
}

/**
 * 从 TypeScript 类型中提取类型信息
 * @param {Object} tsTypeTS类型注解节点
 * @returns {string} 类型字符串
 */
function extractTypeFromTSType(tsType: any): string {
  if (t.isTSStringKeyword(tsType)) return 'string';
  if (t.isTSNumberKeyword(tsType)) return 'number';
  if (t.isTSBooleanKeyword(tsType)) return 'boolean';
  if (t.isTSArrayType(tsType)) return 'array';
  if (t.isTSObjectKeyword(tsType)) return 'object';
  return 'any';
}

/**
 * 将props转换为JSON Schema
 * @param {Object} props 解析后的props对象
 * @returns {Object} JSON Schema对象
 */
export interface JsonSchemaProperty {
  type: string;
  title: string;
  description?: string;
  default?: any;
  items?: { type: string };
  properties?: Record<string, JsonSchemaProperty>;
}

export interface JsonSchema {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}
export interface IFormItemProperty {
  'x-validator': {
    required: boolean;
    message: string;
    pattern: string;
    type: string;
    validator: string;
    validatorOptions: Record<string, any>;
    validatorType: string;
  }
}
export interface FormilySchemaProperty extends Partial<JsonSchemaProperty> {
  type: string;
  title: string;
  description?: string;
  default?: any;
  items?: { type: string };
  properties?: Record<string, JsonSchemaProperty>;
  'x-decorator'?: string;
  'x-component'?: string;
  'x-component-props'?: Record<string, any>;
}

function toJsonSchema(props: Record<string, PropConfig>): JsonSchema {
  const schema: JsonSchema = {
    type: 'object',
    properties: {}
  };

  Object.entries(props).forEach(([key, config]) => {
    const propSchema: JsonSchemaProperty = {
      type: 'string', // 默认类型
      title: key,
      description: config.description || key
    };

    // 设置类型
    if (config.type) {
      const type = config.type.toLowerCase();
      switch (type) {
        case 'string':
          propSchema.type = 'string';
          break;
        case 'number':
          propSchema.type = 'number';
          break;
        case 'boolean':
          propSchema.type = 'boolean';
          break;
        case 'array':
          propSchema.type = 'array';
          propSchema.items = { type: 'string' };
          break;
        case 'object':
          propSchema.type = 'object';
          propSchema.properties = {};
          break;
        default:
          propSchema.type = 'string';
      }
    } else {
      propSchema.type = 'string';
    }// 设置默认值
    if (config.default !== undefined) {
      propSchema.default = config.default;
    }

    // 是否必填
    if (config.required) {
      if (!schema.required) {
        schema.required = [];
      }
      schema.required.push(key);
    }

    schema.properties[key] = propSchema;
  }); return schema;
}

/**
 * 将JSON Schema转换为Formily Schema
 * @param {Object} jsonSchema JSON Schema对象
 * @returns {Object} Formily Schema对象
 */
export interface FormilySchema {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

function toFormilySchema(jsonSchema: JsonSchema, options?: PropsToSchemaOptions): FormilySchema {
  const schema: FormilySchema = {
    type: 'object',
    properties: {}
  };

  // 处理所有属性
  Object.entries(jsonSchema.properties || {}).forEach(([key, propSchema]: [string, JsonSchemaProperty]) => {
        // 创建 Formily 属性
    const formilyProp: FormilySchemaProperty = {
      ...propSchema as any
    };

    // 根据配置添加装饰器
    if (options?.includeDecorator) {
      formilyProp['x-decorator'] = options?.defaultDecorator || 'FormItem';
    }

    // 根据类型设置对应的组件
    const type = propSchema.type as string;
    const componentMap = options?.componentMap || {
      string: 'Input',
      number: 'NumberPicker',
      boolean: 'Switch',
      array: 'Select',
      object: 'ObjectContainer'
    };

    formilyProp['x-component'] = componentMap[type] || componentMap.string || 'Input';

    // 添加特殊组件属性
    if (type === 'array') {
      formilyProp['x-component-props'] = { mode: 'multiple' };
    }

    schema.properties[key] = formilyProp;
  });

  // 处理必填字段
  if (jsonSchema.required && jsonSchema.required.length > 0) {
    schema.required = jsonSchema.required;
  }

  return schema;
}

/**
 * 定义插件配置选项的类型
 */
export interface PropsToSchemaOptions {
  /** 虚拟模块的 ID，默认为 'virtual:formily-props' */
  virtualModuleId?: string;

  /** 组件模式类型，默认为 'react' */
  mode?: 'react' | 'vue';

  /** 是否输出调试日志，默认为 false */
  debug?: boolean;

  /** 需要忽略的文件模式，支持字符串或正则表达式 */
  exclude?: string | RegExp | (string | RegExp)[];

  /** 需要包含的文件模式，支持字符串或正则表达式 */
  include?: string | RegExp | (string | RegExp)[];

  /** 当转换为 JSON Schema 时的默认类型，默认为 'string' */
  defaultType?: string;

  /** 是否在生成的 Schema 中包含注释信息，默认为 true */
  includeDescription?: boolean;

  /** 是否在生成的 Schema 中包含默认值，默认为 true */
  includeDefaultValue?: boolean;

  /** 是否在生成的 Formily Schema 中添加 x-decorator，默认为 true */
  includeDecorator?: boolean;

  /** 默认的装饰器名称，默认为 'FormItem' */
  defaultDecorator?: string;

  /** 组件类型映射，用于将 JSON Schema 类型映射到 Formily 组件 */
  componentMap?: Record<string, string>;
}

/**
 * 组件属性配置的类型
 */
export interface PropConfig {
  type?: string;
  required?: boolean;
  default?: any;
  description?: string;
}

/**
 * 组件模式的类型
 */
export interface ComponentSchema {
  props: Record<string, PropConfig>;
  jsonSchema: any;
  formilySchema: any;
}

/**
 * Vite 插件实现
 * @param {PropsToSchemaOptions} userOptions 插件配置选项
 * @returns {Plugin} Vite 插件对象
 */
function PropsToSchemaVite(userOptions: Partial<PropsToSchemaOptions> = {}): Plugin {
  // 默认配置
  const options: PropsToSchemaOptions = {
    virtualModuleId: 'virtual:formily-props',
    mode: 'react',
    debug: false,
    defaultType: 'string',
    includeDescription: true,
    includeDefaultValue: true,
    includeDecorator: true,
    defaultDecorator: 'FormItem',
    componentMap: {
      string: 'Input',
      number: 'NumberPicker',
      boolean: 'Switch',
      array: 'Select',
      object: 'ObjectContainer'
    },
    ...userOptions,
  };

  // 组件模式存储对象
  const schemaStore: Record<string, ComponentSchema> = {};

  // 将options变量传递给toJsonSchema和toFormilySchema函数
  const pluginToJsonSchema = (props: Record<string, PropConfig>) => toJsonSchema(props);
  const pluginToFormilySchema = (jsonSchema: JsonSchema) => toFormilySchema(jsonSchema, options);

  const virtualModuleId = options.virtualModuleId;
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

    /**
   * 判断文件是否应该被处理
   * @param {string} id 文件路径
   * @returns {boolean} 是否应该处理该文件
   */
  function shouldProcess(id: string): boolean {
    // 过滤非文件路径和虚拟模块
    if (!id || id.includes('\0') || id.includes('node_modules')) {
      return false;
    }

    // 如果指定了 exclude，先检查是否需要排除
    if (options.exclude) {
      const excludes = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
      if (excludes.some(pattern => {
        if (typeof pattern === 'string') return id.includes(pattern);
        return pattern.test(id);
      })) {
        return false;
      }
    }

    // 如果指定了 include，检查是否在包含范围内
    if (options.include) {
      const includes = Array.isArray(options.include) ? options.include : [options.include];
      return includes.some(pattern => {
        if (typeof pattern === 'string') return id.includes(pattern);
        return pattern.test(id);
      });
    }

    // 默认检查文件后缀
    return /\.(vue|jsx|tsx)$/.test(id);
  }

  // 输出调试日志
  function log(...args: any[]) {
    if (options.debug) {
      console.log('[props-to-schema]', ...args);
    }
  }

  let viteConfig: ResolvedConfig;

  return {
    name: 'vite-plugin-props-to-schema',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
      log('Plugin initialized with options:', options);
    },

    // 转换组件文件
    transform(code, id) {
      // 检查是否是组件文件
      if (!shouldProcess(id)) return null;

      log(`Processing file: ${id}`);

      // 确定文件类型和解析方法
      const isVueFile = id.endsWith('.vue');
      const fileType = isVueFile ? 'vue' : 'jsx';

      // 根据文件类型和模式选择解析方法
      let props: Record<string, PropConfig>;
      if (options.mode === 'vue' || isVueFile) {
        props = parseVueComponentProps(code);
      } else {
        props = parseReactComponentProps(code);
      }

      // 如果找到 props 定义，转换为 schema
      if (Object.keys(props).length > 0) {
        const jsonSchema = pluginToJsonSchema(props);
        const formilySchema = pluginToFormilySchema(jsonSchema);
        schemaStore[id] = {
          props,
          jsonSchema,
          formilySchema
        };

        log(`Found ${Object.keys(props).length} props in ${id}`);
      }

      return null;
    },    /**
     * 解析虚拟模块 ID
     * @param {string} id 请求的模块 ID
     * @param {string} importer 导入该模块的文件路径
     */
    resolveId(id: string, importer?: string) {
      // 处理虚拟模块 ID
      if (id === virtualModuleId) {
        log(`Resolving virtual module: ${id}`);
        return resolvedVirtualModuleId;
      }

      // 处理兼容性模块 ID
      if (id === 'formily-props') {
        log(`Resolving compatibility module: ${id} -> ${virtualModuleId}`);
        return resolvedVirtualModuleId;
      }

      return null;
    },

        /**
     * 加载虚拟模块内容
     * @param {string} id 要加载的模块 ID
     * @returns {string|null} 模块内容或 null
     */
    load(id: string): string | null {
      if (id === resolvedVirtualModuleId) {
        log(`Loading virtual module with ${Object.keys(schemaStore).length} schemas`);

        // 处理路径以便于在客户端使用
        const processedSchemas = Object.entries(schemaStore).reduce((acc, [key, value]) => {
          try {
            // 将绝对路径转换为相对路径，便于客户端引用
            const relativePath = key.replace(viteConfig.root, '').replace(/\\/g, '/');
            // 使用文件名作为键，便于在客户端使用
            const fileName = relativePath.split('/').pop() || relativePath;
            acc[fileName] = value;

            // 保存完整路径信息
            acc[fileName].filePath = relativePath;
          } catch (error) {
            log(`Error processing schema for ${key}:`, error);
          }
          return acc;
        }, {} as Record<string, ComponentSchema & { filePath?: string }>);

        // 生成虚拟模块内容
        const moduleContent = {
          schemas: processedSchemas,
          timestamp: new Date().toISOString(),
          count: Object.keys(processedSchemas).length
        };

        const content = `export default ${JSON.stringify(moduleContent, null, 2)};`;

        if (options.debug) {
          log('Virtual module content preview:', content.substring(0, 200) + '...');
        }

        return content;
      }
      return null;
    },

    /**
     * 添加 HMR 支持
     * @param {Object} param 热更新参数
     * @returns {Array} 需要更新的模块数组
     */
    handleHotUpdate({ file, server, modules }: { file: string; server: any; modules: any[] }) {
      // 如果是组件文件变化
      if (shouldProcess(file)) {
        log(`Component file changed: ${file}, refreshing virtual module`);

        // 如果文件在 schemaStore 中存在，则删除它
        if (schemaStore[file]) {
          log(`Removing schema for ${file}`);
          delete schemaStore[file];
        }

        // 强制刷新虚拟模块
        const virtualModule = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (virtualModule) {
          log('Invalidating virtual module');
          server.moduleGraph.invalidateModule(virtualModule);

          // 刷新使用了虚拟模块的模块
          const modulesToUpdate = [virtualModule];

          // 找出依赖于虚拟模块的模块
          const importers = Array.from(virtualModule.importers || new Set());
          if (importers.length > 0) {
            log(`Found ${importers.length} importers of virtual module`);
            modulesToUpdate.push(...importers);
          }

          return modulesToUpdate;
        }
      }

      return [];
    }
  };
}

/**
 * @desc Webpack 插件实现
 * @returns {Object} Webpack 插件对象
 */
// Webpack 插件类型声明
// interface Compiler {
//   hooks: {
//     thisCompilation: {
//       tap: (name: string, callback: (compilation: any) => void) => void;
//     };
//     emit: {
//       tapAsync: (name: string, callback: (compilation: any, callback: () => void) => void) => void;
//     };
//   };
// }

class PropsToSchemaWebpack {
  /**
   * @param {Object} options 插件配置选项
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * @param {Completer} compiler 编译器对象
   */
  private options: any;

  apply(compiler: Compiler) {
    const schemas: Record<string, ComponentSchema> = {};

    // 注册文件处理器
    compiler.hooks.thisCompilation.tap('PropsToSchema', (compilation) => {
      // 使用 babel-loader 的 pitch 方法处理文件
      compilation.hooks.normalModuleLoader.tap('PropsToSchema', (loaderContext: any, module: any) => {
        const resourcePath = module.resource || '';

        // 检查是否是组件文件
        if (!/\.(vue|jsx|tsx)$/.test(resourcePath)) return;

        // 保存原始的 loader 方法
        const originalLoader = loaderContext.loader;

        // 重写 loader 方法
        loaderContext.loader = function (source: string) {
          // 调用原始 loader
          const result = originalLoader.call(this, source);
          // 解析组件的 props
          const props = parseReactComponentProps(source);

          // 如果找到 props 定义，转换为 schema
          if (Object.keys(props).length > 0) {
            const jsonSchema = toJsonSchema(props);
            const formilySchema = toFormilySchema(jsonSchema);
            schemas[resourcePath] = {
              props,
              jsonSchema,
              formilySchema
            };
          }

          return result;
        };
      });
    });

    // 生成输出文件
    compiler.hooks.emit.tapAsync('PropsToSchema', (compilation, callback) => {
      const outputPath = this.options.outputPath || 'formily-schemas.json';
      const content = JSON.stringify(schemas, null, 2);
      compilation.assets[outputPath as string] = {
        source: () => content,
        size: () => content.length,
        buffer: () => Buffer.from(content),
        map: () => null,
        sourceAndMap: () => ({ source: content, map: null }),
        updateHash: () => {}
      };

      callback();
    });
  }
}

// 函数和类导出
export {
  toJsonSchema,
  toFormilySchema,
  PropsToSchemaVite,
  PropsToSchemaWebpack
};
