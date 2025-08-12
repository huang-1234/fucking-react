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

// 图节点类型
export type Vertex = string | number;

/**
 * 图的邻接表表示
 */
export class Graph<T extends Vertex> {
  private adjacencyList: Map<T, T[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  // 添加顶点
  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  // 添加有向边
  addEdge(source: T, destination: T): void {
    this.addVertex(source);
    this.addVertex(destination);
    this.adjacencyList.get(source)!.push(destination);
  }

  // 获取所有顶点
  getVertices(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  // 获取顶点的邻接点
  getNeighbors(vertex: T): T[] {
    return this.adjacencyList.get(vertex) || [];
  }

  // 打印图结构
  print(): void {
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
 */
export function topologicalSortKahn<T extends Vertex>(graph: Graph<T>): T[] {
  const result: T[] = [];
  const queue: T[] = [];
  const inDegree = new Map<T, number>();

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
    const current = queue.shift()!;
    result.push(current);

    graph.getNeighbors(current).forEach(neighbor => {
      const newDegree = inDegree.get(neighbor)! - 1;
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
 */
export function topologicalSortDFS<T extends Vertex>(graph: Graph<T>): T[] {
  const result: T[] = [];
  const visited = new Map<T, number>(); // 0: 未访问, 1: 访问中, 2: 已访问
  let hasCycle = false;

  // 初始化所有顶点为未访问
  graph.getVertices().forEach(v => visited.set(v, 0));

  function dfs(vertex: T): void {
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
 */
export function createExampleGraph(): Graph<string> {
  const graph = new Graph<string>();

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
export function testTopologicalSort(): void {
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
  const cyclicGraph = new Graph<string>();
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

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testTopologicalSort();
}