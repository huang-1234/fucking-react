// 自定义消息类型，兼容各种模型提供者
export type ChatCompletionMessageParam = {
  role: string; // 使用string类型以兼容不同提供者的角色类型
  content: string;
  name?: string;
};

export interface ModelProvider {
  createChatCompletion(messages: ChatCompletionMessageParam[], options?: any): Promise<string>;
  createStreamChatCompletion(messages: ChatCompletionMessageParam[], options?: any): AsyncGenerator<string, void, unknown>;
  generateEmbedding(text: string, options?: any): Promise<number[]>;
}

export enum ModelProviderType {
  OPENAI = 'openai',
  SPARK = 'spark',
}

export interface ModelConfig {
  type: ModelProviderType;
  apiKey?: string;
  apiSecret?: string;
  appId?: string;
  baseUrl?: string;
  defaultModel?: string;
  [key: string]: any;
}
