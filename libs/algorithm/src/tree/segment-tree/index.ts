class SegmentTreeNode {
  start: number;        // 区间起点
  end: number;          // 区间终点
  sum: number;          // 区间和
  lazy: number;         // 懒惰标记（存储未下放的更新值）
  left?: SegmentTreeNode | null;     // 左子节点
  right?: SegmentTreeNode | null;    // 右子节点
  constructor(start: any, end: any) {
    this.start = start;    // 区间起点
    this.end = end;        // 区间终点
    this.sum = 0;         // 区间和
    this.lazy = 0;        // 懒惰标记（存储未下放的更新值）
    this.left = null;     // 左子节点
    this.right = null;    // 右子节点
  }
}

class SegmentTree {
  nums: number[];       // 存储原始数组
  root: SegmentTreeNode;
  constructor(nums: number[]) {
    this.nums = nums;
    this.root = this.buildTree(0, nums.length - 1);
  }

  // 递归构建线段树
  buildTree(start: number, end: number) {
    const node = new SegmentTreeNode(start, end);
    if (start === end) {
      node.sum = this.nums[start]; // 叶子节点存储数组值
      return node;
    }
    const mid = Math.floor((start + end) / 2);
    node.left = this.buildTree(start, mid);
    node.right = this.buildTree(mid + 1, end);
    node.sum = node.left.sum + node.right.sum; // 合并子区间和
    return node;
  }

  // 下放懒惰标记
  pushDown(node: SegmentTreeNode) {
    if (node.lazy !== 0) {
      const mid = Math.floor((node.start + node.end) / 2);
      // 更新左子节点
      node.left && (node.left.sum += node.lazy * (mid - node.start + 1));
      node.left && (node.left.lazy += node.lazy);
      // 更新右子节点
      node.right && (node.right.sum += node.lazy * (node.end - mid));
      node.right && (node.right.lazy += node.lazy);
      node.lazy = 0; // 清空当前标记
    }
  }

  // 区间更新：给 [l, r] 内所有元素加 val
  update(l: number, r: number, val: number, node?: SegmentTreeNode | null) {
    if (!node) return;
    if (l > node.end || r < node.start) return; // 无交集

    // 当前节点区间完全包含在目标区间内
    if (l <= node.start && node.end <= r) {
      node.sum += val * (node.end - node.start + 1);
      if (node.start !== node.end) node.lazy += val; // 非叶子节点存储懒惰标记
      return;
    }

    this.pushDown(node); // 下放已有标记
    const mid = Math.floor((node.start + node.end) / 2);
    if (l <= mid) this.update(l, r, val, node.left);
    if (r > mid) this.update(l, r, val, node.right);
    node.sum = (node.left?.sum || 0) + (node.right?.sum || 0); // 更新父节点
  }

  // 区间查询：求 [l, r] 的元素和
  query(l: number, r: number, node?: SegmentTreeNode | null) {
    if (!node) return 0;
    if (l > node.end || r < node.start) return 0; // 无交集
    if (l <= node.start && node.end <= r) return node.sum; // 完全包含

    this.pushDown(node); // 下放标记确保数据最新
    const mid = Math.floor((node.start + node.end) / 2);
    let sum = 0;
    if (l <= mid) sum += this.query(l, r, node.left);
    if (r > mid) sum += this.query(l, r, node.right);
    return sum;
  }
}

// 示例用法
const nums = [1, 3, 5, 7, 9];
const segTree = new SegmentTree(nums);

console.log("初始区间和 [1, 3]:", segTree.query(1, 3)); // 3+5+7=15

segTree.update(1, 3, 2); // 给索引 1~3 的元素加 2
console.log("更新后区间和 [1, 3]:", segTree.query(1, 3)); // (3+2)+(5+2)+(7+2)=21