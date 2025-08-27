/**
 * @description 找出两个字符串的最长公共子串
 * 算法步骤
 * 1. 定义一个二维dp数组
 * 2. 初始化dp数组
 * 3. 遍历str1和str2
 * 4. 如果str1[i] === str2[j]，则dp[i][j] = dp[i-1][j-1] + 1
 * 5. 否则dp[i][j] = 0
 * 6. 返回dp数组中的最大值对应的子串
 */

/**
 * 步骤回调函数类型定义
 */
export type StepCallback = (params: {
  i: number;
  j: number;
  matched: boolean;
  value: number;
  prev?: { i: number; j: number };
}) => void;

/**
 * 算法结果类型定义
 */
export interface LCSResult {
  result: string;
  maxLength: number;
  endIndex: number;
}

/**
 * @description 最长公共子串的核心算法，支持回调函数收集步骤
 * @param {string} str1 第一个字符串
 * @param {string} str2 第二个字符串
 * @param {StepCallback} onStep 每一步的回调函数
 * @returns {LCSResult} 算法结果
 */
export function findLongestCommonSubstring(
  str1: string,
  str2: string,
  onStep?: StepCallback
): LCSResult {
  if (str1.length === 0 || str2.length === 0) {
    return { result: '', maxLength: 0, endIndex: 0 };
  }

  // 定义一个二维dp数组
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  // 记录最长子串的长度和结束位置
  let maxLength = 0;
  let endIndex = 0;

  // 调用初始化步骤的回调
  if (onStep) {
    onStep({
      i: 0,
      j: 0,
      matched: false,
      value: 0
    });
  }

  // 填充dp数组
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matched = str1[i - 1] === str2[j - 1];
      const value = matched ? dp[i - 1][j - 1] + 1 : 0;

      // 更新DP表
      dp[i][j] = value;

      // 调用步骤回调
      if (onStep) {
        onStep({
          i,
          j,
          matched,
          value,
          prev: { i: i - 1, j: j - 1 }
        });
      }

      // 更新最长子串信息
      if (value > maxLength) {
        maxLength = value;
        endIndex = i - 1;
      }
    }
  }

  // 提取最长公共子串
  const commonSubstring = str1.substring(endIndex - maxLength + 1, endIndex + 1);

  return {
    result: commonSubstring,
    maxLength,
    endIndex
  };
}

/**
 * @description 返回两个字符串的最长公共子串以及DP表格
 * @param {string} str1 第一个字符串
 * @param {string} str2 第二个字符串
 * @returns {Object} 包含结果和DP表格的对象
 */
export function findLongestCommonSubstringWithDP(str1: string, str2: string): {
  result: string;
  dp: number[][];
  maxLength: number;
  endIndex: number;
} {
  if (str1.length === 0 || str2.length === 0) {
    return { result: '', dp: [[0]], maxLength: 0, endIndex: 0 };
  }

  // 定义一个二维dp数组
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  // 记录最长子串的长度和结束位置
  let maxLength = 0;
  let endIndex = 0;

  // 填充dp数组
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;

        // 更新最长子串信息
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i - 1;
        }
      } else {
        dp[i][j] = 0;
      }
    }
  }

  // 提取最长公共子串
  const commonSubstring = str1.substring(endIndex - maxLength + 1, endIndex + 1);

  return {
    result: commonSubstring,
    dp,
    maxLength,
    endIndex
  };
}

/**
 * @description 生成最长公共子串计算的每一步
 * @param {string} str1 第一个字符串
 * @param {string} str2 第二个字符串
 * @returns {Object} 包含步骤和结果的对象
 */
export function generateLCSSteps(str1: string, str2: string): {
  steps: Array<{
    i: number;
    j: number;
    matched: boolean;
    value: number;
    prev?: { i: number; j: number };
  }>;
  result: string;
  maxLength: number;
  endIndex: number;
} {
  const steps: Array<{
    i: number;
    j: number;
    matched: boolean;
    value: number;
    prev?: { i: number; j: number };
  }> = [];

  // 使用回调函数收集步骤
  const result = findLongestCommonSubstring(str1, str2, (step) => {
    steps.push({ ...step });
  });

  return {
    steps,
    ...result
  };
}

/**
 * @description 使用异步方式计算最长公共子串，支持每一步的回调
 * @param {string} str1 第一个字符串
 * @param {string} str2 第二个字符串
 * @param {StepCallback} onStep 每一步的回调函数
 * @param {number} delay 每一步的延迟时间（毫秒）
 * @returns {Promise<LCSResult>} 算法结果的Promise
 */
export async function findLongestCommonSubstringAsync(
  str1: string,
  str2: string,
  onStep?: StepCallback,
  delay: number = 100
): Promise<LCSResult> {
  if (str1.length === 0 || str2.length === 0) {
    return { result: '', maxLength: 0, endIndex: 0 };
  }

  // 定义一个二维dp数组
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  // 记录最长子串的长度和结束位置
  let maxLength = 0;
  let endIndex = 0;

  // 调用初始化步骤的回调
  if (onStep) {
    onStep({
      i: 0,
      j: 0,
      matched: false,
      value: 0
    });

    // 延迟
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 填充dp数组
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matched = str1[i - 1] === str2[j - 1];
      const value = matched ? dp[i - 1][j - 1] + 1 : 0;

      // 更新DP表
      dp[i][j] = value;

      // 调用步骤回调
      if (onStep) {
        onStep({
          i,
          j,
          matched,
          value,
          prev: { i: i - 1, j: j - 1 }
        });

        // 延迟
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // 更新最长子串信息
      if (value > maxLength) {
        maxLength = value;
        endIndex = i - 1;
      }
    }
  }

  // 提取最长公共子串
  const commonSubstring = str1.substring(endIndex - maxLength + 1, endIndex + 1);

  return {
    result: commonSubstring,
    maxLength,
    endIndex
  };
}