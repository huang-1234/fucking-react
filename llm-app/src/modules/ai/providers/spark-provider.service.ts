import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as WebSocket from 'ws';
import { ModelProvider, ModelConfig, ChatCompletionMessageParam } from '../interfaces/model-provider.interface';
import { OpenAiProviderService } from './openai-provider.service';

@Injectable()
export class SparkProviderService implements ModelProvider {
  private readonly logger = new Logger(SparkProviderService.name);
  private config: ModelConfig;
  private openaiProvider: OpenAiProviderService;

  constructor(config: ModelConfig) {
    this.config = config;
    // 创建OpenAI提供者用于生成嵌入向量
    this.openaiProvider = new OpenAiProviderService(config);
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
      // 使用简化版的流式响应实现
      const url = this.getWebSocketUrl();
      const ws = new WebSocket(url);

      // 等待连接建立
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('连接超时')), 10000);
        ws.once('open', () => {
          clearTimeout(timeout);
          resolve();
        });
        ws.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      // 发送请求
      const data = this.buildRequestData(messages, true, options);
      ws.send(JSON.stringify(data));

      try {
        // 处理响应流
        let isDone = false;
        while (!isDone) {
          const message = await new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('响应超时')), 30000);
            ws.once('message', (data) => {
              clearTimeout(timeout);
              try {
                resolve(JSON.parse(data.toString()));
              } catch (err) {
                reject(err);
              }
            });
            ws.once('error', (err) => {
              clearTimeout(timeout);
              reject(err);
            });
          });

          // 检查响应状态
          if (message.header.code !== 0) {
            throw new Error(`讯飞星火API错误: ${message.header.message}`);
          }

          // 获取内容
          const content = message.payload.choices.text?.[0]?.content || '';
          if (content) {
            yield content;
          }

          // 检查是否是最后一条消息
          if (message.header.status === 2) {
            isDone = true;
          }
        }
      } finally {
        // 确保WebSocket连接关闭
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
    } catch (error: any) {
      this.logger.error(`讯飞星火流式调用失败: ${error.message}`, error.stack);
      throw new Error(`讯飞星火流式服务错误: ${error.message}`);
    }
  }

  async generateEmbedding(text: string, options?: any): Promise<number[]> {
    // 星火API暂不支持直接生成嵌入向量，这里是一个模拟实现
    // 实际项目中，可以使用其他API或本地模型生成向量
    // 通过text和options生成向量
    try {
      // 使用OpenAI提供者生成嵌入向量
      const vector = await this.openaiProvider.generateEmbedding(text, options);
      return vector;
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
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): any {
    const model = options?.model || this.config.defaultModel || 'general';
    const temperature = options?.temperature || 0.7;
    const maxTokens = options?.maxTokens || 1000;

    // 转换OpenAI消息格式为讯飞星火格式
    const sparkMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user', // 星火只支持assistant和user两种角色
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