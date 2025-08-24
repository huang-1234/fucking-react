/**
 * 延迟队列的TypeScript实现
 * 基于优先队列实现，按照到期时间排序
 */
import { MinPriorityQueue } from '../priority-queue/priority-queue_ts';

/**
 * 延迟队列中的元素
 */
export interface DelayedItem<T> {
  /**
   * 元素值
   */
  item: T;

  /**
   * 到期时间（毫秒时间戳）
   */
  expiry: number;
}

/**
 * 延迟队列接口
 */
export interface IDelayQueue<T> {
  /**
   * 添加元素到队列中，在指定延迟后可用
   * @param item 要添加的元素
   * @param delayMs 延迟时间（毫秒）
   */
  add(item: T, delayMs: number): void;

  /**
   * 尝试获取已到期的元素，如果没有到期元素则返回null
   */
  poll(): T | null;

  /**
   * 获取已到期的元素，如果没有到期元素则阻塞
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
   */
  take(timeout?: number): Promise<T>;

  /**
   * 查看下一个将到期的元素但不移除
   */
  peek(): DelayedItem<T> | null;

  /**
   * 获取队列大小
   */
  size(): number;

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean;

  /**
   * 清空队列
   */
  clear(): void;

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): DelayedItem<T>[];

  /**
   * 获取当前时间到下一个元素到期的剩余时间（毫秒）
   */
  getDelayToNextExpiry(): number;

  /**
   * 添加队列变更监听器
   * @param listener 监听器函数
   */
  addChangeListener(listener: () => void): void;

  /**
   * 移除队列变更监听器
   * @param listener 监听器函数
   */
  removeChangeListener(listener: () => void): void;
}

/**
 * 延迟队列实现
 */
export class DelayQueue<T> implements IDelayQueue<T> {
  private heap: MinPriorityQueue<DelayedItem<T>>;
  private timer: NodeJS.Timeout | null = null;
  private waiters: Array<{
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
    timeoutId?: NodeJS.Timeout;
  }> = [];
  private changeListeners: Array<() => void> = [];

  /**
   * 创建延迟队列
   */
  constructor() {
    this.heap = new MinPriorityQueue<DelayedItem<T>>();
  }

  /**
   * 添加元素到队列中，在指定延迟后可用
   * @param item 要添加的元素
   * @param delayMs 延迟时间（毫秒）
   */
  add(item: T, delayMs: number): void {
    const expiry = Date.now() + delayMs;
    const delayedItem: DelayedItem<T> = { item, expiry };

    // 添加到优先队列，使用到期时间作为优先级
    this.heap.enqueue(delayedItem, expiry);

    // 通知监听器
    this.notifyListeners();

    // 调度下一个到期元素
    this.scheduleNext();
  }

  /**
   * 尝试获取已到期的元素，如果没有到期元素则返回null
   */
  poll(): T | null {
    // 检查队首元素是否已到期
    const next = this.heap.peek();
    if (!next || next.expiry > Date.now()) {
      return null;
    }

    // 移除并返回队首元素
    const delayedItem = this.heap.dequeue();

    // 通知监听器
    this.notifyListeners();

    // 调度下一个到期元素
    this.scheduleNext();

    return delayedItem ? delayedItem.item : null;
  }

  /**
   * 获取已到期的元素，如果没有到期元素则阻塞
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
   */
  async take(timeout?: number): Promise<T> {
    // 先尝试获取已到期的元素
    const item = this.poll();
    if (item !== null) {
      return item;
    }

    // 如果没有到期元素，则等待
    return new Promise<T>((resolve, reject) => {
      const waiter = { resolve, reject, timeoutId: undefined };

      // 如果设置了超时
      if (timeout !== undefined) {
        const timeoutId = setTimeout(() => {
          // 从等待队列中移除
          const index = this.waiters.indexOf(waiter);
          if (index !== -1) {
            this.waiters.splice(index, 1);
          }
          reject(new Error('Delay queue take timed out'));
        }, timeout);

        (waiter as any).timeoutId = timeoutId;
      }

      this.waiters.push(waiter);

      // 调度下一个到期元素
      this.scheduleNext();
    });
  }

  /**
   * 查看下一个将到期的元素但不移除
   */
  peek(): DelayedItem<T> | null {
    return this.heap.peek();
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.heap.size();
  }

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.heap.clear();

    // 取消定时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 通知监听器
    this.notifyListeners();
  }

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): DelayedItem<T>[] {
    return this.heap.getItems().map(item => item.value);
  }

  /**
   * 获取当前时间到下一个元素到期的剩余时间（毫秒）
   */
  getDelayToNextExpiry(): number {
    const next = this.heap.peek();
    if (!next) {
      return -1;
    }

    const now = Date.now();
    return Math.max(0, next.expiry - now);
  }

  /**
   * 添加队列变更监听器
   * @param listener 监听器函数
   */
  addChangeListener(listener: () => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * 移除队列变更监听器
   * @param listener 监听器函数
   */
  removeChangeListener(listener: () => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index !== -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器队列已变更
   */
  private notifyListeners(): void {
    for (const listener of this.changeListeners) {
      listener();
    }
  }

  /**
   * 调度下一个到期元素
   */
  private scheduleNext(): void {
    // 取消现有定时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 获取下一个到期元素
    const next = this.heap.peek();
    if (!next) {
      return;
    }

    // 计算延迟时间
    const now = Date.now();
    const delay = Math.max(0, next.expiry - now);

    // 设置定时器
    this.timer = setTimeout(() => {
      this.timer = null;
      this.expireItems();
    }, delay);
  }

  /**
   * 处理已到期的元素
   */
  private expireItems(): void {
    const now = Date.now();
    let changed = false;

    // 处理所有已到期的元素
    while (!this.heap.isEmpty()) {
      const next = this.heap.peek();
      if (!next || next.expiry > now) {
        break;
      }

      // 移除队首元素
      const delayedItem = this.heap.dequeue();
      changed = true;

      // 如果有等待的线程，唤醒第一个
      if (this.waiters.length > 0 && delayedItem) {
        const waiter = this.waiters.shift()!;
        if (waiter.timeoutId) {
          clearTimeout(waiter.timeoutId);
        }
        waiter.resolve(delayedItem.item);
      }
    }

    // 如果队列发生变化，通知监听器
    if (changed) {
      this.notifyListeners();
    }

    // 调度下一个到期元素
    this.scheduleNext();
  }
}

/**
 * 创建一个延迟队列
 */
export function createDelayQueue<T>(): IDelayQueue<T> {
  return new DelayQueue<T>();
}
