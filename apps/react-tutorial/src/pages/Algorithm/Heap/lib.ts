import { TreeNode, HeapOperationType } from './base';
import type { HeapOperation, HeapVisualizationCallbacks } from './base';

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
  protected operations: HeapOperation<T>[] = [];
  protected callbacks: HeapVisualizationCallbacks<T> = {};
  protected nodeIdCounter = 0;

  constructor(heapType: HeapType, callbacks?: HeapVisualizationCallbacks<T>) {
    this.heapType = heapType;
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  /**
   * 设置可视化回调
   */
  setCallbacks(callbacks: HeapVisualizationCallbacks<T>): void {
    this.callbacks = callbacks;
  }

  /**
   * 获取操作日志
   */
  getOperations(): HeapOperation<T>[] {
    return [...this.operations];
  }

  /**
   * 清除操作日志
   */
  clearOperations(): void {
    this.operations = [];
  }

  /**
   * 记录操作
   */
  protected logOperation(
    type: HeapOperationType,
    description: string,
    value?: T,
    affectedNodes?: string[],
    beforeState?: TreeNode<T> | null,
    afterState?: TreeNode<T> | null
  ): void {
    const operation: HeapOperation<T> = {
      type,
      timestamp: Date.now(),
      description,
      value,
      affectedNodes,
      beforeState: beforeState ? this.cloneTree(beforeState) : null,
      afterState: afterState ? this.cloneTree(afterState) : null
    };

    this.operations.push(operation);

    if (this.callbacks.onOperationLogged) {
      this.callbacks.onOperationLogged(operation);
    }
  }

  /**
   * 克隆树结构（用于保存状态）
   */
  private cloneTree(node: TreeNode<T> | null): TreeNode<T> | null {
    if (!node) return null;

    const clonedNode = new TreeNode<T>(node.val);
    clonedNode.x = node.x;
    clonedNode.y = node.y;
    clonedNode.id = node.id;

    if (node.left) {
      clonedNode.left = this.cloneTree(node.left);
    }

    if (node.right) {
      clonedNode.right = this.cloneTree(node.right);
    }

    return clonedNode;
  }

  /**
   * 从数组构建堆
   */
  buildHeap(data: T[]): void {
    if (data.length === 0) return;

    // 记录操作前状态
    const beforeState = this.cloneTree(this.root);

    // 创建节点数组
    const nodes: TreeNode<T>[] = data.map(val => {
      const node = new TreeNode(val);
      node.id = `node-${this.nodeIdCounter++}`;
      return node;
    });
    this.count = nodes.length;

    // 构建完全二叉树结构
    for (let i = 0;i < this.count;i++) {
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

    // 记录操作
    this.logOperation(
      HeapOperationType.BUILD_HEAP,
      `从数组 [${data.join(', ')}] 构建堆`,
      undefined,
      nodes.map(node => node.id),
      beforeState,
      this.root!
    );

    // 通知堆更新
    if (this.callbacks.onHeapUpdated) {
      this.callbacks.onHeapUpdated(this.root);
    }
  }

  /**
   * 整树堆化方法 (时间复杂度O(n))
   */
  protected heapifyEntireTree(): void {
    // 计算最后一个非叶节点索引
    const lastNonLeafIndex = Math.floor(this.count / 2) - 1;

    // 从最后一个非叶节点开始向前堆化
    for (let i = lastNonLeafIndex;i >= 0;i--) {
      const node = this.findNodeByIndex(i);
      if (node) {
        this.heapifyDown(node);
      }
    }
  }

  /**
   * 通过索引定位节点
   */
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
   */
  insert(val: T): void {
    // 记录操作前状态
    const beforeState = this.cloneTree(this.root);

    const newNode = new TreeNode(val);
    newNode.id = `node-${this.nodeIdCounter++}`;
    this.count++;

    // 空堆处理
    if (!this.root) {
      this.root = newNode;
      this.lastNode = newNode;

      // 记录操作
      this.logOperation(
        HeapOperationType.INSERT,
        `插入值 ${String(val)} 作为根节点`,
        val,
        [newNode.id],
        beforeState,
        this.root!
      );

      // 通知节点添加
      if (this.callbacks.onNodeAdded) {
        this.callbacks.onNodeAdded(newNode);
      }

      // 通知堆更新
      if (this.callbacks.onHeapUpdated) {
        this.callbacks.onHeapUpdated(this.root);
      }

      return;
    }

    // 定位插入位置（利用二进制特性）
    const path = this.getInsertPath();
    let current = this.root;

    // 根据路径找到父节点（高位忽略）
    for (let i = 1;i < path.length - 1;i++) {
      current = path[i] ? current!.right! : current!.left!;
    }

    // 插入新节点并设置父子关系
    if (path[path.length - 1]) {
      current!.right = newNode;
    } else {
      current!.left = newNode;
    }
    this.lastNode = newNode;

    // 通知节点添加
    if (this.callbacks.onNodeAdded) {
      this.callbacks.onNodeAdded(newNode);
    }

    // 记录插入操作
    this.logOperation(
      HeapOperationType.INSERT,
      `插入值 ${String(val)}`,
      val,
      [newNode.id],
      beforeState,
      null
    );

    // 堆化调整
    this.heapifyUp(newNode);

    // 通知堆更新
    if (this.callbacks.onHeapUpdated) {
      this.callbacks.onHeapUpdated(this.root);
    }
  }

  /**
   * 删除堆顶（核心方法）
   */
  extract(): T | null {
    if (!this.root) return null;

    // 记录操作前状态
    const beforeState = this.cloneTree(this.root);
    const rootValue = this.root.val;
    const rootId = this.root.id;

    if (this.count === 1) {
      this.root = null;
      this.lastNode = null;
      this.count = 0;

      // 记录操作
      this.logOperation(
        HeapOperationType.EXTRACT,
        `移除堆顶元素 ${String(rootValue)}`,
        rootValue,
        [rootId],
        beforeState,
        null
      );

      // 通知节点移除
      if (this.callbacks.onNodeRemoved) {
        this.callbacks.onNodeRemoved(rootId);
      }

      // 通知堆更新
      if (this.callbacks.onHeapUpdated) {
        this.callbacks.onHeapUpdated(null);
      }

      return rootValue;
    }

    // 记录最后一个节点ID
    const lastNodeId = this.lastNode!.id;

    // 交换根节点和末位节点值
    this.logOperation(
      HeapOperationType.SWAP,
      `交换堆顶元素 ${String(this.root.val)} 和末位元素 ${String(this.lastNode!.val)}`,
      undefined,
      [rootId, lastNodeId],
      null,
      null
    );

    // 如果有交换节点回调
    if (this.callbacks.onNodesSwapped) {
      this.callbacks.onNodesSwapped(rootId, lastNodeId);
    }

    this.root.val = this.lastNode!.val;

    // 删除末位节点
    const path = this.getInsertPath();
    let parent = this.root;
    for (let i = 1;i < path.length - 1;i++) {
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

    // 通知节点移除
    if (this.callbacks.onNodeRemoved) {
      this.callbacks.onNodeRemoved(lastNodeId);
    }

    // 记录删除操作
    this.logOperation(
      HeapOperationType.EXTRACT,
      `移除堆顶元素 ${String(rootValue)}`,
      rootValue,
      [rootId],
      beforeState,
      null
    );

    // 从根节点开始堆化调整
    this.heapifyDown(this.root!);

    // 通知堆更新
    if (this.callbacks.onHeapUpdated) {
      this.callbacks.onHeapUpdated(this.root);
    }

    return rootValue;
  }

  /**
   * 获取堆顶值
   */
  peek(): T | null {
    return this.root?.val || null;
  }

  /**
   * 堆大小
   */
  size(): number {
    return this.count;
  }

  /**
   * 获取堆的根节点（用于可视化）
   */
  getRoot(): TreeNode<T> | null {
    return this.root;
  }

  //--- 内部辅助方法 ---//

  /**
   * 计算插入路径（利用完全二叉树特性）
   */
  private getInsertPath(): boolean[] {
    const path: boolean[] = [];
    let n = this.count;
    while (n >= 1) {
      path.push(n % 2 === 0); // 0: 左路径，1: 右路径
      n = Math.floor(n / 2);
    }
    return path.reverse();
  }

  /**
   * 查找新的末位节点（当右子树被删除时使用）
   */
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
 * 大顶堆实现
 */
export class MaxHeap<T> extends Heap<T> {
  constructor(callbacks?: HeapVisualizationCallbacks<T>) {
    super(HeapType.MAX, callbacks);
  }

  /**
   * 比较函数
   */
  protected shouldSwap(parentVal: T, childVal: T): boolean {
    return this.compare(childVal, parentVal) > 0;
  }

  /**
   * 比较函数
   */
  protected compare(v1: T, v2: T): number {
    return Number(v1) - Number(v2); // 数字类型比较
  }

  /**
   * 上浮
   */
  protected heapifyUp(node: TreeNode<T>): void {
    let current = node;
    let parent = this.findParent(current);

    while (parent && this.shouldSwap(parent.val, current.val)) {
      // 记录交换操作
      this.logOperation(
        HeapOperationType.HEAPIFY_UP,
        `上浮: 交换节点 ${String(parent.val)} 和 ${String(current.val)}`,
        undefined,
        [parent.id, current.id],
        null,
        null
      );

      // 如果有交换节点回调
      if (this.callbacks.onNodesSwapped) {
        this.callbacks.onNodesSwapped(parent.id, current.id);
      }

      // 交换节点值
      [parent.val, current.val] = [current.val, parent.val];

      current = parent;
      parent = this.findParent(current);
    }
  }

  /**
   * 下沉
   */
  protected heapifyDown(node: TreeNode<T>): void {
    let current: TreeNode<T> | null = node;
    let nextChild: TreeNode<T> | null = null;

    while (true) {
      const left: TreeNode<T> | null = current.left;
      const right: TreeNode<T> | null = current.right;

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

      // 记录交换操作
      this.logOperation(
        HeapOperationType.HEAPIFY_DOWN,
        `下沉: 交换节点 ${String(current.val)} 和 ${String(nextChild.val)}`,
        undefined,
        [current.id, nextChild.id],
        null,
        null
      );

      // 如果有交换节点回调
      if (this.callbacks.onNodesSwapped) {
        this.callbacks.onNodesSwapped(current.id, nextChild.id);
      }

      // 交换当前节点和子节点
      [current.val, nextChild.val] = [nextChild.val, current.val];

      current = nextChild;
      nextChild = null;
    }
  }

  /**
   * 辅助方法：查找节点父节点
   */
  private findParent(target: TreeNode<T>): TreeNode<T> | null {
    if (target === this.root) return null;

    const stack: (TreeNode<T> | null)[] = [this.root];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;

      if (node.left === target || node.right === target) {
        return node;
      }

      // 先压入右子树，再压入左子树，这样处理顺序是先左后右
      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }
    return null;
  }
}

/**
 * 小顶堆实现（继承并重写比较逻辑）
 */
export class MinHeap<T> extends Heap<T> {
  constructor(callbacks?: HeapVisualizationCallbacks<T>) {
    super(HeapType.MIN, callbacks);
  }

  /**
   * 是否需要交换
   */
  protected shouldSwap(parentVal: T, childVal: T): boolean {
    return this.compare(childVal, parentVal) < 0;
  }

  /**
   * 比较函数
   */
  protected compare(v1: T, v2: T): number {
    return Number(v1) - Number(v2); // 数字类型比较
  }

  /**
   * 上浮
   */
  protected heapifyUp(node: TreeNode<T>): void {
    let current = node;
    let parent = this.findParent(current);

    while (parent && this.shouldSwap(parent.val, current.val)) {
      // 记录交换操作
      this.logOperation(
        HeapOperationType.HEAPIFY_UP,
        `上浮: 交换节点 ${String(parent.val)} 和 ${String(current.val)}`,
        undefined,
        [parent.id, current.id],
        null,
        null
      );

      // 如果有交换节点回调
      if (this.callbacks.onNodesSwapped) {
        this.callbacks.onNodesSwapped(parent.id, current.id);
      }

      // 交换节点值
      [parent.val, current.val] = [current.val, parent.val];

      current = parent;
      parent = this.findParent(current);
    }
  }

  /**
   * 下沉
   */
  protected heapifyDown(node: TreeNode<T>): void {
    let current: TreeNode<T> | null = node;
    let nextChild: TreeNode<T> | null = null;

    while (true) {
      const left: TreeNode<T> | null = current.left;
      const right: TreeNode<T> | null = current.right;

      // 选择较小的子节点
      if (left && (!right || this.compare(left.val, right.val) < 0)) {
        nextChild = left;
      } else if (right) {
        nextChild = right;
      }

      // 如果没有子节点或已满足堆条件
      if (!nextChild || !this.shouldSwap(current.val, nextChild.val)) {
        break;
      }

      // 记录交换操作
      this.logOperation(
        HeapOperationType.HEAPIFY_DOWN,
        `下沉: 交换节点 ${String(current.val)} 和 ${String(nextChild.val)}`,
        undefined,
        [current.id, nextChild.id],
        null,
        null
      );

      // 如果有交换节点回调
      if (this.callbacks.onNodesSwapped) {
        this.callbacks.onNodesSwapped(current.id, nextChild.id);
      }

      // 交换当前节点和子节点
      [current.val, nextChild.val] = [nextChild.val, current.val];

      current = nextChild;
      nextChild = null;
    }
  }

  /**
   * 辅助方法：查找节点父节点
   */
  private findParent(target: TreeNode<T>): TreeNode<T> | null {
    if (target === this.root) return null;

    const stack: (TreeNode<T> | null)[] = [this.root];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;

      if (node.left === target || node.right === target) {
        return node;
      }

      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }
    return null;
  }
}