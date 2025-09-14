import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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
