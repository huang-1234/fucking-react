import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PerformanceTracker } from './utils/performance.util';

async function bootstrap() {
  const performanceTracker = new PerformanceTracker('Bootstrap');
  const app = await NestFactory.create(AppModule);
  performanceTracker.checkpoint('应用创建');
  const configService = app.get(ConfigService);
  const port: number = configService.get<number>('port') ?? 3000;

  // 配置CORS
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局守卫
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  performanceTracker.checkpoint('全局守卫设置');

  // 配置Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS LLM API')
    .setDescription('大模型应用服务API文档')
    .setVersion('1.0')
    .addTag('ai', '人工智能相关接口')
    .addTag('chat', '聊天相关接口')
    .addTag('knowledge-base', '知识库相关接口')
    .addTag('auth', '认证相关接口')
    .addTag('users', '用户相关接口')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  performanceTracker.checkpoint('Swagger设置');

  await app.listen(port);
  performanceTracker.checkpoint('应用启动');

  const logger = new Logger('Bootstrap');
  logger.log(`应用已启动，监听端口: http://localhost:${port}`);
  logger.log(`Swagger文档: http://localhost:${port}/swagger`);

  // 打印性能报告
  performanceTracker.printReport();
}

bootstrap();
