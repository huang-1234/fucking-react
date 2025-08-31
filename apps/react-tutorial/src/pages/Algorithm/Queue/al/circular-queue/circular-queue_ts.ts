/**
 * 循环队列的TypeScript实现
 * 使用定长数组和头尾指针实现高效的FIFO队列
 */

/**
 * 循环队列接口
 */
export interface ICircularQueue<T> {
  /**
   * 入队操作
   * @param item 要入队的元素
   * @returns 是否成功入队
   */
  enqueue(item: T): boolean;

  /**
   * 出队操作
   * @returns 队首元素，如果队列为空则返回null
   */
  dequeue(): T | null;

  /**
   * 查看队首元素但不移除
   * @returns 队首元素，如果队列为空则返回null
   */
  front(): T | null;

  /**
   * 查看队尾元素但不移除
   * @returns 队尾元素，如果队列为空则返回null
   */
  rear(): T | null;

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean;

  /**
   * 检查队列是否已满
   */
  isFull(): boolean;

  /**
   * 获取队列大小
   */
  size(): number;

  /**
   * 获取队列容量
   */
  capacity(): number;

  /**
   * 清空队列
   */
  clear(): void;

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): (T | null)[];

  /**
   * 获取头指针位置
   */
  getHeadIndex(): number;

  /**
   * 获取尾指针位置
   */
  getTailIndex(): number;
}

/**
 * 循环队列实现
 */
export class CircularQueue<T> implements ICircularQueue<T> {
  private buffer: (T | null)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private readonly maxSize: number;

  /**
   * 创建循环队列
   * @param capacity 队列容量
   */
  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    this.maxSize = capacity;
    this.buffer = new Array(capacity).fill(null);
  }

  /**
   * 入队操作
   * @param item 要入队的元素
   * @returns 是否成功入队
   */
  enqueue(item: T): boolean {
    if (this.isFull()) {
      return false;
    }

    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.maxSize;
    this.count++;
    return true;
  }

  /**
   * 出队操作
   * @returns 队首元素，如果队列为空则返回null
   */
  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.buffer[this.head];
    this.buffer[this.head] = null;
    this.head = (this.head + 1) % this.maxSize;
    this.count--;
    return item;
  }

  /**
   * 查看队首元素但不移除
   * @returns 队首元素，如果队列为空则返回null
   */
  front(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.buffer[this.head];
  }

  /**
   * 查看队尾元素但不移除
   * @returns 队尾元素，如果队列为空则返回null
   */
  rear(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    // 计算尾部元素的索引
    const rearIndex = (this.tail - 1 + this.maxSize) % this.maxSize;
    return this.buffer[rearIndex];
  }

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * 检查队列是否已满
   */
  isFull(): boolean {
    return this.count === this.maxSize;
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.count;
  }

  /**
   * 获取队列容量
   */
  capacity(): number {
    return this.maxSize;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): (T | null)[] {
    return [...this.buffer];
  }

  /**
   * 获取头指针位置
   */
  getHeadIndex(): number {
    return this.head;
  }

  /**
   * 获取尾指针位置
   */
  getTailIndex(): number {
    return this.tail;
  }
}

/**
 * 创建一个循环队列
 * @param capacity 队列容量
 */
export function createCircularQueue<T>(capacity: number): ICircularQueue<T> {
  return new CircularQueue<T>(capacity);
}

/**
 * 覆盖式循环队列
 * 当队列已满时，新元素会覆盖最旧的元素
 */
export class OverwritingCircularQueue<T> implements ICircularQueue<T> {
  private buffer: (T | null)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private readonly maxSize: number;

  /**
   * 创建覆盖式循环队列
   * @param capacity 队列容量
   */
  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    this.maxSize = capacity;
    this.buffer = new Array(capacity).fill(null);
  }

  /**
   * 入队操作，如果队列已满则覆盖最旧的元素
   * @param item 要入队的元素
   * @returns 始终返回true
   */
  enqueue(item: T): boolean {
    // 如果队列已满，移动头指针
    if (this.isFull()) {
      this.head = (this.head + 1) % this.maxSize;
      this.count--;
    }

    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.maxSize;
    this.count++;
    return true;
  }

  /**
   * 出队操作
   * @returns 队首元素，如果队列为空则返回null
   */
  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.buffer[this.head];
    this.buffer[this.head] = null;
    this.head = (this.head + 1) % this.maxSize;
    this.count--;
    return item;
  }

  /**
   * 查看队首元素但不移除
   * @returns 队首元素，如果队列为空则返回null
   */
  front(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.buffer[this.head];
  }

  /**
   * 查看队尾元素但不移除
   * @returns 队尾元素，如果队列为空则返回null
   */
  rear(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    // 计算尾部元素的索引
    const rearIndex = (this.tail - 1 + this.maxSize) % this.maxSize;
    return this.buffer[rearIndex];
  }

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * 检查队列是否已满
   */
  isFull(): boolean {
    return this.count === this.maxSize;
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.count;
  }

  /**
   * 获取队列容量
   */
  capacity(): number {
    return this.maxSize;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): (T | null)[] {
    return [...this.buffer];
  }

  /**
   * 获取头指针位置
   */
  getHeadIndex(): number {
    return this.head;
  }

  /**
   * 获取尾指针位置
   */
  getTailIndex(): number {
    return this.tail;
  }
}

/**
 * 创建一个覆盖式循环队列
 * @param capacity 队列容量
 */
export function createOverwritingCircularQueue<T>(capacity: number): ICircularQueue<T> {
  return new OverwritingCircularQueue<T>(capacity);
}
