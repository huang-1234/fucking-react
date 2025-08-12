/**
 * 广度优先搜索(BFS)算法实现
 *
 * BFS是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着宽度方向遍历，
 * 先访问所有邻接节点，然后再访问下一层节点。
 */

const { Graph } = require('./dfs_bfs_base');

/**
 * @typedef {import('./dfs_bfs_base').VertexId} VertexId
 * @typedef {import('./dfs_bfs_base').VertexMetadata} VertexMetadata
 * @typedef {import('./dfs_bfs_base').EdgeData} EdgeData
 */

/**
 * 广度优先搜索实现
 * @param {Graph} graph - 要遍历的图
 * @param {VertexId} startVertex - 开始遍历的顶点
 * @param {function(VertexId, VertexMetadata, number): void} [callback] - 访问顶点时的回调函数，参数为顶点ID、顶点元数据和层级
 * @returns {VertexId[]} 遍历顺序的顶点数组
 */
function bfs(graph, startVertex, callback) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {VertexId[]} */
  const result = [];
  /** @type {Array<{vertex: VertexId, level: number}>} */
  const queue = [{ vertex: startVertex, level: 0 }];

  // 如果起始顶点不存在，直接返回空数组
  if (!startVertex) return result;

  // 标记起始顶点为已访问
  visited.add(startVertex);

  while (queue.length > 0) {
    // 出队
    const { vertex: currentVertex, level } = queue.shift();

    // 添加到结果数组
    result.push(currentVertex);

    // 如果提供了回调函数，则调用
    if (callback) callback(currentVertex, graph.getVertexMetadata(currentVertex), level);

    // 将所有未访问的邻接点加入队列
    for (const edge of graph.getNeighbors(currentVertex)) {
      if (!visited.has(edge.vertex)) {
        visited.add(edge.vertex);
        queue.push({ vertex: edge.vertex, level: level + 1 });
      }
    }
  }

  return result;
}

/**
 * 使用BFS查找最短路径
 * @param {Graph} graph - 图
 * @param {VertexId} startVertex - 起始顶点
 * @param {VertexId} endVertex - 目标顶点
 * @returns {{path: VertexId[], distance: number}|null} 最短路径和距离，如果不存在则返回null
 */
function findShortestPath(graph, startVertex, endVertex) {
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {Map<VertexId, VertexId|null>} */
  const predecessor = new Map();
  /** @type {Map<VertexId, number>} */
  const distance = new Map();
  /** @type {VertexId[]} */
  const queue = [startVertex];

  // 如果起始顶点和目标顶点相同
  if (startVertex === endVertex) {
    return { path: [startVertex], distance: 0 };
  }

  // 标记起始顶点为已访问
  visited.add(startVertex);
  predecessor.set(startVertex, null);
  distance.set(startVertex, 0);

  while (queue.length > 0) {
    const currentVertex = queue.shift();
    const currentDistance = distance.get(currentVertex);

    // 访问所有邻接点
    for (const edge of graph.getNeighbors(currentVertex)) {
      const neighbor = edge.vertex;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        predecessor.set(neighbor, currentVertex);
        distance.set(neighbor, currentDistance + 1);
        queue.push(neighbor);

        // 如果找到目标顶点，重建并返回路径
        if (neighbor === endVertex) {
          /** @type {VertexId[]} */
          const path = [];
          let current = endVertex;

          while (current !== null) {
            path.unshift(current);
            current = predecessor.get(current);
          }

          return {
            path,
            distance: distance.get(endVertex)
          };
        }
      }
    }
  }

  // 如果没有找到路径，返回null
  return null;
}

/**
 * 计算无向图中所有顶点对之间的最短路径长度
 * @param {Graph} graph - 图
 * @returns {Map<string, number>} 顶点对之间的最短路径长度，键格式为"v1,v2"
 */
function allPairsShortestPathLength(graph) {
  /** @type {Map<string, number>} */
  const distances = new Map();
  const vertices = graph.getVertices();

  // 对每个顶点进行BFS
  for (const startVertex of vertices) {
    /** @type {Set<VertexId>} */
    const visited = new Set();
    /** @type {Map<VertexId, number>} */
    const distance = new Map();
    /** @type {Array<{vertex: VertexId, dist: number}>} */
    const queue = [{ vertex: startVertex, dist: 0 }];

    // 初始化起始顶点
    visited.add(startVertex);
    distance.set(startVertex, 0);

    while (queue.length > 0) {
      const { vertex: currentVertex, dist: currentDistance } = queue.shift();

      // 存储当前顶点到起始顶点的距离
      distances.set(`${startVertex},${currentVertex}`, currentDistance);

      // 访问所有邻接点
      for (const edge of graph.getNeighbors(currentVertex)) {
        const neighbor = edge.vertex;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const newDistance = currentDistance + 1;
          distance.set(neighbor, newDistance);
          queue.push({ vertex: neighbor, dist: newDistance });
        }
      }
    }
  }

  return distances;
}

/**
 * 检测二分图（使用BFS染色法）
 * 二分图是一种可以将顶点分成两个独立集合的图，使得每条边的两个顶点分别属于这两个集合
 * @param {Graph} graph - 要检测的图
 * @returns {{isBipartite: boolean, coloring?: Map<VertexId, number>}} 是否为二分图及顶点染色结果
 */
function isBipartite(graph) {
  const vertices = graph.getVertices();
  if (vertices.length === 0) return { isBipartite: true, coloring: new Map() };

  /** @type {Map<VertexId, number>} */
  const colors = new Map(); // 0: 未染色, 1: 颜色1, -1: 颜色2

  // 对每个连通分量进行BFS染色
  for (const startVertex of vertices) {
    // 如果已经染色，跳过
    if (colors.has(startVertex)) continue;

    /** @type {VertexId[]} */
    const queue = [startVertex];
    colors.set(startVertex, 1); // 初始染色为1

    while (queue.length > 0) {
      const currentVertex = queue.shift();
      const currentColor = colors.get(currentVertex);

      // 访问所有邻接点
      for (const edge of graph.getNeighbors(currentVertex)) {
        const neighbor = edge.vertex;
        // 如果邻接点未染色，染上相反的颜色
        if (!colors.has(neighbor)) {
          colors.set(neighbor, -currentColor);
          queue.push(neighbor);
        }
        // 如果邻接点已染色且颜色与当前顶点相同，则不是二分图
        else if (colors.get(neighbor) === currentColor) {
          return { isBipartite: false };
        }
      }
    }
  }

  return { isBipartite: true, coloring: colors };
}

/**
 * 使用BFS进行层次遍历
 * @param {Graph} graph - 图
 * @param {VertexId} startVertex - 起始顶点
 * @returns {Map<number, VertexId[]>} 按层次组织的顶点，键为层次，值为该层次的顶点数组
 */
function levelOrderTraversal(graph, startVertex) {
  /** @type {Map<number, VertexId[]>} */
  const levels = new Map();
  /** @type {Set<VertexId>} */
  const visited = new Set();
  /** @type {Array<{vertex: VertexId, level: number}>} */
  const queue = [{ vertex: startVertex, level: 0 }];

  // 如果起始顶点不存在，直接返回空Map
  if (!startVertex) return levels;

  // 标记起始顶点为已访问
  visited.add(startVertex);

  while (queue.length > 0) {
    const { vertex: currentVertex, level } = queue.shift();

    // 将顶点添加到对应层次
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level).push(currentVertex);

    // 将所有未访问的邻接点加入队列
    for (const edge of graph.getNeighbors(currentVertex)) {
      const neighbor = edge.vertex;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ vertex: neighbor, level: level + 1 });
      }
    }
  }

  return levels;
}

/**
 * 测试BFS函数
 */
function testBFS() {
  const { createExampleGraph } = require('./dfs_bfs_base');

  console.log("===== BFS测试 =====");

  // 创建示例图
  const graph = createExampleGraph();
  console.log("图结构:");
  graph.print();

  // 测试BFS
  console.log("\nBFS结果 (从顶点0开始):");
  const bfsResult = bfs(graph, 0, (vertex, metadata, level) => {
    console.log(`访问顶点 ${vertex}${metadata.label ? ` (${metadata.label})` : ''}, 层级: ${level}`);
  });
  console.log("遍历顺序:", bfsResult.join(" -> "));

  // 测试最短路径
  console.log("\n从顶点0到顶点5的最短路径:");
  const pathResult = findShortestPath(graph, 0, 5);
  if (pathResult) {
    console.log(`路径: ${pathResult.path.join(" -> ")}`);
    console.log(`距离: ${pathResult.distance}`);
  } else {
    console.log("没有找到路径");
  }

  // 测试所有顶点对之间的最短路径长度
  console.log("\n部分顶点对之间的最短路径长度:");
  const distances = allPairsShortestPathLength(graph);
  for (const [pair, distance] of distances.entries()) {
    const [from, to] = pair.split(',');
    if (from === '0') { // 只显示从顶点0出发的路径
      console.log(`${from} 到 ${to}: ${distance}`);
    }
  }

  // 测试二分图检测
  console.log("\n示例图是否为二分图:");
  const bipartiteResult = isBipartite(graph);
  console.log(bipartiteResult.isBipartite ? "是" : "否");
  if (bipartiteResult.isBipartite) {
    console.log("顶点染色情况:");
    bipartiteResult.coloring.forEach((color, vertex) => {
      console.log(`顶点 ${vertex}: ${color === 1 ? '红色' : '蓝色'}`);
    });
  }

  // 创建一个明显的二分图（偶数环）
  const bipartiteGraph = new Graph();
  bipartiteGraph.addEdge("A", "B");
  bipartiteGraph.addEdge("B", "C");
  bipartiteGraph.addEdge("C", "D");
  bipartiteGraph.addEdge("D", "A");
  console.log("\n偶数环是否为二分图:", isBipartite(bipartiteGraph).isBipartite ? "是" : "否");

  // 创建一个非二分图（奇数环）
  const nonBipartiteGraph = new Graph();
  nonBipartiteGraph.addEdge("A", "B");
  nonBipartiteGraph.addEdge("B", "C");
  nonBipartiteGraph.addEdge("C", "A");
  console.log("奇数环是否为二分图:", isBipartite(nonBipartiteGraph).isBipartite ? "是" : "否");

  // 测试层次遍历
  console.log("\n层次遍历结果 (从顶点0开始):");
  const levelOrder = levelOrderTraversal(graph, 0);
  levelOrder.forEach((vertices, level) => {
    console.log(`层级 ${level}: ${vertices.join(", ")}`);
  });
}

// 导出所有函数
module.exports = {
  bfs,
  findShortestPath,
  allPairsShortestPathLength,
  isBipartite,
  levelOrderTraversal,
  testBFS
};

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testBFS();
}
