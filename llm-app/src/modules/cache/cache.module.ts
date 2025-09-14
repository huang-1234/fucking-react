import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('redis');

        // 检查Redis配置是否存在
        const isRedisConfigured = redisConfig && redisConfig.host;

        if (isRedisConfigured) {
          return {
            store: await redisStore({
              socket: {
                host: redisConfig.host,
                port: redisConfig.port,
              },
              password: redisConfig.password || undefined,
              ttl: 60 * 60 * 1000, // 默认缓存1小时
            }),
            isGlobal: true,
          };
        } else {
          // 如果没有Redis配置，则使用内存缓存
          return {
            isGlobal: true,
            ttl: 60 * 60 * 1000, // 默认缓存1小时
          };
        }
      },
    }),
  ],
  controllers: [CacheController],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
