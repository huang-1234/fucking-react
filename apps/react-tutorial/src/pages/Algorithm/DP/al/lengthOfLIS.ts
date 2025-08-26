import type { StepCbParamsBase } from "./step";

/**
 * @description 最长上升子序列问题的动态规划实现
 * 求数组中最长严格递增子序列长度
 *
 * 算法步骤:
 * 1. 定义状态：dp[i] 表示以nums[i]结尾的最长上升子序列长度
 * 2. 状态转移方程：dp[i] = max(dp[j] + 1) for j in [0, i-1] if nums[i] > nums[j]
 * 3. 初始状态：dp[i] = 1 (每个元素至少是长度为1的子序列)
 * 4. 返回dp数组中的最大值
 */
export interface StepCbParams extends StepCbParamsBase {
  prevValue: number | null;
}
/**
 * 步骤回调函数类型定义
 */
export type StepCallback = (params: StepCbParams) => void;

/**
 * 算法结果类型定义
 */
export interface LISResult {
  result: number;
  dp: number[];
  sequence: number[];
}

/**
 * @description 最长上升子序列问题的核心算法，支持回调函数收集步骤
 * @param {number[]} nums 数字数组
 * @param {StepCallback} onStep 每一步的回调函数
 * @returns {LISResult} 算法结果
 */
export function lengthOfLIS(
  nums: number[],
  onStep?: StepCallback
): LISResult {
  if (!nums.length) return { result: 0, dp: [], sequence: [] };

  const n = nums.length;
  const dp: number[] = new Array(n).fill(1); // 每个元素至少是长度为1的子序列

  // 记录前驱节点，用于重建序列
  const prev: number[] = new Array(n).fill(-1);

  // 初始化第一个元素
  if (onStep) {
    onStep({
      i: 0,
      j: null,
      value: 1,
      prevValue: null,
      decision: `初始化：dp[0] = 1，以 ${nums[0]} 结尾的LIS长度为1`
    });
  }

  // 状态转移
  for (let i = 1; i < n; i++) {
    let maxLen = 1;
    let maxJ = -1;

    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        const newLen = dp[j] + 1;
        if (newLen > maxLen) {
          maxLen = newLen;
          maxJ = j;

          if (onStep) {
            onStep({
              i,
              j,
              value: maxLen,
              prevValue: dp[j],
              decision: `更新：dp[${i}] = dp[${j}] + 1 = ${dp[j]} + 1 = ${maxLen}，因为 ${nums[i]} > ${nums[j]}`
            });
          }
        }
      }
    }

    dp[i] = maxLen;
    prev[i] = maxJ;

    if (maxJ === -1 && onStep) {
      onStep({
        i,
        j: null,
        value: 1,
        prevValue: null,
        decision: `没有找到更长的序列，dp[${i}] = 1，以 ${nums[i]} 结尾的LIS长度为1`
      });
    }
  }

  // 找到最长上升子序列的长度和结束位置
  let maxLength = 0;
  let endIndex = -1;

  for (let i = 0; i < n; i++) {
    if (dp[i] > maxLength) {
      maxLength = dp[i];
      endIndex = i;
    }
  }

  // 重建最长上升子序列
  const sequence: number[] = [];
  while (endIndex !== -1) {
    sequence.unshift(nums[endIndex]);
    endIndex = prev[endIndex];
  }

  return {
    result: maxLength,
    dp,
    sequence
  };
}

/**
 * @description 贪心+二分查找优化的最长上升子序列算法
 * @param {number[]} nums 数字数组
 * @returns {number} 最长上升子序列的长度
 */
export function lengthOfLISOptimized(nums: number[]): number {
  if (!nums.length) return 0;

  const tails: number[] = [];

  for (const num of nums) {
    let left = 0, right = tails.length;

    // 二分查找
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // 如果找到了合适的位置，更新tails数组
    if (left === tails.length) {
      tails.push(num);
    } else {
      tails[left] = num;
    }
  }

  return tails.length;
}

/**
 * @description 生成最长上升子序列问题计算的每一步
 * @param {number[]} nums 数字数组
 * @returns {Object} 包含步骤和结果的对象
 */
export function generateLISSteps(nums: number[]): {
  steps: Array<{
    i: number;
    j: number | null;
    value: number;
    prevValue: number | null;
    decision: string;
  }>;
  result: number;
  dp: number[];
  sequence: number[];
} {
  const steps: Array<{
    i: number;
    j: number | null;
    value: number;
    prevValue: number | null;
    decision: string;
  }> = [];

  // 使用回调函数收集步骤
  const result = lengthOfLIS(nums, (step) => {
    steps.push({ ...step });
  });

  return {
    steps,
    result: result.result,
    dp: result.dp,
    sequence: result.sequence
  };
}

/**
 * @description 使用异步方式计算最长上升子序列问题，支持每一步的回调
 * @param {number[]} nums 数字数组
 * @param {StepCallback} onStep 每一步的回调函数
 * @param {number} delay 每一步的延迟时间（毫秒）
 * @returns {Promise<LISResult>} 算法结果的Promise
 */
export async function lengthOfLISAsync(
  nums: number[],
  onStep?: StepCallback,
  delay: number = 100
): Promise<LISResult> {
  if (!nums.length) return { result: 0, dp: [], sequence: [] };

  const n = nums.length;
  const dp: number[] = new Array(n).fill(1); // 每个元素至少是长度为1的子序列

  // 记录前驱节点，用于重建序列
  const prev: number[] = new Array(n).fill(-1);

  // 初始化第一个元素
  if (onStep) {
    onStep({
      i: 0,
      j: null,
      value: 1,
      prevValue: null,
      decision: `初始化：dp[0] = 1，以 ${nums[0]} 结尾的LIS长度为1`
    });

    // 延迟
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 状态转移
  for (let i = 1; i < n; i++) {
    let maxLen = 1;
    let maxJ = -1;

    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        const newLen = dp[j] + 1;
        if (newLen > maxLen) {
          maxLen = newLen;
          maxJ = j;

          if (onStep) {
            onStep({
              i,
              j,
              value: maxLen,
              prevValue: dp[j],
              decision: `更新：dp[${i}] = dp[${j}] + 1 = ${dp[j]} + 1 = ${maxLen}，因为 ${nums[i]} > ${nums[j]}`
            });

            // 延迟
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
      }
    }

    dp[i] = maxLen;
    prev[i] = maxJ;

    if (maxJ === -1 && onStep) {
      onStep({
        i,
        j: null,
        value: 1,
        prevValue: null,
        decision: `没有找到更长的序列，dp[${i}] = 1，以 ${nums[i]} 结尾的LIS长度为1`
      });

      // 延迟
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 找到最长上升子序列的长度和结束位置
  let maxLength = 0;
  let endIndex = -1;

  for (let i = 0; i < n; i++) {
    if (dp[i] > maxLength) {
      maxLength = dp[i];
      endIndex = i;
    }
  }

  // 重建最长上升子序列
  const sequence: number[] = [];
  while (endIndex !== -1) {
    sequence.unshift(nums[endIndex]);
    endIndex = prev[endIndex];
  }

  return {
    result: maxLength,
    dp,
    sequence
  };
}
