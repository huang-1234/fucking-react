/**
 * @codegenie/serverless-express 高级用法示例
 *
 * 这个文件展示了如何使用 @codegenie/serverless-express 的高级功能
 */

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress  from '@codegenie/serverless-express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Handler } from 'aws-lambda';
import { AppModule } from '../app.module';

// 自定义解析器示例
// const eventParser = (event: APIGatewayProxyEvent) => {
//   // 可以在这里对事件进行自定义处理
//   console.log(`Received event: ${JSON.stringify(event)}`);
//   return event;
// };

// 自定义响应格式化器示例
// const responseFormatter = (
//   response: any,
//   callback: Callback<APIGatewayProxyResult>
// ) => {
//   // 可以在这里对响应进行自定义处理
//   if (!response.headers) {
//     response.headers = {};
//   }
//   response.headers['X-Powered-By'] = 'NestJS-Serverless';

//   // 调用原始回调
//   callback(null, response);
// };

// 自定义错误处理器示例
// const errorHandler = (err: Error, callback: Callback<APIGatewayProxyResult>) => {
//   console.error('Error during serverless execution:', err);

//   // 返回自定义错误响应
//   const response = {
//     statusCode: 500,
//     body: JSON.stringify({
//       error: 'Internal Server Error',
//       message: err.message,
//       timestamp: new Date().toISOString(),
//     }),
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Error-Type': err.name,
//     },
//   };

//   callback(null, response);
// };

// 服务器实例
let cachedServer: Handler;

// 创建服务器函数
async function bootstrapServer(): Promise<Handler> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = require('express')();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  // 应用配置
  app.enableCors();
  app.setGlobalPrefix('api');

  await app.init();

  // 配置 serverless-express
  cachedServer = serverlessExpress({
    app: expressApp,

    // 高级配置
    // eventSource: eventParser,
    // responseFormatter,
    // errorHandler,

    // 二进制设置
    // binary: [
    //   'application/octet-stream',
    //   'application/pdf',
    //   'image/*',
    //   'audio/*',
    //   'video/*',
    // ],
  });

  return cachedServer;
}

// Lambda 处理函数
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
): Promise<APIGatewayProxyResult> => {
  // 优化 Lambda 冷启动
  context.callbackWaitsForEmptyEventLoop = false;

  // 获取或创建服务器
  const server = await bootstrapServer();

  // 处理请求
  return server(event, context, callback);
};
