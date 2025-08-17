import { describe, it, expect, beforeEach } from 'vitest';
import { TreeNode, MultiTreeTraversal } from './multi-tree.js';

describe('MultiTreeTraversal', () => {
  let root;
  let traversal;

  // 创建一个测试用的多叉树
  //       1
  //     / | \
  //    2  3  4
  //   / \    |
  //  5   6   7
  beforeEach(() => {
    root = new TreeNode(1);
    const node2 = new TreeNode(2);
    const node3 = new TreeNode(3);
    const node4 = new TreeNode(4);
    const node5 = new TreeNode(5);
    const node6 = new TreeNode(6);
    const node7 = new TreeNode(7);

    root.children.push(node2);
    root.children.push(node3);
    root.children.push(node4);
    node2.children.push(node5);
    node2.children.push(node6);
    node4.children.push(node7);

    traversal = new MultiTreeTraversal(root);
  });

  describe('前序遍历', () => {
    it('递归方式应该返回正确的前序遍历结果', () => {
      const expected = [1, 2, 5, 6, 3, 4, 7];
      expect(traversal.preOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的前序遍历结果', () => {
      const expected = [1, 2, 5, 6, 3, 4, 7];
      expect(traversal.preOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new MultiTreeTraversal(null);
      expect(emptyTraversal.preOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.preOrderTraversalIterative()).toEqual([]);
    });
  });

  describe('后序遍历', () => {
    it('递归方式应该返回正确的后序遍历结果', () => {
      const expected = [5, 6, 2, 3, 7, 4, 1];
      expect(traversal.postOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的后序遍历结果', () => {
      const expected = [5, 6, 2, 3, 7, 4, 1];
      expect(traversal.postOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new MultiTreeTraversal(null);
      expect(emptyTraversal.postOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.postOrderTraversalIterative()).toEqual([]);
    });
  });

  describe('中序遍历', () => {
    it('递归方式应该返回正确的中序遍历结果', () => {
      // 多叉树的中序遍历：先访问第一个子节点，然后访问根节点，然后访问其余子节点
      const expected = [5, 6, 2, 1, 3, 7, 4];
      expect(traversal.inOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的中序遍历结果', () => {
      const expected = [5, 6, 2, 1, 3, 7, 4];
      expect(traversal.inOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new MultiTreeTraversal(null);
      expect(emptyTraversal.inOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.inOrderTraversalIterative()).toEqual([]);
    });

    it('叶子节点应该只返回自身值', () => {
      const leafNode = new TreeNode(42);
      const leafTraversal = new MultiTreeTraversal(leafNode);
      expect(leafTraversal.inOrderTraversalRecursive()).toEqual([42]);
      expect(leafTraversal.inOrderTraversalIterative()).toEqual([42]);
    });
  });

  describe('层序遍历', () => {
    it('递归方式应该返回正确的层序遍历结果', () => {
      const expected = [1, 2, 3, 4, 5, 6, 7];
      expect(traversal.levelOrderTraversalRecursive()).toEqual(expected);
    });

    it('迭代方式应该返回正确的层序遍历结果', () => {
      const expected = [1, 2, 3, 4, 5, 6, 7];
      expect(traversal.levelOrderTraversalIterative()).toEqual(expected);
    });

    it('空树应该返回空数组', () => {
      const emptyTraversal = new MultiTreeTraversal(null);
      expect(emptyTraversal.levelOrderTraversalRecursive()).toEqual([]);
      expect(emptyTraversal.levelOrderTraversalIterative()).toEqual([]);
    });
  });

  describe('特殊情况测试', () => {
    it('单节点树应该正确处理', () => {
      const singleNode = new TreeNode(99);
      const singleTraversal = new MultiTreeTraversal(singleNode);

      expect(singleTraversal.preOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.preOrderTraversalIterative()).toEqual([99]);
      expect(singleTraversal.inOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.inOrderTraversalIterative()).toEqual([99]);
      expect(singleTraversal.postOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.postOrderTraversalIterative()).toEqual([99]);
      expect(singleTraversal.levelOrderTraversalRecursive()).toEqual([99]);
      expect(singleTraversal.levelOrderTraversalIterative()).toEqual([99]);
    });

    it('线性树（每个节点只有一个子节点）应该正确处理', () => {
      const linearRoot = new TreeNode(1);
      const node2 = new TreeNode(2);
      const node3 = new TreeNode(3);

      linearRoot.children.push(node2);
      node2.children.push(node3);

      const linearTraversal = new MultiTreeTraversal(linearRoot);

      expect(linearTraversal.preOrderTraversalRecursive()).toEqual([1, 2, 3]);
      expect(linearTraversal.preOrderTraversalIterative()).toEqual([1, 2, 3]);
      expect(linearTraversal.inOrderTraversalRecursive()).toEqual([2, 3, 1]);
      expect(linearTraversal.inOrderTraversalIterative()).toEqual([2, 3, 1]);
      expect(linearTraversal.postOrderTraversalRecursive()).toEqual([3, 2, 1]);
      expect(linearTraversal.postOrderTraversalIterative()).toEqual([3, 2, 1]);
      expect(linearTraversal.levelOrderTraversalRecursive()).toEqual([1, 2, 3]);
      expect(linearTraversal.levelOrderTraversalIterative()).toEqual([1, 2, 3]);
    });
  });
});
