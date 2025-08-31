/**
 * 堆数据结构实现
 * 支持最小堆和最大堆
 */

export interface HeapItem<T> {
  value: T;
  priority: number;
}

export class MinHeap<T> {
  private heap: HeapItem<T>[] = [];

  /**
   * 插入元素到堆中并维护堆的性质
   * @param value 要插入的值
   * @param priority 优先级（数字越小优先级越高）
   */
  insert(value: T, priority: number): void {
    const item: HeapItem<T> = { value, priority };
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * 提取最小优先级的元素
   * @returns 最小优先级元素的值，如果堆为空则返回null
   */
  extractMin(): T | null {
    if (this.heap.length === 0) {
      return null;
    }

    const min = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }

    return min.value;
  }

  /**
   * 查看最小优先级的元素但不移除
   * @returns 最小优先级元素的值，如果堆为空则返回null
   */
  min(): T | null {
    return this.heap.length > 0 ? this.heap[0].value : null;
  }

  /**
   * 获取堆中元素数量
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * 检查堆是否为空
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * 清空堆
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * 获取堆中所有元素（用于可视化）
   */
  getItems(): HeapItem<T>[] {
    return [...this.heap];
  }

  /**
   * 向上调整堆
   * @param index 开始调整的索引
   */
  private heapifyUp(index: number): void {
    let currentIndex = index;
    const currentItem = this.heap[currentIndex];

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      const parentItem = this.heap[parentIndex];

      if (parentItem.priority <= currentItem.priority) {
        break;
      }

      // 交换当前节点和父节点
      this.heap[currentIndex] = parentItem;
      this.heap[parentIndex] = currentItem;
      currentIndex = parentIndex;
    }
  }

  /**
   * 向下调整堆
   * @param index 开始调整的索引
   */
  private heapifyDown(index: number): void {
    let currentIndex = index;
    const currentItem = this.heap[currentIndex];
    const lastIndex = this.heap.length - 1;

    while (true) {
      let smallestChildIndex = currentIndex;
      const leftChildIndex = 2 * currentIndex + 1;
      const rightChildIndex = 2 * currentIndex + 2;

      // 检查左子节点
      if (leftChildIndex <= lastIndex &&
          this.heap[leftChildIndex].priority < this.heap[smallestChildIndex].priority) {
        smallestChildIndex = leftChildIndex;
      }

      // 检查右子节点
      if (rightChildIndex <= lastIndex &&
          this.heap[rightChildIndex].priority < this.heap[smallestChildIndex].priority) {
        smallestChildIndex = rightChildIndex;
      }

      // 如果当前节点已经是最小的，结束调整
      if (smallestChildIndex === currentIndex) {
        break;
      }

      // 交换当前节点和最小的子节点
      this.heap[currentIndex] = this.heap[smallestChildIndex];
      this.heap[smallestChildIndex] = currentItem;
      currentIndex = smallestChildIndex;
    }
  }
}

export class MaxHeap<T> {
  private minHeap: MinHeap<T>;

  constructor() {
    this.minHeap = new MinHeap<T>();
  }

  /**
   * 插入元素到堆中并维护堆的性质
   * @param value 要插入的值
   * @param priority 优先级（数字越大优先级越高）
   */
  insert(value: T, priority: number): void {
    // 对于最大堆，我们使用负的优先级来转换为最小堆
    this.minHeap.insert(value, -priority);
  }

  /**
   * 提取最大优先级的元素
   * @returns 最大优先级元素的值，如果堆为空则返回null
   */
  extractMax(): T | null {
    return this.minHeap.extractMin();
  }

  /**
   * 查看最大优先级的元素但不移除
   * @returns 最大优先级元素的值，如果堆为空则返回null
   */
  max(): T | null {
    return this.minHeap.min();
  }

  /**
   * 获取堆中元素数量
   */
  size(): number {
    return this.minHeap.size();
  }

  /**
   * 检查堆是否为空
   */
  isEmpty(): boolean {
    return this.minHeap.isEmpty();
  }

  /**
   * 清空堆
   */
  clear(): void {
    this.minHeap.clear();
  }

  /**
   * 获取堆中所有元素（用于可视化）
   */
  getItems(): HeapItem<T>[] {
    // 将负的优先级转换回正的优先级
    return this.minHeap.getItems().map(item => ({
      value: item.value,
      priority: -item.priority
    }));
  }
}
