import { Graph } from "./graph"; // 假设已实现邻接表类

export class DependencyGraph {
  private graph: Graph<string>;

  constructor(isDirected: boolean = true) {
    this.graph = new Graph<string>(isDirected); // 依赖图为有向图
  }

  /**
   * 根据依赖数组构建图
   * @param deps 依赖关系数组，格式 [[依赖方, 被依赖方], ...]
   */
  buildFromDependencies(deps: [string, string][]) {
    // 添加所有顶点（自动去重）
    const allNodes = new Set<string>();
    deps.forEach(([dependent, dependency]) => {
      allNodes.add(dependent);
      allNodes.add(dependency);
    });
    allNodes.forEach(node => this.graph.addVertex(node));

    // 添加依赖边（方向：被依赖方 → 依赖方）
    deps.forEach(([dependent, dependency]) => {
      this.graph.addEdge(dependency, dependent); // 方向：dependency → dependent
    });
  }

  // 获取图实例（用于遍历/算法）
  getGraph() {
    return this.graph;
  }
  toString() {
    const result: string[] = [];
    this.graph.getVertices().forEach(vertex => {
      result.push(`${vertex} -> ${this.graph.getNeighbors(vertex).map(neighbor => neighbor.vertex).join(", ")}`);
    });
    return result.join("\n");
  }
  toGraphString() {
    return this.graph.toString();
  }
}

const graph = new DependencyGraph();
graph.buildFromDependencies([
  ["a", "b"],
  ["b", "c"],
  ["c", "d"],
  ["d", "e"],
  ["e", "f"],
  ["f", "g"],
  ["g", "h"],
  ["h", "i"],
  ["i", "j"],
  ["j", "k"],
]);

// console.log(graph.toString());
console.log(graph.toGraphString());