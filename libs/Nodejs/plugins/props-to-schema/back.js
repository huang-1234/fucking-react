/* cspell:disable */
/**
 * props-to-schema - 将组件 props 转换为 Formily 表单协议
 *
 * 支持 Webpack 和 Vite 构建环境
 * 可以提取 Vue 组件或 React 组件的 props 定义
 * 自动生成 JSON Schema 和 Formily Schema
 */

let babelParse, traverse, t;

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
 * 解析组件文件内容，提取 props 定义
 * @param {string} source 组件源代码
 * @param {string} fileType 文件类型 'vue'|'jsx'|'tsx'
 * @returns {Object} 解析后的 props 对象
 */
function parseComponentProps(source, fileType = 'vue') {
  const props = {};

  try {
    // 根据文件类型处理不同的解析策略
    if (fileType === 'vue') {
      return parseVueComponentProps(source);
    } else {
      return parseReactComponentProps(source);
    }
  } catch (error) {
    console.error('解析组件props失败:', error);
    return props;
  }
}

/**
 * 解析 Vue 组件的 props
 * @param {string} source Vue组件源代码
 * @returns {Object} 解析后的 props 对象
 */
function parseVueComponentProps(source) {
  const props = {};

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
      ObjectProperty(path) {
        if (path.node.key.name === 'props' && path.parent.type === 'ObjectExpression') {
          const propsNode = path.node.value;
          if (t.isObjectExpression(propsNode)) {
            propsNode.properties.forEach(prop => {
              if (t.isObjectProperty(prop)) {
                const propName = prop.key.name || prop.key.value;
                const propConfig = {};// 提取 prop 配置
                if (t.isObjectExpression(prop.value)) {
                  prop.value.properties.forEach(configProp => {
                    if (t.isObjectProperty(configProp)) {
                      const configKey = configProp.key.name || configProp.key.value;

                      // 处理不同类型的值
                      if (t.isStringLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      } else if (t.isNumericLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      } else if (t.isBooleanLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      } else if (t.isIdentifier(configProp.value)) {
                        propConfig[configKey] = configProp.value.name;
                      } else if (t.isArrayExpression(configProp.value)) {
                        propConfig[configKey] = [];
                      } else if (t.isObjectExpression(configProp.value)) {
                        propConfig[configKey] = {};
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
      CallExpression(path) {
        if (path.node.callee.name === 'defineProps') {
          const arg = path.node.arguments[0];
          if (t.isObjectExpression(arg)) {
            arg.properties.forEach(prop => {
              if (t.isObjectProperty(prop)) {
                const propName = prop.key.name || prop.key.value;
                const propConfig = {};

                if (t.isObjectExpression(prop.value)) {
                  prop.value.properties.forEach(configProp => {
                    if (t.isObjectProperty(configProp)) {
                      const configKey = configProp.key.name;
                      if (t.isStringLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      } else if (t.isIdentifier(configProp.value)) {
                        propConfig[configKey] = configProp.value.name;
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
function parseVuePropsWithRegex(scriptContent) {
  const props = {};

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

      const config = {};

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
function parseReactComponentProps(source) {
  const props = {};
  try {
    // 解析 JSX/TSX 代码
    const ast = babelParse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });// 提取 PropTypes 定义
    traverse(ast, {
      // 检查 Component.propTypes = { ... }
      AssignmentExpression(path) {
        if (
          t.isMemberExpression(path.node.left) &&
          path.node.left.property.name === 'propTypes' &&
          t.isObjectExpression(path.node.right)
        ) {
          extractPropTypesFromObject(path.node.right, props);
        }
      },
      // 检查 static propTypes = { ... }
      ClassProperty(path) {
        if (
          path.node.key.name === 'propTypes' &&
          t.isObjectExpression(path.node.value)
        ) {
          extractPropTypesFromObject(path.node.value, props);
        }
      },// 检查 TypeScript 接口定义
      TSInterfaceDeclaration(path) {
        if (path.node.id.name.includes('Props')) {
          path.node.body.body.forEach(property => {
            if (t.isTSPropertySignature(property)) {
              const propName = property.key.name;
              const propConfig = {};

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
function extractPropTypesFromObject(objectExpr, props) {
  objectExpr.properties.forEach(prop => {
    if (t.isObjectProperty(prop)) {
      const propName = prop.key.name || prop.key.value;
      const propConfig = {};

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
function extractTypeFromTSType(tsType) {
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
function toJsonSchema(props) {
  const schema = {
    type: 'object',
    properties: {}
  };

  Object.entries(props).forEach(([key, config]) => {
    const propSchema = {
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
function toFormilySchema(jsonSchema) {
  const schema = {
    type: 'object',
    properties: {}
  };

  // 处理所有属性
  Object.entries(jsonSchema.properties || {}).forEach(([key, propSchema]) => {
    const formilyProp = {
      ...propSchema,
      'x-decorator': 'FormItem',
    };

    // 根据类型设置对应的组件
    switch (propSchema.type) {
      case 'string':
        formilyProp['x-component'] = 'Input';
        break;
      case 'number':
        formilyProp['x-component'] = 'NumberPicker';
        break;
      case 'boolean':
        formilyProp['x-component'] = 'Switch';
        break;
      case 'array':
        formilyProp['x-component'] = 'Select';
        formilyProp['x-component-props'] = { mode: 'multiple' };
        break;
      case 'object':
        formilyProp['x-component'] = 'ObjectContainer';
        break;
      default:
        formilyProp['x-component'] = 'Input';
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
 * Vite 插件实现
 * @returns {Object} Vite 插件对象
 */
function vitePlugin() {
  const virtualModuleId = 'virtual:formily-props';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  const componentSchemas = {};
  return {
    name: 'vite-plugin-props-to-schema',
    // 转换组件文件
    transform(code, id) {
      // 检查是否是组件文件
      if (!/\.(vue|jsx|tsx)$/.test(id)) return null;

      // 确定文件类型
      const fileType = id.endsWith('.vue') ? 'vue' : 'jsx';

      // 解析组件的 props
      const props = parseComponentProps(code, fileType);

      // 如果找到 props 定义，转换为 schema
      if (Object.keys(props).length > 0) {
        const jsonSchema = toJsonSchema(props);
        const formilySchema = toFormilySchema(jsonSchema);
        componentSchemas[id] = {
          props,
          jsonSchema,
          formilySchema
        };
      }

      return null;
    },// 解析虚拟模块 ID
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return null;
    },

    // 加载虚拟模块内容
    load(id) {
      if (id === resolvedVirtualModuleId) {
        console.log('🚀 Loading virtual module with schemas:', componentSchemas);
        const content = `export default ${JSON.stringify(componentSchemas, null, 2)};`;
        console.log('📦 Virtual module content:', content);
        return content;
      }
      return null;
    }
  };
}

/**
 * @desc Webpack 插件实现
 * @returns {Object} Webpack 插件对象
 */
class WebpackPlugin {
  /**
   * @param {Object} options 插件配置选项
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * @param {Completer} compiler 编译器对象
   */
  apply(compiler) {
    const schemas = {};

    // 注册文件处理器
    compiler.hooks.thisCompilation.tap('PropsToSchema', (compilation) => {
      // 使用 babel-loader 的 pitch 方法处理文件
      compilation.hooks.normalModuleLoader.tap('PropsToSchema', (loaderContext, module) => {
        const resourcePath = module.resource || '';

        // 检查是否是组件文件
        if (!/\.(vue|jsx|tsx)$/.test(resourcePath)) return;

        // 保存原始的 loader 方法
        const originalLoader = loaderContext.loader;

        // 重写 loader 方法
        loaderContext.loader = function (source) {
          // 调用原始 loader
          const result = originalLoader.call(this, source);

          // 确定文件类型
          const fileType = resourcePath.endsWith('.vue') ? 'vue' : 'jsx';

          // 解析组件的 props
          const props = parseComponentProps(source, fileType);

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
      const content = JSON.stringify(schemas, null, 2); compilation.assets[outputPath] = {
        source: () => content,
        size: () => content.length
      };

      callback();
    });
  }
}

module.exports = {
  parseComponentProps,
  toJsonSchema,
  toFormilySchema,
  vitePlugin,
  WebpackPlugin,
  // 便捷导出
  vite: vitePlugin,
  webpack: WebpackPlugin
};
