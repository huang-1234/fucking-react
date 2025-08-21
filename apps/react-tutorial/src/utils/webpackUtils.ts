import { message } from 'antd';

/**
 * Webpack配置类型定义
 */
export interface WebpackConfig {
  mode: 'development' | 'production' | 'none';
  entry: string | Record<string, string> | string[];
  output: {
    path: string;
    filename: string;
    publicPath?: string;
  };
  devtool?: string;
  optimization?: {
    minimize?: boolean;
    splitChunks?: {
      chunks?: 'async' | 'initial' | 'all';
      minSize?: number;
      maxSize?: number;
      minChunks?: number;
      automaticNameDelimiter?: string;
      cacheGroups?: Record<string, any>;
    };
    runtimeChunk?: boolean | 'single' | 'multiple' | { name: string | ((entrypoint: any) => string) };
  };
  module?: {
    rules: Array<{
      test: string | RegExp;
      use: string | string[] | { loader: string; options?: Record<string, any> }[];
      exclude?: string | RegExp;
      include?: string | RegExp;
    }>;
  };
  plugins?: any[];
  resolve?: {
    extensions?: string[];
    alias?: Record<string, string>;
  };
  devServer?: Record<string, any>;
}

/**
 * 验证Webpack配置是否有效
 * @param config Webpack配置对象
 * @returns 验证结果和错误信息
 */
export const validateWebpackConfig = (config: WebpackConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 检查必填字段
  if (!config.entry) {
    errors.push('缺少入口配置 (entry)');
  }

  if (!config.output || !config.output.path || !config.output.filename) {
    errors.push('缺少输出配置 (output.path 和 output.filename)');
  }

  // 检查模式是否有效
  if (config.mode && !['development', 'production', 'none'].includes(config.mode)) {
    errors.push('无效的模式 (mode)，必须是 development、production 或 none');
  }

  // 检查规则配置
  if (config.module && config.module.rules) {
    config.module.rules.forEach((rule, index) => {
      if (!rule.test) {
        errors.push(`规则 #${index + 1} 缺少测试条件 (test)`);
      }
      if (!rule.use) {
        errors.push(`规则 #${index + 1} 缺少 loader 配置 (use)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 将Webpack配置对象转换为JavaScript代码字符串
 * @param config Webpack配置对象
 * @returns 格式化的JavaScript代码字符串
 */
export const configToString = (config: WebpackConfig): string => {
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

  return `// webpack.config.js
const path = require('path');
${
  config.plugins && config.plugins.length > 0
    ? `${config.plugins
        .map(p => `const ${p.name} = require('${p.name.toLowerCase()}');`)
        .join('\n')}`
    : ''
}

module.exports = {
  mode: ${formatValue(config.mode)},
  entry: ${formatValue(config.entry)},
  output: ${formatValue(config.output)},
  ${config.devtool ? `devtool: ${formatValue(config.devtool)},` : ''}
  ${
    config.optimization
      ? `optimization: ${formatValue(config.optimization)},`
      : ''
  }
  ${
    config.module
      ? `module: ${formatValue(config.module)},`
      : ''
  }
  ${
    config.plugins && config.plugins.length > 0
      ? `plugins: [
    ${config.plugins
      .map(
        plugin => `new ${plugin.name}(${
          Object.keys(plugin.options).length
            ? formatValue(plugin.options, 4)
            : ''
        })`
      )
      .join(',\n    ')}
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
};`;
};

/**
 * 解析webpack stats.json文件为依赖图数据
 * @param statsJson webpack stats.json数据
 * @returns 处理后的依赖图数据
 */
export const parseWebpackStats = (statsJson: any) => {
  if (!statsJson || !statsJson.modules) {
    return { nodes: [], links: [] };
  }

  const nodes = statsJson.modules.map((module: any) => ({
    id: module.id,
    name: module.name,
    size: module.size,
    dependencies: module.reasons ? module.reasons.map((reason: any) => reason.moduleId).filter(Boolean) : []
  }));

  const links: { source: string; target: string }[] = [];
  nodes.forEach((node: any) => {
    node.dependencies.forEach((depId: string) => {
      links.push({
        source: node.id,
        target: depId
      });
    });
  });

  return { nodes, links };
};

/**
 * 下载Webpack配置文件
 * @param config Webpack配置对象或配置代码字符串
 * @param filename 文件名
 */
export const downloadWebpackConfig = (config: WebpackConfig | string, filename = 'webpack.config.js') => {
  try {
    const content = typeof config === 'string' ? config : configToString(config);
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('配置文件下载成功');
  } catch (error) {
    console.error('下载配置文件失败', error);
    message.error('配置文件下载失败');
  }
};

/**
 * 复制Webpack配置到剪贴板
 * @param config Webpack配置对象或配置代码字符串
 */
export const copyWebpackConfig = async (config: WebpackConfig | string) => {
  try {
    const content = typeof config === 'string' ? config : configToString(config);
    await navigator.clipboard.writeText(content);
    message.success('配置已复制到剪贴板');
  } catch (error) {
    console.error('复制配置失败', error);
    message.error('复制配置失败');
  }
};
