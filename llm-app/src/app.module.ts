import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ParamValidationMiddleware } from './common/middlewares/param-validation.middleware';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FilesModule } from './modules/files/files.module';
import { RedisCacheModule } from './modules/cache/cache.module';
import { NebulaModule } from './modules/nebula/nebula.module';
import { PlayerModule } from './modules/player/player.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 检查是否使用内存数据库
        const useMemoryDb = configService.get('USE_MEMORY_DB') === 'true';

        if (useMemoryDb) {
          console.log('使用SQLite内存数据库模式');
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: configService.get('NODE_ENV') !== 'production',
            autoLoadEntities: true,
          };
        }

        const dbConfig = configService.get('database');
        console.log('尝试连接PostgreSQL数据库:', dbConfig.host);
        return {
          ...dbConfig,
          autoLoadEntities: true,
        };
      },
    }),
    NebulaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        graphdHost: configService.get<string>('nebula.host') || 'localhost',
        graphdPort: configService.get<number>('nebula.port') || 9669,
        username: configService.get<string>('nebula.username') || 'root',
        password: configService.get<string>('nebula.password') || 'nebula',
        spaceName: configService.get<string>('nebula.space') || 'basketballplayer',
        poolSize: configService.get<number>('nebula.poolSize') || 10,
      }),
    }),
    AiModule,
    ChatModule,
    KnowledgeBaseModule,
    UsersModule,
    AuthModule,
    FilesModule,
    RedisCacheModule,
    PlayerModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ParamValidationMiddleware)
      .forRoutes(
        { path: 'api/chat/sse/stream', method: RequestMethod.ALL },
        { path: 'api/knowledge-base/add', method: RequestMethod.POST },
        { path: 'api/knowledge-base/query', method: RequestMethod.GET },
      );
  }
}
