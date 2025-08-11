/**
 * 服务器入口文件
 */
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import config from './config';

// 中间件
import errorMiddleware from './middleware/error';
import cacheMiddleware from './middleware/cache';
import renderMiddleware from './middleware/render';

// 创建服务器
export function createServer() {
  const app = new Koa();

  // 错误处理中间件
  app.use(errorMiddleware());

  // 请求体解析
  app.use(bodyParser());

  // 静态资源服务
  app.use(serve(path.resolve(process.cwd(), 'dist/client'), {
    maxage: config.static.maxAge,
    gzip: true,
    br: true
  }));

  app.use(serve(path.resolve(process.cwd(), 'public'), {
    maxage: config.static.maxAge,
    gzip: true,
    br: true
  }));

  // 缓存中间件
  app.use(cacheMiddleware());

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
  const { startCluster } = require('./cluster');

  // 根据环境决定是否使用集群模式
  if (config.env === 'production' && config.workers > 1) {
    startCluster();
  } else {
    // 开发环境或单进程模式
    const app = createServer();
    const PORT = config.port;

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://${config.host}:${PORT}`);
      console.log(`环境: ${config.env}`);
    });
  }
}