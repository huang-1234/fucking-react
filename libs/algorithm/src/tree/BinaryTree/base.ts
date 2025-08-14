/**
 * @desc 使用TypeScript实现二叉树的前序遍历、中序遍历、后序遍历以及层序遍历；
 * 每种遍历方式都有递归和迭代两种方式、每个遍历方式都有返回值
 */

/**
 * 二叉树节点类
 */
export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * 二叉树遍历类
 */
export class TreeTraversal<T> {
  tree: TreeNode<T> | null;

  constructor(tree: TreeNode<T> | null) {
    this.tree = tree;
  }

  /**
   * 前序遍历（递归）：根-左-右
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  preOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    return [
      node.value,
      ...this.preOrderTraversalRecursive(node.left),
      ...this.preOrderTraversalRecursive(node.right)
    ];
  }

  /**
   * 前序遍历（迭代）：根-左-右
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

      // 先压入右节点，再压入左节点，这样出栈时会先处理左节点
      if (current.right) stack.push(current.right);
      if (current.left) stack.push(current.left);
    }

    return result;
  }

  /**
   * 中序遍历（递归）：左-根-右
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  inOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    return [
      ...this.inOrderTraversalRecursive(node.left),
      node.value,
      ...this.inOrderTraversalRecursive(node.right)
    ];
  }

  /**
   * 中序遍历（迭代）：左-根-右
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  inOrderTraversalIterative(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    const result: T[] = [];
    const stack: TreeNode<T>[] = [];
    let current: TreeNode<T> | null = node;

    while (current || stack.length > 0) {
      // 遍历到最左叶子节点
      while (current) {
        stack.push(current);
        current = current.left;
      }

      // 访问根节点
      current = stack.pop()!;
      result.push(current.value);

      // 遍历右子树
      current = current.right;
    }

    return result;
  }

  /**
   * 后序遍历（递归）：左-右-根
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  postOrderTraversalRecursive(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    return [
      ...this.postOrderTraversalRecursive(node.left),
      ...this.postOrderTraversalRecursive(node.right),
      node.value
    ];
  }

  /**
   * 后序遍历（迭代）：左-右-根
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

      // 先压入左节点，再压入右节点
      if (current.left) stack.push(current.left);
      if (current.right) stack.push(current.right);
    }

    // 从输出栈中弹出节点，顺序是左-右-根
    while (outputStack.length > 0) {
      result.push(outputStack.pop()!.value);
    }

    return result;
  }

  /**
   * 层序遍历（广度优先）
   * @param node 当前节点
   * @returns 遍历结果数组
   */
  levelOrderTraversal(node: TreeNode<T> | null = this.tree): T[] {
    if (!node) return [];

    const result: T[] = [];
    const queue: TreeNode<T>[] = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.value);

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return result;
  }

  /**
   * 将这颗树可视化的打印出来
   */
  toTree(): void {
    console.log(this.preOrderTraversalRecursive());
  }
}

export default TreeTraversal;