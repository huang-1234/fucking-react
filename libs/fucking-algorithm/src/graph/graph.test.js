/**
 * @fileoverview 图数据结构和算法的测试
 */

// 使用 vitest 框架的单元测试
const { describe, it, expect, beforeEach } = require("vitest");
const { Graph, topologicalSort } = require("./graph");

describe("Graph 类测试", () => {
  /** @type {Graph} */
  let graph;

  beforeEach(() => {
    graph = new Graph(true); // 初始化有向图
  });

  // 1. 测试初始化状态
  it("初始化时邻接表应为空", () => {
    expect(graph.getVertices()).toEqual([]);
  });

  // 2. 测试顶点操作
  describe("顶点操作", () => {
    it("添加顶点后应存在于图中", () => {
      graph.addVertex(1, { label: "节点1" });
      expect(graph.getVertices()).toEqual([1]);
      expect(graph.getVertexMetadata(1)).toEqual({ label: "节点1" });
    });

    it("删除顶点时同步移除关联边", () => {
      graph.addEdge(1, 2);
      graph.removeVertex(1);
      expect(graph.getNeighbors(2)).toEqual([]);
    });

    it("可以更新顶点元数据", () => {
      graph.addVertex(1, { label: "节点1" });
      graph.updateVertexMetadata(1, { description: "测试节点", color: "red" });
      expect(graph.getVertexMetadata(1)).toEqual({
        label: "节点1",
        description: "测试节点",
        color: "red"
      });
    });
  });

  // 3. 测试边操作
  describe("边操作", () => {
    beforeEach(() => {
      graph.addVertex(1);
      graph.addVertex(2);
    });

    it("添加边后邻接节点应包含目标顶点", () => {
      graph.addEdge(1, 2, 5, { label: "连接1-2" });
      const neighbors = graph.getNeighbors(1);
      expect(neighbors.length).toBe(1);
      expect(neighbors[0].vertex).toBe(2);
      expect(neighbors[0].weight).toBe(5);
      expect(neighbors[0].label).toBe("连接1-2");
    });

    it("删除边后邻接节点应移除目标顶点", () => {
      graph.addEdge(1, 2);
      // 目前没有直接删除边的方法，所以测试删除顶点
      graph.removeVertex(1);
      expect(graph.getNeighbors(1)).toEqual([]);
    });

    it("无向图添加边时应双向连接", () => {
      const undirectedGraph = new Graph(false);
      undirectedGraph.addEdge(1, 2, 5, { label: "双向连接" });

      const neighbors1 = undirectedGraph.getNeighbors(1);
      const neighbors2 = undirectedGraph.getNeighbors(2);

      expect(neighbors1.length).toBe(1);
      expect(neighbors1[0].vertex).toBe(2);
      expect(neighbors1[0].weight).toBe(5);
      expect(neighbors1[0].label).toBe("双向连接");

      expect(neighbors2.length).toBe(1);
      expect(neighbors2[0].vertex).toBe(1);
      expect(neighbors2[0].weight).toBe(5);
      expect(neighbors2[0].label).toBe("双向连接");
    });
  });

  // 4. 测试邻接节点获取
  it("获取不存在的顶点邻接节点应返回空数组", () => {
    expect(graph.getNeighbors(99)).toEqual([]);
  });

  // 5. 测试带权边
  it("带权边应正确存储权重值", () => {
    graph.addEdge(1, 2, 5);
    const neighbors = graph.getNeighbors(1);
    expect(neighbors.length).toBe(1);
    expect(neighbors[0].vertex).toBe(2);
    expect(neighbors[0].weight).toBe(5);
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

  // 7. 测试复杂元数据
  describe("复杂元数据", () => {
    it("可以存储和检索复杂的顶点元数据", () => {
      const complexMetadata = {
        label: "复杂节点",
        description: "包含多层嵌套数据的节点",
        position: { x: 100, y: 200 },
        color: "#FF5733",
        weight: 10,
        customData: {
          createdAt: new Date(),
          tags: ["important", "critical"],
          properties: {
            priority: "high",
            status: "active"
          }
        }
      };

      graph.addVertex(1, complexMetadata);
      const retrievedMetadata = graph.getVertexMetadata(1);

      expect(retrievedMetadata).toEqual(complexMetadata);
      expect(retrievedMetadata.position.x).toBe(100);
      expect(retrievedMetadata.customData.tags).toContain("important");
      expect(retrievedMetadata.customData.properties.priority).toBe("high");
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

      // 检查拓扑排序的有效性
      expect(order.length).toBe(5);
      expect(order[0]).toBe(1); // 1应该在最前面
      expect(order[order.length - 1]).toBe(5); // 5应该在最后

      // 检查2和3的相对位置不确定，但都应该在1之后，4之前
      const indexOf2 = order.indexOf(2);
      const indexOf3 = order.indexOf(3);
      const indexOf4 = order.indexOf(4);

      expect(indexOf2).toBeGreaterThan(0);
      expect(indexOf3).toBeGreaterThan(0);
      expect(indexOf4).toBeGreaterThan(Math.max(indexOf2, indexOf3));
    });

    it("有环图的拓扑排序应返回空数组", () => {
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1); // 形成环

      const order = topologicalSort(graph);
      expect(order).toEqual([]);
    });
  });
});