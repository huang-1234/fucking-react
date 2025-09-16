import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import { fileURLToPath } from 'url';
import Router from 'koa-router';

// Import SSE middleware and routes
import sseMiddleware from './sse-middleware.js';
import sseRoutes from './sse-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug logger middleware
const loggerMiddleware = async (ctx, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} - Request received`);

  try {
    await next();
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} - Response: ${ctx.status} (${ms}ms)`);
  } catch (err) {
    const ms = Date.now() - start;
    console.error(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} - Error: ${err.message} (${ms}ms)`);
    throw err;
  }
};

async function createServer() {
  const app = new Koa();

  // Add logger middleware
  app.use(loggerMiddleware);

  console.log('Creating Vite server...');
  // Create Vite server in middleware mode with HMR support
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    server: {
      middlewareMode: true
    },
    appType: 'custom'
  });
  console.log('Vite server created successfully');

  // Use Vite's connect middleware
  app.use(async (ctx, next) => {
    await vite.middlewares.handle(ctx.req, ctx.res, next);
  });

  // Serve static files
  console.log('Setting up static file serving...');
  app.use(serve(path.resolve(__dirname, 'public'), {
    maxage: 0,
    gzip: true
  }));

  // Body parser
  console.log('Setting up body parser...');
  app.use(bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    strict: true,
    onerror: (err, ctx) => {
      console.error('Body parser error:', err);
      ctx.status = 422;
      ctx.body = {
        error: 'Unable to parse request body'
      };
    }
  }));

  // SSE middleware
  console.log('Setting up SSE middleware...');
  app.use(sseMiddleware({
    heartbeatInterval: 30000,
    retry: 3000
  }));

  // Register SSE routes
  console.log('Registering SSE routes...');
  app.use(sseRoutes.routes());
  app.use(sseRoutes.allowedMethods());

  // API routes
  console.log('Setting up API routes...');
  const apiRouter = new Router({ prefix: '/api' });

  apiRouter.get('/home', (ctx) => {
    console.log('API home endpoint called');
    ctx.type = 'application/json';
    ctx.body = {
      title: 'React 19 SSR 演示',
      subtitle: '使用React 19、Koa和TypeScript实现的高性能SSR应用',
      description: 'React 19 SSR演示首页，展示最新的React服务端渲染功能',
      features: [
        {
          title: 'React 19 流式SSR',
          description: '利用React 19的最新流式渲染功能，实现更快的首屏加载和更好的用户体验。'
        },
        {
          title: '高性能Koa服务器',
          description: '基于Koa构建的高性能服务器，支持集群模式和多级缓存策略。'
        },
        {
          title: 'TypeScript支持',
          description: '全栈TypeScript支持，提供类型安全和更好的开发体验。'
        },
        {
          title: '多级缓存',
          description: '实现页面级、组件级和数据级缓存，显著提升性能。'
        },
        {
          title: 'SSE实时推送',
          description: '使用Server-Sent Events实现服务器到客户端的实时数据推送。'
        }
      ]
    };
  });

  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  // 添加错误处理中间件
  console.log('Setting up error handling middleware...');
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error('Server error:', err);
      ctx.status = err.status || 500;
      ctx.body = {
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
      };
      ctx.app.emit('error', err, ctx);
    }
  });

  // Handle SSR requests
  console.log('Setting up SSR handler...');
  app.use(async (ctx) => {
    // Skip SSE requests which should have been handled by the SSE middleware
    if (ctx.path.endsWith('/events') || ctx.path.includes('/stream') || ctx.headers.accept === 'text/event-stream') {
      console.log('SSE request detected, skipping SSR handling');
      return;
    }

    console.log('SSR request:', ctx.url);
    try {
      // 检查是否有 public/index.html 文件
      let template;
      const templatePath = path.resolve(__dirname, 'public/index.html');

      if (fs.existsSync(templatePath)) {
        console.log('Using template from file:', templatePath);
        template = fs.readFileSync(templatePath, 'utf-8');
      } else {
        console.log('Using default template');
        // 使用默认模板
        template = `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>React 19 SSR Demo</title>
          <!--head-outlet-->
        </head>
        <body>
          <div id="root"><!--ssr-outlet--></div>
          <!--state-outlet-->
          <script type="module" src="/src/client/entry-client.tsx"></script>
        </body>
        </html>`;
      }

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(ctx.url, template);

      // 添加 Vite HMR 客户端脚本
      template = template.replace(
        '</head>',
        `<script type="module" src="/@vite/client"></script></head>`
      );

      // 模拟渲染结果
      const head = {
        title: '<title>React 19 SSR Demo</title>',
        meta: '<meta name="description" content="React 19 SSR Demo with SSE support">',
        links: '',
        scripts: ''
      };

      const state = {
        pageData: {
          '/': {
            title: 'React 19 SSR 演示',
            subtitle: '使用React 19、Koa和TypeScript实现的高性能SSR应用',
            content: '这是一个使用React 19、Koa和TypeScript实现的高性能SSR应用，支持SSE实时推送'
          }
        }
      };

      // Insert head content
      template = template.replace('<!--head-outlet-->',
        `${head.title}${head.meta}${head.links}${head.scripts}`);

      // Insert state
      const stateScript = `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`;
      template = template.replace('<!--state-outlet-->', stateScript);

      // Add SSE client script
      const sseClientScript = `
        <script>
          // SSE客户端连接
          function connectSSE() {
            console.log('Connecting to SSE endpoint...');
            const eventSource = new EventSource('/api/events');

            eventSource.onopen = (event) => {
              console.log('SSE连接已建立');
            };

            eventSource.addEventListener('connected', (event) => {
              const data = JSON.parse(event.data);
              console.log('SSE连接ID:', data.id);
            });

            eventSource.addEventListener('init', (event) => {
              const data = JSON.parse(event.data);
              console.log('SSE初始数据:', data.messages);
            });

            eventSource.addEventListener('message', (event) => {
              const data = JSON.parse(event.data);
              console.log('SSE消息:', data);
            });

            eventSource.addEventListener('system', (event) => {
              const data = JSON.parse(event.data);
              console.log('系统状态更新:', data);
            });

            eventSource.onerror = (error) => {
              console.error('SSE错误:', error);
              eventSource.close();
              // 尝试重连
              setTimeout(connectSSE, 3000);
            };

            return eventSource;
          }

          // 页面加载完成后连接SSE
          window.addEventListener('load', () => {
            console.log('Page loaded, connecting to SSE...');
            const eventSource = connectSSE();

            // 页面卸载时关闭连接
            window.addEventListener('beforeunload', () => {
              if (eventSource) {
                console.log('Closing SSE connection...');
                eventSource.close();
              }
            });
          });
        </script>
      `;

      template = template.replace('</body>', `${sseClientScript}</body>`);

      // 返回简化的 HTML 响应
      ctx.status = 200;
      ctx.type = 'html';
      ctx.body = template.replace('<!--ssr-outlet-->', '<div>React 19 SSR Demo with SSE - 开发模式</div>');
      console.log('SSR response sent successfully');

    } catch (e) {
      // If an error is caught, send back to client
      console.error('SSR error:', e);

      ctx.status = 500;
      ctx.body = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <div id="root">
            <h1>Development Server Error</h1>
            <p>${e.message}</p>
            <pre>${e.stack}</pre>
          </div>
          <script>
            window.__SSR_ERROR__ = true;
            window.__PRELOADED_STATE__ = {};
          </script>
          <script type="module" src="/@vite/client"></script>
          <script type="module" src="/src/client/entry-client.tsx"></script>
        </body>
        </html>
      `;
    }
  });

  return app;
}

console.log('Starting server...');
createServer().then(app => {
  app.listen(5175, () => {
    console.log('SSR development server with SSE support running at http://localhost:5175');
    console.log('SSE endpoints available at:');
    console.log('- http://localhost:5175/api/events (General events)');
    console.log('- http://localhost:5175/api/stream/system (System status updates)');

    // Send a test message every 10 seconds
    setInterval(() => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Sending test message to all connected clients`);

      // Get all connections from the app context
      const connections = app.context.state?.sse?.connections;
      if (connections && connections.size > 0) {
        console.log(`Active SSE connections: ${connections.size}`);
        app.context.state.sse.broadcast('message', {
          type: 'info',
          content: `Test message at ${timestamp}`,
          timestamp: Date.now()
        });
      } else {
        console.log('No active SSE connections');
      }
    }, 10000);
  });
});
