import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ModelProvider, ModelConfig, ChatCompletionMessageParam } from '../interfaces/model-provider.interface';

@Injectable()
export class OpenAiProviderService implements ModelProvider {
  private readonly logger = new Logger(OpenAiProviderService.name);
  private openai: OpenAI;
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    options?: any,
  ): Promise<string> {
    try {
      const model = options?.model || this.config.defaultModel || 'gpt-3.5-turbo';
      const completion = await this.openai.chat.completions.create({
        model,
        messages: messages as any, // 类型转换以兼容OpenAI API
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      this.logger.error(`OpenAI调用失败: ${error.message}`, error.stack);
      throw new Error(`OpenAI服务暂时不可用: ${error.message}`);
    }
  }

  async *createStreamChatCompletion(
    messages: ChatCompletionMessageParam[],
    options?: any,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const model = options?.model || this.config.defaultModel || 'gpt-3.5-turbo';
      const stream = await this.openai.chat.completions.create({
        model,
        messages: messages as any, // 类型转换以兼容OpenAI API
        stream: true,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error: any) {
      this.logger.error(`OpenAI流式调用失败: ${error.message}`, error.stack);
      throw new Error(`OpenAI流式服务错误: ${error.message}`);
    }
  }

  async generateEmbedding(text: string, options?: any): Promise<number[]> {
    try {
      const model = options?.model || 'text-embedding-ada-002';
      const response = await this.openai.embeddings.create({
        model,
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      this.logger.error(`OpenAI生成嵌入向量失败: ${error.message}`, error.stack);
      throw new Error(`OpenAI嵌入向量生成失败: ${error.message}`);
    }
  }
}
