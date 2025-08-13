/**
 * // 初始化有向图（课程依赖）
const courseGraph = new Graph<number>(true);
courseGraph.addEdge(1, 0); // 课程1依赖课程0
courseGraph.addEdge(2, 1); // 课程2依赖课程1
courseGraph.addEdge(3, 1); // 课程3依赖课程1

// 执行拓扑排序
const order = topologicalSort(courseGraph);
console.log("课程学习顺序:", order); // 输出: [0, 1, 2, 3] 或 [0, 1, 3, 2]

// 检测环的用例
courseGraph.addEdge(0, 3); // 添加环（0→3→1→0）
const invalidOrder = topologicalSort(courseGraph);
console.log("存在环时:", invalidOrder); // 输出: []
 */
// 基于 vitest 框架的单元测试
// graph.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { Graph, topologicalSort } from "./graph"; // 假设Graph类定义在此路径

describe("Graph 类测试", () => {
  let graph: Graph<number>;

  beforeEach(() => {
    graph = new Graph<number>(true); // 初始化有向图
  });

  // 1. 测试初始化状态
  it("初始化时邻接表应为空", () => {
    expect(graph.getVertices()).toEqual([]);
  });

  // 2. 测试顶点操作
  describe("顶点操作", () => {
    it("添加顶点后应存在于图中", () => {
      graph.addVertex(1);
      expect(graph.getVertices()).toEqual([1]);
    });

    it("删除顶点时同步移除关联边", () => {
      graph.addEdge(1, 2);
      graph.removeVertex(1);
      expect(graph.getNeighbors(2)).toEqual([]); // 验证2的关联边被清理
    });
  });

  // 3. 测试边操作
  describe("边操作", () => {
    beforeEach(() => {
      graph.addVertex(1);
      graph.addVertex(2);
    });

    it("添加边后邻接节点应包含目标顶点", () => {
      graph.addEdge(1, 2);
      expect(graph.getNeighbors(1)).toEqual([{ vertex: 2 }]);
    });

    it("删除边后邻接节点应移除目标顶点", () => {
      graph.addEdge(1, 2);
      /**
       * @TODO: 这里应该删除边，而不是删除顶点
       */
      graph.removeVertex(1);
      expect(graph.getNeighbors(1)).toEqual([]);
    });

    it("无向图添加边时应双向连接", () => {
      const undirectedGraph = new Graph<number>(false);
      undirectedGraph.addEdge(1, 2);
      expect(undirectedGraph.getNeighbors(1)).toEqual([{ vertex: 2 }]);
      expect(undirectedGraph.getNeighbors(2)).toEqual([{ vertex: 1 }]);
    });
  });

  // 4. 测试邻接节点获取
  it("获取不存在的顶点邻接节点应返回空数组", () => {
    expect(graph.getNeighbors(99)).toEqual([]);
  });

  // 5. 测试带权边
  it("带权边应正确存储权重值", () => {
    graph.addEdge(1, 2, 5);
    expect(graph.getNeighbors(1)).toEqual([{ vertex: 2, weight: 5 }]);
  });

  // 6. 边界条件测试
  describe("边界条件", () => {
    it("重复添加相同顶点不应重复存储", () => {
      graph.addVertex(1);
      graph.addVertex(1);
      expect(graph.getVertices()).toEqual([1]);
    });

    it("删除不存在的顶点不应报错", () => {
      expect(() => graph.removeVertex(99)).not.toThrow();
    });
  });
  describe("拓扑排序", () => {
    it("拓扑排序应返回正确的排序结果", () => {
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      graph.addEdge(4, 5);
      const order = topologicalSort(graph);
      console.log(order);
      expect(order).toEqual([1, 2, 3, 4, 5]);
    });
  });
});