import { TreeNode } from './base';
// 堆类型枚举
enum HeapType {
  MAX,
  MIN
}

/**
 * 抽象堆基类
 */
export abstract class Heap<T> {
  protected root: TreeNode<T> | null = null;
  protected lastNode: TreeNode<T> | null = null;
  protected count = 0;
  protected readonly heapType: HeapType;

  constructor(heapType: HeapType) {
    this.heapType = heapType;
  }
    // 新增：从数组构建堆的公共接口
  protected buildHeap(data: T[]): void {
    if (data.length === 0) return;

    // 创建节点数组
    const nodes: TreeNode<T>[] = data.map(val => new TreeNode(val));
    this.count = nodes.length;

    // 构建完全二叉树结构
    for (let i = 0; i < this.count; i++) {
      const leftIndex = 2 * i + 1;
      const rightIndex = 2 * i + 2;

      if (leftIndex < this.count) {
        nodes[i].left = nodes[leftIndex];
      }
      if (rightIndex < this.count) {
        nodes[i].right = nodes[rightIndex];
      }
    }

    this.root = nodes[0];
    this.lastNode = nodes[this.count - 1];

    // 堆化操作 (Floyd算法)
    this.heapifyEntireTree();
  }

  // 新增：整树堆化方法 (时间复杂度O(n))
  protected heapifyEntireTree(): void {
    // 计算最后一个非叶节点索引
    const lastNonLeafIndex = Math.floor(this.count / 2) - 1;

    // 从最后一个非叶节点开始向前堆化
    for (let i = lastNonLeafIndex; i >= 0; i--) {
      const node = this.findNodeByIndex(i);
      if (node) {
        this.heapifyDown(node);
      }
    }
  }

  // 新增：通过索引定位节点
  protected findNodeByIndex(targetIndex: number): TreeNode<T> | null {
    if (targetIndex < 0 || targetIndex >= this.count) return null;

    // 通过DFS顺序索引定位
    let count = 0;
    const stack: TreeNode<T>[] = [this.root!];

    while (stack.length) {
      const node = stack.pop()!;
      if (count++ === targetIndex) return node;

      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }

    return null;
  }

  /**
   * 插入元素（核心方法）
   * @param val
   * @returns
   */
  insert(val: T): void {
    const newNode = new TreeNode(val);
    this.count++;

    // 空堆处理
    if (!this.root) {
      this.root = newNode;
      this.lastNode = newNode;
      return;
    }

    // 定位插入位置（利用二进制特性）
    const path = this.getInsertPath();
    let current = this.root;

    // 根据路径找到父节点（高位忽略）
    for (let i = 1; i < path.length - 1; i++) {
      current = path[i] ? current!.right! : current!.left!;
    }

    // 插入新节点并设置父子关系
    if (path[path.length - 1]) {
      current!.right = newNode;
    } else {
      current!.left = newNode;
    }
    this.lastNode = newNode;

    // 堆化调整
    this.heapifyUp(newNode);
  }

  /**
   * 删除堆顶（核心方法）
   * @returns
   */
  extract(): T | null {
    if (!this.root) return null;

    const rootValue = this.root.val;
    if (this.count === 1) {
      this.root = null;
      this.lastNode = null;
      this.count = 0;
      return rootValue;
    }

    // 交换根节点和末位节点值
    this.root.val = this.lastNode!.val;

    // 删除末位节点
    const path = this.getInsertPath();
    let parent = this.root;
    for (let i = 1; i < path.length - 1; i++) {
      parent = path[i] ? parent!.right! : parent!.left!;
    }

    // 更新末位节点指针
    if (path[path.length - 1]) {
      parent!.right = null;
      this.lastNode = parent?.left || null;
    } else {
      parent!.left = null;
      this.lastNode = this.findNewLast();
    }

    this.count--;

    // 从根节点开始堆化调整
    this.heapifyDown(this.root!);

    return rootValue;
  }

  // 获取堆顶值
  peek(): T | null {
    return this.root?.val || null;
  }

  // 堆大小
  size(): number {
    return this.count;
  }

  //--- 内部辅助方法 ---//

  // 计算插入路径（利用完全二叉树特性）
  private getInsertPath(): boolean[] {
    const path: boolean[] = [];
    let n = this.count;
    while (n >= 1) {
      path.push(n % 2 === 0); // 0: 左路径，1: 右路径
      n = Math.floor(n / 2);
    }
    return path.reverse();
  }

  // 查找新的末位节点（当右子树被删除时使用）
  private findNewLast(): TreeNode<T> | null {
    const queue = [this.root];
    let last: TreeNode<T> | null = null;

    while (queue.length) {
      last = queue.shift()!;
      if (last.left) queue.push(last.left);
      if (last.right) queue.push(last.right);
    }
    return last;
  }

  //--- 需要子类实现的抽象方法 ---//
  protected abstract shouldSwap(parentVal: T, childVal: T): boolean;
  protected abstract compare(v1: T, v2: T): number;
  protected abstract heapifyUp(node: TreeNode<T>): void;
  protected abstract heapifyDown(node: TreeNode<T>): void;
}

/**
 * @decs 比较数字大小的基类
 */
export class DataCompare<T> {
  constructor(private heapType: HeapType) {
  }

  /**
   * @desc 比较函数
   * @param v1
   * @param v2
   * @returns
   */
  compare(v1: T, v2: T): number {
    return Number(v1) - Number(v2); // 数字类型比较
  }
}

/**
 * @desc 大顶堆实现
 */
export class MaxHeap<T> extends Heap<T> {
  constructor() {
    super(HeapType.MAX);
  }

  /**
   * @desc 比较函数
   * @param parentVal
   * @param childVal
   * @returns
   */
  protected shouldSwap(parentVal: T, childVal: T): boolean {
    return this.compare(childVal, parentVal) > 0;
  }

  /**
   * @desc 比较函数
   * @param v1
   * @param v2
   * @returns
   */
  protected compare(v1: T, v2: T): number {
    return Number(v1) - Number(v2); // 数字类型比较
  }

    // 新增：从数组构建堆的公共接口
  buildHeap(data: T[]): void {
    if (data.length === 0) return;

    // 创建节点数组
    const nodes: TreeNode<T>[] = data.map(val => new TreeNode(val));
    this.count = nodes.length;

    // 构建完全二叉树结构
    for (let i = 0; i < this.count; i++) {
      const leftIndex = 2 * i + 1;
      const rightIndex = 2 * i + 2;

      if (leftIndex < this.count) {
        nodes[i].left = nodes[leftIndex];
      }
      if (rightIndex < this.count) {
        nodes[i].right = nodes[rightIndex];
      }
    }

    this.root = nodes[0];
    this.lastNode = nodes[this.count - 1];

    // 堆化操作 (Floyd算法)
    this.heapifyEntireTree();
  }

  // 新增：整树堆化方法 (时间复杂度O(n))
  protected heapifyEntireTree(): void {

    // 计算最后一个非叶节点索引
    const lastNonLeafIndex = Math.floor(this.count / 2) - 1;

    // 从最后一个非叶节点开始向前堆化
    for (let i = lastNonLeafIndex; i >= 0; i--) {
      const node = this.findNodeByIndex(i);
      if (node) {
        this.heapifyDown(node);
      }
    }
  }

  // 新增：通过索引定位节点
  protected findNodeByIndex(targetIndex: number): TreeNode<T> | null {
    if (targetIndex < 0 || targetIndex >= this.count) return null;

    // 通过DFS顺序索引定位
    let count = 0;
    const stack: TreeNode<T>[] = [this.root!];

    while (stack.length) {
      const node = stack.pop()!;
      if (count++ === targetIndex) return node;

      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }

    return null;
  }

  /**
   * @desc 上浮
   * @param node
   * @returns
   */
  protected heapifyUp(node: TreeNode<T>): void {
    let current = node;
    let parent = this.findParent(current);

    while (parent && this.shouldSwap(parent.val, current.val)) {
      // 交换节点值
      [parent.val, current.val] = [current.val, parent.val];
      current = parent;
      parent = this.findParent(current);
    }
  }

  /**
   * @desc 下沉
   * @param node
   * @returns
   */
  protected heapifyDown(node: TreeNode<T>): void {
    let current: TreeNode<T> | null = node;
    let nextChild: TreeNode<T> | null = null;

    while (true) {
      const left = current.left;
      const right = current.right;

      // 选择较大的子节点
      if (left && (!right || this.compare(left.val, right.val) > 0)) {
        nextChild = left;
      } else if (right) {
        nextChild = right;
      }

      // 如果没有子节点或已满足堆条件
      if (!nextChild || !this.shouldSwap(current.val, nextChild.val)) {
        break;
      }

      // 交换当前节点和子节点
      [current.val, nextChild.val] = [nextChild.val, current.val];
      current = nextChild;
      nextChild = null;
    }
  }

  /**
   * 辅助方法：查找节点父节点
   * @param target
   * @returns
   */
  private findParent(target: TreeNode<T>): TreeNode<T> | null {
    const stack: (TreeNode<T> | null)[] = [this.root];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;

      if (node.left === target || node.right === target) {
        return node;
      }
      stack.push(node.left);
      stack.push(node.right);
    }
    return null;
  }
}

/**
 * 小顶堆实现（继承并重写比较逻辑）
 */
class MinHeap<T> extends Heap<T> {
  constructor() {
    super(HeapType.MIN);
  }

  /**
   * @desc 是否需要交换
   * @param parentVal
   * @param childVal
   * @returns
   */
  protected shouldSwap(parentVal: T, childVal: T): boolean {
    return this.compare(childVal, parentVal) < 0;
  }

  /**
   * @desc 比较函数
   * @param v1
   * @param v2
   * @returns
   */
  protected compare(v1: T, v2: T): number {
    return Number(v1) - Number(v2); // 数字类型比较
  }

  /**
   * @desc 上浮
   * @param node
   * @returns
   */
  protected heapifyUp(node: TreeNode<T>): void {
    return new MinHeap<T>().heapifyUp.call(this, node);
  }

  /**
   * @desc 下沉
   * @param node
   * @returns
   */
  protected heapifyDown(node: TreeNode<T>): void {
    return new MinHeap<T>().heapifyDown.call(this, node);
  }
}