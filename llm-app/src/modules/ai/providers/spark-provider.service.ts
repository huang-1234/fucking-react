import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as WebSocket from 'ws';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ModelProvider, ModelConfig } from '../interfaces/model-provider.interface';

@Injectable()
export class SparkProviderService implements ModelProvider {
  private readonly logger = new Logger(SparkProviderService.name);
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    options?: any,
  ): Promise<string> {
    try {
      const response = await this.sendSparkRequest(messages, false, options);
      return response;
    } catch (error: any) {
      this.logger.error(`讯飞星火调用失败: ${error.message}`, error.stack);
      throw new Error(`讯飞星火服务暂时不可用: ${error.message}`);
    }
  }

  async *createStreamChatCompletion(
    messages: ChatCompletionMessageParam[],
    options?: any,
  ): AsyncGenerator<string, void, unknown> {
    try {
      yield* this.streamSparkResponse(messages, options);
    } catch (error: any) {
      this.logger.error(`讯飞星火流式调用失败: ${error.message}`, error.stack);
      throw new Error(`讯飞星火流式服务错误: ${error.message}`);
    }
  }

  async generateEmbedding(text: string, options?: any): Promise<number[]> {
    // 星火API暂不支持直接生成嵌入向量，这里是一个模拟实现
    // 实际项目中，可以使用其他API或本地模型生成向量
    try {
      // 模拟向量生成，实际项目中应替换为真实API调用
      const mockEmbedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
      const magnitude = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
      return mockEmbedding.map(val => val / magnitude); // 归一化
    } catch (error: any) {
      this.logger.error(`讯飞星火生成嵌入向量失败: ${error.message}`, error.stack);
      throw new Error(`讯飞星火嵌入向量生成失败: ${error.message}`);
    }
  }

  private async sendSparkRequest(
    messages: ChatCompletionMessageParam[],
    stream: boolean = false,
    options?: any,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebSocketUrl();
        const ws = new WebSocket(url);

        let fullResponse = '';

        ws.on('open', () => {
          const data = this.buildRequestData(messages, stream, options);
          ws.send(JSON.stringify(data));
        });

        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.header.code !== 0) {
              ws.close();
              reject(new Error(`讯飞星火API错误: ${response.header.message}`));
              return;
            }

            const content = response.payload.choices.text?.[0]?.content || '';
            fullResponse += content;

            if (response.header.status === 2) {
              ws.close();
              resolve(fullResponse);
            }
          } catch (error) {
            ws.close();
            reject(error);
          }
        });

        ws.on('error', (error) => {
          reject(error);
        });

        // 设置超时
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
            reject(new Error('讯飞星火API请求超时'));
          }
        }, 30000);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async *streamSparkResponse(
    messages: ChatCompletionMessageParam[],
    options?: any,
  ): AsyncGenerator<string, void, unknown> {
    return new Promise(async (resolve, reject) => {
      let streamController: ReadableStreamDefaultController<string>;
      const stream = new ReadableStream<string>({
        start(controller) {
          streamController = controller;
        },
      });

      try {
        const url = this.getWebSocketUrl();
        const ws = new WebSocket(url);

        ws.on('open', () => {
          const data = this.buildRequestData(messages, true, options);
          ws.send(JSON.stringify(data));
        });

        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.header.code !== 0) {
              ws.close();
              streamController.error(new Error(`讯飞星火API错误: ${response.header.message}`));
              return;
            }

            const content = response.payload.choices.text?.[0]?.content || '';
            if (content) {
              streamController.enqueue(content);
            }

            if (response.header.status === 2) {
              ws.close();
              streamController.close();
            }
          } catch (error) {
            ws.close();
            streamController.error(error);
          }
        });

        ws.on('error', (error) => {
          streamController.error(error);
        });

        // 设置超时
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
            streamController.error(new Error('讯飞星火API请求超时'));
          }
        }, 60000);

        // 使用for await读取流
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield value;
          }
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private getWebSocketUrl(): string {
    const apiKey = this.config.apiKey;
    const apiSecret = this.config.apiSecret;
    const appId = this.config.appId;
    const baseUrl = this.config.baseUrl || 'wss://spark-api.xf-yun.com/v3.5/chat';

    if (!apiKey || !apiSecret || !appId) {
      throw new Error('讯飞星火API配置不完整，请检查apiKey、apiSecret和appId');
    }

    const host = new URL(baseUrl).host;
    const path = new URL(baseUrl).pathname;
    const date = new Date().toUTCString();
    const algorithm = 'hmac-sha256';
    const headers = 'host date request-line';
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signatureSha = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
    const authorization = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signatureSha}"`;

    const url = `${baseUrl}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
    return url;
  }

  private buildRequestData(
    messages: ChatCompletionMessageParam[],
    stream: boolean = false,
    options?: any,
  ): any {
    const model = options?.model || this.config.defaultModel || 'general';
    const temperature = options?.temperature || 0.7;
    const maxTokens = options?.maxTokens || 1000;

    // 转换OpenAI消息格式为讯飞星火格式
    const sparkMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'user' : 'user',
      content: msg.content,
    }));

    return {
      header: {
        app_id: this.config.appId,
      },
      parameter: {
        chat: {
          domain: model,
          temperature,
          max_tokens: maxTokens,
          stream,
        },
      },
      payload: {
        message: {
          text: sparkMessages,
        },
      },
    };
  }
}
