import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

// 预热标志，用于跟踪应用是否已初始化
let isWarmedUp = false;
// 缓存serverless应用实例
let cachedServer: Handler;

// 创建应用实例的函数
async function bootstrapServer(): Promise<Handler> {
  const logger = new Logger('Serverless');
  const startTime = Date.now();

  logger.log('正在初始化NestJS应用...');

  // 创建NestJS应用
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // 减少日志输出
    bodyParser: true,
  });

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 配置CORS
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 初始化应用但不监听端口
  await app.init();

  // 创建serverless应用
  const expressApp = app.getHttpAdapter().getInstance();
  const serverlessApp = serverlessExpress({ app: expressApp });

  const initTime = Date.now() - startTime;
  logger.log(`NestJS应用初始化完成，耗时: ${initTime}ms`);

  return serverlessApp;
}

// Lambda处理函数
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const logger = new Logger('Serverless');
  const startTime = Date.now();

  // 检查是否是预热事件
  if (event.source === 'serverless-plugin-warmup') {
    logger.log('预热事件接收到，保持Lambda实例温暖...');
    return { statusCode: 200, body: 'Lambda预热成功' };
  }

  // 如果是第一次调用，初始化应用
  if (!isWarmedUp) {
    logger.log('冷启动检测到，初始化应用...');
    cachedServer = await bootstrapServer();
    isWarmedUp = true;
    logger.log(`冷启动完成，总耗时: ${Date.now() - startTime}ms`);
  } else {
    logger.log('热启动检测到，使用缓存的应用实例');
  }

  // 处理请求
  return cachedServer(event, context, callback);
};
