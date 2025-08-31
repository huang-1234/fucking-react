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
 * 基于邻接表的图实现，支持有向/无向图、带权边、动态增删节点
 */
class Graph {
  /**
   * 创建图实例
   * @param {boolean} [isDirected=false] - 是否为有向图
   */
  constructor(isDirected = false) {
    /** @type {boolean} */
    this.isDirected = isDirected;

    /** @type {Map<VertexId, EdgeData[]>} */
    this.adjacencyList = new Map();

    /** @type {Map<VertexId, VertexMetadata>} */
    this.metadata = new Map();
  }

  /**
   * 添加顶点
   * @param {VertexId} vertex - 顶点ID
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
   * 添加边（可选权重和其他属性）
   * @param {VertexId} source - 源顶点
   * @param {VertexId} destination - 目标顶点
   * @param {number} [weight] - 边的权重
   * @param {Object} [edgeAttributes={}] - 边的其他属性
   * @returns {Graph} - 返回图实例以支持链式调用
   */
  addEdge(source, destination, weight, edgeAttributes = {}) {
    this.addVertex(source);
    this.addVertex(destination);

    /** @type {EdgeData} */
    const edgeData = {
      vertex: destination,
      weight,
      ...edgeAttributes
    };

    this.adjacencyList.get(source).push(edgeData);

    // 无向图需双向连接
    if (!this.isDirected) {
      /** @type {EdgeData} */
      const reverseEdgeData = {
        vertex: source,
        weight,
        ...edgeAttributes
      };
      this.adjacencyList.get(destination).push(reverseEdgeData);
    }

    return this;
  }

  /**
   * 删除顶点（同步移除关联边）
   * @param {VertexId} vertex - 要删除的顶点
   * @returns {Graph} - 返回图实例以支持链式调用
   */
  removeVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) return this;

    // 移除指向该顶点的边
    for (const [v, edges] of this.adjacencyList) {
      this.adjacencyList.set(v, edges.filter(e => e.vertex !== vertex));
    }

    this.adjacencyList.delete(vertex);
    this.metadata.delete(vertex);

    return this;
  }

  /**
   * 获取邻接节点
   * @param {VertexId} vertex - 顶点ID
   * @returns {EdgeData[]} - 邻接边数组
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
   * 可视化邻接表（调试用）
   */
  print() {
    this.adjacencyList.forEach((edges, vertex) => {
      const vertexMeta = this.metadata.get(vertex);
      const vertexLabel = vertexMeta && vertexMeta.label ? `${vertex}(${vertexMeta.label})` : vertex;

      const edgeStr = edges.map(e => {
        const targetMeta = this.metadata.get(e.vertex);
        const targetLabel = targetMeta && targetMeta.label ? `${e.vertex}(${targetMeta.label})` : e.vertex;
        return `${targetLabel}${e.weight !== undefined ? `(${e.weight})` : ''}`;
      }).join(", ");

      console.log(`${vertexLabel} -> ${edgeStr}`);
    });
  }

  /**
   * 获取所有顶点
   * @returns {VertexId[]} - 顶点ID数组
   */
  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * 将图转换为字符串
   * @example
   * ```
   * const graph = new Graph();
   * graph.addEdge(1, 2);
   * graph.addEdge(1, 3);
   * graph.addEdge(2, 4);
   * graph.addEdge(3, 4);
   * graph.addEdge(4, 5);
   * console.log(graph.toString());
   * 1 -> 2, 3
   * 2 -> 1, 4
   * 3 -> 1, 4
   * 4 -> 2, 3, 5
   * 5 -> 4
   * ```
   * @returns {string} 图的字符串表示
   */
  toString() {
    const result = [];
    this.adjacencyList.forEach((edges, vertex) => {
      result.push(`${vertex} -> ${edges.map(e => e.vertex).join(", ")}`);
    });
    return result.join("\n");
  }
  /**
   * 将图转换为JSON对象
   * @returns {Object} - 图的JSON对象
   */
  toJson() {
    return {
      adjacencyList: Array.from(this.adjacencyList.entries()),
      metadata: Array.from(this.metadata.entries())
    };
  }
}

/**
 * 基于邻接表的拓扑排序（Kahn算法）
 * @param {Graph} graph - 图实例
 * @returns {VertexId[]} - 拓扑序或空数组（检测到环）
 */
function topologicalSort(graph) {
  /** @type {Map<VertexId, number>} */
  const inDegree = new Map();
  /** @type {VertexId[]} */
  const queue = [];
  /** @type {VertexId[]} */
  const result = [];

  // 1. 初始化所有顶点的入度为0
  graph.getVertices().forEach(v => inDegree.set(v, 0));

  // 2. 计算每个顶点的入度
  graph.getVertices().forEach(v => {
    graph.getNeighbors(v).forEach(neighbor => {
      inDegree.set(neighbor.vertex, (inDegree.get(neighbor.vertex) || 0) + 1);
    });
  });

  // 3. 入度为0的顶点入队
  inDegree.forEach((degree, vertex) => {
    if (degree === 0) queue.push(vertex);
  });

  // 4. BFS遍历
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    graph.getNeighbors(current).forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor.vertex) - 1);
      inDegree.set(neighbor.vertex, newDegree);
      if (newDegree === 0) queue.push(neighbor.vertex);
    });
  }

  // 5. 环检测
  return result.length === graph.getVertices().length ? result : [];
}

export {
  Graph,
  topologicalSort
}