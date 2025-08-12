/**
 * 拓扑排序实现
 *
 * 拓扑排序是对有向无环图(DAG)的顶点进行排序，使得对于图中任意一条有向边(u, v)，
 * 顶点u在排序中都出现在顶点v之前。如果图中存在环，则无法进行拓扑排序。
 *
 * 两种经典算法：
 * 1. Kahn算法：基于BFS，使用入度表
 * 2. DFS算法：基于DFS，使用访问标记
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
     * 添加有向边
     * @param {T} source - 源顶点
     * @param {T} destination - 目标顶点
     */
    addEdge(source, destination) {
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
   * Kahn算法实现拓扑排序
   * 时间复杂度: O(V + E)，其中V是顶点数，E是边数
   *
   * 算法步骤:
   * 1. 计算所有顶点的入度
   * 2. 将所有入度为0的顶点加入队列
   * 3. 当队列非空时，出队一个顶点，将其加入结果，并将其所有邻接点的入度减1
   * 4. 如果减1后邻接点入度为0，则将其加入队列
   * 5. 重复步骤3-4直到队列为空
   * 6. 如果结果中的顶点数等于图中的顶点数，则返回拓扑排序；否则图中存在环，返回空数组
   *
   * @template {Vertex} T
   * @param {Graph<T>} graph - 要进行拓扑排序的图
   * @returns {T[]} 拓扑排序结果，如果存在环则返回空数组
   */
  function topologicalSortKahn(graph) {
    /** @type {T[]} */
    const result = [];
    /** @type {T[]} */
    const queue = [];
    /** @type {Map<T, number>} */
    const inDegree = new Map();

    // 初始化所有顶点的入度为0
    graph.getVertices().forEach(v => inDegree.set(v, 0));

    // 计算每个顶点的入度
    graph.getVertices().forEach(v => {
      graph.getNeighbors(v).forEach(neighbor => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
      });
    });

    // 将所有入度为0的顶点加入队列
    inDegree.forEach((degree, vertex) => {
      if (degree === 0) queue.push(vertex);
    });

    // BFS
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      graph.getNeighbors(current).forEach(neighbor => {
        const newDegree = inDegree.get(neighbor) - 1;
        inDegree.set(neighbor, newDegree);

        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    // 检查是否存在环
    return result.length === graph.getVertices().length ? result : [];
  }

  /**
   * DFS算法实现拓扑排序
   * 时间复杂度: O(V + E)，其中V是顶点数，E是边数
   *
   * 算法步骤:
   * 1. 对图中每个未访问的顶点进行DFS
   * 2. 在DFS过程中标记顶点的状态：未访问、访问中、已访问
   * 3. 如果在DFS过程中遇到"访问中"的顶点，则表示存在环
   * 4. DFS完成后，将顶点按照访问完成的逆序排列，即为拓扑排序
   *
   * @template {Vertex} T
   * @param {Graph<T>} graph - 要进行拓扑排序的图
   * @returns {T[]} 拓扑排序结果，如果存在环则返回空数组
   */
  function topologicalSortDFS(graph) {
    /** @type {T[]} */
    const result = [];
    /** @type {Map<T, number>} */
    const visited = new Map(); // 0: 未访问, 1: 访问中, 2: 已访问
    let hasCycle = false;

    // 初始化所有顶点为未访问
    graph.getVertices().forEach(v => visited.set(v, 0));

    /**
     * DFS辅助函数
     * @param {T} vertex - 当前访问的顶点
     */
    function dfs(vertex) {
      // 如果已经检测到环，直接返回
      if (hasCycle) return;

      // 标记为访问中
      visited.set(vertex, 1);

      // 访问所有邻接点
      for (const neighbor of graph.getNeighbors(vertex)) {
        const status = visited.get(neighbor);

        if (status === 0) { // 未访问
          dfs(neighbor);
        } else if (status === 1) { // 访问中，检测到环
          hasCycle = true;
          return;
        }
        // 已访问的顶点不需要再次访问
      }

      // 标记为已访问
      visited.set(vertex, 2);
      // 将顶点加入结果（前插法，最终结果需要反转）
      result.unshift(vertex);
    }

    // 对每个未访问的顶点进行DFS
    for (const vertex of graph.getVertices()) {
      if (visited.get(vertex) === 0) {
        dfs(vertex);
      }
    }

    return hasCycle ? [] : result;
  }

  /**
   * 创建并返回一个示例图
   * @returns {Graph<string>} 示例图
   */
  function createExampleGraph() {
    const graph = new Graph();

    // 添加边：课程依赖关系示例
    // 例如: ["数据结构", "算法"] 表示"算法"依赖于"数据结构"
    const dependencies = [
      ["数学基础", "数据结构"],
      ["数学基础", "算法"],
      ["数据结构", "算法"],
      ["数据结构", "数据库"],
      ["算法", "高级算法"],
      ["数据库", "系统设计"]
    ];

    dependencies.forEach(([prereq, course]) => {
      graph.addVertex(prereq);
      graph.addVertex(course);
      graph.addEdge(prereq, course);
    });

    return graph;
  }

  /**
   * 测试函数
   */
  function testTopologicalSort() {
    const graph = createExampleGraph();

    console.log("图结构:");
    graph.print();

    console.log("\nKahn算法拓扑排序结果:");
    const kahnResult = topologicalSortKahn(graph);
    console.log(kahnResult.join(" -> "));

    console.log("\nDFS算法拓扑排序结果:");
    const dfsResult = topologicalSortDFS(graph);
    console.log(dfsResult.join(" -> "));

    // 创建一个有环的图进行测试
    const cyclicGraph = new Graph();
    cyclicGraph.addEdge("A", "B");
    cyclicGraph.addEdge("B", "C");
    cyclicGraph.addEdge("C", "A"); // 形成环

    console.log("\n有环图的Kahn算法结果:");
    const cyclicKahnResult = topologicalSortKahn(cyclicGraph);
    console.log(cyclicKahnResult.length === 0 ? "检测到环，无法进行拓扑排序" : cyclicKahnResult.join(" -> "));

    console.log("\n有环图的DFS算法结果:");
    const cyclicDFSResult = topologicalSortDFS(cyclicGraph);
    console.log(cyclicDFSResult.length === 0 ? "检测到环，无法进行拓扑排序" : cyclicDFSResult.join(" -> "));
  }

  // 导出所有需要的函数和类
  module.exports = {
    Graph,
    topologicalSortKahn,
    topologicalSortDFS,
    createExampleGraph,
    testTopologicalSort
  };

  // 如果直接运行此文件，则执行测试
  if (require.main === module) {
    testTopologicalSort();
  }
