import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelProvider, ModelProviderType, ModelConfig } from '../interfaces/model-provider.interface';
import { OpenAiProviderService } from '../providers/openai-provider.service';
import { SparkProviderService } from '../providers/spark-provider.service';

@Injectable()
export class ModelProviderFactory {
  private readonly logger = new Logger(ModelProviderFactory.name);

  constructor(private readonly configService: ConfigService) {}

  createProvider(type: ModelProviderType): ModelProvider {
    const config = this.getProviderConfig(type);

    switch (type) {
      case ModelProviderType.OPENAI:
        return new OpenAiProviderService(config);
      case ModelProviderType.SPARK:
        return new SparkProviderService(config);
      default:
        this.logger.warn(`未知的模型提供者类型: ${type}，使用默认的OpenAI`);
        return new OpenAiProviderService(this.getProviderConfig(ModelProviderType.OPENAI));
    }
  }

  private getProviderConfig(type: ModelProviderType): ModelConfig {
    switch (type) {
      case ModelProviderType.OPENAI:
        return {
          type: ModelProviderType.OPENAI,
          apiKey: this.configService.get<string>('openai.apiKey'),
          baseUrl: this.configService.get<string>('openai.baseUrl'),
          defaultModel: this.configService.get<string>('openai.defaultModel') || 'gpt-3.5-turbo',
        };
      case ModelProviderType.SPARK:
        return {
          type: ModelProviderType.SPARK,
          apiKey: this.configService.get<string>('spark.apiKey'),
          apiSecret: this.configService.get<string>('spark.apiSecret'),
          appId: this.configService.get<string>('spark.appId'),
          baseUrl: this.configService.get<string>('spark.baseUrl'),
          defaultModel: this.configService.get<string>('spark.defaultModel') || 'general',
        };
      default:
        return {
          type: ModelProviderType.OPENAI,
          apiKey: this.configService.get<string>('openai.apiKey'),
          baseUrl: this.configService.get<string>('openai.baseUrl'),
          defaultModel: this.configService.get<string>('openai.defaultModel') || 'gpt-3.5-turbo',
        };
    }
  }
}
