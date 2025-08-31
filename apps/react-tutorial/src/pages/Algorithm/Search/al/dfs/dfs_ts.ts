/**
 * 深度优先搜索 (DFS) 的 TypeScript 实现
 *
 * DFS 是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着一条路径尽可能深入地探索，
 * 直到无法继续前进时回溯到上一个分叉点，然后继续探索其他路径。
 *
 * 实现方式：
 * 1. 递归实现 - 利用系统调用栈
 * 2. 迭代实现 - 使用显式栈
 */

// 图的邻接表表示
export type Graph = { [node: string]: string[] };

/**
 * 递归方式实现深度优先搜索
 * @param graph 图的邻接表表示
 * @param node 当前节点
 * @param visited 已访问节点集合
 * @param result 访问结果数组
 * @param callback 可选的回调函数，用于可视化
 */
export function dfsRecursive(
  graph: Graph,
  node: string,
  visited: Set<string> = new Set(),
  result: string[] = [],
  callback?: (currentNode: string, visited: Set<string>, stack: string[]) => void
): string[] {
  // 标记当前节点为已访问
  visited.add(node);
  result.push(node);

  // 如果提供了回调函数，则调用它
  if (callback) {
    // 模拟当前递归栈
    const stack = [...result];
    callback(node, new Set(visited), stack);
  }

  // 访问所有未访问的邻居节点
  for (const neighbor of graph[node] || []) {
    if (!visited.has(neighbor)) {
      dfsRecursive(graph, neighbor, visited, result, callback);
    }
  }

  return result;
}

/**
 * 迭代方式实现深度优先搜索
 * @param graph 图的邻接表表示
 * @param start 起始节点
 * @param callback 可选的回调函数，用于可视化
 */
export function dfsIterative(
  graph: Graph,
  start: string,
  callback?: (currentNode: string, visited: Set<string>, stack: string[]) => void
): string[] {
  const visited = new Set<string>();
  const stack: string[] = [start];
  const result: string[] = [];

  while (stack.length > 0) {
    // 从栈顶取出节点
    const node = stack.pop()!;

    // 如果节点未访问过，则处理它
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);

      // 如果提供了回调函数，则调用它
      if (callback) {
        callback(node, new Set(visited), [...stack]);
      }

      // 将所有未访问的邻居节点压入栈中（逆序，确保访问顺序与递归版本一致）
      const neighbors = graph[node] || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return result;
}

/**
 * 使用DFS检测图中是否存在环
 * @param graph 图的邻接表表示
 */
export function hasCycle(graph: Graph): boolean {
  const visited = new Set<string>();
  const recStack = new Set<string>(); // 当前递归栈中的节点

  // 对每个未访问的节点进行DFS
  for (const node in graph) {
    if (isCyclicUtil(graph, node, visited, recStack)) {
      return true;
    }
  }

  return false;

  // 辅助函数，检查从某个节点开始是否存在环
  function isCyclicUtil(
    graph: Graph,
    node: string,
    visited: Set<string>,
    recStack: Set<string>
  ): boolean {
    // 如果节点不在已访问集合中
    if (!visited.has(node)) {
      // 标记当前节点为已访问，并加入递归栈
      visited.add(node);
      recStack.add(node);

      // 递归访问所有邻居节点
      for (const neighbor of graph[node] || []) {
        // 如果邻居节点未访问且从该邻居开始存在环
        if (!visited.has(neighbor) && isCyclicUtil(graph, neighbor, visited, recStack)) {
          return true;
        }
        // 如果邻居节点在当前递归栈中，说明存在环
        else if (recStack.has(neighbor)) {
          return true;
        }
      }
    }

    // 回溯时从递归栈中移除当前节点
    recStack.delete(node);
    return false;
  }
}

/**
 * 使用DFS查找图中两点之间的所有路径
 * @param graph 图的邻接表表示
 * @param start 起始节点
 * @param end 目标节点
 */
export function findAllPaths(
  graph: Graph,
  start: string,
  end: string,
  callback?: (path: string[], visited: Set<string>) => void
): string[][] {
  const visited = new Set<string>();
  const paths: string[][] = [];

  // DFS查找路径
  function dfs(node: string, path: string[]) {
    // 将当前节点加入路径和已访问集合
    visited.add(node);
    path.push(node);

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback([...path], new Set(visited));
    }

    // 如果找到目标节点，则记录路径
    if (node === end) {
      paths.push([...path]);
    } else {
      // 否则继续搜索未访问的邻居节点
      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, path);
        }
      }
    }

    // 回溯：移除当前节点
    visited.delete(node);
    path.pop();
  }

  dfs(start, []);
  return paths;
}

/**
 * 使用DFS进行拓扑排序
 * @param graph 图的邻接表表示（有向无环图）
 */
export function topologicalSort(
  graph: Graph,
  callback?: (node: string, visited: Set<string>, stack: string[]) => void
): string[] {
  const visited = new Set<string>();
  const stack: string[] = [];

  // 对每个未访问的节点进行DFS
  for (const node in graph) {
    if (!visited.has(node)) {
      topologicalSortUtil(node, visited, stack);
    }
  }

  // 返回反转后的栈
  return stack.reverse();

  // 辅助函数，执行拓扑排序的DFS
  function topologicalSortUtil(
    node: string,
    visited: Set<string>,
    stack: string[]
  ) {
    // 标记当前节点为已访问
    visited.add(node);

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback(node, new Set(visited), [...stack]);
    }

    // 递归访问所有未访问的邻居节点
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        topologicalSortUtil(neighbor, visited, stack);
      }
    }

    // 所有邻居节点处理完后，将当前节点加入栈
    stack.push(node);
  }
}

/**
 * 二维网格DFS遍历
 * @param grid 二维网格
 * @param row 起始行
 * @param col 起始列
 * @param visited 已访问的单元格
 * @param callback 可选的回调函数，用于可视化
 */
export function gridDFS<T>(
  grid: T[][],
  row: number,
  col: number,
  visited: boolean[][] = Array(grid.length).fill(0).map(() => Array(grid[0].length).fill(false)),
  callback?: (r: number, c: number, val: T, visited: boolean[][]) => void
): void {
  // 检查边界和是否已访问
  if (
    row < 0 || row >= grid.length ||
    col < 0 || col >= grid[0].length ||
    visited[row][col]
  ) {
    return;
  }

  // 标记当前单元格为已访问
  visited[row][col] = true;

  // 如果提供了回调函数，则调用它
  if (callback) {
    callback(row, col, grid[row][col], visited.map(row => [...row]));
  }

  // 四个方向：上、右、下、左
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

  // 递归访问四个方向的相邻单元格
  for (const [dr, dc] of directions) {
    gridDFS(grid, row + dr, col + dc, visited, callback);
  }
}

/**
 * 岛屿数量问题 - 使用DFS
 * @param grid 二维网格，'1'表示陆地，'0'表示水域
 */
export function numIslands(
  grid: string[][],
  callback?: (r: number, c: number, islandId: number, visited: boolean[][]) => void
): number {
  if (grid.length === 0 || grid[0].length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1' && !visited[r][c]) {
        count++;
        dfsIsland(r, c, count);
      }
    }
  }

  return count;

  // 辅助函数，标记一个岛屿的所有陆地
  function dfsIsland(row: number, col: number, islandId: number) {
    // 检查边界和是否是陆地
    if (
      row < 0 || row >= rows ||
      col < 0 || col >= cols ||
      grid[row][col] === '0' ||
      visited[row][col]
    ) {
      return;
    }

    // 标记为已访问
    visited[row][col] = true;

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback(row, col, islandId, visited.map(row => [...row]));
    }

    // 四个方向：上、右、下、左
    dfsIsland(row - 1, col, islandId);
    dfsIsland(row, col + 1, islandId);
    dfsIsland(row + 1, col, islandId);
    dfsIsland(row, col - 1, islandId);
  }
}
