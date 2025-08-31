/**
 * 阻塞队列的TypeScript实现
 * 使用条件变量和互斥锁实现线程同步
 */
import { Mutex, Condition } from '../../lib/condition-variable';

/**
 * 阻塞队列接口
 */
export interface IBlockingQueue<T> {
  /**
   * 将元素添加到队列中，如果队列已满则阻塞
   * @param item 要添加的元素
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
   */
  put(item: T, timeout?: number): Promise<void>;

  /**
   * 尝试将元素添加到队列中，如果队列已满则立即返回false
   * @param item 要添加的元素
   */
  offer(item: T): boolean;

  /**
   * 尝试将元素添加到队列中，如果队列已满则等待指定时间
   * @param item 要添加的元素
   * @param timeout 超时时间（毫秒）
   */
  offerWithTimeout(item: T, timeout: number): Promise<boolean>;

  /**
   * 从队列中取出元素，如果队列为空则阻塞
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
   */
  take(timeout?: number): Promise<T>;

  /**
   * 尝试从队列中取出元素，如果队列为空则立即返回null
   */
  poll(): T | null;

  /**
   * 尝试从队列中取出元素，如果队列为空则等待指定时间
   * @param timeout 超时时间（毫秒）
   */
  pollWithTimeout(timeout: number): Promise<T | null>;

  /**
   * 查看队首元素但不移除
   */
  peek(): T | null;

  /**
   * 获取队列大小
   */
  size(): number;

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean;

  /**
   * 检查队列是否已满
   */
  isFull(): boolean;

  /**
   * 清空队列
   */
  clear(): void;

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): T[];

  /**
   * 获取队列容量
   */
  capacity(): number;

  /**
   * 获取等待的生产者数量
   */
  getWaitingProducers(): number;

  /**
   * 获取等待的消费者数量
   */
  getWaitingConsumers(): number;
}

/**
 * 阻塞队列实现
 */
export class BlockingQueue<T> implements IBlockingQueue<T> {
  private queue: T[] = [];
  private maxSize: number;
  private mutex = new Mutex();
  private notEmpty: Condition;
  private notFull: Condition;
  private waitingProducers = 0;
  private waitingConsumers = 0;

  /**
   * 创建阻塞队列
   * @param maxSize 队列最大容量，默认为Infinity（无限容量）
   */
  constructor(maxSize: number = Infinity) {
    this.maxSize = maxSize;
    this.notEmpty = new Condition(this.mutex);
    this.notFull = new Condition(this.mutex);
  }

  /**
   * 将元素添加到队列中，如果队列已满则阻塞
   * @param item 要添加的元素
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
   */
  async put(item: T, timeout?: number): Promise<void> {
    await this.mutex.acquire();

    try {
      // 如果队列已满，等待空间
      while (this.queue.length >= this.maxSize) {
        this.waitingProducers++;
        try {
          await this.notFull.wait(timeout);
        } finally {
          this.waitingProducers--;
        }
      }

      // 添加元素
      this.queue.push(item);

      // 通知等待的消费者
      this.notEmpty.notify();
    } finally {
      this.mutex.release();
    }
  }

  /**
   * 尝试将元素添加到队列中，如果队列已满则立即返回false
   * @param item 要添加的元素
   */
  offer(item: T): boolean {
    if (this.mutex.isLocked() || this.queue.length >= this.maxSize) {
      return false;
    }

    this.mutex.withLock(() => {
      if (this.queue.length >= this.maxSize) {
        return false;
      }

      this.queue.push(item);
      this.notEmpty.notify();
      return true;
    });

    return true;
  }

  /**
   * 尝试将元素添加到队列中，如果队列已满则等待指定时间
   * @param item 要添加的元素
   * @param timeout 超时时间（毫秒）
   */
  async offerWithTimeout(item: T, timeout: number): Promise<boolean> {
    try {
      await this.put(item, timeout);
      return true;
    } catch (error) {
      // 超时
      return false;
    }
  }

  /**
   * 从队列中取出元素，如果队列为空则阻塞
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
   */
  async take(timeout?: number): Promise<T> {
    await this.mutex.acquire();

    try {
      // 如果队列为空，等待元素
      while (this.queue.length === 0) {
        this.waitingConsumers++;
        try {
          await this.notEmpty.wait(timeout);
        } finally {
          this.waitingConsumers--;
        }
      }

      // 取出元素
      const item = this.queue.shift()!;

      // 通知等待的生产者
      this.notFull.notify();

      return item;
    } finally {
      this.mutex.release();
    }
  }

  /**
   * 尝试从队列中取出元素，如果队列为空则立即返回null
   */
  poll(): T | null {
    if (this.mutex.isLocked() || this.queue.length === 0) {
      return null;
    }

    let item: T | null = null;

    this.mutex.withLock(() => {
      if (this.queue.length === 0) {
        return null;
      }

      item = this.queue.shift()!;
      this.notFull.notify();
      return item;
    });

    return item;
  }

  /**
   * 尝试从队列中取出元素，如果队列为空则等待指定时间
   * @param timeout 超时时间（毫秒）
   */
  async pollWithTimeout(timeout: number): Promise<T | null> {
    try {
      return await this.take(timeout);
    } catch (error) {
      // 超时
      return null;
    }
  }

  /**
   * 查看队首元素但不移除
   */
  peek(): T | null {
    if (this.mutex.isLocked() || this.queue.length === 0) {
      return null;
    }

    return this.queue[0];
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * 检查队列是否已满
   */
  isFull(): boolean {
    return this.queue.length >= this.maxSize;
  }

  /**
   * 清空队列
   */
  async clear(): Promise<void> {
    await this.mutex.acquire();

    try {
      this.queue = [];
      this.notFull.notifyAll();
    } finally {
      this.mutex.release();
    }
  }

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): T[] {
    return [...this.queue];
  }

  /**
   * 获取队列容量
   */
  capacity(): number {
    return this.maxSize;
  }

  /**
   * 获取等待的生产者数量
   */
  getWaitingProducers(): number {
    return this.waitingProducers;
  }

  /**
   * 获取等待的消费者数量
   */
  getWaitingConsumers(): number {
    return this.waitingConsumers;
  }
}

/**
 * 创建一个阻塞队列
 * @param maxSize 队列最大容量，默认为Infinity（无限容量）
 */
export function createBlockingQueue<T>(maxSize: number = Infinity): IBlockingQueue<T> {
  return new BlockingQueue<T>(maxSize);
}
