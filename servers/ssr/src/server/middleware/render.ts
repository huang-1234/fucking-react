/**
 * SSR渲染中间件
 * 处理React服务端渲染
 */
import { Context, Next } from 'koa';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createHeadInjector, createStateInjector, HeadInfo } from '../utils/stream';
import config from '../config';
import { ErrorInfo } from 'react-dom/client';

// 默认HTML模板
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="/favicon.ico">
  <!--head-outlet-->
</head>
<body>
  <div id="root"><!--ssr-outlet--></div>
  <!--state-outlet-->
  <script type="module" src="/client.js"></script>
</body>
</html>`;

// 读取HTML模板
const getTemplate = (): string => {
  const templatePath = path.resolve(process.cwd(), 'dist/index.html');

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
  head: HeadInfo;           // 头部信息
}

// 渲染React应用到流
export async function renderToStream(options: SSROptions): Promise<SSRResult> {
  const { url, template = getTemplate(), preloadedState = {}, context = {} } = options;

  // 动态导入服务端入口
  const { render } = await import('../../entry-server.tsx');

  // 执行渲染
  const rendered = await render(url, context);
  const { App, head, state } = rendered;

  // 合并状态
  const finalState = {
    ...preloadedState,
    ...state
  };

  // 创建流
  const stream = new Promise<Readable>((resolve) => {
    const { pipe } = renderToPipeableStream(App, {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        resolve(pipe as unknown as Readable);
      },
      onError(error: unknown, errorInfo: ErrorInfo) {
        console.error('渲染错误:', error, errorInfo);
        // 在生产环境中，可以提供降级UI
      }
    });
  });

  return {
    stream: await stream,
    state: finalState,
    head
  };
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

      // 创建转换流，注入状态和头部信息
      const stateInjector = createStateInjector(state);
      const headInjector = createHeadInjector(head);

      // 设置响应体为流
      ctx.body = stream
        .pipe(stateInjector)
        .pipe(headInjector);

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