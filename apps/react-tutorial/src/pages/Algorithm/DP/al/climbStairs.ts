/**
 * @description 爬楼梯问题的动态规划实现
 * 每次可以爬1或2阶，求到达第n阶的方案数
 *
 * 算法步骤:
 * 1. 定义状态：dp[i] 表示爬到第i阶的方案数
 * 2. 状态转移方程：dp[i] = dp[i-1] + dp[i-2]
 * 3. 初始状态：dp[1] = 1, dp[2] = 2
 * 4. 返回dp[n]
 */

/**
 * 步骤回调函数类型定义
 */
export type StepCallback = (params: {
  i: number;
  value: number;
  prev1: number;
  prev2: number;
}) => void;

/**
 * 算法结果类型定义
 */
export interface ClimbStairsResult {
  result: number;
  dp: number[];
}

/**
 * @description 爬楼梯问题的核心算法，支持回调函数收集步骤
 * @param {number} n 楼梯阶数
 * @param {StepCallback} onStep 每一步的回调函数
 * @returns {ClimbStairsResult} 算法结果
 */
export function climbStairs(
  n: number,
  onStep?: StepCallback
): ClimbStairsResult {
  if (n <= 0) return { result: 0, dp: [] };
  if (n === 1) return { result: 1, dp: [1] };

  // 定义dp数组
  const dp: number[] = new Array(n + 1).fill(0);

  // 初始状态
  dp[1] = 1;
  dp[2] = 2;

  // 调用初始化步骤的回调
  if (onStep) {
    onStep({
      i: 1,
      value: 1,
      prev1: 0,
      prev2: 0
    });

    onStep({
      i: 2,
      value: 2,
      prev1: 1,
      prev2: 0
    });
  }

  // 状态转移
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];

    // 调用步骤回调
    if (onStep) {
      onStep({
        i,
        value: dp[i],
        prev1: dp[i - 1],
        prev2: dp[i - 2]
      });
    }
  }

  return {
    result: dp[n],
    dp
  };
}

/**
 * @description 空间优化版本的爬楼梯算法
 * @param {number} n 楼梯阶数
 * @returns {number} 方案数
 */
export function climbStairsOptimized(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;

  let a = 1; // dp[1]
  let b = 2; // dp[2]

  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }

  return b;
}

/**
 * @description 生成爬楼梯问题计算的每一步
 * @param {number} n 楼梯阶数
 * @returns {Object} 包含步骤和结果的对象
 */
export function generateClimbStairsSteps(n: number): {
  steps: Array<{
    i: number;
    value: number;
    prev1: number;
    prev2: number;
  }>;
  result: number;
  dp: number[];
} {
  const steps: Array<{
    i: number;
    value: number;
    prev1: number;
    prev2: number;
  }> = [];

  // 使用回调函数收集步骤
  const result = climbStairs(n, (step) => {
    steps.push({ ...step });
  });

  return {
    steps,
    result: result.result,
    dp: result.dp
  };
}

/**
 * @description 使用异步方式计算爬楼梯问题，支持每一步的回调
 * @param {number} n 楼梯阶数
 * @param {StepCallback} onStep 每一步的回调函数
 * @param {number} delay 每一步的延迟时间（毫秒）
 * @returns {Promise<ClimbStairsResult>} 算法结果的Promise
 */
export async function climbStairsAsync(
  n: number,
  onStep?: StepCallback,
  delay: number = 100
): Promise<ClimbStairsResult> {
  if (n <= 0) return { result: 0, dp: [] };
  if (n === 1) return { result: 1, dp: [1] };

  // 定义dp数组
  const dp: number[] = new Array(n + 1).fill(0);

  // 初始状态
  dp[1] = 1;
  dp[2] = 2;

  // 调用初始化步骤的回调
  if (onStep) {
    onStep({
      i: 1,
      value: 1,
      prev1: 0,
      prev2: 0
    });

    // 延迟
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    onStep({
      i: 2,
      value: 2,
      prev1: 1,
      prev2: 0
    });

    // 延迟
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 状态转移
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];

    // 调用步骤回调
    if (onStep) {
      onStep({
        i,
        value: dp[i],
        prev1: dp[i - 1],
        prev2: dp[i - 2]
      });

      // 延迟
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    result: dp[n],
    dp
  };
}
