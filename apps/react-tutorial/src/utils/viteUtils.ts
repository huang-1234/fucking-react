import { message } from 'antd';

/**
 * Vite插件类型定义
 */
export interface VitePlugin {
  name: string;
  enabled: boolean;
  options: Record<string, any>;
  description?: string;
  category?: 'framework' | 'optimization' | 'build' | 'development' | 'custom';
}

/**
 * Vite配置类型定义
 */
export interface ViteConfig {
  plugins?: VitePlugin[];
  root?: string;
  base?: string;
  mode?: string;
  publicDir?: string;
  cacheDir?: string;
  resolve?: {
    alias?: Record<string, string> | Array<{ find: string; replacement: string }>;
    dedupe?: string[];
    conditions?: string[];
    mainFields?: string[];
    extensions?: string[];
  };
  css?: Record<string, any>;
  json?: {
    namedExports?: boolean;
    stringify?: boolean;
  };
  esbuild?: Record<string, any> | false;
  assetsInclude?: string | RegExp | (string | RegExp)[];
  logLevel?: 'info' | 'warn' | 'error' | 'silent';
  clearScreen?: boolean;
  envDir?: string;
  envPrefix?: string | string[];
  server?: {
    host?: string | boolean;
    port?: number;
    strictPort?: boolean;
    https?: boolean | Record<string, any>;
    open?: boolean | string;
    proxy?: Record<string, any>;
    cors?: boolean | Record<string, any>;
    headers?: Record<string, string>;
  };
  build?: {
    target?: string | string[];
    outDir?: string;
    assetsDir?: string;
    assetsInlineLimit?: number;
    cssCodeSplit?: boolean;
    sourcemap?: boolean | 'inline' | 'hidden';
    rollupOptions?: Record<string, any>;
    minify?: boolean | 'terser' | 'esbuild';
    terserOptions?: Record<string, any>;
    write?: boolean;
    emptyOutDir?: boolean;
    reportCompressedSize?: boolean;
    chunkSizeWarningLimit?: number;
    watch?: Record<string, any> | null;
  };
  preview?: {
    host?: string | boolean;
    port?: number;
    strictPort?: boolean;
    https?: boolean | Record<string, any>;
    open?: boolean | string;
    proxy?: Record<string, any>;
    cors?: boolean | Record<string, any>;
  };
  optimizeDeps?: {
    entries?: string | string[];
    exclude?: string[];
    include?: string[];
    esbuildOptions?: Record<string, any>;
    force?: boolean;
  };
  ssr?: {
    external?: string[];
    noExternal?: string | RegExp | (string | RegExp)[] | true;
    target?: 'node' | 'webworker';
  };
}

/**
 * 验证Vite配置是否有效
 * @param config Vite配置对象
 * @returns 验证结果和错误信息
 */
export const validateViteConfig = (config: ViteConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 检查插件配置
  if (config.plugins) {
    config.plugins.forEach((plugin, index) => {
      if (!plugin.name) {
        errors.push(`插件 #${index + 1} 缺少名称`);
      }
    });
  }

  // 检查服务器端口范围
  if (config.server && config.server.port) {
    if (config.server.port < 0 || config.server.port > 65535) {
      errors.push('服务器端口必须在 0-65535 范围内');
    }
  }

  // 检查构建目标
  if (config.build && config.build.target) {
    const validTargets = ['es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'esnext'];
    const targets = Array.isArray(config.build.target) ? config.build.target : [config.build.target];

    targets.forEach(target => {
      if (!validTargets.includes(target)) {
        errors.push(`无效的构建目标: ${target}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 将Vite配置对象转换为JavaScript代码字符串
 * @param config Vite配置对象
 * @returns 格式化的JavaScript代码字符串
 */
export const configToString = (config: ViteConfig): string => {
  const formatValue = (value: any, indent = 2): string => {
    if (value === undefined || value === null) {
      return 'undefined';
    }

    if (typeof value === 'string') {
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
    ? `[\n    ${config.plugins
        .filter(p => p.enabled)
        .map(plugin => {
          const importName = plugin.name.replace(/^@/, '').replace(/[/-]/g, '_');
          const options = Object.keys(plugin.options).length > 0
            ? formatValue(plugin.options, 4)
            : '';

          return options
            ? `${importName}(${options})`
            : `${importName}()`;
        })
        .join(',\n    ')}\n  ]`
    : '[]';

  // 处理插件导入
  const pluginImports = config.plugins && config.plugins.length > 0
    ? config.plugins
        .filter(p => p.enabled)
        .map(plugin => {
          const importName = plugin.name.replace(/^@/, '').replace(/[/-]/g, '_');
          return `import ${importName} from '${plugin.name}'`;
        })
        .join('\n')
    : '';

  // 移除插件属性，因为我们已经单独处理了
  const configWithoutPlugins = { ...config };
  delete configWithoutPlugins.plugins;

  return `// vite.config.js
import { defineConfig } from 'vite'
${pluginImports}

export default defineConfig({
  plugins: ${pluginsCode},
  ${Object.entries(configWithoutPlugins)
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join(',\n  ')}
})`;
};

/**
 * 下载Vite配置文件
 * @param config Vite配置对象或配置代码字符串
 * @param filename 文件名
 */
export const downloadViteConfig = (config: ViteConfig | string, filename = 'vite.config.js') => {
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
 * 复制Vite配置到剪贴板
 * @param config Vite配置对象或配置代码字符串
 */
export const copyViteConfig = async (config: ViteConfig | string) => {
  try {
    const content = typeof config === 'string' ? config : configToString(config);
    await navigator.clipboard.writeText(content);
    message.success('配置已复制到剪贴板');
  } catch (error) {
    console.error('复制配置失败', error);
    message.error('复制配置失败');
  }
};

/**
 * 获取预设的Vite插件列表
 * @returns 预设的Vite插件列表
 */
export const getPresetVitePlugins = (): VitePlugin[] => {
  return [
    {
      name: '@vitejs/plugin-react',
      enabled: true,
      options: {
        fastRefresh: true,
        babel: {
          plugins: []
        }
      },
      description: '为 React 项目提供快速刷新和 JSX 支持',
      category: 'framework'
    },
    {
      name: '@vitejs/plugin-vue',
      enabled: false,
      options: {
        reactivityTransform: false,
        customElement: false
      },
      description: '为 Vue 单文件组件提供支持',
      category: 'framework'
    },
    {
      name: 'vite-plugin-compression',
      enabled: false,
      options: {
        algorithm: 'gzip',
        ext: '.gz'
      },
      description: '压缩构建产物，减小体积',
      category: 'optimization'
    },
    {
      name: 'vite-plugin-pwa',
      enabled: false,
      options: {
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Vite App',
          short_name: 'Vite App',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        }
      },
      description: '将应用转换为渐进式 Web 应用 (PWA)',
      category: 'build'
    },
    {
      name: 'vite-plugin-inspect',
      enabled: false,
      options: {},
      description: '检查 Vite 插件的中间状态',
      category: 'development'
    }
  ];
};
