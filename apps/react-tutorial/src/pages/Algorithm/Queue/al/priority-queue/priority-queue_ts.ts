/**
 * 优先队列的TypeScript实现
 * 基于二叉堆实现，支持最小优先队列和最大优先队列
 */
import { MinHeap, MaxHeap } from '../../lib/heap';

/**
 * 优先队列接口
 */
export interface IPriorityQueue<T> {
  /**
   * 入队操作
   * @param item 要入队的元素
   * @param priority 元素的优先级
   */
  enqueue(item: T, priority: number): void;

  /**
   * 出队操作
   * @returns 队首元素，如果队列为空则返回null
   */
  dequeue(): T | null;

  /**
   * 查看队首元素但不移除
   * @returns 队首元素，如果队列为空则返回null
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
   * 清空队列
   */
  clear(): void;

  /**
   * 获取队列中的所有元素（用于可视化）
   */
  getItems(): { value: T; priority: number }[];
}

/**
 * 最小优先队列实现
 * 优先级数字越小，优先级越高
 */
export class MinPriorityQueue<T> implements IPriorityQueue<T> {
  private heap: MinHeap<T>;

  constructor() {
    this.heap = new MinHeap<T>();
  }

  enqueue(item: T, priority: number): void {
    this.heap.insert(item, priority);
  }

  dequeue(): T | null {
    return this.heap.extractMin();
  }

  peek(): T | null {
    return this.heap.min();
  }

  size(): number {
    return this.heap.size();
  }

  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  clear(): void {
    this.heap.clear();
  }

  getItems(): { value: T; priority: number }[] {
    return this.heap.getItems();
  }
}

/**
 * 最大优先队列实现
 * 优先级数字越大，优先级越高
 */
export class MaxPriorityQueue<T> implements IPriorityQueue<T> {
  private heap: MaxHeap<T>;

  constructor() {
    this.heap = new MaxHeap<T>();
  }

  enqueue(item: T, priority: number): void {
    this.heap.insert(item, priority);
  }

  dequeue(): T | null {
    return this.heap.extractMax();
  }

  peek(): T | null {
    return this.heap.max();
  }

  size(): number {
    return this.heap.size();
  }

  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  clear(): void {
    this.heap.clear();
  }

  getItems(): { value: T; priority: number }[] {
    return this.heap.getItems();
  }
}

/**
 * 创建一个最小优先队列
 */
export function createMinPriorityQueue<T>(): IPriorityQueue<T> {
  return new MinPriorityQueue<T>();
}

/**
 * 创建一个最大优先队列
 */
export function createMaxPriorityQueue<T>(): IPriorityQueue<T> {
  return new MaxPriorityQueue<T>();
}

/**
 * 使用优先队列进行排序
 * @param items 要排序的项
 * @param getPriority 获取项优先级的函数
 * @param ascending 是否升序排序
 */
export function prioritySort<T>(
  items: T[],
  getPriority: (item: T) => number,
  ascending: boolean = true
): T[] {
  const queue = ascending
    ? createMinPriorityQueue<T>()
    : createMaxPriorityQueue<T>();

  // 将所有项添加到优先队列
  items.forEach(item => {
    queue.enqueue(item, getPriority(item));
  });

  // 从队列中取出所有项，形成排序后的数组
  const result: T[] = [];
  while (!queue.isEmpty()) {
    const item = queue.dequeue();
    if (item !== null) {
      result.push(item);
    }
  }

  return result;
}
