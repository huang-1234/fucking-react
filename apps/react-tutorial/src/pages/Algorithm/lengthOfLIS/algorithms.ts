/**
 * 动态规划方法实现最长递增子序列
 * 时间复杂度：O(n²)
 * 空间复杂度：O(n)
 */
export function lengthOfLIS_DP(nums: number[]): number {
  if (!nums || nums.length === 0) return 0;

  const dp = new Array(nums.length).fill(1);
  let maxRes = 1;

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
        maxRes = Math.max(maxRes, dp[i]);
      }
    }
  }

  return maxRes;
}

/**
 * 二分查找方法实现最长递增子序列
 * 时间复杂度：O(nlogn)
 * 空间复杂度：O(n)
 */
export function lengthOfLIS_Binary(nums: number[]): number {
  if (!nums || nums.length === 0) return 0;

  const tails = [];

  for (const num of nums) {
    let left = 0;
    let right = tails.length - 1;

    // 二分查找，找到第一个大于等于 num 的位置
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // 如果找到的位置是数组末尾，说明 num 比所有元素都大，追加到末尾
    if (left === tails.length) {
      tails.push(num);
    } else {
      // 否则，用 num 替换 tails[left]
      tails[left] = num;
    }
  }

  return tails.length;
}

/**
 * 找到左边界（第一个大于等于目标值的位置）
 */
export function findLeftBound(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  let result = nums.length; // 默认不存在时为数组长度

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2); // 防溢出
    if (nums[mid] >= target) {
      result = mid;      // 记录位置
      right = mid - 1;   // 继续向左收缩
    } else {
      left = mid + 1;    // 向右收缩
    }
  }

  return result; // 返回第一个≥target的索引
}

/**
 * 找到右边界（最后一个小于等于目标值的位置）
 */
export function findRightBound(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  let result = -1; // 默认不存在

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (nums[mid] <= target) {
      result = mid;      // 记录位置
      left = mid + 1;   // 继续向右收缩
    } else {
      right = mid - 1;  // 向左收缩
    }
  }

  return result; // 返回最后一个≤target的索引
}
