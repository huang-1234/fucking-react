/**
 * 服务器配置文件
 */
export interface ServerConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
  workers: number;
  cache: {
    enabled: boolean;
    ttl: number; // 缓存过期时间(ms)
    maxSize: number; // 最大缓存项数
  };
  static: {
    path: string;
    maxAge: number;
  };
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// 从环境变量加载配置
const loadFromEnv = (): Partial<ServerConfig> => {
  return {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    host: process.env.HOST || undefined,
    env: (process.env.NODE_ENV as ServerConfig['env']) || undefined,
    workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : undefined,
    cache: {
      enabled: process.env.CACHE_ENABLED === 'true',
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : undefined,
      maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE, 10) : undefined,
    },
    logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || undefined,
  };
};

// 默认配置
const defaultConfig: ServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  env: 'development',
  workers: Math.max(1, Math.min(require('os').cpus().length - 1, 4)), // 最多使用CPU核心数-1，最少1个，最多4个
  cache: {
    enabled: true,
    ttl: 60 * 1000, // 默认1分钟
    maxSize: 1000,
  },
  static: {
    path: './public',
    maxAge: 24 * 60 * 60 * 1000, // 1天
  },
  logLevel: 'info',
};

// 合并配置
const envConfig = loadFromEnv();
const config: ServerConfig = {
  ...defaultConfig,
  ...envConfig,
  cache: {
    ...defaultConfig.cache,
    ...envConfig.cache,
  },
};

export default config;