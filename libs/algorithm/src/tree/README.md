# 树算法集合

## 概述

树是一种重要的非线性数据结构，具有层次关系。本模块实现了完整的树数据结构和相关算法，包括二叉树、多叉树、树的遍历、回溯算法等核心内容。

## 算法目录

### 1. 二叉树 (Binary Tree)
- **路径**: `BinaryTree/`
- **实现**: 支持多语言版本（TypeScript、JavaScript、Rust、Go、C++）
- **功能**: 基础二叉树操作、堆实现

### 2. 树遍历 (Tree Traversal)
- **路径**: `TreeTraversal/`
- **算法**: 前序、中序、后序、层序遍历
- **支持**: 二叉树和多叉树遍历

### 3. 回溯算法 (Backtracking)
- **路径**: `backtrack/`
- **应用**: 排列组合、N皇后、数独求解

### 4. 线段树 (Segment Tree)
- **路径**: `segment-tree/`
- **功能**: 区间查询、区间更新

### 5. 树形差分 (Tree Diff)
- **路径**: `tree-diff/`
- **应用**: 协议树合并、版本对比

## 核心算法设计

### 二叉树基础结构

#### 节点定义
```typescript
class TreeNode<T> {
    val: T
    left: TreeNode<T> | null
    right: TreeNode<T> | null
    
    constructor(val: T) {
        this.val = val
        this.left = null
        this.right = null
    }
}
```

#### 基础操作
```typescript
class BinaryTree<T> {
    root: TreeNode<T> | null
    
    constructor() {
        this.root = null
    }
    
    // 插入节点
    insert(val: T): void {
        this.root = this.insertNode(this.root, val)
    }
    
    private insertNode(node: TreeNode<T> | null, val: T): TreeNode<T> {
        if (!node) {
            return new TreeNode(val)
        }
        
        if (val < node.val) {
            node.left = this.insertNode(node.left, val)
        } else {
            node.right = this.insertNode(node.right, val)
        }
        
        return node
    }
    
    // 查找节点
    search(val: T): boolean {
        return this.searchNode(this.root, val)
    }
    
    private searchNode(node: TreeNode<T> | null, val: T): boolean {
        if (!node) return false
        if (node.val === val) return true
        
        return val < node.val 
            ? this.searchNode(node.left, val)
            : this.searchNode(node.right, val)
    }
}
```

### 树遍历算法

#### 1. 前序遍历 (Preorder)
```typescript
// 递归实现
function preorderRecursive<T>(root: TreeNode<T> | null): T[] {
    const result: T[] = []
    
    function traverse(node: TreeNode<T> | null) {
        if (!node) return
        
        result.push(node.val)      // 访问根节点
        traverse(node.left)        // 遍历左子树
        traverse(node.right)       // 遍历右子树
    }
    
    traverse(root)
    return result
}

// 迭代实现
function preorderIterative<T>(root: TreeNode<T> | null): T[] {
    if (!root) return []
    
    const result: T[] = []
    const stack: TreeNode<T>[] = [root]
    
    while (stack.length > 0) {
        const node = stack.pop()!
        result.push(node.val)
        
        // 先压入右子树，再压入左子树（栈的特性）
        if (node.right) stack.push(node.right)
        if (node.left) stack.push(node.left)
    }
    
    return result
}
```

#### 2. 中序遍历 (Inorder)
```typescript
// 递归实现
function inorderRecursive<T>(root: TreeNode<T> | null): T[] {
    const result: T[] = []
    
    function traverse(node: TreeNode<T> | null) {
        if (!node) return
        
        traverse(node.left)        // 遍历左子树
        result.push(node.val)      // 访问根节点
        traverse(node.right)       // 遍历右子树
    }
    
    traverse(root)
    return result
}

// 迭代实现
function inorderIterative<T>(root: TreeNode<T> | null): T[] {
    const result: T[] = []
    const stack: TreeNode<T>[] = []
    let current = root
    
    while (current || stack.length > 0) {
        // 一直向左走到底
        while (current) {
            stack.push(current)
            current = current.left
        }
        
        // 处理栈顶节点
        current = stack.pop()!
        result.push(current.val)
        
        // 转向右子树
        current = current.right
    }
    
    return result
}
```

#### 3. 后序遍历 (Postorder)
```typescript
// 递归实现
function postorderRecursive<T>(root: TreeNode<T> | null): T[] {
    const result: T[] = []
    
    function traverse(node: TreeNode<T> | null) {
        if (!node) return
        
        traverse(node.left)        // 遍历左子树
        traverse(node.right)       // 遍历右子树
        result.push(node.val)      // 访问根节点
    }
    
    traverse(root)
    return result
}

// 迭代实现（双栈法）
function postorderIterative<T>(root: TreeNode<T> | null): T[] {
    if (!root) return []
    
    const result: T[] = []
    const stack1: TreeNode<T>[] = [root]
    const stack2: TreeNode<T>[] = []
    
    // 第一个栈用于遍历，第二个栈用于存储结果
    while (stack1.length > 0) {
        const node = stack1.pop()!
        stack2.push(node)
        
        if (node.left) stack1.push(node.left)
        if (node.right) stack1.push(node.right)
    }
    
    // 从第二个栈中弹出元素即为后序遍历结果
    while (stack2.length > 0) {
        result.push(stack2.pop()!.val)
    }
    
    return result
}
```

#### 4. 层序遍历 (Level Order)
```typescript
function levelOrder<T>(root: TreeNode<T> | null): T[][] {
    if (!root) return []
    
    const result: T[][] = []
    const queue: TreeNode<T>[] = [root]
    
    while (queue.length > 0) {
        const levelSize = queue.length
        const currentLevel: T[] = []
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!
            currentLevel.push(node.val)
            
            if (node.left) queue.push(node.left)
            if (node.right) queue.push(node.right)
        }
        
        result.push(currentLevel)
    }
    
    return result
}
```

### 回溯算法

#### 算法模板
```typescript
function backtrack<T>(
    path: T[],
    result: T[][],
    choices: T[],
    used: boolean[]
): void {
    // 终止条件
    if (path.length === choices.length) {
        result.push([...path])  // 深拷贝
        return
    }
    
    // 遍历所有选择
    for (let i = 0; i < choices.length; i++) {
        // 跳过已使用的选择
        if (used[i]) continue
        
        // 做选择
        path.push(choices[i])
        used[i] = true
        
        // 递归
        backtrack(path, result, choices, used)
        
        // 撤销选择（回溯）
        path.pop()
        used[i] = false
    }
}
```

#### 应用实例：全排列
```typescript
function permute<T>(nums: T[]): T[][] {
    const result: T[][] = []
    const path: T[] = []
    const used: boolean[] = new Array(nums.length).fill(false)
    
    function backtrack() {
        // 终止条件
        if (path.length === nums.length) {
            result.push([...path])
            return
        }
        
        // 遍历选择
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue
            
            // 做选择
            path.push(nums[i])
            used[i] = true
            
            // 递归
            backtrack()
            
            // 撤销选择
            path.pop()
            used[i] = false
        }
    }
    
    backtrack()
    return result
}
```

#### 应用实例：组合求和
```typescript
function combinationSum(candidates: number[], target: number): number[][] {
    const result: number[][] = []
    const path: number[] = []
    
    function backtrack(start: number, currentSum: number) {
        // 终止条件
        if (currentSum === target) {
            result.push([...path])
            return
        }
        
        if (currentSum > target) {
            return  // 剪枝
        }
        
        // 遍历选择
        for (let i = start; i < candidates.length; i++) {
            // 做选择
            path.push(candidates[i])
            
            // 递归（可以重复使用当前元素）
            backtrack(i, currentSum + candidates[i])
            
            // 撤销选择
            path.pop()
        }
    }
    
    backtrack(0, 0)
    return result
}
```

### 堆实现

#### 最大堆
```typescript
class MaxHeap<T> {
    private heap: T[] = []
    private compare: (a: T, b: T) => number
    
    constructor(compareFn?: (a: T, b: T) => number) {
        this.compare = compareFn || ((a, b) => (a as any) - (b as any))
    }
    
    // 获取父节点索引
    private parent(index: number): number {
        return Math.floor((index - 1) / 2)
    }
    
    // 获取左子节点索引
    private leftChild(index: number): number {
        return 2 * index + 1
    }
    
    // 获取右子节点索引
    private rightChild(index: number): number {
        return 2 * index + 2
    }
    
    // 上浮操作
    private heapifyUp(index: number): void {
        while (index > 0) {
            const parentIndex = this.parent(index)
            if (this.compare(this.heap[index], this.heap[parentIndex]) <= 0) {
                break
            }
            
            [this.heap[index], this.heap[parentIndex]] = 
            [this.heap[parentIndex], this.heap[index]]
            
            index = parentIndex
        }
    }
    
    // 下沉操作
    private heapifyDown(index: number): void {
        while (this.leftChild(index) < this.heap.length) {
            let maxIndex = this.leftChild(index)
            const rightIndex = this.rightChild(index)
            
            if (rightIndex < this.heap.length && 
                this.compare(this.heap[rightIndex], this.heap[maxIndex]) > 0) {
                maxIndex = rightIndex
            }
            
            if (this.compare(this.heap[index], this.heap[maxIndex]) >= 0) {
                break
            }
            
            [this.heap[index], this.heap[maxIndex]] = 
            [this.heap[maxIndex], this.heap[index]]
            
            index = maxIndex
        }
    }
    
    // 插入元素
    insert(value: T): void {
        this.heap.push(value)
        this.heapifyUp(this.heap.length - 1)
    }
    
    // 提取最大值
    extractMax(): T | null {
        if (this.heap.length === 0) return null
        if (this.heap.length === 1) return this.heap.pop()!
        
        const max = this.heap[0]
        this.heap[0] = this.heap.pop()!
        this.heapifyDown(0)
        
        return max
    }
    
    // 获取最大值（不删除）
    peek(): T | null {
        return this.heap.length > 0 ? this.heap[0] : null
    }
    
    // 获取堆大小
    size(): number {
        return this.heap.length
    }
    
    // 检查是否为空
    isEmpty(): boolean {
        return this.heap.length === 0
    }
}
```

## 时间复杂度分析

| 算法 | 时间复杂度 | 空间复杂度 | 特点 |
|------|------------|------------|------|
| 前序遍历 | O(n) | O(h) | 根-左-右 |
| 中序遍历 | O(n) | O(h) | 左-根-右，BST有序 |
| 后序遍历 | O(n) | O(h) | 左-右-根 |
| 层序遍历 | O(n) | O(w) | 广度优先 |
| 堆插入 | O(log n) | O(1) | 维护堆性质 |
| 堆删除 | O(log n) | O(1) | 重新堆化 |
| 回溯算法 | O(n!) | O(n) | 指数级复杂度 |

注：h为树的高度，w为树的最大宽度，n为节点数

## 应用场景

### 1. 二叉搜索树
- 数据库索引
- 文件系统
- 表达式解析

### 2. 堆
- 优先队列
- 堆排序
- Top K问题

### 3. 回溯算法
- 组合优化问题
- 约束满足问题
- 游戏AI（如象棋、围棋）

### 4. 树遍历
- 文件系统遍历
- DOM树操作
- 语法树分析

## 测试用例

```typescript
// 二叉树测试
const tree = new BinaryTree<number>()
tree.insert(5)
tree.insert(3)
tree.insert(7)
tree.insert(1)
tree.insert(9)

console.log(tree.search(7))  // true
console.log(tree.search(4))  // false

// 遍历测试
const root = new TreeNode(1)
root.left = new TreeNode(2)
root.right = new TreeNode(3)
root.left.left = new TreeNode(4)
root.left.right = new TreeNode(5)

console.log(preorderRecursive(root))   // [1, 2, 4, 5, 3]
console.log(inorderRecursive(root))    // [4, 2, 5, 1, 3]
console.log(postorderRecursive(root))  // [4, 5, 2, 3, 1]

// 堆测试
const maxHeap = new MaxHeap<number>()
maxHeap.insert(10)
maxHeap.insert(5)
maxHeap.insert(15)
maxHeap.insert(3)

console.log(maxHeap.extractMax())  // 15
console.log(maxHeap.peek())        // 10

// 回溯测试
console.log(permute([1, 2, 3]))
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

console.log(combinationSum([2, 3, 6, 7], 7))
// [[2,2,3],[7]]
```

## 总结

树算法是计算机科学中的核心内容，涵盖了数据结构设计、算法优化、问题求解等多个方面。掌握树的基本操作、遍历算法、堆结构和回溯思想，对于解决复杂的计算问题具有重要意义。