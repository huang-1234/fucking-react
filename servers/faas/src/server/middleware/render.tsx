/**
 * SSR渲染中间件
 * 处理React服务端渲染
 */
import { Context, Next } from 'koa';
import { renderToStream, createFallbackHTML } from '../../core/ssr-engine';

/**
 * SSR渲染中间件
 */
export default function renderMiddleware(options: {
  clientEntryPath?: string;
  assetsPrefix?: string;
  templatePath?: string;
} = {}) {
  const {
    clientEntryPath = '/client.js',
    assetsPrefix = '',
    templatePath
  } = options;

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
      const { stream, state, head, statusCode } = await renderToStream({
        url: ctx.url,
        context: { ctx },
        clientEntryPath,
        assetsPrefix,
        templatePath
      });

      // 设置状态码
      ctx.status = statusCode;

      // 设置响应头
      ctx.type = 'html';
      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.set('Transfer-Encoding', 'chunked');

      // 设置响应体为流
      ctx.body = stream;

    } catch (err) {
      console.error('SSR渲染错误:', err);

      // 如果SSR渲染失败，降级为客户端渲染
      const fallbackHtml = createFallbackHTML(undefined, err as Error);

      ctx.status = 200;
      ctx.type = 'html';
      ctx.body = fallbackHtml;
    }
  };
}