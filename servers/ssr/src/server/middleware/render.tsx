/**
 * SSR渲染中间件
 * 处理React服务端渲染
 */
import { Context, Next } from 'koa';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createDOMEnvironment } from '../dom-simulator';
import { Router, matchRoute } from '../../shared/router';
import App from '../../shared/App';
import { AppProvider, fetchInitialState } from '../../shared/store';
import pkg from 'react-helmet-async';
const { HelmetProvider } = pkg;
import type { HelmetServerState } from 'react-helmet-async';
import { getCollectedStyles, clearCollectedStyles } from '../../shared/utils/withStyles';

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

// 读取HTML模板
const getTemplate = (): string => {
  const templatePath = path.resolve(process.cwd(), 'dist/client/index.html');

  try {
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf-8');
    }
  } catch (err) {
    console.warn('无法读取HTML模板文件，使用默认模板', err);
  }

  return DEFAULT_TEMPLATE;
};

// SSR渲染选项
export interface SSROptions {
  url: string;              // 请求URL
  template?: string;         // HTML模板
  manifest?: Record<string, string[]>;  // 资源清单
  preloadedState?: object;  // 预加载状态
  context?: object;         // 上下文对象
}

// SSR渲染结果
export interface SSRResult {
  stream: Readable;         // HTML流
  state: object;            // 状态对象
  head: Record<string, string>;  // 头部信息
}

// 创建HTML流
function createHtmlStream(
  template: string,
  content: string,
  head: Record<string, string>,
  state: object,
  styles: string
): Readable {
  const [beforeContent, afterContent] = template.split('<!--ssr-outlet-->');

  // 注入头部信息
  const beforeWithHead = beforeContent.replace('<!--head-outlet-->',
    `${head.title || ''}${head.meta || ''}${head.links || ''}${head.scripts || ''}`);

  // 注入样式
  const beforeWithStyles = beforeWithHead.replace('<!--styles-outlet-->',
    `<style id="ssr-styles">${styles}</style>`);

  // 注入状态
  const afterWithState = afterContent.replace('<!--state-outlet-->',
    `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`);

  // 创建流
  const stream = new Readable();
  stream.push(beforeWithStyles);
  stream.push(content);
  stream.push(afterWithState);
  stream.push(null);

  return stream;
}

// 渲染React应用到流
export async function renderToStream(options: SSROptions): Promise<SSRResult> {
  const { url, template = getTemplate(), preloadedState = {}, context = {} } = options;

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

    // 获取路由数据
    if (route && route.fetchData) {
      const routeData = await route.fetchData({ url, ctx: context });
      initialState.pageData = {
        ...initialState.pageData,
        [url]: routeData
      };
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
        bootstrapScripts: ['/assets/main.js'],
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
            const htmlStream = createHtmlStream('', content, head, initialState, styles);

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
      head
    };
  } finally {
    // 清理DOM环境
    cleanup();
  }
}

// SSR渲染中间件
export default function renderMiddleware() {
  return async (ctx: Context, next: Next) => {
    // 如果不是HTML请求，跳过
    if (!ctx.accepts('html')) {
      return await next();
    }

    // 如果是静态资源，跳过
    if (ctx.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      return await next();
    }

    try {
      // 渲染React应用
      const { stream, state, head } = await renderToStream({
        url: ctx.url,
        context: { ctx }
      });

      // 设置响应头
      ctx.status = 200;
      ctx.type = 'html';
      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.set('Transfer-Encoding', 'chunked');

      // 设置响应体为流
      ctx.body = stream;

    } catch (err) {
      console.error('SSR渲染错误:', err);

      // 如果SSR渲染失败，降级为客户端渲染
      const template = getTemplate()
        .replace('<!--ssr-outlet-->', '<!-- SSR Failed, Falling back to CSR -->')
        .replace('<!--state-outlet-->', `<script>
          window.__SSR_ERROR__ = true;
          window.__PRELOADED_STATE__ = ${JSON.stringify({}).replace(/</g, '\\u003c')};
        </script>`);

      ctx.status = 200;
      ctx.type = 'html';
      ctx.body = template;
    }
  };
}