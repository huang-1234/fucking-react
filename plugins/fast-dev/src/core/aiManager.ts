/**
 * AI管理器 - 负责集成和管理AI功能
 */
import * as vscode from 'vscode';
import { EventBus } from './eventBus';
import { AIEvents } from '../types/events';

// AI提供者接口
export interface IAIProvider {
  id: string;
  name: string;
  description: string;
  isAvailable(): Promise<boolean>;
  processPrompt(prompt: string, options?: any): Promise<string>;
  generateCode(description: string, options?: any): Promise<string>;
  analyzeCode(code: string, options?: any): Promise<any>;
}

export class AIManager {
  private providers: Map<string, IAIProvider> = new Map();
  private activeProviderId: string | null = null;

  constructor(
    private context: vscode.ExtensionContext,
    private eventBus: EventBus
  ) {
    // 从配置中加载默认AI提供者
    this.loadDefaultProvider();

    // 监听配置变更
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('universal-dev-platform.ai')) {
        this.loadDefaultProvider();
      }
    });
  }

  /**
   * 加载默认AI提供者
   */
  private loadDefaultProvider(): void {
    const config = vscode.workspace.getConfiguration('universal-dev-platform');
    const defaultProviderId = config.get<string>('ai.defaultProvider');

    if (defaultProviderId && this.providers.has(defaultProviderId)) {
      this.activeProviderId = defaultProviderId;
    }
  }

  /**
   * 注册AI提供者
   */
  public registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.id, provider);

    // 如果是第一个注册的提供者，则设为活跃提供者
    if (this.providers.size === 1 && !this.activeProviderId) {
      this.activeProviderId = provider.id;
    }

    // 发布AI提供者注册事件
    this.eventBus.emit(AIEvents.PROVIDER_REGISTERED, {
      providerId: provider.id,
      providerName: provider.name
    });
  }

  /**
   * 获取AI提供者
   */
  public getProvider(id: string): IAIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * 获取所有AI提供者
   */
  public getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 获取活跃的AI提供者
   */
  public getActiveProvider(): IAIProvider | undefined {
    if (!this.activeProviderId) {
      return undefined;
    }
    return this.providers.get(this.activeProviderId);
  }

  /**
   * 设置活跃的AI提供者
   */
  public setActiveProvider(id: string): boolean {
    if (!this.providers.has(id)) {
      return false;
    }

    this.activeProviderId = id;

    // 发布AI提供者变更事件
    this.eventBus.emit(AIEvents.PROVIDER_CHANGED, {
      providerId: id,
      providerName: this.providers.get(id)!.name
    });

    return true;
  }

  /**
   * 处理文本提示
   */
  public async processPrompt(prompt: string, options?: any): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('没有可用的AI提供者');
    }

    try {
      // 发布AI处理开始事件
      this.eventBus.emit(AIEvents.PROCESSING_STARTED, {
        prompt,
        providerId: provider.id
      });

      // 处理提示
      const result = await provider.processPrompt(prompt, options);

      // 发布AI处理完成事件
      this.eventBus.emit(AIEvents.PROCESSING_COMPLETED, {
        prompt,
        result,
        providerId: provider.id
      });

      return result;
    } catch (error) {
      // 发布AI处理错误事件
      this.eventBus.emit(AIEvents.PROCESSING_ERROR, {
        prompt,
        error,
        providerId: provider.id
      });

      throw error;
    }
  }

  /**
   * 生成代码
   */
  public async generateCode(description: string, options?: any): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('没有可用的AI提供者');
    }

    try {
      // 发布代码生成开始事件
      this.eventBus.emit(AIEvents.CODE_GENERATION_STARTED, {
        description,
        providerId: provider.id
      });

      // 生成代码
      const code = await provider.generateCode(description, options);

      // 发布代码生成完成事件
      this.eventBus.emit(AIEvents.CODE_GENERATION_COMPLETED, {
        description,
        code,
        providerId: provider.id
      });

      return code;
    } catch (error) {
      // 发布代码生成错误事件
      this.eventBus.emit(AIEvents.CODE_GENERATION_ERROR, {
        description,
        error,
        providerId: provider.id
      });

      throw error;
    }
  }

  /**
   * 分析代码
   */
  public async analyzeCode(code: string, options?: any): Promise<any> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('没有可用的AI提供者');
    }

    try {
      // 发布代码分析开始事件
      this.eventBus.emit(AIEvents.CODE_ANALYSIS_STARTED, {
        codeLength: code.length,
        providerId: provider.id
      });

      // 分析代码
      const analysis = await provider.analyzeCode(code, options);

      // 发布代码分析完成事件
      this.eventBus.emit(AIEvents.CODE_ANALYSIS_COMPLETED, {
        codeLength: code.length,
        analysis,
        providerId: provider.id
      });

      return analysis;
    } catch (error) {
      // 发布代码分析错误事件
      this.eventBus.emit(AIEvents.CODE_ANALYSIS_ERROR, {
        codeLength: code.length,
        error,
        providerId: provider.id
      });

      throw error;
    }
  }
}
