/**
 * Vite插件 - Service Worker生成器
 */
import type { Plugin } from 'vite';
import { resolve, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createServiceWorkerTemplate } from '../core/lifecycle';
import { generateRevision } from '../utils/version-control';

/**
 * Vite插件选项
 */
export interface ServiceWorkerPluginOptions {
  /** 是否启用插件 */
  enabled?: boolean;
  /** Service Worker输出文件名 */
  filename?: string;
  /** 缓存名称 */
  cacheName?: string;
  /** 版本号 */
  version?: string;
  /** 预缓存资源 */
  precacheAssets?: string[];
  /** 缓存白名单 */
  cacheWhitelist?: string[];
  /** 是否启用导航预加载 */
  enableNavigationPreload?: boolean;
  /** 离线页面URL */
  offlineFallbackUrl?: string;
  /** 自定义Service Worker模板 */
  swTemplate?: string;
  /** 自定义Service Worker内容 */
  swSrc?: string;
  /** 是否在开发环境中启用 */
  enableInDev?: boolean;
  /** 生成离线页面 */
  generateOfflinePage?: boolean;
  /** 自定义离线页面内容 */
  offlinePageTemplate?: string;
  /** 是否注入预缓存清单 */
  injectManifest?: boolean;
  /** 预缓存清单路径 */
  manifestPath?: string;
  /** 是否生成类型定义 */
  generateTypes?: boolean;
}

/**
 * 默认离线页面模板
 */
const DEFAULT_OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线访问</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    .offline-container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    button {
      background-color: #4a6cf7;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }
    button:hover {
      background-color: #3a5ce5;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>您当前处于离线状态</h1>
    <p>无法连接到网络。请检查您的网络连接，然后重试。</p>
    <button onclick="window.location.reload()">重新连接</button>
  </div>
</body>
</html>
`;

/**
 * 创建Vite Service Worker插件
 * @param options 插件选项
 * @returns Vite插件
 */
export function viteServiceWorker(options: ServiceWorkerPluginOptions = {}): Plugin {
  const {
    enabled = true,
    filename = 'service-worker.js',
    cacheName = 'app-cache',
    version = '1.0.0',
    precacheAssets = [],
    cacheWhitelist = [],
    enableNavigationPreload = true,
    offlineFallbackUrl = '/offline.html',
    swTemplate = '',
    swSrc = '',
    enableInDev = false,
    generateOfflinePage = true,
    offlinePageTemplate = DEFAULT_OFFLINE_PAGE,
    injectManifest = true,
    manifestPath = 'precache-manifest.js',
    generateTypes = true,
  } = options;

  // 资源清单
  let manifest: string[] = [];

  return {
    name: 'vite-plugin-service-worker',

    configResolved(config) {
      // 检查是否应该启用插件
      if (!enabled) return;
      if (config.command === 'serve' && !enableInDev) return;
    },

    async buildStart() {
      // 重置资源清单
      manifest = [];
    },

    async writeBundle(outputOptions, bundle) {
      // 检查是否应该启用插件
      if (!enabled) return;

      const outDir = outputOptions.dir || 'dist';

      // 收集所有生成的资源
      if (injectManifest) {
        manifest = Object.keys(bundle)
          .filter(fileName => {
            // 排除Service Worker相关文件
            return !fileName.includes(filename) &&
                  !fileName.includes(manifestPath) &&
                  !fileName.endsWith('.map');
          })
          .map(fileName => {
            // 转换为URL路径
            return '/' + fileName;
          });

        // 添加自定义预缓存资源
        manifest = [...manifest, ...precacheAssets];
      }

      // 生成Service Worker文件
      let swContent = '';

      if (swSrc && existsSync(swSrc)) {
        // 使用自定义Service Worker源文件
        swContent = readFileSync(swSrc, 'utf-8');
      } else if (swTemplate) {
        // 使用自定义模板
        swContent = swTemplate;
      } else {
        // 使用默认模板
        swContent = createServiceWorkerTemplate({
          version,
          cacheName,
          precacheAssets: manifest,
          cacheWhitelist,
          enableNavigationPreload,
          offlineFallbackUrl,
        });
      }

      // 写入Service Worker文件
      const swPath = join(outDir, filename);
      writeFileSync(swPath, swContent, 'utf-8');

      // 生成预缓存清单
      if (injectManifest) {
        const manifestContent = `
          // 预缓存清单
          // 生成时间: ${new Date().toISOString()}
          self.__PRECACHE_MANIFEST = ${JSON.stringify(manifest, null, 2)};
        `;

        const manifestFilePath = join(outDir, manifestPath);
        writeFileSync(manifestFilePath, manifestContent, 'utf-8');
      }

      // 生成离线页面
      if (generateOfflinePage) {
        const offlinePath = join(outDir, offlineFallbackUrl.replace(/^\//, ''));

        // 确保目录存在
        const offlineDir = offlinePath.split('/').slice(0, -1).join('/');
        if (!existsSync(offlineDir)) {
          mkdirSync(offlineDir, { recursive: true });
        }

        writeFileSync(offlinePath, offlinePageTemplate, 'utf-8');
      }

      // 生成类型定义
      if (generateTypes) {
        const typesContent = `
          // Service Worker类型定义
          // 生成时间: ${new Date().toISOString()}

          interface ServiceWorkerGlobalScope {
            __PRECACHE_MANIFEST: string[];
          }
        `;

        const typesPath = join(outDir, 'service-worker.d.ts');
        writeFileSync(typesPath, typesContent, 'utf-8');
      }

      console.log(`[vite-plugin-service-worker] Service Worker生成成功: ${swPath}`);
    },

    configureServer(server) {
      // 在开发服务器中提供Service Worker支持
      if (!enableInDev) return;

      server.middlewares.use((req, res, next) => {
        if (req.url === `/${filename}`) {
          // 生成开发环境Service Worker
          const swContent = createServiceWorkerTemplate({
            version: `dev-${Date.now()}`,
            cacheName: `${cacheName}-dev`,
            precacheAssets: [],
            cacheWhitelist: [],
            enableNavigationPreload,
            offlineFallbackUrl,
          });

          res.setHeader('Content-Type', 'application/javascript');
          res.end(swContent);
          return;
        }

        if (req.url === offlineFallbackUrl) {
          res.setHeader('Content-Type', 'text/html');
          res.end(offlinePageTemplate);
          return;
        }

        next();
      });
    },
  };
}
