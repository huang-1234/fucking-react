import { describe, it, expect, beforeEach } from 'vitest';
import TreeTraversal from './base.js';

// 从文件中提取 TreeNode 类
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

describe('TreeTraversal', () => {
  let root;
  let traversal;

  // 创建一个测试用的二叉树
  //       1
  //      / \
  //     2   3
  //    / \ / \
  //   4  5 6  7
  beforeEach(() => {
    root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.left.left = new TreeNode(4);
    root.left.right = new TreeNode(5);
    root.right.left = new TreeNode(6);
    root.right.right = new TreeNode(7);

    traversal = new TreeTraversal(root);
  });

  describe('前序遍历', () => {
    it('递归方式应该返回正确的前序遍历结果', () => {
      const expected = [1, 2, 4, 5, 3, 6, 7];
      expect(traversal.preOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的前序遍历结果', () => {
      const expected = [1, 2, 4, 5, 3, 6, 7];
      expect(traversal.preOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new TreeTraversal(null);
      expect(emptyTraversal.preOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.preOrderTraversalIterative()).toEqual([]);
    });
  });

  describe('中序遍历', () => {
    it('递归方式应该返回正确的中序遍历结果', () => {
      const expected = [4, 2, 5, 1, 6, 3, 7];
      expect(traversal.inOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的中序遍历结果', () => {
      const expected = [4, 2, 5, 1, 6, 3, 7];
      expect(traversal.inOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new TreeTraversal(null);
      expect(emptyTraversal.inOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.inOrderTraversalIterative()).toEqual([]);
    });
  });

  describe('后序遍历', () => {
    it('递归方式应该返回正确的后序遍历结果', () => {
      const expected = [4, 5, 2, 6, 7, 3, 1];
      expect(traversal.postOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的后序遍历结果', () => {
      const expected = [4, 5, 2, 6, 7, 3, 1];
      expect(traversal.postOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new TreeTraversal(null);
      expect(emptyTraversal.postOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.postOrderTraversalIterative()).toEqual([]);
    });
  });

  describe('层序遍历', () => {
    it('应该返回正确的层序遍历结果', () => {
      const expected = [1, 2, 3, 4, 5, 6, 7];
      expect(traversal.levelOrderTraversal()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new TreeTraversal(null);
      expect(emptyTraversal.levelOrderTraversal()).toEqual([]);
    });
  });

  describe('特殊情况测试', () => {
    it('单节点树应该正确处理', () => {
      const singleNode = new TreeNode(99);
      const singleTraversal = new TreeTraversal(singleNode);

      expect(singleTraversal.preOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.preOrderTraversalIterative()).toEqual([99]);
      expect(singleTraversal.inOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.inOrderTraversalIterative()).toEqual([99]);
      expect(singleTraversal.postOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.postOrderTraversalIterative()).toEqual([99]);
      expect(singleTraversal.levelOrderTraversal()).toEqual([99]);
    });

    it('不平衡树应该正确处理', () => {
      // 创建一个左倾斜的树
      //      1
      //     /
      //    2
      //   /
      //  3
      const skewedRoot = new TreeNode(1);
      skewedRoot.left = new TreeNode(2);
      skewedRoot.left.left = new TreeNode(3);

      const skewedTraversal = new TreeTraversal(skewedRoot);

      expect(skewedTraversal.preOrderTraversalRecursive()).toEqual([1, 2, 3]);
      expect(skewedTraversal.preOrderTraversalIterative()).toEqual([1, 2, 3]);
      expect(skewedTraversal.inOrderTraversalRecursive()).toEqual([3, 2, 1]);
      expect(skewedTraversal.inOrderTraversalIterative()).toEqual([3, 2, 1]);
      expect(skewedTraversal.postOrderTraversalRecursive()).toEqual([3, 2, 1]);
      expect(skewedTraversal.postOrderTraversalIterative()).toEqual([3, 2, 1]);
      expect(skewedTraversal.levelOrderTraversal()).toEqual([1, 2, 3]);
    });

    it('右倾斜树应该正确处理', () => {
      // 创建一个右倾斜的树
      //  1
      //   \
      //    2
      //     \
      //      3
      const rightSkewedRoot = new TreeNode(1);
      rightSkewedRoot.right = new TreeNode(2);
      rightSkewedRoot.right.right = new TreeNode(3);

      const rightSkewedTraversal = new TreeTraversal(rightSkewedRoot);

      expect(rightSkewedTraversal.preOrderTraversalRecursive()).toEqual([1, 2, 3]);
      expect(rightSkewedTraversal.preOrderTraversalIterative()).toEqual([1, 2, 3]);
      expect(rightSkewedTraversal.inOrderTraversalRecursive()).toEqual([1, 2, 3]);
      expect(rightSkewedTraversal.inOrderTraversalIterative()).toEqual([1, 2, 3]);
      expect(rightSkewedTraversal.postOrderTraversalRecursive()).toEqual([3, 2, 1]);
      expect(rightSkewedTraversal.postOrderTraversalIterative()).toEqual([3, 2, 1]);
      expect(rightSkewedTraversal.levelOrderTraversal()).toEqual([1, 2, 3]);
    });
  });
});
