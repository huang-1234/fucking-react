# 图算法集合

## 概述

图是一种重要的非线性数据结构，由顶点（Vertex）和边（Edge）组成。本模块实现了完整的图数据结构和经典图算法，包括深度优先搜索（DFS）、广度优先搜索（BFS）等核心算法。

## 算法目录

### 1. 图数据结构 (Graph)
- **路径**: `graph.ts`
- **特性**: 支持有向/无向图、带权边、动态增删节点
- **实现**: 基于邻接表的高效实现

### 2. 深度优先搜索 (DFS)
- **路径**: `dfs.js`
- **应用**: 路径查找、环检测、连通分量

### 3. 广度优先搜索 (BFS)
- **路径**: `bfs.js`
- **应用**: 最短路径、层次遍历、二分图检测

### 4. 依赖关系图
- **路径**: `deps.ts`
- **应用**: 模块依赖分析、构建顺序确定

## 核心算法设计

### 图数据结构

#### 设计思路
使用邻接表表示图，支持泛型顶点类型，提供完整的图操作接口。

#### 核心实现
```typescript
export class Graph<T extends string | number> {
  private isDirected: boolean
  private adjacencyList: Map<T, { vertex: T; weight?: number }[]>

  constructor(isDirected = false) {
    this.isDirected = isDirected
    this.adjacencyList = new Map()
  }

  // 添加顶点
  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, [])
    }
  }

  // 添加边（可选权重）
  addEdge(source: T, destination: T, weight?: number): void {
    this.addVertex(source)
    this.addVertex(destination)
    this.adjacencyList.get(source)?.push({ vertex: destination, weight })

    // 无向图需双向连接
    if (!this.isDirected) {
      this.adjacencyList.get(destination)?.push({ vertex: source, weight })
    }
  }
}
```

#### 时间复杂度分析
- **添加顶点**: O(1)
- **添加边**: O(1)
- **查找邻居**: O(1)
- **空间复杂度**: O(V + E)

### 深度优先搜索 (DFS)

#### 算法原理
DFS是一种用于遍历或搜索树或图的算法。它沿着图的深度遍历图的节点，尽可能深地搜索图的分支。

#### 核心步骤

1. **递归实现**
```javascript
function dfsRecursive(graph, startVertex, visited = new Set()) {
  // 标记当前顶点为已访问
  visited.add(startVertex)
  console.log(startVertex)

  // 递归访问所有未访问的邻接点
  const neighbors = graph.getNeighbors(startVertex)
  for (const edge of neighbors) {
    if (!visited.has(edge.vertex)) {
      dfsRecursive(graph, edge.vertex, visited)
    }
  }

  return Array.from(visited)
}
```

2. **迭代实现**
```javascript
function dfsIterative(graph, startVertex) {
  const visited = new Set()
  const stack = [startVertex]
  const result = []

  while (stack.length > 0) {
    const currentVertex = stack.pop()

    if (!visited.has(currentVertex)) {
      visited.add(currentVertex)
      result.push(currentVertex)

      // 将所有未访问的邻接点加入栈
      const neighbors = graph.getNeighbors(currentVertex)
      for (const edge of neighbors.reverse()) {
        if (!visited.has(edge.vertex)) {
          stack.push(edge.vertex)
        }
      }
    }
  }

  return result
}
```

#### 应用场景

1. **路径查找**
```javascript
function findPath(graph, start, target) {
  const visited = new Set()
  const path = []

  function dfs(vertex) {
    if (vertex === target) {
      path.push(vertex)
      return true
    }

    visited.add(vertex)
    path.push(vertex)

    for (const edge of graph.getNeighbors(vertex)) {
      if (!visited.has(edge.vertex)) {
        if (dfs(edge.vertex)) {
          return true
        }
      }
    }

    path.pop()  // 回溯
    return false
  }

  return dfs(start) ? path : null
}
```

2. **环检测**
```javascript
function hasCycle(graph) {
  const visited = new Set()
  const recursionStack = new Set()

  function dfs(vertex) {
    visited.add(vertex)
    recursionStack.add(vertex)

    for (const edge of graph.getNeighbors(vertex)) {
      if (!visited.has(edge.vertex)) {
        if (dfs(edge.vertex)) return true
      } else if (recursionStack.has(edge.vertex)) {
        return true  // 发现环
      }
    }

    recursionStack.delete(vertex)
    return false
  }

  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      if (dfs(vertex)) return true
    }
  }

  return false
}
```

### 广度优先搜索 (BFS)

#### 算法原理
BFS是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着宽度方向遍历，先访问所有邻接节点，然后再访问下一层节点。

#### 核心步骤

1. **标准BFS实现**
```javascript
function bfs(graph, startVertex) {
  const visited = new Set()
  const result = []
  const queue = [startVertex]

  // 标记起始顶点为已访问
  visited.add(startVertex)

  while (queue.length > 0) {
    // 出队
    const currentVertex = queue.shift()
    result.push(currentVertex)

    // 将所有未访问的邻接点加入队列
    for (const edge of graph.getNeighbors(currentVertex)) {
      if (!visited.has(edge.vertex)) {
        visited.add(edge.vertex)
        queue.push(edge.vertex)
      }
    }
  }

  return result
}
```

2. **最短路径（无权图）**
```javascript
function shortestPath(graph, start, target) {
  const visited = new Set()
  const queue = [{vertex: start, path: [start]}]
  visited.add(start)

  while (queue.length > 0) {
    const {vertex, path} = queue.shift()

    if (vertex === target) {
      return path
    }

    for (const edge of graph.getNeighbors(vertex)) {
      if (!visited.has(edge.vertex)) {
        visited.add(edge.vertex)
        queue.push({
          vertex: edge.vertex,
          path: [...path, edge.vertex]
        })
      }
    }
  }

  return null  // 无路径
}
```

#### 应用场景

1. **层次遍历**
```javascript
function levelOrder(graph, startVertex) {
  const visited = new Set()
  const levels = []
  let queue = [startVertex]
  visited.add(startVertex)

  while (queue.length > 0) {
    const currentLevel = [...queue]
    levels.push(currentLevel)
    queue = []

    for (const vertex of currentLevel) {
      for (const edge of graph.getNeighbors(vertex)) {
        if (!visited.has(edge.vertex)) {
          visited.add(edge.vertex)
          queue.push(edge.vertex)
        }
      }
    }
  }

  return levels
}
```

2. **二分图检测**
```javascript
function isBipartite(graph) {
  const color = new Map()

  function bfsCheck(start) {
    const queue = [start]
    color.set(start, 0)

    while (queue.length > 0) {
      const vertex = queue.shift()
      const currentColor = color.get(vertex)

      for (const edge of graph.getNeighbors(vertex)) {
        if (!color.has(edge.vertex)) {
          color.set(edge.vertex, 1 - currentColor)
          queue.push(edge.vertex)
        } else if (color.get(edge.vertex) === currentColor) {
          return false  // 相邻节点同色，不是二分图
        }
      }
    }

    return true
  }

  for (const vertex of graph.getVertices()) {
    if (!color.has(vertex)) {
      if (!bfsCheck(vertex)) return false
    }
  }

  return true
}
```

## 算法对比分析

| 算法 | 时间复杂度 | 空间复杂度 | 特点 | 适用场景 |
|------|------------|------------|------|----------|
| DFS | O(V + E) | O(V) | 深度优先，使用栈 | 路径查找、环检测 |
| BFS | O(V + E) | O(V) | 广度优先，使用队列 | 最短路径、层次遍历 |

## 高级应用

### 1. 连通分量
```javascript
function findConnectedComponents(graph) {
  const visited = new Set()
  const components = []

  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      const component = dfsRecursive(graph, vertex, visited)
      components.push(component)
    }
  }

  return components
}
```

### 2. 拓扑排序
```javascript
function topologicalSort(graph) {
  const visited = new Set()
  const stack = []

  function dfs(vertex) {
    visited.add(vertex)

    for (const edge of graph.getNeighbors(vertex)) {
      if (!visited.has(edge.vertex)) {
        dfs(edge.vertex)
      }
    }

    stack.push(vertex)  // 后序遍历
  }

  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      dfs(vertex)
    }
  }

  return stack.reverse()
}
```

## 可视化支持

本模块提供了完整的可视化组件，支持：
- 图结构可视化
- 算法执行过程动画
- 交互式图编辑
- 多种布局算法

## 测试用例

```javascript
// 创建图
const graph = new Graph(false)  // 无向图
graph.addEdge(1, 2)
graph.addEdge(1, 3)
graph.addEdge(2, 4)
graph.addEdge(3, 4)

// DFS遍历
console.log(dfsRecursive(graph, 1))  // [1, 2, 4, 3]

// BFS遍历
console.log(bfs(graph, 1))           // [1, 2, 3, 4]

// 最短路径
console.log(shortestPath(graph, 1, 4))  // [1, 2, 4] 或 [1, 3, 4]

// 连通性检测
console.log(isConnected(graph))      // true
```

## 总结

图算法是计算机科学中的重要组成部分，DFS和BFS作为两种基本的图遍历算法，为解决复杂的图问题提供了基础。通过合理选择算法和数据结构，可以高效解决路径查找、连通性分析、拓扑排序等实际问题。