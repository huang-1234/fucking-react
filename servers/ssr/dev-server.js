const fs = require('fs');
const path = require('path');
const { createServer: createViteServer } = require('vite');
const Koa = require('koa');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');

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

  // Body parser
  app.use(bodyParser());

  // API routes
  app.use(async (ctx, next) => {
    if (ctx.path === '/api/home') {
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

  // Handle SSR requests
  app.use(async (ctx) => {
    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'public/index.html'),
        'utf-8'
      );

      // 2. Apply Vite HTML transforms
      template = await vite.transformIndexHtml(ctx.url, template);

      // 3. Load the server entry module
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

      // 4. Render the app
      const { App, head, state } = await render(ctx.url, { ctx });

      // 5. Render to string
      const { renderToPipeableStream } = await vite.ssrLoadModule('react-dom/server');

      // 6. Stream the response
      ctx.status = 200;
      ctx.type = 'html';

      // Insert head content
      template = template.replace('<!--head-outlet-->',
        `${head.title}${head.meta}${head.links}${head.scripts}`);

      // Insert state
      const stateScript = `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`;
      template = template.replace('<!--state-outlet-->', stateScript);

      // Split template for streaming
      const [before, after] = template.split('<!--ssr-outlet-->');

      ctx.res.write(before);

      // Create and pipe the stream
      const stream = renderToPipeableStream(App, {
        onShellReady() {
          stream.pipe(ctx.res);
          ctx.res.write(after);
          ctx.res.end();
        },
        onError(error) {
          console.error('Rendering error:', error);
          ctx.status = 500;
          ctx.res.end('Internal Server Error');
        }
      });

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
  app.listen(5173, () => {
    console.log('SSR development server running at http://localhost:5173');
  });
});