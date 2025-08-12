// 树节点泛型类
export class TreeNode<T> {
  val: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;

  constructor(
    val: T,
    left: TreeNode<T> | null = null,
    right: TreeNode<T> | null = null
  ) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 二叉树操作类
export class BinaryTree<T> {
  root: TreeNode<T> | null;

  constructor(root: TreeNode<T> | null = null) {
    this.root = root;
  }

  /**
   * 构建二叉搜索树
   * @param arr
   * @returns
   */
  _buildTree(arr: T[]): TreeNode<T> | null {
    if (!arr.length) return null;
    const mid = Math.floor(arr.length / 2);
    const root = new TreeNode<T>(arr[mid]);
    root.left = this._buildTree(arr.slice(0, mid));
    root.right = this._buildTree(arr.slice(mid + 1));
    return root;
  }

  /**
   * 前序遍历（根-左-右）
   * @returns
   */
  preOrder(): T[] {
    const result: T[] = [];
    const dfs = (node: TreeNode<T> | null) => {
      if (!node) return;
      result.push(node.val);
      dfs(node.left);
      dfs(node.right);
    };
    dfs(this.root);
    return result;
  }

  // 中序遍历（左-根-右）
  inOrder(): T[] {
    const result: T[] = [];
    const dfs = (node: TreeNode<T> | null) => {
      if (!node) return;
      dfs(node.left);
      result.push(node.val);
      dfs(node.right);
    };
    dfs(this.root);
    return result;
  }

  // 后序遍历（左-右-根）
  postOrder(): T[] {
    const result: T[] = [];
    const dfs = (node: TreeNode<T> | null) => {
      if (!node) return;
      dfs(node.left);
      dfs(node.right);
      result.push(node.val);
    };
    dfs(this.root);
    return result;
  }

  // 层序遍历
  levelOrder(): T[] {
    const result: T[] = [];
    if (!this.root) return result;

    const queue: TreeNode<T>[] = [this.root];
    while (queue.length) {
      const node = queue.shift()!;
      result.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return result;
  }

  // 查找节点
  search(target: T): TreeNode<T> | null {
    const queue: TreeNode<T>[] = this.root ? [this.root] : [];
    while (queue.length) {
      const node = queue.shift()!;
      if (node.val === target) return node;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return null;
  }

  // 获取树高度
  getHeight(): number {
    const dfs = (node: TreeNode<T> | null): number => {
      if (!node) return 0;
      return Math.max(dfs(node.left), dfs(node.right)) + 1;
    };
    return dfs(this.root);
  }
}