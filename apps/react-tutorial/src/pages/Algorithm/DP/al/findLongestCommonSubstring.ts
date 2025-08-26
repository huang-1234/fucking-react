/**
 * @description 找出两个字符串的最长公共子串
 * 算法步骤
 * 1. 定义一个二维dp数组
 * 2. 初始化dp数组
 * 3. 遍历str1和str2
 * 4. 如果str1[i] === str2[j]，则dp[i][j] = dp[i-1][j-1] + 1
 * 5. 否则dp[i][j] = 0
 * 6. 返回dp数组中的最大值对应的子串
 *
 * @param {string} str1
 * @param {string} str2
 * @returns {string}
 */
export function findLongestCommonSubstring(str1: string, str2: string): string {
  if (str1.length === 0 || str2.length === 0) {
    return '';
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
  return commonSubstring;
}

/**
 * @description 返回两个字符串的最长公共子串以及DP表格
 * @param {string} str1
 * @param {string} str2
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
 * @param {string} str1
 * @param {string} str2
 * @returns {Array} 计算步骤数组
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
  if (str1.length === 0 || str2.length === 0) {
    return { steps: [], result: '', maxLength: 0, endIndex: 0 };
  }

  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  const steps: Array<{
    i: number;
    j: number;
    matched: boolean;
    value: number;
    prev?: { i: number; j: number };
  }> = [];

  let maxLength = 0;
  let endIndex = 0;

  // 初始步骤
  steps.push({
    i: 0,
    j: 0,
    matched: false,
    value: 0
  });

  // 填充dp数组并记录每一步
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matched = str1[i - 1] === str2[j - 1];
      const value = matched ? dp[i - 1][j - 1] + 1 : 0;

      // 记录步骤
      steps.push({
        i,
        j,
        matched,
        value,
        prev: { i: i - 1, j: j - 1 }
      });

      // 更新DP表
      dp[i][j] = value;

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
    steps,
    result: commonSubstring,
    maxLength,
    endIndex
  };
}