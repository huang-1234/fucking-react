interface Entry<K, V> {
  key: K;
  value: V;
  isDeleted: boolean; // 删除标记，用于线性探测
}

export class HashMap<K, V> {
  /* 哈希表 */
  private buckets: Array<Entry<K, V> | undefined>;
  /** 大小 */
  private _size: number;
  /** 负载因子 */
  private loadFactor: number;
  /** 容量 */
  private capacity: number;

  /**
   * 构造函数
   * @param initialCapacity 初始容量
   * @param loadFactor 负载因子
   * 时空复杂度：O(1)
   */
  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity);
    this._size = 0;
    this.loadFactor = loadFactor;
  }

  /**
   * 获取大小
   * 时空复杂度：O(1)
   * @returns 大小
   */
  get size(): number {
    return this._size;
  }

  /**
   * 哈希函数
   * @param key 键
   * 时空复杂度：O(1)
   * @returns 哈希值
   */
  private hash(key: K): number {
    // 一个简单的哈希函数示例。实际应用中应使用更复杂的函数。
    const keyString = JSON.stringify(key);
    let hash = 5381;
    for (let i = 0;i < keyString.length;i++) {
      hash = (hash << 5) + hash + keyString.charCodeAt(i);
    }
    return Math.abs(hash % this.capacity);
  }

  /**
   * 查找索引
   * @param key 键
   * 时空复杂度：O(1)
   * @returns 索引
   */
  private findIndex(key: K): number {
    let index = this.hash(key);
    let firstDeletedIndex = -1;

    // 线性探测
    while (this.buckets[index] !== undefined) {
      const entry = this.buckets[index]!;
      // 检查是否找到Key，并且该条目未被标记为删除
      if (!entry.isDeleted && entry.key === key) {
        // 如果之前找到了已删除的条目，可以在这里进行优化（惰性删除的清理）
        if (firstDeletedIndex !== -1) {
          this.buckets[firstDeletedIndex] = this.buckets[index];
          this.buckets[index] = undefined;
          return firstDeletedIndex;
        }
        return index;
      }
      // 记录第一个被删除的条目的位置，用于后续插入优化
      if (entry.isDeleted && firstDeletedIndex === -1) {
        firstDeletedIndex = index;
      }
      index = (index + 1) % this.capacity; // 循环数组
    }
    // 如果找到了已删除的位置，返回该位置
    if (firstDeletedIndex !== -1) {
      return firstDeletedIndex;
    }
    // 返回第一个找到的空位置
    return index;
  }

  /**
   * 设置值
   * @param key 键
   * @param value 值
   * 时空复杂度：O(1)
   */
  set(key: K, value: V): void {
    // 检查是否需要扩容
    if (this._size >= this.capacity * this.loadFactor) {
      this.resize(this.capacity * 2);
    }

    const index = this.findIndex(key);
    this.buckets[index] = { key, value, isDeleted: false };
    this._size++;
  }

  /**
   * 获取值
   * @param key 键
   * 时空复杂度：O(1)
   * @returns 值
   */
  get(key: K): V | undefined {
    const index = this.findIndex(key);
    const entry = this.buckets[index];
    // 确保找到的条目存在且未被删除
    if (entry !== undefined && !entry.isDeleted) {
      return entry.value;
    }
    return undefined;
  }

  /**
   * 删除值
   * @param key 键
   * 时空复杂度：O(1)
   * @returns 是否删除成功
   */
  delete(key: K): boolean {
    const index = this.findIndex(key);
    const entry = this.buckets[index];
    if (entry !== undefined && !entry.isDeleted) {
      // 惰性删除，只标记为已删除
      entry.isDeleted = true;
      this._size--;

      // 检查是否需要缩容
      if (this.capacity > 16 && this._size < this.capacity * 0.25) {
        this.resize(Math.floor(this.capacity / 2));
      }
      return true;
    }
    return false;
  }

  /**
   * 是否包含值
   * @param key 键
   * 时空复杂度：O(1)
   * @returns 是否包含
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 重新调整容量
   * @param newCapacity 新容量
   * 时空复杂度：O(n)
   */
  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.buckets = new Array(this.capacity);
    this._size = 0;

    // 重新哈希所有未被删除的条目
    for (const entry of oldBuckets) {
      if (entry && !entry.isDeleted) {
        this.set(entry.key, entry.value);
      }
    }
  }
}