import { produce } from 'immer';

/**
 * 状态管理器配置选项
 */
export interface StateManagerOptions {
  enableHistory?: boolean;
  maxHistorySize?: number;
  debug?: boolean;
}

/**
 * 状态变更监听器
 */
export type StateChangeListener<T> = (newState: T, oldState: T, path?: string) => void;

/**
 * 状态管理器 - 用于管理Markdown编辑器的状态
 */
export class StateManager<T extends object> {
  private state: T;
  private initialState: T;
  private history: T[] = [];
  private historyIndex: number = -1;
  private listeners: StateChangeListener<T>[] = [];
  private options: Required<StateManagerOptions>;

  constructor(initialState: T, options?: StateManagerOptions) {
    this.state = initialState;
    this.initialState = { ...initialState };
    this.options = {
      enableHistory: options?.enableHistory !== false,
      maxHistorySize: options?.maxHistorySize || 50,
      debug: options?.debug || false
    };
  }

  /**
   * 获取当前状态
   * @returns 当前状态
   */
  public getState(): T {
    return this.state;
  }

  /**
   * 设置状态
   * @param updater 状态更新函数或新状态
   * @param path 可选的状态路径（用于调试）
   */
  public setState(updater: ((state: T) => void) | Partial<T>, path?: string): void {
    const oldState = this.state;

    // 使用immer进行不可变更新
    if (typeof updater === 'function') {
      this.state = produce(this.state, updater as (draft: T) => void);
    } else {
      this.state = produce(this.state, draft => {
        Object.assign(draft, updater);
      });
    }

    // 添加到历史记录
    if (this.options.enableHistory) {
      // 如果当前不在历史记录的最新位置，则清除未来的历史
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // 添加新状态到历史记录
      this.history.push({ ...this.state });

      // 限制历史记录大小
      if (this.history.length > this.options.maxHistorySize) {
        this.history.shift();
      }

      this.historyIndex = this.history.length - 1;
    }

    // 调试日志
    if (this.options.debug) {
      console.log(`[StateManager] State updated${path ? ` at ${path}` : ''}:`, this.state);
    }

    // 通知监听器
    this.notifyListeners(oldState, path);
  }

  /**
   * 重置状态到初始值
   */
  public resetState(): void {
    const oldState = this.state;
    this.state = { ...this.initialState };

    // 清除历史记录
    if (this.options.enableHistory) {
      this.history = [{ ...this.state }];
      this.historyIndex = 0;
    }

    // 调试日志
    if (this.options.debug) {
      console.log('[StateManager] State reset to initial:', this.state);
    }

    // 通知监听器
    this.notifyListeners(oldState);
  }

  /**
   * 添加状态变更监听器
   * @param listener 监听器函数
   * @returns 移除监听器的函数
   */
  public subscribe(listener: StateChangeListener<T>): () => void {
    this.listeners.push(listener);

    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有监听器状态已变更
   * @param oldState 旧状态
   * @param path 可选的状态路径
   */
  private notifyListeners(oldState: T, path?: string): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state, oldState, path);
      } catch (error) {
        console.error('[StateManager] Error in listener:', error);
      }
    }
  }

  /**
   * 撤销操作（回到上一个状态）
   * @returns 是否成功撤销
   */
  public undo(): boolean {
    if (!this.options.enableHistory || this.historyIndex <= 0) {
      return false;
    }

    this.historyIndex--;
    const oldState = this.state;
    this.state = { ...this.history[this.historyIndex] };

    // 调试日志
    if (this.options.debug) {
      console.log('[StateManager] Undo to state:', this.state);
    }

    // 通知监听器
    this.notifyListeners(oldState);
    return true;
  }

  /**
   * 重做操作（前进到下一个状态）
   * @returns 是否成功重做
   */
  public redo(): boolean {
    if (!this.options.enableHistory || this.historyIndex >= this.history.length - 1) {
      return false;
    }

    this.historyIndex++;
    const oldState = this.state;
    this.state = { ...this.history[this.historyIndex] };

    // 调试日志
    if (this.options.debug) {
      console.log('[StateManager] Redo to state:', this.state);
    }

    // 通知监听器
    this.notifyListeners(oldState);
    return true;
  }

  /**
   * 检查是否可以撤销
   * @returns 是否可以撤销
   */
  public canUndo(): boolean {
    return this.options.enableHistory && this.historyIndex > 0;
  }

  /**
   * 检查是否可以重做
   * @returns 是否可以重做
   */
  public canRedo(): boolean {
    return this.options.enableHistory && this.historyIndex < this.history.length - 1;
  }

  /**
   * 获取历史记录大小
   * @returns 历史记录大小
   */
  public getHistorySize(): number {
    return this.history.length;
  }

  /**
   * 获取当前历史记录索引
   * @returns 当前历史记录索引
   */
  public getHistoryIndex(): number {
    return this.historyIndex;
  }

  /**
   * 清除历史记录但保留当前状态
   */
  public clearHistory(): void {
    if (this.options.enableHistory) {
      this.history = [{ ...this.state }];
      this.historyIndex = 0;
    }
  }
}

export default StateManager;
