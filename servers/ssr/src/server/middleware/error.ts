/**
 * 错误处理中间件
 * 统一处理服务器错误，提供友好的错误页面
 */
import { Context, Next } from 'koa';
import fs from 'fs';
import path from 'path';
import config from '../config';

// 错误日志记录
const logError = (ctx: Context, error: Error) => {
  const { method, url, headers } = ctx.request;
  const userAgent = headers['user-agent'] || 'unknown';
  const ip = ctx.ip;
  const timestamp = new Date().toISOString();

  // 格式化错误日志
  const logEntry = {
    timestamp,
    level: 'error',
    method,
    url,
    ip,
    userAgent,
    status: ctx.status,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  };

  // 在开发环境下打印到控制台
  if (config.env === 'development') {
    console.error('\n[ERROR]', JSON.stringify(logEntry, null, 2));
  } else {
    // 在生产环境下可以将错误写入日志文件或发送到日志服务
    // 这里简单实现写入文件的方式
    const logDir = path.resolve(process.cwd(), 'logs');

    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
};

// 生成错误HTML页面
const generateErrorHtml = (status: number, message: string, stack?: string) => {
  const isDev = config.env === 'development';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error ${status}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
      line-height: 1.5;
    }
    h1 { color: #e53e3e; margin-bottom: 1rem; }
    .message { margin-bottom: 2rem; font-size: 1.2rem; }
    .stack {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 0.25rem;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 0.9rem;
      overflow-x: auto;
    }
    .back-link { margin-top: 2rem; display: inline-block; }
  </style>
</head>
<body>
  <h1>Error ${status}</h1>
  <div class="message">${message}</div>
  ${isDev && stack ? `<pre class="stack">${stack}</pre>` : ''}
  <a href="/" class="back-link">返回首页</a>
</body>
</html>`;
};

// 错误处理中间件
export default function errorMiddleware() {
  return async (ctx: Context, next: Next) => {
    try {
      await next();

      // 处理404错误
      if (ctx.status === 404 && !ctx.body) {
        ctx.status = 404;
        ctx.type = 'html';
        ctx.body = generateErrorHtml(404, '页面未找到');
      }
    } catch (err) {
      // 记录错误
      logError(ctx, err as Error);

      // 设置状态码
      ctx.status = (err as any).status || (err as any).statusCode || 500;

      // 设置响应类型
      ctx.type = 'html';

      // 生成错误页面
      const errorMessage = config.env === 'production'
        ? '服务器内部错误，请稍后再试'
        : (err as Error).message || '未知错误';

      ctx.body = generateErrorHtml(
        ctx.status,
        errorMessage,
        config.env === 'development' ? (err as Error).stack : undefined
      );

      // 触发应用级错误事件
      ctx.app.emit('error', err, ctx);
    }
  };
}