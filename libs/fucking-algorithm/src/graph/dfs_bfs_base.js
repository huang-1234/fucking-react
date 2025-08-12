/**
 * 图算法基础实现
 * 包含图的数据结构和通用工具函数
 */

/**
 * @typedef {string|number} VertexId - 顶点ID类型
 */

/**
 * @typedef {Object} VertexMetadata - 顶点元数据
 * @property {string} [label] - 顶点标签
 * @property {string} [description] - 顶点描述
 * @property {Object} [position] - 顶点位置
 * @property {number} [position.x] - X坐标
 * @property {number} [position.y] - Y坐标
 * @property {string} [color] - 顶点颜色
 * @property {number} [weight] - 顶点权重
 * @property {Object} [customData] - 自定义数据对象
 */

/**
 * @typedef {Object} EdgeData - 边数据
 * @property {VertexId} vertex - 目标顶点ID
 * @property {number} [weight] - 边的权重
 * @property {string} [label] - 边的标签
 * @property {string} [color] - 边的颜色
 * @property {Object} [customData] - 自定义数据对象
 */

/**
 * 图的邻接表表示
 */
class Graph {
  /**
   * 创建图实例
   */
  constructor() {
    /** @type {Map<VertexId, EdgeData[]>} */
    this.adjacencyList = new Map();

    /** @type {Map<VertexId, VertexMetadata>} */
    this.metadata = new Map();
  }

  /**
   * 添加顶点
   * @param {VertexId} vertex - 要添加的顶点
   * @param {VertexMetadata} [metadata={}] - 顶点元数据
   * @returns {Graph} - 返回图实例以支持链式调用
   */
  addVertex(vertex, metadata = {}) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
      this.metadata.set(vertex, metadata);
    }
    return this;
  }

  /**
   * 添加无向边
   * @param {VertexId} vertex1 - 第一个顶点
   * @param {VertexId} vertex2 - 第二个顶点
   * @param {number} [weight] - 边的权重
   * @param {Object} [edgeAttributes={}] - 边的其他属性
   * @returns {Graph} - 返回图实例以支持链式调用
   */
  addEdge(vertex1, vertex2, weight, edgeAttributes = {}) {
    this.addVertex(vertex1);
    this.addVertex(vertex2);

    /** @type {EdgeData} */
    const edge1to2 = {
      vertex: vertex2,
      weight,
      ...edgeAttributes
    };

    /** @type {EdgeData} */
    const edge2to1 = {
      vertex: vertex1,
      weight,
      ...edgeAttributes
    };

    this.adjacencyList.get(vertex1).push(edge1to2);
    this.adjacencyList.get(vertex2).push(edge2to1);

    return this;
  }

  /**
   * 添加有向边
   * @param {VertexId} source - 源顶点
   * @param {VertexId} destination - 目标顶点
   * @param {number} [weight] - 边的权重
   * @param {Object} [edgeAttributes={}] - 边的其他属性
   * @returns {Graph} - 返回图实例以支持链式调用
   */
  addDirectedEdge(source, destination, weight, edgeAttributes = {}) {
    this.addVertex(source);
    this.addVertex(destination);

    /** @type {EdgeData} */
    const edgeData = {
      vertex: destination,
      weight,
      ...edgeAttributes
    };

    this.adjacencyList.get(source).push(edgeData);

    return this;
  }

  /**
   * 获取所有顶点
   * @returns {VertexId[]} 所有顶点的数组
   */
  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * 获取顶点的邻接点
   * @param {VertexId} vertex - 要获取邻接点的顶点
   * @returns {EdgeData[]} 邻接点数组
   */
  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }

  /**
   * 获取顶点元数据
   * @param {VertexId} vertex - 顶点ID
   * @returns {VertexMetadata|undefined} - 顶点元数据
   */
  getVertexMetadata(vertex) {
    return this.metadata.get(vertex);
  }

  /**
   * 更新顶点元数据
   * @param {VertexId} vertex - 顶点ID
   * @param {VertexMetadata} metadata - 新的元数据
   * @returns {Graph} - 返回图实例以支持链式调用
   */
  updateVertexMetadata(vertex, metadata) {
    if (this.adjacencyList.has(vertex)) {
      this.metadata.set(vertex, { ...this.metadata.get(vertex), ...metadata });
    }
    return this;
  }

  /**
   * 打印图结构
   */
  print() {
    for (const [vertex, edges] of this.adjacencyList.entries()) {
      const vertexMeta = this.metadata.get(vertex);
      const vertexLabel = vertexMeta && vertexMeta.label ? `${vertex}(${vertexMeta.label})` : vertex;

      const edgeStr = edges.map(e => {
        const targetMeta = this.metadata.get(e.vertex);
        const targetLabel = targetMeta && targetMeta.label ? `${e.vertex}(${targetMeta.label})` : e.vertex;
        return `${targetLabel}${e.weight !== undefined ? `(${e.weight})` : ''}`;
      }).join(", ");

      console.log(`${vertexLabel} -> ${edgeStr}`);
    }
  }
}

/**
 * 创建一个示例图用于测试
 * @returns {Graph} 示例图
 */
function createExampleGraph() {
  const graph = new Graph();

  // 添加顶点及元数据
  [0, 1, 2, 3, 4, 5].forEach((v, index) => {
    graph.addVertex(v, {
      label: `节点${v}`,
      description: `示例节点${v}`,
      position: { x: index * 100, y: Math.floor(index / 3) * 100 },
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      customData: {
        createdAt: new Date(),
        importance: index % 3 // 0: 低, 1: 中, 2: 高
      }
    });
  });

  // 添加边
  graph.addEdge(0, 1, 1, { label: "边0-1" });
  graph.addEdge(0, 2, 2, { label: "边0-2" });
  graph.addEdge(1, 3, 3, { label: "边1-3" });
  graph.addEdge(2, 3, 4, { label: "边2-3" });
  graph.addEdge(2, 4, 5, { label: "边2-4" });
  graph.addEdge(3, 4, 6, { label: "边3-4" });
  graph.addEdge(3, 5, 7, { label: "边3-5" });
  graph.addEdge(4, 5, 8, { label: "边4-5" });

  return graph;
}

/**
 * 创建一个有向图示例
 * @returns {Graph} 有向图示例
 */
function createExampleDirectedGraph() {
  const graph = new Graph();

  // 添加顶点及元数据
  [0, 1, 2, 3, 4, 5].forEach((v, index) => {
    graph.addVertex(v, {
      label: `有向节点${v}`,
      description: `有向图示例节点${v}`,
      position: { x: index * 100, y: Math.floor(index / 3) * 100 },
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      customData: {
        createdAt: new Date(),
        importance: index % 3 // 0: 低, 1: 中, 2: 高
      }
    });
  });

  // 添加有向边
  graph.addDirectedEdge(0, 1, 1, { label: "有向边0→1" });
  graph.addDirectedEdge(0, 2, 2, { label: "有向边0→2" });
  graph.addDirectedEdge(1, 3, 3, { label: "有向边1→3" });
  graph.addDirectedEdge(2, 3, 4, { label: "有向边2→3" });
  graph.addDirectedEdge(2, 4, 5, { label: "有向边2→4" });
  graph.addDirectedEdge(3, 4, 6, { label: "有向边3→4" });
  graph.addDirectedEdge(3, 5, 7, { label: "有向边3→5" });
  graph.addDirectedEdge(4, 5, 8, { label: "有向边4→5" });

  return graph;
}

module.exports = {
  Graph,
  createExampleGraph,
  createExampleDirectedGraph
};

// 测试代码
(function test() {
  console.log("=== 测试图数据结构 ===");
  const graph = createExampleGraph();
  console.log("无向图结构:");
  graph.print();

  console.log("\n有向图结构:");
  const directedGraph = createExampleDirectedGraph();
  directedGraph.print();
})();
