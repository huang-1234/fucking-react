/**
 * Webpack 开发服务器
 */
import path from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import webpack from 'webpack';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES 模块中获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建Koa应用
const app = new Koa();

// 静态资源服务
app.use(serve(path.resolve(__dirname, 'dist/client')));
app.use(serve(path.resolve(__dirname, 'public')));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

// 构建客户端和服务端代码
async function buildCode() {
  console.log('构建客户端代码...');

  // 动态导入 webpack 配置
  const { default: clientConfig } = await import('./webpack.client.js');
  const clientCompiler = webpack(clientConfig);

  return new Promise((resolve, reject) => {
    clientCompiler.run((err, stats) => {
      if (err) {
        console.error('客户端构建失败:', err);
        return reject(err);
      }

      console.log('客户端构建完成');
      console.log('构建服务端代码...');

      // 动态导入服务端配置
      import('./webpack.server.js').then(({ default: serverConfig }) => {
        const serverCompiler = webpack(serverConfig);

        serverCompiler.run((err, stats) => {
          if (err) {
            console.error('服务端构建失败:', err);
            return reject(err);
          }

          console.log('服务端构建完成');
          resolve();
        });
      }).catch(err => {
        console.error('加载服务端配置失败:', err);
        reject(err);
      });
    });
  });
}

// 启动开发服务器
async function startDevServer() {
  try {
    await buildCode();
    console.log('开发服务器启动成功');
  } catch (err) {
    console.error('开发服务器启动失败:', err);
  }
}

startDevServer();