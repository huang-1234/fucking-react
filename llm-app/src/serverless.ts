import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@codegenie/serverless-express';
import { AppModule } from './app.module';
import { Context, Handler, APIGatewayProxyEvent } from 'aws-lambda';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

let server: Handler;

async function createServer(): Promise<Handler> {
  const expressApp = require('express')();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  const configService = app.get(ConfigService);

  // 配置CORS
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  await app.init();

  const logger = new Logger('Serverless');
  logger.log('Serverless NestJS应用已初始化');

  return serverlessExpress({
    app: expressApp,
    binaryMimeTypes: ['application/octet-stream', 'image/*']
  });
}

import { Callback } from 'aws-lambda';
export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  server = server ?? (await createServer());
  return server?.(event, context, callback);
};
