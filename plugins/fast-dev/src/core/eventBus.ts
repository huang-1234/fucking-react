/**
 * 事件总线 - 插件间通信的核心机制
 * 实现发布-订阅模式，用于解耦各个功能模块
 */
import { EventEmitter } from 'events';

export class EventBus {
  private emitter: EventEmitter;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    this.emitter = new EventEmitter();
    // 设置最大监听器数量，避免内存泄漏警告
    this.emitter.setMaxListeners(100);
  }

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  public on(event: string, handler: Function): () => void {
    // 将处理函数转换为适当的类型
    const typedHandler = (...args: any[]) => handler(...args);

    // 注册事件处理器
    this.emitter.on(event, typedHandler);

    // 记录事件处理器，用于清理
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // 返回取消订阅的函数
    return () => this.off(event, handler);
  }

  /**
   * 订阅事件（只触发一次）
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  public once(event: string, handler: Function): () => void {
    // 将处理函数转换为适当的类型
    const typedHandler = (...args: any[]) => {
      handler(...args);
      // 自动从记录中移除
      if (this.eventHandlers.has(event)) {
        this.eventHandlers.get(event)!.delete(handler);
      }
    };

    // 注册一次性事件处理器
    this.emitter.once(event, typedHandler);

    // 记录事件处理器，用于清理
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // 返回取消订阅的函数
    return () => this.off(event, handler);
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  public off(event: string, handler: Function): void {
    // 从事件发射器中移除处理器
    this.emitter.removeListener(event, handler as any);

    // 从记录中移除处理器
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event)!.delete(handler);
    }
  }

  /**
   * 发布事件
   * @param event 事件名称
   * @param data 事件数据
   */
  public emit(event: string, data?: any): void {
    this.emitter.emit(event, data);
  }

  /**
   * 清理特定事件的所有处理器
   * @param event 事件名称
   */
  public clearEvent(event: string): void {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)!;
      handlers.forEach(handler => {
        this.emitter.removeListener(event, handler as any);
      });
      handlers.clear();
    }
  }

  /**
   * 清理所有事件处理器
   */
  public clearAll(): void {
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.emitter.removeListener(event, handler as any);
      });
      handlers.clear();
    });
    this.eventHandlers.clear();
  }

  /**
   * 获取事件处理器数量
   * @param event 事件名称
   */
  public listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }

  /**
   * 获取所有事件名称
   */
  public eventNames(): (string | symbol)[] {
    return this.emitter.eventNames();
  }
}
