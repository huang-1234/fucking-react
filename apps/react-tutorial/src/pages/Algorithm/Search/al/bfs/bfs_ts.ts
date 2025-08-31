/**
 * 广度优先搜索 (BFS) 的 TypeScript 实现
 *
 * BFS 是一种用于遍历或搜索树或图的算法。它从根节点开始，先访问所有相邻节点，
 * 然后再访问下一层节点，按层级顺序逐步扩展。
 *
 * 特点：
 * 1. 使用队列（先进先出）作为辅助数据结构
 * 2. 保证找到的路径是最短路径（在无权图中）
 * 3. 适合解决最短路径、层级遍历等问题
 */

// 图的邻接表表示
export type Graph = { [node: string]: string[] };

/**
 * 基本的广度优先搜索实现
 * @param graph 图的邻接表表示
 * @param start 起始节点
 * @param callback 可选的回调函数，用于可视化
 */
export function bfs(
  graph: Graph,
  start: string,
  callback?: (currentNode: string, visited: Set<string>, queue: string[]) => void
): string[] {
  const visited = new Set<string>();
  const queue: string[] = [start];
  const result: string[] = [];

  // 标记起始节点为已访问
  visited.add(start);

  while (queue.length > 0) {
    // 出队一个节点
    const node = queue.shift()!;
    result.push(node);

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback(node, new Set(visited), [...queue]);
    }

    // 访问所有未访问的邻居节点
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

/**
 * 使用BFS查找最短路径
 * @param graph 图的邻接表表示
 * @param start 起始节点
 * @param end 目标节点
 * @param callback 可选的回调函数，用于可视化
 */
export function shortestPath(
  graph: Graph,
  start: string,
  end: string,
  callback?: (currentNode: string, visited: Set<string>, queue: string[], paths: Map<string, string[]>) => void
): string[] {
  // 如果起始节点就是目标节点，直接返回
  if (start === end) {
    return [start];
  }

  const visited = new Set<string>();
  const queue: string[] = [start];
  // 记录每个节点的前驱节点
  const prev = new Map<string, string>();

  // 标记起始节点为已访问
  visited.add(start);

  while (queue.length > 0) {
    // 出队一个节点
    const node = queue.shift()!;

    // 如果提供了回调函数，则调用它
    if (callback) {
      // 构建当前的路径映射
      const paths = new Map<string, string[]>();
      for (const [node, prevNode] of prev.entries()) {
        let path = [node];
        let current = prevNode;
        while (current) {
          path.unshift(current);
          current = prev.get(current) || '';
        }
        paths.set(node, path);
      }

      callback(node, new Set(visited), [...queue], paths);
    }

    // 访问所有未访问的邻居节点
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        prev.set(neighbor, node);
        queue.push(neighbor);

        // 如果找到目标节点，构建并返回路径
        if (neighbor === end) {
          const path = [end];
          let current = node;
          while (current) {
            path.unshift(current);
            current = prev.get(current) || '';
          }
          return path;
        }
      }
    }
  }

  // 如果没有找到路径，返回空数组
  return [];
}

/**
 * 二维网格BFS遍历
 * @param grid 二维网格
 * @param startRow 起始行
 * @param startCol 起始列
 * @param callback 可选的回调函数，用于可视化
 */
export function gridBFS<T>(
  grid: T[][],
  startRow: number,
  startCol: number,
  callback?: (r: number, c: number, val: T, distance: number, visited: boolean[][]) => void
): number[][] {
  if (grid.length === 0 || grid[0].length === 0) {
    return [];
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
  const distance = Array(rows).fill(0).map(() => Array(cols).fill(-1));

  // 四个方向：上、右、下、左
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

  // 初始化队列，存储 [row, col, distance]
  const queue: [number, number, number][] = [[startRow, startCol, 0]];
  visited[startRow][startCol] = true;
  distance[startRow][startCol] = 0;

  // 如果提供了回调函数，则调用它
  if (callback) {
    callback(startRow, startCol, grid[startRow][startCol], 0, visited.map(row => [...row]));
  }

  while (queue.length > 0) {
    // 出队一个单元格
    const [row, col, dist] = queue.shift()!;

    // 探索四个方向
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // 检查边界和是否已访问
      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true;
        distance[newRow][newCol] = dist + 1;
        queue.push([newRow, newCol, dist + 1]);

        // 如果提供了回调函数，则调用它
        if (callback) {
          callback(newRow, newCol, grid[newRow][newCol], dist + 1, visited.map(row => [...row]));
        }
      }
    }
  }

  return distance;
}

/**
 * 使用BFS解决迷宫最短路径问题
 * @param maze 迷宫二维数组，0表示通道，1表示墙
 * @param start 起点坐标 [row, col]
 * @param end 终点坐标 [row, col]
 * @param callback 可选的回调函数，用于可视化
 */
export function solveMaze(
  maze: number[][],
  start: [number, number],
  end: [number, number],
  callback?: (r: number, c: number, dist: number, visited: boolean[][], queue: [number, number, number][]) => void
): [number, number][] {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array(rows).fill(0).map(() => Array(cols).fill(false));

  // 四个方向：上、右、下、左
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

  // 初始化队列，存储 [row, col, distance]
  const queue: [number, number, number][] = [[start[0], start[1], 0]];
  visited[start[0]][start[1]] = true;

  // 记录每个单元格的前驱单元格
  const prev = new Map<string, [number, number]>();

  while (queue.length > 0) {
    // 出队一个单元格
    const [row, col, dist] = queue.shift()!;

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback(row, col, dist, visited.map(row => [...row]), [...queue]);
    }

    // 如果到达终点，构建并返回路径
    if (row === end[0] && col === end[1]) {
      return buildPath(prev, end);
    }

    // 探索四个方向
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // 检查边界、是否是通道、是否已访问
      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true;
        queue.push([newRow, newCol, dist + 1]);
        prev.set(`${newRow},${newCol}`, [row, col]);
      }
    }
  }

  // 如果没有找到路径，返回空数组
  return [];

  // 辅助函数，根据前驱信息构建路径
  function buildPath(
    prev: Map<string, [number, number]>,
    end: [number, number]
  ): [number, number][] {
    const path: [number, number][] = [end];
    let current = end;

    while (prev.has(`${current[0]},${current[1]}`)) {
      current = prev.get(`${current[0]},${current[1]}`)!;
      path.unshift(current);
    }

    return path;
  }
}

/**
 * 单词接龙问题 - 使用BFS
 * @param beginWord 起始单词
 * @param endWord 目标单词
 * @param wordList 单词列表
 * @param callback 可选的回调函数，用于可视化
 */
export function wordLadder(
  beginWord: string,
  endWord: string,
  wordList: string[],
  callback?: (currentWord: string, visited: Set<string>, queue: [string, number][], level: number) => void
): number {
  // 如果目标单词不在单词列表中，无法变换
  if (!wordList.includes(endWord)) {
    return 0;
  }

  // 创建单词集合，方便快速查找
  const wordSet = new Set(wordList);

  // 如果起始单词在单词列表中，需要移除以避免重复访问
  wordSet.delete(beginWord);

  // 初始化队列，存储 [word, level]
  const queue: [string, number][] = [[beginWord, 1]];
  const visited = new Set<string>([beginWord]);

  while (queue.length > 0) {
    // 出队一个单词
    const [word, level] = queue.shift()!;

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback(word, new Set(visited), [...queue], level);
    }

    // 如果到达目标单词，返回变换次数
    if (word === endWord) {
      return level;
    }

    // 尝试变换单词的每一个字符
    for (let i = 0; i < word.length; i++) {
      // 尝试替换为a-z的每个字符
      for (let c = 97; c <= 122; c++) {
        const newChar = String.fromCharCode(c);
        const newWord = word.slice(0, i) + newChar + word.slice(i + 1);

        // 如果新单词在单词集合中且未访问过
        if (wordSet.has(newWord) && !visited.has(newWord)) {
          visited.add(newWord);
          queue.push([newWord, level + 1]);
          wordSet.delete(newWord); // 移除以避免重复访问
        }
      }
    }
  }

  // 如果无法变换到目标单词，返回0
  return 0;
}
