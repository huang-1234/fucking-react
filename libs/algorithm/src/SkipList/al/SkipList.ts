/**
 * 跳表数据结构的 TypeScript 实现
 * 支持泛型，提供高效的查找、插入和删除操作
 */

/**
 * 跳表节点类
 */
export class SkipListNode<T> {
  value: T;
  next: Array<SkipListNode<T> | null>;
  level: number;

  constructor(value: T, level: number) {
    this.value = value;
    this.level = level;
    this.next = new Array(level).fill(null);
  }
}

/**
 * 跳表类
 */
export class SkipList<T> {
  private maxLevel: number;
  private head: SkipListNode<T>;
  private level: number;
  private probability: number;
  private compareFn: (a: T, b: T) => number;
  private size: number;

  constructor(
    maxLevel: number = 16,
    probability: number = 0.5,
    compareFn?: (a: T, b: T) => number
  ) {
    this.maxLevel = maxLevel;
    this.probability = probability;
    this.level = 0;
    this.size = 0;

    // 默认比较函数，适用于数字和字符串
    this.compareFn = compareFn || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // 创建头节点（哨兵节点）
    this.head = new SkipListNode<T>(null as any, maxLevel);
  }

  /**
   * 随机生成节点层级
   */
  private randomLevel(): number {
    let level = 1;
    while (Math.random() < this.probability && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  /**
   * 查找节点
   */
  search(value: T): SkipListNode<T> | null {
    let current = this.head;

    // 从最高层开始向下搜索
    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] && this.compareFn(current.next[i]!.value, value) < 0) {
        current = current.next[i]!;
      }
    }

    // 移动到下一个节点
    current = current.next[0]!;

    // 检查是否找到目标值
    if (current && this.compareFn(current.value, value) === 0) {
      return current;
    }

    return null;
  }

  /**
   * 插入节点
   */
  insert(value: T): { success: boolean; updatePath: SkipListNode<T>[] } {
    const update: Array<SkipListNode<T>> = new Array(this.maxLevel).fill(this.head);
    let current = this.head;
    const updatePath: SkipListNode<T>[] = [];

    // 从最高层开始查找插入位置
    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] && this.compareFn(current.next[i]!.value, value) < 0) {
        current = current.next[i]!;
        updatePath.push(current);
      }
      update[i] = current;
    }

    // 移动到下一个节点
    current = current.next[0];

    // 如果值已存在，不插入
    if (current && this.compareFn(current.value, value) === 0) {
      return { success: false, updatePath };
    }

    // 生成新节点的层级
    const newLevel = this.randomLevel();

    // 如果新层级超过当前最大层级，更新相关数组
    if (newLevel > this.level) {
      for (let i = this.level + 1; i < newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel - 1;
    }

    // 创建新节点
    const newNode = new SkipListNode(value, newLevel);

    // 更新指针
    for (let i = 0; i < newLevel; i++) {
      newNode.next[i] = update[i].next[i];
      update[i].next[i] = newNode;
    }

    this.size++;
    return { success: true, updatePath };
  }

  /**
   * 删除节点
   */
  delete(value: T): { success: boolean; deletedNode: SkipListNode<T> | null } {
    const update: Array<SkipListNode<T>> = new Array(this.maxLevel).fill(this.head);
    let current = this.head;

    // 从最高层开始查找删除位置
    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] && this.compareFn(current.next[i]!.value, value) < 0) {
        current = current.next[i]!;
      }
      update[i] = current;
    }

    // 移动到目标节点
    current = current.next[0];

    // 如果找到目标节点
    if (current && this.compareFn(current.value, value) === 0) {
      // 更新所有层级的指针
      for (let i = 0; i < current.level; i++) {
        update[i].next[i] = current.next[i];
      }

      // 更新跳表的最大层级
      while (this.level > 0 && !this.head.next[this.level]) {
        this.level--;
      }

      this.size--;
      return { success: true, deletedNode: current };
    }

    return { success: false, deletedNode: null };
  }

  /**
   * 获取所有节点（按层级组织）
   */
  getLevels(): Array<Array<{ node: SkipListNode<T>; position: number }>> {
    const levels: Array<Array<{ node: SkipListNode<T>; position: number }>> = [];

    for (let level = this.level; level >= 0; level--) {
      const levelNodes: Array<{ node: SkipListNode<T>; position: number }> = [];
      let current = this.head.next[level];
      let position = 0;

      while (current) {
        levelNodes.push({ node: current, position });
        current = current.next[level];
        position++;
      }

      levels.push(levelNodes);
    }

    return levels;
  }

  /**
   * 获取所有节点值（有序）
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head.next[0];

    while (current) {
      result.push(current.value);
      current = current.next[0];
    }

    return result;
  }

  /**
   * 获取跳表大小
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 获取当前最大层级
   */
  getCurrentLevel(): number {
    return this.level;
  }

  /**
   * 获取最大层级限制
   */
  getMaxLevel(): number {
    return this.maxLevel;
  }

  /**
   * 检查跳表是否为空
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * 清空跳表
   */
  clear(): void {
    for (let i = 0; i < this.maxLevel; i++) {
      this.head.next[i] = null;
    }
    this.level = 0;
    this.size = 0;
  }

  /**
   * 设置比较函数
   */
  setComparator(compareFn: (a: T, b: T) => number): void {
    this.compareFn = compareFn;
  }

  /**
   * 设置配置
   */
  setConfig(config: { maxLevel?: number; probability?: number }): void {
    if (config.maxLevel !== undefined) {
      this.maxLevel = config.maxLevel;
    }
    if (config.probability !== undefined) {
      this.probability = config.probability;
    }
  }

  /**
   * 序列化跳表数据
   */
  serialize(): any {
    return {
      maxLevel: this.maxLevel,
      probability: this.probability,
      level: this.level,
      size: this.size,
      data: this.toArray()
    };
  }

  /**
   * 反序列化跳表数据
   */
  deserialize(data: any): void {
    this.clear();
    this.maxLevel = data.maxLevel || 16;
    this.probability = data.probability || 0.5;

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((value: T) => {
        this.insert(value);
      });
    }
  }
}

export default SkipList;