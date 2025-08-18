/**
 * 服务器入口文件
 */
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import path from 'path';

// 中间件
import errorMiddleware from './middleware/error';
import cacheMiddleware from './middleware/cache';
import renderMiddleware from './middleware/render';

// 配置
const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  host: process.env.HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  static: {
    path: './dist/client',
    maxAge: 24 * 60 * 60 * 1000 // 1天
  },
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 60 * 1000 // 默认1分钟
  }
};

// 创建服务器
export function createServer() {
  const app = new Koa();

  // 错误处理中间件
  app.use(errorMiddleware());

  // 请求体解析
  app.use(bodyParser());

  // 静态资源服务
  app.use(serve(path.resolve(process.cwd(), config.static.path), {
    maxage: config.static.maxAge,
    gzip: true
  }));

  // API路由
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

  // 缓存中间件
  app.use(cacheMiddleware({
    enabled: config.cache.enabled,
    ttl: config.cache.ttl
  }));

  // SSR渲染中间件
  app.use(renderMiddleware());

  // 全局错误处理
  app.on('error', (err, ctx) => {
    if (config.env === 'development') {
      console.error('服务器错误', err);
    }
    // 在生产环境中，可以将错误发送到监控系统
  });

  return app;
}

// 直接运行文件时启动服务器
if (require.main === module) {
  const app = createServer();
  const PORT = config.port;

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://${config.host}:${PORT}`);
    console.log(`环境: ${config.env}`);
  });
}