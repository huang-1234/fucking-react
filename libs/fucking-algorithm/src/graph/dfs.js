/**
 * 深度优先搜索(DFS)算法实现
 *
 * DFS是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着一条路径尽可能深入，
 * 直到无法继续为止，然后回溯到前一个节点，继续探索其他路径。
 */

const { Graph } = require('./dfs_bfs_base');

/**
 * @typedef {import('./dfs_bfs_base').VertexId} VertexId
 * @typedef {import('./dfs_bfs_base').VertexMetadata} VertexMetadata
 * @typedef {import('./dfs_bfs_base').EdgeData} EdgeData
 */

/**
 * 使用递归方式实现DFS
 * @param {Graph} graph - 要遍历的图
 * @param {VertexId} startVertex - 开始遍历的顶点
 * @param {function(VertexId, VertexMetadata): void} [callback] - 访问顶点时的回调函数
 * @returns {VertexId[]} 遍历顺序的顶点数组
 */
function dfsRecursive(graph, startVertex, callback) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {VertexId[]} */
  const result = [];

  /**
   * DFS递归辅助函数
   * @param {VertexId} vertex - 当前访问的顶点
   */
  function dfs(vertex) {
    if (!vertex || visited.has(vertex)) return;

    // 标记为已访问
    visited.add(vertex);

    // 添加到结果数组
    result.push(vertex);

    // 如果提供了回调函数，则调用
    if (callback) callback(vertex, graph.getVertexMetadata(vertex));

    // 递归访问所有邻接点
    for (const edge of graph.getNeighbors(vertex)) {
      if (!visited.has(edge.vertex)) {
        dfs(edge.vertex);
      }
    }
  }

  // 开始DFS
  dfs(startVertex);

  return result;
}

/**
 * 使用迭代方式实现DFS（使用栈）
 * @param {Graph} graph - 要遍历的图
 * @param {VertexId} startVertex - 开始遍历的顶点
 * @param {function(VertexId, VertexMetadata): void} [callback] - 访问顶点时的回调函数
 * @returns {VertexId[]} 遍历顺序的顶点数组
 */
function dfsIterative(graph, startVertex, callback) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {VertexId[]} */
  const result = [];
  /** @type {VertexId[]} */
  const stack = [startVertex];

  // 如果起始顶点不存在，直接返回空数组
  if (!startVertex) return result;

  // 标记起始顶点为已访问
  visited.add(startVertex);

  while (stack.length > 0) {
    // 弹出栈顶元素
    const currentVertex = stack.pop();

    // 添加到结果数组
    result.push(currentVertex);

    // 如果提供了回调函数，则调用
    if (callback) callback(currentVertex, graph.getVertexMetadata(currentVertex));

    // 将所有未访问的邻接点压入栈中（注意：倒序压入以保持与递归DFS相同的访问顺序）
    const neighbors = graph.getNeighbors(currentVertex);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighborVertex = neighbors[i].vertex;
      if (!visited.has(neighborVertex)) {
        visited.add(neighborVertex);
        stack.push(neighborVertex);
      }
    }
  }

  return result;
}

/**
 * 使用DFS查找两点之间的路径
 * @param {Graph} graph - 图
 * @param {VertexId} startVertex - 起始顶点
 * @param {VertexId} endVertex - 目标顶点
 * @returns {VertexId[]|null} 找到的路径，如果不存在则返回null
 */
function findPathDFS(graph, startVertex, endVertex) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {Map<VertexId, VertexId|null>} */
  const predecessor = new Map();

  /**
   * DFS递归辅助函数
   * @param {VertexId} vertex - 当前访问的顶点
   * @returns {boolean} 是否找到路径
   */
  function dfs(vertex) {
    // 标记为已访问
    visited.add(vertex);

    // 如果找到目标顶点，返回true
    if (vertex === endVertex) {
      return true;
    }

    // 递归访问所有邻接点
    for (const edge of graph.getNeighbors(vertex)) {
      const neighbor = edge.vertex;
      if (!visited.has(neighbor)) {
        predecessor.set(neighbor, vertex);
        if (dfs(neighbor)) {
          return true;
        }
      }
    }

    return false;
  }

  // 初始化起始顶点的前驱为null
  predecessor.set(startVertex, null);

  // 如果找不到路径，返回null
  if (!dfs(startVertex)) {
    return null;
  }

  // 重建路径
  /** @type {VertexId[]} */
  const path = [];
  let current = endVertex;

  while (current !== null) {
    path.unshift(current);
    current = predecessor.get(current);
  }

  return path;
}

/**
 * 检测图中是否存在环（使用DFS）
 * @param {Graph} graph - 要检测的图
 * @returns {boolean} 是否存在环
 */
function hasCycleDFS(graph) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {Set<VertexId>} */
  const recursionStack = new Set();

  /**
   * DFS递归辅助函数
   * @param {VertexId} vertex - 当前访问的顶点
   * @returns {boolean} 是否存在环
   */
  function detectCycle(vertex) {
    // 标记为已访问并加入递归栈
    visited.add(vertex);
    recursionStack.add(vertex);

    // 访问所有邻接点
    for (const edge of graph.getNeighbors(vertex)) {
      const neighbor = edge.vertex;
      // 如果邻接点未访问且从该点出发检测到环
      if (!visited.has(neighbor)) {
        if (detectCycle(neighbor)) {
          return true;
        }
      }
      // 如果邻接点在递归栈中，说明找到了环
      else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    // 回溯时从递归栈中移除
    recursionStack.delete(vertex);
    return false;
  }

  // 对每个未访问的顶点进行DFS
  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      if (detectCycle(vertex)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 使用DFS查找图中的所有连通分量
 * @param {Graph} graph - 图
 * @returns {VertexId[][]} 连通分量数组，每个元素是一个顶点数组
 */
function findConnectedComponents(graph) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {VertexId[][]} */
  const components = [];

  /**
   * DFS递归辅助函数
   * @param {VertexId} vertex - 当前访问的顶点
   * @param {VertexId[]} component - 当前连通分量
   */
  function dfs(vertex, component) {
    visited.add(vertex);
    component.push(vertex);

    for (const edge of graph.getNeighbors(vertex)) {
      const neighbor = edge.vertex;
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    }
  }

  // 对每个未访问的顶点进行DFS
  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      /** @type {VertexId[]} */
      const component = [];
      dfs(vertex, component);
      components.push(component);
    }
  }

  return components;
}

/**
 * 测试DFS函数
 */
function testDFS() {
  const { createExampleGraph, createExampleDirectedGraph } = require('./dfs_bfs_base');

  console.log("===== DFS测试 =====");

  // 创建示例图
  const graph = createExampleGraph();
  console.log("图结构:");
  graph.print();

  // 测试递归DFS
  console.log("\n递归DFS结果 (从顶点0开始):");
  const dfsRecResult = dfsRecursive(graph, 0, (vertex, metadata) => {
    console.log(`访问顶点 ${vertex}${metadata.label ? ` (${metadata.label})` : ''}`);
  });
  console.log("遍历顺序:", dfsRecResult.join(" -> "));

  // 测试迭代DFS
  console.log("\n迭代DFS结果 (从顶点0开始):");
  const dfsIterResult = dfsIterative(graph, 0);
  console.log("遍历顺序:", dfsIterResult.join(" -> "));

  // 测试路径查找
  console.log("\n从顶点0到顶点5的路径:");
  const path = findPathDFS(graph, 0, 5);
  console.log(path ? path.join(" -> ") : "没有找到路径");

  // 测试环检测
  const directedGraph = createExampleDirectedGraph();
  console.log("\n有向图是否有环:", hasCycleDFS(directedGraph) ? "是" : "否");

  // 创建一个有环的有向图
  const cyclicGraph = new Graph();
  cyclicGraph.addDirectedEdge("A", "B");
  cyclicGraph.addDirectedEdge("B", "C");
  cyclicGraph.addDirectedEdge("C", "A"); // 形成环
  console.log("\n有环图是否有环:", hasCycleDFS(cyclicGraph) ? "是" : "否");

  // 测试连通分量查找
  console.log("\n连通分量测试:");
  const disconnectedGraph = new Graph();
  // 第一个连通分量
  disconnectedGraph.addEdge("A", "B");
  disconnectedGraph.addEdge("B", "C");
  // 第二个连通分量
  disconnectedGraph.addEdge("D", "E");
  // 第三个连通分量
  disconnectedGraph.addVertex("F");

  const components = findConnectedComponents(disconnectedGraph);
  console.log(`找到 ${components.length} 个连通分量:`);
  components.forEach((component, index) => {
    console.log(`连通分量 ${index + 1}: ${component.join(", ")}`);
  });
}

// 导出所有函数
module.exports = {
  dfsRecursive,
  dfsIterative,
  findPathDFS,
  hasCycleDFS,
  findConnectedComponents,
  testDFS
};

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testDFS();
}
