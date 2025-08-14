/**
 * @desc 使用js+jsDoc类型提示实现一个类型、内部有多叉树的前序遍历、中序遍历、后续遍历以及层序遍历；
 * 每种遍历方式都有递归和迭代两种方式、每个遍历方式都有返回值、每个值都有类型
 */
/**
 * @desc 树节点，树节点有值、子节点
 * @class TreeNode
 * @property {T} value - 节点的值
 * @property {TreeNode[]} children - 子节点，默认值为空数组
 */
class TreeNode {
  /**
   *
   * @param {T} value
   */
  constructor(value) {
    /**
     * @type {T}
     */
    this.value = value;
    /**
     * @type {TreeNode[]}
     */
    this.children = [];
  }
}

/**
 * @desc 多叉树遍历类
 * @class MultiTreeTraversal
 */
class MultiTreeTraversal {
  /**
   * @param {TreeNode|null} tree - 多叉树根节点
   */
  constructor(tree) {
    this.tree = tree;
  }

  /**
   * 前序遍历（递归）：根-子节点
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  preOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];

    // 访问根节点
    let result = [node.value];

    // 递归遍历所有子节点
    for (const child of node.children) {
      result = result.concat(this.preOrderTraversalRecursive(child));
    }

    return result;
  }

  /**
   * 前序遍历（迭代）：根-子节点
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  preOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const stack = [node];

    while (stack.length > 0) {
      const current = stack.pop();
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
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  postOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];

    let result = [];

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
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  postOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const stack = [node];
    const outputStack = [];

    while (stack.length > 0) {
      const current = stack.pop();
      outputStack.push(current);

      // 从左向右压入子节点
      for (let i = 0; i < current.children.length; i++) {
        stack.push(current.children[i]);
      }
    }

    // 从输出栈中弹出节点，顺序是子节点-根
    while (outputStack.length > 0) {
      result.push(outputStack.pop().value);
    }

    return result;
  }

  /**
   * 层序遍历（广度优先）
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  levelOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];

    const result = [];
    const levels = [];

    /**
     * 辅助函数，递归遍历每一层
     * @param {TreeNode} node - 当前节点
     * @param {number} level - 当前层级
     */
    const traverseLevel = (node, level) => {
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
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  levelOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const queue = [node];

    while (queue.length > 0) {
      const current = queue.shift();
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
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  inOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];
    if (node.children.length === 0) return [node.value];

    let result = [];

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
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<*>} - 遍历结果数组
   */
  inOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const stack = [];
    let current = node;
    let visitedRoot = false;

    stack.push({ node: current, visitedRoot: false, childIndex: 0 });

    while (stack.length > 0) {
      const { node, visitedRoot, childIndex } = stack[stack.length - 1];

      // 如果没有子节点或者已经访问完所有子节点
      if (node.children.length === 0 || (visitedRoot && childIndex >= node.children.length)) {
        if (!visitedRoot) {
          result.push(node.value);
          stack[stack.length - 1].visitedRoot = true;
        } else {
          stack.pop();
        }
        continue;
      }

      // 如果没有访问根节点且已经访问了第一个子节点
      if (!visitedRoot && childIndex === 1) {
        result.push(node.value);
        stack[stack.length - 1].visitedRoot = true;
        continue;
      }

      // 访问下一个子节点
      stack[stack.length - 1].childIndex++;
      if (childIndex < node.children.length) {
        stack.push({ node: node.children[childIndex], visitedRoot: false, childIndex: 0 });
      }
    }

    return result;
  }
}

module.exports = { TreeNode, MultiTreeTraversal };