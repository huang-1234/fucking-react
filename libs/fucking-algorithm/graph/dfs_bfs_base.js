/**
 * 图算法基础实现
 * 包含图的数据结构和通用工具函数
 */

/**
 * @typedef {string|number} Vertex
 */

/**
 * 图的邻接表表示
 * @template {Vertex} T
 */
class Graph {
    constructor() {
      /** @type {Map<T, T[]>} */
      this.adjacencyList = new Map();
    }

    /**
     * 添加顶点
     * @param {T} vertex - 要添加的顶点
     */
    addVertex(vertex) {
      if (!this.adjacencyList.has(vertex)) {
        this.adjacencyList.set(vertex, []);
      }
    }

    /**
     * 添加无向边
     * @param {T} vertex1 - 第一个顶点
     * @param {T} vertex2 - 第二个顶点
     */
    addEdge(vertex1, vertex2) {
      this.addVertex(vertex1);
      this.addVertex(vertex2);
      this.adjacencyList.get(vertex1).push(vertex2);
      this.adjacencyList.get(vertex2).push(vertex1);
    }

    /**
     * 添加有向边
     * @param {T} source - 源顶点
     * @param {T} destination - 目标顶点
     */
    addDirectedEdge(source, destination) {
      this.addVertex(source);
      this.addVertex(destination);
      this.adjacencyList.get(source).push(destination);
    }

    /**
     * 获取所有顶点
     * @returns {T[]} 所有顶点的数组
     */
    getVertices() {
      return Array.from(this.adjacencyList.keys());
    }

    /**
     * 获取顶点的邻接点
     * @param {T} vertex - 要获取邻接点的顶点
     * @returns {T[]} 邻接点数组
     */
    getNeighbors(vertex) {
      return this.adjacencyList.get(vertex) || [];
    }

    /**
     * 打印图结构
     */
    print() {
      for (const [vertex, edges] of this.adjacencyList.entries()) {
        console.log(`${vertex} -> ${edges.join(', ')}`);
      }
    }
  }

  /**
   * 创建一个示例图用于测试
   * @returns {Graph<number>} 示例图
   */
  function createExampleGraph() {
    const graph = new Graph();

    // 添加顶点
    [0, 1, 2, 3, 4, 5].forEach(v => graph.addVertex(v));

    // 添加边
    graph.addEdge(0, 1);
    graph.addEdge(0, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 3);
    graph.addEdge(2, 4);
    graph.addEdge(3, 4);
    graph.addEdge(3, 5);
    graph.addEdge(4, 5);

    return graph;
  }

  /**
   * 创建一个有向图示例
   * @returns {Graph<number>} 有向图示例
   */
  function createExampleDirectedGraph() {
    const graph = new Graph();

    // 添加顶点
    [0, 1, 2, 3, 4, 5].forEach(v => graph.addVertex(v));

    // 添加有向边
    graph.addDirectedEdge(0, 1);
    graph.addDirectedEdge(0, 2);
    graph.addDirectedEdge(1, 3);
    graph.addDirectedEdge(2, 3);
    graph.addDirectedEdge(2, 4);
    graph.addDirectedEdge(3, 4);
    graph.addDirectedEdge(3, 5);
    graph.addDirectedEdge(4, 5);

    return graph;
  }

  module.exports = {
    Graph,
    createExampleGraph,
    createExampleDirectedGraph
  };


  (function test() {
    const graph = createExampleGraph();
    graph.print();
  })()
