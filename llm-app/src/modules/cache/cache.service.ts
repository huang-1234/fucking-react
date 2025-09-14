import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 60 * 60 * 1000; // 默认缓存1小时

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error: any) {
      this.logger.error(`获取缓存失败: ${error.message}`, error.stack);
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl || this.defaultTTL);
    } catch (error: any) {
      this.logger.error(`设置缓存失败: ${error.message}`, error.stack);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error: any) {
      this.logger.error(`删除缓存失败: ${error.message}`, error.stack);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error: any) {
      this.logger.error(`重置缓存失败: ${error.message}`, error.stack);
    }
  }

  // 获取缓存或执行函数并缓存结果
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = await this.get<T>(key);

    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}
