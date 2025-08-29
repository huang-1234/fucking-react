import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = new Koa();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Use Vite's connect middleware
  app.use(async (ctx, next) => {
    await vite.middlewares.handle(ctx.req, ctx.res, next);
  });

  // Serve static files
  app.use(serve(path.resolve(__dirname, 'public'), {
    maxage: 0,
    gzip: true
  }));

  // Body parser - 添加错误处理和配置选项
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

  // API routes
  app.use(async (ctx, next) => {
    // 只处理 GET 请求，避免 body 解析问题
    if (ctx.path === '/api/home' && ctx.method === 'GET') {
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
          }
        ]
      };
      return;
    }
    await next();
  });

  // 添加错误处理中间件
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
  app.use(async (ctx) => {
    try {
      // 检查是否有 public/index.html 文件
      let template;
      const templatePath = path.resolve(__dirname, 'public/index.html');

      if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf-8');
      } else {
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

      // 模拟渲染结果
      const head = {
        title: '<title>React 19 SSR Demo</title>',
        meta: '<meta name="description" content="React 19 SSR Demo">',
        links: '',
        scripts: ''
      };

      const state = {
        pageData: {
          '/': {
            title: 'React 19 SSR 演示',
            subtitle: '使用React 19、Koa和TypeScript实现的高性能SSR应用',
            content: '这是一个使用React 19、Koa和TypeScript实现的高性能SSR应用'
          }
        }
      };

      // Insert head content
      template = template.replace('<!--head-outlet-->',
        `${head.title}${head.meta}${head.links}${head.scripts}`);

      // Insert state
      const stateScript = `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`;
      template = template.replace('<!--state-outlet-->', stateScript);

      // 返回简化的 HTML 响应
      ctx.status = 200;
      ctx.type = 'html';
      ctx.body = template.replace('<!--ssr-outlet-->', '<div>React 19 SSR Demo - 开发模式</div>');

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

createServer().then(app => {
  app.listen(5174, () => {
    console.log('SSR development server running at http://localhost:5174');
  });
});