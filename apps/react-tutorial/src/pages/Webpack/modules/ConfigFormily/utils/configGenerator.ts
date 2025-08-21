/**
 * 将Webpack配置对象转换为JavaScript代码字符串
 * @param config Webpack配置对象
 * @returns 格式化的JavaScript代码字符串
 */
export const generateWebpackConfig = (config: any): string => {
  const formatValue = (value: any, indent = 2): string => {
    if (value === undefined || value === null) {
      return 'undefined';
    }

    if (typeof value === 'string') {
      if (value.startsWith('/') && value.endsWith('/')) {
        // 正则表达式
        return value.replace(/^\/|\/$/g, '');
      }
      return `'${value}'`;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return `[\n${' '.repeat(indent + 2)}${value
          .map(v => formatValue(v, indent + 2))
          .join(`,\n${' '.repeat(indent + 2)}`)}\n${' '.repeat(indent)}]`;
      }

      if (Object.keys(value).length === 0) return '{}';

      return `{\n${Object.entries(value)
        .map(([k, v]) => `${' '.repeat(indent + 2)}${k}: ${formatValue(v, indent + 2)}`)
        .join(',\n')}\n${' '.repeat(indent)}}`;
    }

    return String(value);
  };

  // 处理插件
  const pluginsCode = config.plugins && config.plugins.length > 0
    ? config.plugins.map((plugin: any) => {
        return `new ${plugin.name}(${
          Object.keys(plugin.options || {}).length > 0
            ? formatValue(plugin.options, 4)
            : ''
        })`;
      }).join(',\n    ')
    : '';

  // 处理规则
  const rulesCode = config.module && config.module.rules
    ? config.module.rules.map((rule: any) => {
        return `{
      test: /${rule.test}/,
      use: [${(rule.use || []).map((loader: string) => `'${loader}'`).join(', ')}]${
          rule.exclude ? `,\n      exclude: /${rule.exclude}/` : ''
        }
    }`;
      }).join(',\n    ')
    : '';

  return `// webpack.config.js
const path = require('path');
${config.plugins && config.plugins.length > 0 ? `${config.plugins.map((p: any) => `const ${p.name} = require('${p.name.toLowerCase()}');`).join('\n')}` : ''}

module.exports = {
  mode: ${formatValue(config.mode)},
  entry: ${formatValue(config.entry)},
  output: {
    path: path.resolve(__dirname, ${formatValue(config.output.path)}),
    filename: ${formatValue(config.output.filename)}
  },
  ${config.devtool ? `devtool: ${formatValue(config.devtool)},` : ''}
  ${
    config.optimization
      ? `optimization: ${formatValue(config.optimization)},`
      : ''
  }
  ${
    config.module && config.module.rules && config.module.rules.length > 0
      ? `module: {
    rules: [
    ${rulesCode}
    ]
  },`
      : ''
  }
  ${
    config.plugins && config.plugins.length > 0
      ? `plugins: [
    ${pluginsCode}
  ],`
      : ''
  }
  ${
    config.resolve
      ? `resolve: ${formatValue(config.resolve)},`
      : ''
  }
  ${
    config.devServer
      ? `devServer: ${formatValue(config.devServer)},`
      : ''
  }
};`;};
