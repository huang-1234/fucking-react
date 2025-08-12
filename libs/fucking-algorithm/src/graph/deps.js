/**
 * 依赖图实现
 * 用于表示和处理依赖关系
 */

const { Graph } = require('./graph');

/**
 * @typedef {import('./graph').VertexId} VertexId
 * @typedef {import('./graph').VertexMetadata} VertexMetadata
 * @typedef {import('./graph').EdgeData} EdgeData
 */

/**
 * @typedef {Object} DependencyMetadata
 * @property {string} [version] - 依赖版本
 * @property {boolean} [isOptional] - 是否为可选依赖
 * @property {string} [type] - 依赖类型（例如：'dev', 'peer', 'runtime'）
 * @property {Date} [addedAt] - 添加时间
 * @property {string} [repository] - 仓库地址
 * @property {Object} [customData] - 自定义数据
 */

/**
 * 依赖图类
 * 用于管理和分析项目依赖关系
 */
class DependencyGraph {
  /**
   * 创建依赖图实例
   * @param {boolean} [isDirected=true] - 是否为有向图
   */
  constructor(isDirected = true) {
    /** @type {Graph} */
    this.graph = new Graph(isDirected); // 依赖图为有向图
  }

  /**
   * 根据依赖数组构建图
   * @param {Array<[string, string, DependencyMetadata?]>} deps - 依赖关系数组，格式 [[依赖方, 被依赖方, 元数据], ...]
   * @returns {DependencyGraph} - 返回依赖图实例以支持链式调用
   */
  buildFromDependencies(deps) {
    // 添加所有顶点（自动去重）
    /** @type {Set<string>} */
    const allNodes = new Set();
    deps.forEach(([dependent, dependency]) => {
      allNodes.add(dependent);
      allNodes.add(dependency);
    });

    // 为每个节点添加基础元数据
    allNodes.forEach(node => {
      this.graph.addVertex(node, {
        label: node,
        description: `依赖节点: ${node}`,
        customData: {
          type: 'dependency',
          createdAt: new Date()
        }
      });
    });

    // 添加依赖边（方向：被依赖方 → 依赖方）
    deps.forEach(([dependent, dependency, metadata = {}]) => {
      // 添加边，并包含依赖元数据
      this.graph.addEdge(dependency, dependent, 1, {
        label: `${dependency} → ${dependent}`,
        customData: metadata
      });
    });

    return this;
  }

  /**
   * 获取图实例（用于遍历/算法）
   * @returns {Graph} - 图实例
   */
  getGraph() {
    return this.graph;
  }

  /**
   * 获取依赖图的文本表示
   * @returns {string} - 依赖图的文本表示
   */
  toString() {
    const result = [];
    this.graph.getVertices().forEach(vertex => {
      const neighbors = this.graph.getNeighbors(vertex);
      result.push(`${vertex} -> ${neighbors.map(n => n.vertex).join(", ")}`);
    });
    return result.join("\n");
  }

  /**
   * 获取依赖图的图形表示（使用Graph的toString方法）
   * @returns {string} - 图的字符串表示
   */
  toGraphString() {
    return this.graph.toString();
  }

  /**
   * 分析依赖图，找出关键依赖
   * @returns {Object} - 依赖分析结果
   */
  analyzeDependencies() {
    const vertices = this.graph.getVertices();
    const result = {
      totalDependencies: vertices.length,
      rootDependencies: [],
      leafDependencies: [],
      mostDependedOn: { node: null, count: 0 }
    };

    // 计算入度和出度
    /** @type {Map<VertexId, number>} */
    const inDegree = new Map();
    /** @type {Map<VertexId, number>} */
    const outDegree = new Map();

    vertices.forEach(v => {
      inDegree.set(v, 0);
      outDegree.set(v, this.graph.getNeighbors(v).length);
    });

    vertices.forEach(v => {
      this.graph.getNeighbors(v).forEach(edge => {
        inDegree.set(edge.vertex, (inDegree.get(edge.vertex) || 0) + 1);
      });
    });

    // 找出根依赖（没有被其他节点依赖的节点）
    vertices.forEach(v => {
      if (inDegree.get(v) === 0 && outDegree.get(v) > 0) {
        result.rootDependencies.push(v);
      }
    });

    // 找出叶子依赖（不依赖其他节点的节点）
    vertices.forEach(v => {
      if (outDegree.get(v) === 0 && inDegree.get(v) > 0) {
        result.leafDependencies.push(v);
      }
    });

    // 找出被最多其他节点依赖的节点
    vertices.forEach(v => {
      const count = inDegree.get(v);
      if (count > (result.mostDependedOn.count || 0)) {
        result.mostDependedOn = { node: v, count };
      }
    });

    return result;
  }
}

// 示例代码
const exampleDeps = [
  ["a", "b", { version: "1.0.0", type: "runtime" }],
  ["b", "c", { version: "2.0.0", type: "runtime" }],
  ["c", "d", { version: "3.0.0", type: "dev" }],
  ["d", "e", { version: "4.0.0", type: "peer" }],
  ["e", "f", { version: "5.0.0", type: "runtime" }],
  ["f", "g", { version: "6.0.0", type: "runtime" }],
  ["g", "h", { version: "7.0.0", type: "dev" }],
  ["h", "i", { version: "8.0.0", type: "runtime" }],
  ["i", "j", { version: "9.0.0", type: "runtime" }],
  ["j", "k", { version: "10.0.0", type: "peer" }],
];

// 创建并测试依赖图
function testDependencyGraph() {
  console.log("===== 依赖图测试 =====");

  const graph = new DependencyGraph();
  graph.buildFromDependencies(exampleDeps);

  console.log("依赖图结构:");
  console.log(graph.toString());

  console.log("\n依赖分析结果:");
  const analysis = graph.analyzeDependencies();
  console.log(`总依赖数: ${analysis.totalDependencies}`);
  console.log(`根依赖: ${analysis.rootDependencies.join(", ")}`);
  console.log(`叶子依赖: ${analysis.leafDependencies.join(", ")}`);
  console.log(`最被依赖的节点: ${analysis.mostDependedOn.node} (被依赖次数: ${analysis.mostDependedOn.count})`);
}

module.exports = {
  DependencyGraph,
  testDependencyGraph
};

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testDependencyGraph();
}