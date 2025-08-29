/**
 * SSR 渲染引擎
 * 抽离核心渲染逻辑，支持不同环境复用
 */
import { Readable } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { createDOMEnvironment } from './dom-simulator';
import { Router, matchRoute } from '../shared/router';
import App from '../shared/App';
import { AppProvider, fetchInitialState } from '../shared/store';
import pkg from 'react-helmet-async';
const { HelmetProvider } = pkg;
import type { HelmetServerState } from 'react-helmet-async';
import { getCollectedStyles, clearCollectedStyles } from '../shared/utils/withStyles';

// 默认HTML模板
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="/favicon.ico">
  <!--head-outlet-->
  <!--styles-outlet-->
</head>
<body>
  <div id="root"><!--ssr-outlet--></div>
  <!--state-outlet-->
  <script type="module" src="/client.js"></script>
</body>
</html>`;

// SSR渲染选项
export interface SSROptions {
  url: string;              // 请求URL
  template?: string;        // HTML模板
  manifest?: Record<string, string[]>;  // 资源清单
  preloadedState?: object;  // 预加载状态
  context?: object;         // 上下文对象
  clientEntryPath?: string; // 客户端入口路径
  assetsPrefix?: string;    // 静态资源前缀（CDN）
}

// SSR渲染结果
export interface SSRResult {
  stream: Readable;         // HTML流
  state: object;            // 状态对象
  head: Record<string, string>;  // 头部信息
  statusCode: number;       // HTTP状态码
}

/**
 * 读取HTML模板
 */
export const getTemplate = (templatePath?: string): string => {
  const defaultPath = templatePath || path.resolve(process.cwd(), 'dist/client/index.html');

  try {
    if (fs.existsSync(defaultPath)) {
      return fs.readFileSync(defaultPath, 'utf-8');
    }
  } catch (err) {
    console.warn('无法读取HTML模板文件，使用默认模板', err);
  }

  return DEFAULT_TEMPLATE;
};

/**
 * 创建HTML流
 */
function createHtmlStream(
  template: string,
  content: string,
  head: Record<string, string>,
  state: object,
  styles: string,
  clientEntryPath: string = '/client.js',
  assetsPrefix: string = ''
): Readable {
  const [beforeContent, afterContent] = template.split('<!--ssr-outlet-->');

  // 注入头部信息
  const beforeWithHead = beforeContent.replace('<!--head-outlet-->',
    `${head.title || ''}${head.meta || ''}${head.links || ''}${head.scripts || ''}`);

  // 注入样式
  const beforeWithStyles = beforeWithHead.replace('<!--styles-outlet-->',
    `<style id="ssr-styles">${styles}</style>`);

  // 处理客户端入口路径
  let afterWithClientEntry = afterContent;
  if (clientEntryPath) {
    const fullClientPath = `${assetsPrefix || ''}${clientEntryPath}`;
    afterWithClientEntry = afterContent.replace(
      /<script[^>]*src=['"]\/client\.js['"][^>]*><\/script>/,
      `<script type="module" src="${fullClientPath}"></script>`
    );
  }

  // 注入状态
  const afterWithState = afterWithClientEntry.replace('<!--state-outlet-->',
    `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`);

  // 创建流
  const stream = new Readable();
  stream.push(beforeWithStyles);
  stream.push(content);
  stream.push(afterWithState);
  stream.push(null);

  return stream;
}

/**
 * 渲染React应用到流
 */
export async function renderToStream(options: SSROptions): Promise<SSRResult> {
  const {
    url,
    template = getTemplate(),
    preloadedState = {},
    context = {},
    clientEntryPath = '/client.js',
    assetsPrefix = ''
  } = options;

  // 激活DOM环境
  const { cleanup } = createDOMEnvironment({
    url: 'http://localhost',
    referrer: ''
  });

  try {
    // 清除之前收集的样式
    clearCollectedStyles();

    // 获取初始状态
    const initialState = await fetchInitialState(url);

    // 匹配路由
    const route = matchRoute(url);
    let statusCode = 200;

    // 获取路由数据
    if (route) {
      if (route.path === '*') {
        // 404路由
        statusCode = 404;
      }

      if (route.fetchData) {
        try {
          const routeData = await route.fetchData({ url, ctx: context });
          initialState.pageData = {
            ...initialState.pageData,
            [url]: routeData
          };
        } catch (error) {
          console.error('路由数据获取错误:', error);
          // 如果是API错误，可能需要设置不同的状态码
          if (error && typeof error === 'object' && 'statusCode' in error) {
            statusCode = (error as { statusCode: number }).statusCode;
          }
        }
      }
    }

    // 用于收集头部信息
    const helmetContext = {};

    // 渲染应用
    const appJsx = (
      <HelmetProvider context={helmetContext}>
        <AppProvider initialState={initialState}>
          <Router location={url}>
            <App />
          </Router>
        </AppProvider>
      </HelmetProvider>
    );

    // 流式渲染
    const streamPromise = new Promise<Readable>((resolve, reject) => {
      let content = '';
      const stream = renderToPipeableStream(appJsx, {
        bootstrapScripts: [`${assetsPrefix}/assets/main.js`],
        onShellReady() {
          try {
            // 提取头部信息
            const { helmet } = helmetContext as { helmet: HelmetServerState };
            const head = {
              title: helmet.title.toString(),
              meta: helmet.meta.toString(),
              links: helmet.link.toString(),
              scripts: helmet.script.toString()
            };

            // 获取收集到的样式
            const styles = getCollectedStyles();

            // 创建HTML流
            const htmlStream = createHtmlStream(
              template,
              content,
              head,
              initialState,
              styles,
              clientEntryPath,
              assetsPrefix
            );

            resolve(htmlStream);
          } catch (error) {
            reject(error);
          }
        },
        onError(error) {
          console.error('流式渲染错误:', error);
          reject(error);
        }
      });
    });

    // 提取头部信息
    const { helmet } = helmetContext as { helmet: HelmetServerState };
    const head = {
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      links: helmet.link.toString(),
      scripts: helmet.script.toString()
    };

    return {
      stream: await streamPromise,
      state: initialState,
      head,
      statusCode
    };
  } finally {
    // 清理DOM环境
    cleanup();
  }
}

/**
 * 创建降级HTML（当SSR失败时使用）
 */
export function createFallbackHTML(template: string = getTemplate(), error?: Error): string {
  const isDev = process.env.NODE_ENV !== 'production';

  return template
    .replace('<!--ssr-outlet-->', '<!-- SSR Failed, Falling back to CSR -->')
    .replace('<!--state-outlet-->', `<script>
      window.__SSR_ERROR__ = true;
      window.__PRELOADED_STATE__ = ${JSON.stringify({}).replace(/</g, '\\u003c')};
    </script>`)
    .replace('<!--head-outlet-->', `
      <title>加载中...</title>
      <meta name="robots" content="noindex">
      ${isDev && error ? `
        <script>
          console.error("SSR Error:", ${JSON.stringify(error.message)});
          ${error.stack ? `console.error(${JSON.stringify(error.stack)});` : ''}
        </script>
      ` : ''}
    `);
}
