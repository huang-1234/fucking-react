export default () => ({
  ai: {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
  },
  port: parseInt(process.env.PORT || '3000', 10),
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL,
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
  },
  spark: {
    apiKey: process.env.SPARK_API_KEY,
    apiSecret: process.env.SPARK_API_SECRET,
    appId: process.env.SPARK_APP_ID,
    baseUrl: process.env.SPARK_BASE_URL || 'wss://spark-api.xf-yun.com/v3.5/chat',
    defaultModel: process.env.SPARK_DEFAULT_MODEL || 'general',
  },
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'llm_app',
    synchronize: process.env.NODE_ENV !== 'production', // 开发环境自动同步数据库结构
    logging: process.env.NODE_ENV !== 'production',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});