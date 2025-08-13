/**
 * @desc 使用TypeScript实现多叉树的前序遍历、中序遍历、后序遍历以及层序遍历；
 * 每种遍历方式都有递归和迭代两种方式、每个遍历方式都有返回值
 */

/**
 * 多叉树节点类
 */
export class TreeNode<T> {
  value: T;
  children: TreeNode<T>[];

  constructor(value: T) {
    this.value = value;
    this.children = [];
  }
}

/**
 * 多叉树遍历类
 */
export class MultiTreeTraversal<T> {
  tree: TreeNode<T> | null;

  constructor(tree: TreeNode<T> | null) {
    this.tree = tree;
  }

  /**
   * 前序遍历（递归）：根-子节点
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  preOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    // 访问根节点
    let result: T[] = [node.value];

    // 递归遍历所有子节点
    for (const child of node.children) {
      result = result.concat(this.preOrderTraversalRecursive(child));
    }

    return result;
  }

  /**
   * 前序遍历（迭代）：根-子节点
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  preOrderTraversalIterative(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    const result: T[] = [];
    const stack: TreeNode<T>[] = [node];

    while (stack.length > 0) {
      const current = stack.pop()!;
      result.push(current.value);

      // 从右向左压入子节点，这样出栈时会从左向右处理
      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]);
      }
    }

    return result;
  }

  /**
   * 后序遍历（递归）：子节点-根
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  postOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    let result: T[] = [];

    // 递归遍历所有子节点
    for (const child of node.children) {
      result = result.concat(this.postOrderTraversalRecursive(child));
    }

    // 访问根节点
    result.push(node.value);

    return result;
  }

  /**
   * 后序遍历（迭代）：子节点-根
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  postOrderTraversalIterative(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    const result: T[] = [];
    const stack: TreeNode<T>[] = [node];
    const outputStack: TreeNode<T>[] = [];

    while (stack.length > 0) {
      const current = stack.pop()!;
      outputStack.push(current);

      // 从左向右压入子节点
      for (const child of current.children) {
        stack.push(child);
      }
    }

    // 从输出栈中弹出节点，顺序是子节点-根
    while (outputStack.length > 0) {
      result.push(outputStack.pop()!.value);
    }

    return result;
  }

  /**
   * 层序遍历（递归）
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  levelOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    const result: T[] = [];
    const levels: T[][] = [];

    /**
     * 辅助函数，递归遍历每一层
     * @param node 当前节点
     * @param level 当前层级
     */
    const traverseLevel = (node: TreeNode<T>, level: number): void => {
      if (!levels[level]) {
        levels[level] = [];
      }

      levels[level].push(node.value);

      for (const child of node.children) {
        traverseLevel(child, level + 1);
      }
    };

    traverseLevel(node, 0);

    // 将所有层级的节点值合并到结果数组
    for (const level of levels) {
      result.push(...level);
    }

    return result;
  }

  /**
   * 层序遍历（迭代）
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  levelOrderTraversalIterative(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    const result: T[] = [];
    const queue: TreeNode<T>[] = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.value);

      // 将所有子节点加入队列
      for (const child of current.children) {
        queue.push(child);
      }
    }

    return result;
  }

  /**
   * 中序遍历（递归）：对于多叉树，中序遍历的定义不如二叉树明确
   * 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  inOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];
    if (node.children.length === 0) return [node.value];

    let result: T[] = [];

    // 访问第一个子节点
    if (node.children.length > 0) {
      result = result.concat(this.inOrderTraversalRecursive(node.children[0]));
    }

    // 访问根节点
    result.push(node.value);

    // 访问其余子节点
    for (let i = 1; i < node.children.length; i++) {
      result = result.concat(this.inOrderTraversalRecursive(node.children[i]));
    }

    return result;
  }

  /**
   * 中序遍历（迭代）：对于多叉树，中序遍历的定义不如二叉树明确
   * 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  inOrderTraversalIterative(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    interface StackItem<T> {
      node: TreeNode<T>;
      visitedRoot: boolean;
      childIndex: number;
    }

    const result: T[] = [];
    const stack: StackItem<T>[] = [{
      node,
      visitedRoot: false,
      childIndex: 0
    }];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];

      // 如果没有子节点或者已经访问完所有子节点
      if (current.node.children.length === 0 ||
          (current.visitedRoot && current.childIndex >= current.node.children.length)) {
        if (!current.visitedRoot) {
          result.push(current.node.value);
          current.visitedRoot = true;
        } else {
          stack.pop();
        }
        continue;
      }

      // 如果没有访问根节点且已经访问了第一个子节点
      if (!current.visitedRoot && current.childIndex === 1) {
        result.push(current.node.value);
        current.visitedRoot = true;
        continue;
      }

      // 访问下一个子节点
      if (current.childIndex < current.node.children.length) {
        stack.push({
          node: current.node.children[current.childIndex],
          visitedRoot: false,
          childIndex: 0
        });
        current.childIndex++;
      }
    }

    return result;
  }
}

export { TreeNode, MultiTreeTraversal };
