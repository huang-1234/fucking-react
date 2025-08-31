/**
 * @description 最小路径和问题的动态规划实现
 * 在m×n网格中从左上角到右下角，求数字和最小的路径
 *
 * 算法步骤:
 * 1. 定义状态：dp[i][j] 表示从起点到(i,j)位置的最小路径和
 * 2. 状态转移方程：dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
 * 3. 初始状态：初始化第一行和第一列的累加和
 * 4. 返回dp[m-1][n-1]
 */

import type { StepCallbackPathSum } from "./step";

/**
 * 算法结果类型定义
 */
export interface MinPathSumResult {
  result: number;
  dp: number[][];
  path: [number, number][];
}

/**
 * @description 最小路径和问题的核心算法，支持回调函数收集步骤
 * @param {number[][]} grid 网格数组
 * @param {StepCallbackPathSum} onStep 每一步的回调函数
 * @returns {MinPathSumResult} 算法结果
 */
export function minPathSum(
  grid: number[][],
  onStep?: StepCallbackPathSum
): MinPathSumResult {
  if (!grid.length || !grid[0].length) {
    return { result: 0, dp: [], path: [] };
  }

  const m = grid.length;
  const n = grid[0].length;

  // 创建dp数组的副本，避免修改原数组
  const dp: number[][] = Array(m).fill(0).map((_, i) =>
    Array(n).fill(0).map((_, j) => grid[i][j])
  );

  // 用于记录路径的来源方向
  const pathFrom: Array<Array<'top' | 'left' | 'start'>> = Array(m).fill(0).map(() =>
    Array(n).fill('start')
  );

  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
    pathFrom[0][j] = 'left';

    if (onStep) {
      onStep({
        i: 0,
        j,
        value: dp[0][j],
        fromTop: null,
        fromLeft: dp[0][j - 1],
        decision: `初始化第一行：dp[0][${j}] = dp[0][${j-1}] + grid[0][${j}] = ${dp[0][j-1]} + ${grid[0][j]} = ${dp[0][j]}`
      });
    }
  }

  // 初始化第一列
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
    pathFrom[i][0] = 'top';

    if (onStep) {
      onStep({
        i,
        j: 0,
        value: dp[i][0],
        fromTop: dp[i - 1][0],
        fromLeft: null,
        decision: `初始化第一列：dp[${i}][0] = dp[${i-1}][0] + grid[${i}][0] = ${dp[i-1][0]} + ${grid[i][0]} = ${dp[i][0]}`
      });
    }
  }

  // 状态转移
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const fromTop = dp[i - 1][j];
      const fromLeft = dp[i][j - 1];

      if (fromTop <= fromLeft) {
        dp[i][j] = fromTop + grid[i][j];
        pathFrom[i][j] = 'top';

        if (onStep) {
          onStep({
            i,
            j,
            value: dp[i][j],
            fromTop,
            fromLeft,
            decision: `从上方来：dp[${i}][${j}] = dp[${i-1}][${j}] + grid[${i}][${j}] = ${fromTop} + ${grid[i][j]} = ${dp[i][j]}`
          });
        }
      } else {
        dp[i][j] = fromLeft + grid[i][j];
        pathFrom[i][j] = 'left';

        if (onStep) {
          onStep({
            i,
            j,
            value: dp[i][j],
            fromTop,
            fromLeft,
            decision: `从左方来：dp[${i}][${j}] = dp[${i}][${j-1}] + grid[${i}][${j}] = ${fromLeft} + ${grid[i][j]} = ${dp[i][j]}`
          });
        }
      }
    }
  }

  // 回溯找出最短路径
  const path: [number, number][] = [];
  let i = m - 1, j = n - 1;

  while (i >= 0 && j >= 0) {
    path.unshift([i, j]);

    if (i === 0 && j === 0) break;

    if (pathFrom[i][j] === 'top') {
      i--;
    } else {
      j--;
    }
  }

  return {
    result: dp[m - 1][n - 1],
    dp,
    path
  };
}

/**
 * @description 空间优化版本的最小路径和算法
 * @param {number[][]} grid 网格数组
 * @returns {number} 最小路径和
 */
export function minPathSumOptimized(grid: number[][]): number {
  if (!grid.length || !grid[0].length) return 0;

  const m = grid.length;
  const n = grid[0].length;
  const dp: number[] = new Array(n).fill(0);

  // 初始化第一个元素
  dp[0] = grid[0][0];

  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[j] = dp[j - 1] + grid[0][j];
  }

  // 状态转移
  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0]; // 更新第一列

    for (let j = 1; j < n; j++) {
      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
    }
  }

  return dp[n - 1];
}

/**
 * @description 生成最小路径和问题计算的每一步
 * @param {number[][]} grid 网格数组
 * @returns {Object} 包含步骤和结果的对象
 */
export function generateMinPathSumSteps(grid: number[][]): {
  steps: Array<StepCbParams>;
  result: number;
  dp: number[][];
  path: [number, number][];
} {
  const steps: Array<StepCbParams> = [];

  // 使用回调函数收集步骤
  const result = minPathSum(grid, (step) => {
    steps.push({ ...step });
  });

  return {
    steps,
    result: result.result,
    dp: result.dp,
    path: result.path
  };
}

/**
 * @description 使用异步方式计算最小路径和问题，支持每一步的回调
 * @param {number[][]} grid 网格数组
 * @param {StepCallbackPathSum} onStep 每一步的回调函数
 * @param {number} delay 每一步的延迟时间（毫秒）
 * @returns {Promise<MinPathSumResult>} 算法结果的Promise
 */
export async function minPathSumAsync(
  grid: number[][],
  onStep?: StepCallbackPathSum,
  delay: number = 100
): Promise<MinPathSumResult> {
  if (!grid.length || !grid[0].length) {
    return { result: 0, dp: [], path: [] };
  }

  const m = grid.length;
  const n = grid[0].length;

  // 创建dp数组的副本，避免修改原数组
  const dp: number[][] = Array(m).fill(0).map((_, i) =>
    Array(n).fill(0).map((_, j) => grid[i][j])
  );

  // 用于记录路径的来源方向
  const pathFrom: Array<Array<'top' | 'left' | 'start'>> = Array(m).fill(0).map(() =>
    Array(n).fill('start')
  );

  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
    pathFrom[0][j] = 'left';

    if (onStep) {
      onStep({
        i: 0,
        j,
        value: dp[0][j],
        fromTop: null,
        fromLeft: dp[0][j - 1],
        decision: `初始化第一行：dp[0][${j}] = dp[0][${j-1}] + grid[0][${j}] = ${dp[0][j-1]} + ${grid[0][j]} = ${dp[0][j]}`
      });

      // 延迟
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 初始化第一列
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
    pathFrom[i][0] = 'top';

    if (onStep) {
      onStep({
        i,
        j: 0,
        value: dp[i][0],
        fromTop: dp[i - 1][0],
        fromLeft: null,
        decision: `初始化第一列：dp[${i}][0] = dp[${i-1}][0] + grid[${i}][0] = ${dp[i-1][0]} + ${grid[i][0]} = ${dp[i][0]}`
      });

      // 延迟
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 状态转移
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const fromTop = dp[i - 1][j];
      const fromLeft = dp[i][j - 1];

      if (fromTop <= fromLeft) {
        dp[i][j] = fromTop + grid[i][j];
        pathFrom[i][j] = 'top';

        if (onStep) {
          onStep({
            i,
            j,
            value: dp[i][j],
            fromTop,
            fromLeft,
            decision: `从上方来：dp[${i}][${j}] = dp[${i-1}][${j}] + grid[${i}][${j}] = ${fromTop} + ${grid[i][j]} = ${dp[i][j]}`
          });

          // 延迟
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } else {
        dp[i][j] = fromLeft + grid[i][j];
        pathFrom[i][j] = 'left';

        if (onStep) {
          onStep({
            i,
            j,
            value: dp[i][j],
            fromTop,
            fromLeft,
            decision: `从左方来：dp[${i}][${j}] = dp[${i}][${j-1}] + grid[${i}][${j}] = ${fromLeft} + ${grid[i][j]} = ${dp[i][j]}`
          });

          // 延迟
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    }
  }

  // 回溯找出最短路径
  const path: [number, number][] = [];
  let i = m - 1, j = n - 1;

  while (i >= 0 && j >= 0) {
    path.unshift([i, j]);

    if (i === 0 && j === 0) break;

    if (pathFrom[i][j] === 'top') {
      i--;
    } else {
      j--;
    }
  }

  return {
    result: dp[m - 1][n - 1],
    dp,
    path
  };
}