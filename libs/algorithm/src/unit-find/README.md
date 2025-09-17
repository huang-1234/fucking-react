# 并查集算法集合

## 概述

并查集（Union-Find）是一种树型的数据结构，用于处理一些不相交集合的合并及查询问题。它支持两种操作：查找（Find）和合并（Union），因此也被称为Union-Find数据结构。

## 算法目录

### 1. 基础并查集
- **路径**: `base.ts`
- **功能**: 基本的查找和合并操作
- **优化**: 路径压缩、按秩合并

### 2. 图形化并查集
- **路径**: `GraphUnionFind.tsx`
- **功能**: 可视化并查集操作过程
- **应用**: 教学演示、算法理解

## 核心算法设计

### 基础并查集实现

#### 数据结构设计
```typescript
class UnionFind {
    private parent: number[]    // 父节点数组
    private rank: number[]      // 秩（树的高度）数组
    private count: number       // 连通分量数量
    
    constructor(n: number) {
        this.parent = new Array(n)
        this.rank = new Array(n)
        this.count = n
        
        // 初始化：每个节点的父节点是自己
        for (let i = 0; i < n; i++) {
            this.parent[i] = i
            this.rank[i] = 1
        }
    }
}
```

#### 核心操作

1. **查找操作（Find）**
```typescript
// 基础版本
find(x: number): number {
    if (this.parent[x] !== x) {
        return this.find(this.parent[x])
    }
    return x
}

// 路径压缩优化版本
findWithPathCompression(x: number): number {
    if (this.parent[x] !== x) {
        // 路径压缩：将路径上的所有节点直接连接到根节点
        this.parent[x] = this.findWithPathCompression(this.parent[x])
    }
    return this.parent[x]
}
```

2. **合并操作（Union）**
```typescript
// 基础版本
union(x: number, y: number): boolean {
    const rootX = this.find(x)
    const rootY = this.find(y)
    
    if (rootX === rootY) {
        return false  // 已经在同一集合中
    }
    
    this.parent[rootX] = rootY
    this.count--
    return true
}

// 按秩合并优化版本
unionByRank(x: number, y: number): boolean {
    const rootX = this.find(x)
    const rootY = this.find(y)
    
    if (rootX === rootY) {
        return false
    }
    
    // 将秩小的树合并到秩大的树下
    if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY
    } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX
    } else {
        this.parent[rootY] = rootX
        this.rank[rootX]++
    }
    
    this.count--
    return true
}
```

3. **辅助操作**
```typescript
// 检查两个元素是否在同一集合中
connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
}

// 获取连通分量数量
getCount(): number {
    return this.count
}

// 获取集合大小
getSize(x: number): number {
    const root = this.find(x)
    let size = 0
    
    for (let i = 0; i < this.parent.length; i++) {
        if (this.find(i) === root) {
            size++
        }
    }
    
    return size
}
```

### 完整实现

```typescript
class UnionFind {
    private parent: number[]
    private rank: number[]
    private count: number
    
    constructor(n: number) {
        this.parent = new Array(n)
        this.rank = new Array(n)
        this.count = n
        
        for (let i = 0; i < n; i++) {
            this.parent[i] = i
            this.rank[i] = 1
        }
    }
    
    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x])  // 路径压缩
        }
        return this.parent[x]
    }
    
    union(x: number, y: number): boolean {
        const rootX = this.find(x)
        const rootY = this.find(y)
        
        if (rootX === rootY) {
            return false
        }
        
        // 按秩合并
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX
        } else {
            this.parent[rootY] = rootX
            this.rank[rootX]++
        }
        
        this.count--
        return true
    }
    
    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y)
    }
    
    getCount(): number {
        return this.count
    }
    
    // 获取所有连通分量
    getComponents(): number[][] {
        const components = new Map<number, number[]>()
        
        for (let i = 0; i < this.parent.length; i++) {
            const root = this.find(i)
            if (!components.has(root)) {
                components.set(root, [])
            }
            components.get(root)!.push(i)
        }
        
        return Array.from(components.values())
    }
}
```

## 时间复杂度分析

### 优化前
- **Find操作**: O(n) - 最坏情况下退化为链表
- **Union操作**: O(n) - 需要调用Find操作

### 优化后（路径压缩 + 按秩合并）
- **Find操作**: O(α(n)) - 接近常数时间
- **Union操作**: O(α(n)) - 接近常数时间

其中 α(n) 是阿克曼函数的反函数，增长极其缓慢，在实际应用中可以认为是常数。

## 经典应用

### 1. 岛屿数量问题

```typescript
function numIslands(grid: string[][]): number {
    if (!grid || grid.length === 0) return 0
    
    const m = grid.length
    const n = grid[0].length
    const uf = new UnionFind(m * n)
    let waterCount = 0
    
    // 将二维坐标转换为一维索引
    const getIndex = (i: number, j: number) => i * n + j
    
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === '0') {
                waterCount++
                continue
            }
            
            // 检查四个方向的相邻陆地
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
            
            for (const [di, dj] of directions) {
                const ni = i + di
                const nj = j + dj
                
                if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] === '1') {
                    uf.union(getIndex(i, j), getIndex(ni, nj))
                }
            }
        }
    }
    
    return uf.getCount() - waterCount
}
```

### 2. 朋友圈问题

```typescript
function findCircleNum(isConnected: number[][]): number {
    const n = isConnected.length
    const uf = new UnionFind(n)
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (isConnected[i][j] === 1) {
                uf.union(i, j)
            }
        }
    }
    
    return uf.getCount()
}
```

### 3. 最小生成树（Kruskal算法）

```typescript
interface Edge {
    from: number
    to: number
    weight: number
}

function kruskal(n: number, edges: Edge[]): Edge[] {
    // 按权重排序
    edges.sort((a, b) => a.weight - b.weight)
    
    const uf = new UnionFind(n)
    const mst: Edge[] = []
    
    for (const edge of edges) {
        if (uf.union(edge.from, edge.to)) {
            mst.push(edge)
            
            // 如果已经有n-1条边，MST构建完成
            if (mst.length === n - 1) {
                break
            }
        }
    }
    
    return mst
}
```

### 4. 动态连通性问题

```typescript
class DynamicConnectivity {
    private uf: UnionFind
    private edges: Set<string>
    
    constructor(n: number) {
        this.uf = new UnionFind(n)
        this.edges = new Set()
    }
    
    // 添加边
    addEdge(u: number, v: number): void {
        const edgeKey = `${Math.min(u, v)}-${Math.max(u, v)}`
        
        if (!this.edges.has(edgeKey)) {
            this.edges.add(edgeKey)
            this.uf.union(u, v)
        }
    }
    
    // 删除边（需要重建并查集）
    removeEdge(u: number, v: number): void {
        const edgeKey = `${Math.min(u, v)}-${Math.max(u, v)}`
        
        if (this.edges.has(edgeKey)) {
            this.edges.delete(edgeKey)
            this.rebuild()
        }
    }
    
    // 重建并查集
    private rebuild(): void {
        const n = this.uf.getCount() + this.countConnectedPairs()
        this.uf = new UnionFind(n)
        
        for (const edgeKey of this.edges) {
            const [u, v] = edgeKey.split('-').map(Number)
            this.uf.union(u, v)
        }
    }
    
    private countConnectedPairs(): number {
        // 计算当前连接的节点对数量
        let count = 0
        const components = this.uf.getComponents()
        
        for (const component of components) {
            count += component.length * (component.length - 1) / 2
        }
        
        return count
    }
    
    // 查询连通性
    isConnected(u: number, v: number): boolean {
        return this.uf.connected(u, v)
    }
    
    // 获取连通分量数量
    getComponentCount(): number {
        return this.uf.getCount()
    }
}
```

## 扩展变形

### 1. 带权并查集

```typescript
class WeightedUnionFind {
    private parent: number[]
    private weight: number[]  // 到根节点的权重
    
    constructor(n: number) {
        this.parent = new Array(n)
        this.weight = new Array(n)
        
        for (let i = 0; i < n; i++) {
            this.parent[i] = i
            this.weight[i] = 0
        }
    }
    
    find(x: number): number {
        if (this.parent[x] !== x) {
            const root = this.find(this.parent[x])
            this.weight[x] += this.weight[this.parent[x]]
            this.parent[x] = root
        }
        return this.parent[x]
    }
    
    union(x: number, y: number, w: number): boolean {
        const rootX = this.find(x)
        const rootY = this.find(y)
        
        if (rootX === rootY) {
            return false
        }
        
        this.parent[rootX] = rootY
        this.weight[rootX] = this.weight[y] - this.weight[x] + w
        
        return true
    }
    
    // 获取x到y的权重差
    getWeight(x: number, y: number): number | null {
        if (!this.connected(x, y)) {
            return null
        }
        
        return this.weight[x] - this.weight[y]
    }
    
    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y)
    }
}
```

### 2. 可撤销并查集

```typescript
class UndoableUnionFind {
    private parent: number[]
    private rank: number[]
    private count: number
    private history: Array<{
        type: 'union'
        x: number
        y: number
        oldParentX: number
        oldParentY: number
        oldRankX: number
        oldRankY: number
        oldCount: number
    }> = []
    
    constructor(n: number) {
        this.parent = new Array(n)
        this.rank = new Array(n)
        this.count = n
        
        for (let i = 0; i < n; i++) {
            this.parent[i] = i
            this.rank[i] = 1
        }
    }
    
    find(x: number): number {
        // 注意：不能使用路径压缩，因为需要支持撤销
        if (this.parent[x] !== x) {
            return this.find(this.parent[x])
        }
        return x
    }
    
    union(x: number, y: number): boolean {
        const rootX = this.find(x)
        const rootY = this.find(y)
        
        if (rootX === rootY) {
            return false
        }
        
        // 保存操作前的状态
        const operation = {
            type: 'union' as const,
            x: rootX,
            y: rootY,
            oldParentX: this.parent[rootX],
            oldParentY: this.parent[rootY],
            oldRankX: this.rank[rootX],
            oldRankY: this.rank[rootY],
            oldCount: this.count
        }
        
        this.history.push(operation)
        
        // 执行合并
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX
        } else {
            this.parent[rootY] = rootX
            this.rank[rootX]++
        }
        
        this.count--
        return true
    }
    
    // 撤销最后一次操作
    undo(): boolean {
        if (this.history.length === 0) {
            return false
        }
        
        const operation = this.history.pop()!
        
        // 恢复状态
        this.parent[operation.x] = operation.oldParentX
        this.parent[operation.y] = operation.oldParentY
        this.rank[operation.x] = operation.oldRankX
        this.rank[operation.y] = operation.oldRankY
        this.count = operation.oldCount
        
        return true
    }
    
    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y)
    }
    
    getCount(): number {
        return this.count
    }
}
```

## 测试用例

```typescript
// 基础功能测试
const uf = new UnionFind(5)

console.log(uf.getCount())        // 5
console.log(uf.connected(0, 1))   // false

uf.union(0, 1)
console.log(uf.connected(0, 1))   // true
console.log(uf.getCount())        // 4

uf.union(1, 2)
uf.union(3, 4)
console.log(uf.getCount())        // 2

// 岛屿数量测试
const grid = [
    ['1','1','1','1','0'],
    ['1','1','0','1','0'],
    ['1','1','0','0','0'],
    ['0','0','0','0','0']
]
console.log(numIslands(grid))     // 1

// 朋友圈测试
const isConnected = [
    [1,1,0],
    [1,1,0],
    [0,0,1]
]
console.log(findCircleNum(isConnected))  // 2
```

## 应用场景总结

1. **网络连通性**: 判断网络中两点是否连通
2. **社交网络**: 分析朋友关系、社群划分
3. **图像处理**: 连通区域标记、图像分割
4. **最小生成树**: Kruskal算法的核心数据结构
5. **动态连通性**: 在线维护图的连通性
6. **等价类划分**: 将元素按等价关系分组

## 总结

并查集是一种简单而强大的数据结构，通过路径压缩和按秩合并两种优化技术，可以在近似常数时间内完成查找和合并操作。它在解决连通性问题、等价类划分等方面有着广泛的应用，是算法竞赛和实际工程中的重要工具。