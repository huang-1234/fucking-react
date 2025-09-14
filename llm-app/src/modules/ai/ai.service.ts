import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { CacheService } from '../cache/cache.service';
import { ModelProviderFactory } from './factories/model-provider.factory';
import { ModelProviderType, ModelProvider } from './interfaces/model-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly providers: Map<ModelProviderType, ModelProvider> = new Map();
  private defaultProvider: ModelProviderType = ModelProviderType.OPENAI;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private modelProviderFactory: ModelProviderFactory,
  ) {
    // 初始化默认提供者
    this.initProviders();
  }

  private initProviders(): void {
    // 初始化OpenAI提供者
    this.providers.set(
      ModelProviderType.OPENAI,
      this.modelProviderFactory.createProvider(ModelProviderType.OPENAI)
    );

    // 如果配置了星火API，则初始化星火提供者
    const sparkApiKey = this.configService.get<string>('spark.apiKey');
    if (sparkApiKey) {
      this.providers.set(
        ModelProviderType.SPARK,
        this.modelProviderFactory.createProvider(ModelProviderType.SPARK)
      );
    }

    // 设置默认提供者
    const defaultProvider = this.configService.get<string>('ai.defaultProvider');
    if (defaultProvider && Object.values(ModelProviderType).includes(defaultProvider as ModelProviderType)) {
      this.defaultProvider = defaultProvider as ModelProviderType;
    }
  }

  private getProvider(type?: ModelProviderType): ModelProvider {
    const providerType = type || this.defaultProvider;
    const provider = this.providers.get(providerType);

    if (!provider) {
      this.logger.warn(`未找到提供者: ${providerType}，使用默认提供者: ${this.defaultProvider}`);
      return this.providers.get(this.defaultProvider)!;
    }

    return provider;
  }

  // 非流式调用（用于简单问答）
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
    providerType?: ModelProviderType,
  ): Promise<string> {
    try {
      const provider = this.getProvider(providerType);
      return await provider.createChatCompletion(messages, { model });
    } catch (error: any) {
      this.logger.error('AI调用失败', error);
      throw new Error(`AI服务暂时不可用: ${error.message}`);
    }
  }

  // 流式响应（用于逐字输出，支持SSE和WebSocket）
  async *createStreamChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
    providerType?: ModelProviderType,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const provider = this.getProvider(providerType);
      yield* provider.createStreamChatCompletion(messages, { model });
    } catch (error: any) {
      this.logger.error('AI流式调用失败', error);
      throw new Error(`AI流式服务错误: ${error.message}`);
    }
  }

  // 生成嵌入向量（Embeddings）
  async generateEmbedding(
    text: string,
    model: string = 'text-embedding-ada-002',
    providerType?: ModelProviderType,
  ): Promise<number[]> {
    // 创建缓存键
    const cacheKey = `embedding:${Buffer.from(text).toString('base64').substring(0, 32)}`;

    try {
      // 尝试从缓存获取
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const provider = this.getProvider(providerType);
          return await provider.generateEmbedding(text, { model });
        },
        // 嵌入向量缓存时间更长，因为它们不会改变
        24 * 60 * 60 * 1000, // 24小时
      );
    } catch (error: any) {
      this.logger.error('生成嵌入向量失败', error);
      throw new Error(`嵌入向量生成失败: ${error.message}`);
    }
  }
}