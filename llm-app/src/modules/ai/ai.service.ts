import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
      // 可配置baseURL用于其他兼容API
      baseURL: this.configService.get('openai.baseUrl'),
    });
  }

  // 非流式调用（用于简单问答）
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      this.logger.error('AI调用失败', error);
      throw new Error(`AI服务暂时不可用: ${error.message}`);
    }
  }

  // 流式响应（用于逐字输出，支持SSE和WebSocket）
  async *createStreamChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        stream: true, // 启用流式
        temperature: 0.7,
        max_tokens: 1000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content; // 逐字产出
        }
      }
    } catch (error: any) {
      this.logger.error('AI流式调用失败', error);
      throw new Error(`AI流式服务错误: ${error.message}`);
    }
  }

  // 生成嵌入向量（Embeddings）
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      this.logger.error('生成嵌入向量失败', error);
      throw new Error(`嵌入向量生成失败: ${error.message}`);
    }
  }
}