/**
 * @desc 使用js+jsDoc类型提示实现一个类型、内部有树的前序遍历、中序遍历、后续遍历以及层序遍历；
 * 每种遍历方式都有递归和迭代两种方式、每个遍历方式都有返回值、每个值都有类型
 */
/**
 * @desc 树节点，树节点有值、左子节点、右子节点
 * @class TreeNode
 * @property {T} value - 节点的值
 * @property {TreeNode|null} left - 左子节点，默认值为null
 * @property {TreeNode|null} right - 右子节点，默认值为null
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
     * @type {TreeNode|null}
     */
    this.left = null;
    /**
     * @type {TreeNode|null}
     */
    this.right = null;
  }
}

/**
 * @desc 树节点，树节点有值、左子节点、右子节点
 * @interface TreeNode
 * @property {T} value - 节点的值
 * @property {TreeNode|null} left - 左子节点，默认值为null
 * @property {TreeNode|null} right - 右子节点，默认值为null
 */

/**
 * @desc 树遍历类，树遍历类有树的根节点
 * @class TreeTraversal
 * @property {TreeNode|null} tree - 二叉树根节点，默认值为null
 */
class TreeTraversal {
  /**
   * @param {TreeNode|null} tree - 二叉树根节点
   */
  constructor(tree) {
    this.tree = tree;
  }

  /**
   * 前序遍历（递归）：根-左-右
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  preOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];
    return [
      node.value,
      ...this.preOrderTraversalRecursive(node.left),
      ...this.preOrderTraversalRecursive(node.right)
    ];
  }

  /**
   * 前序遍历（迭代）：根-左-右
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  preOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const stack = [node];

    while (stack.length > 0) {
      const current = stack.pop();
      result.push(current.value);

      // 先压入右节点，再压入左节点，这样出栈时会先处理左节点
      if (current.right) stack.push(current.right);
      if (current.left) stack.push(current.left);
    }

    return result;
  }

  /**
   * 中序遍历（递归）：左-根-右
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  inOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];
    return [
      ...this.inOrderTraversalRecursive(node.left),
      node.value,
      ...this.inOrderTraversalRecursive(node.right)
    ];
  }

  /**
   * 中序遍历（迭代）：左-根-右
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  inOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const stack = [];
    let current = node;

    while (current || stack.length > 0) {
      // 遍历到最左叶子节点
      while (current) {
        stack.push(current);
        current = current.left;
      }
      // 访问根节点
      current = stack.pop();
      // 访问根节点
      result.push(current.value);
      // 遍历右子树
      current = current.right;
    }

    return result;
  }

  /**
   * 后序遍历（递归）：左-右-根
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  postOrderTraversalRecursive(node = this.tree) {
    if (!node) return [];
    return [
      ...this.postOrderTraversalRecursive(node.left),
      ...this.postOrderTraversalRecursive(node.right),
      node.value
    ];
  }

  /**
   * 后序遍历（迭代）：左-右-根
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  postOrderTraversalIterative(node = this.tree) {
    if (!node) return [];

    const result = [];
    const stack = [node];
    const outputStack = [];

    while (stack.length > 0) {
      const current = stack.pop();
      outputStack.push(current);

      // 先压入左节点，再压入右节点
      if (current.left) stack.push(current.left);
      if (current.right) stack.push(current.right);
    }

    // 从输出栈中弹出节点，顺序是左-右-根
    while (outputStack.length > 0) {
      result.push(outputStack.pop().value);
    }

    return result;
  }

  /**
   * 层序遍历（广度优先）
   * @param {TreeNode|null} node - 当前节点
   * @returns {Array<T>} - 遍历结果数组
   */
  levelOrderTraversal(node = this.tree) {
    if (!node) return [];

    const result = [];
    const queue = [node];

    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current.value);

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return result;
  }
  /**
   * 将这颗树可视化的打印出来
   */
  toTree() {
    console.log(this.preOrderTraversalRecursive());
  }
}

module.exports = TreeTraversal;


(function test() {
  const tree = new TreeTraversal(new TreeNode(1));
  tree.tree.left = new TreeNode(2);
  tree.tree.right = new TreeNode(3);
  tree.tree.left.left = new TreeNode(4);
  tree.tree.left.right = new TreeNode(5);
  tree.tree.right.left = new TreeNode(6);
  tree.tree.right.right = new TreeNode(7);

  tree.toTree();

  // console.log(tree.preOrderTraversalRecursive());
  // console.log(tree.preOrderTraversalIterative());
  // console.log(tree.inOrderTraversalRecursive());
  // console.log(tree.inOrderTraversalIterative());
  // console.log(tree.postOrderTraversalRecursive());
  // console.log(tree.postOrderTraversalIterative());
  // console.log(tree.levelOrderTraversal());
})()