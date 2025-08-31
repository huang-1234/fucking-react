/**
 * 双端队列的核心算法实现
 */

/**
 * 双端队列基本实现
 * 支持在两端进行添加和删除操作
 */
export class Deque<T> {
  private items: T[] = [];

  /**
   * 从队列前端添加元素
   * @param item 添加的元素
   * @returns
   * @use Array.prototype.unshift
   * @description 从队列前端添加元素
   * @example
   * const deque = new Deque();
   * deque.addFront(1);
   * deque.addFront(2);
   * deque.addFront(3);
   */
  addFront(item: T): void {
    this.items.unshift(item);
  }
  /**
   * 从队列前端移除元素
   * @returns 移除的元素
   * @use Array.prototype.shift
   * @description 从队列前端移除元素
   * @example
   */
  removeFront(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items.shift();
  }

  /**
   * 从队列后端添加元素
   * @param item 添加的元素
   * @returns
   * @use Array.prototype.push
   * @description 从队列后端添加元素
   * @example
   * const deque = new Deque();
   * deque.addBack(1);
   * deque.addBack(2);
   * deque.addBack(3);
   */
  addBack(item: T): void {
    this.items.push(item);
  }

  /**
   * 从队列后端移除元素
   * @returns 移除的元素
   * @use Array.prototype.pop
   * @description 从队列后端移除元素
   * @example
   */
  removeBack(): T | undefined {
    return this.items.pop();
  }

  /**
   * 查看队列前端元素
   * @returns 队列前端元素
   * @use Array.prototype.shift
   * @description 查看队列前端元素
   * @example
   */
  peekFront(): T | undefined {
    return this.items[0];
  }

  /**
   * 查看队列后端元素
   * @returns 队列后端元素
   * @use Array.prototype.pop
   * @description 查看队列后端元素
   * @example
   */
  peekBack(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * 获取队列大小
   * @returns 队列大小
   * @use Array.prototype.length
   * @description 获取队列大小
   * @example
   */
  size(): number {
    return this.items.length;
  }

  /**
   * 检查队列是否为空
   * @returns 队列是否为空
   * @use Array.prototype.length
   * @description 检查队列是否为空
   * @example
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * 清空队列
   * @returns
   * @use Array.prototype.length
   * @description 清空队列
   * @example
   */
  clear(): void {
    this.items = [];
  }

  /**
   * 获取所有元素
   * @returns 所有元素
   * @use Array.prototype.slice
   * @description 获取所有元素
   * @example
   */
  getItems(): T[] {
    return [...this.items];
  }
}

/**
 * 单调递减队列 - 用于维护窗口最大值
 * 队头始终是当前窗口的最大值
 */
export class MonotonicDecreasingDeque<T> {
  private deque: Deque<{ value: T; index: number }> = new Deque();

  /**
   * 添加元素，保持单调递减特性
   * @param value 添加的元素
   * @param index 添加的元素的索引
   * @param compareFn 比较函数
   * @returns
   * @use Array.prototype.push
   * @description 添加元素，保持单调递减特性
   * @example
   */
  push(value: T, index: number, compareFn: (a: T, b: T) => number = (a, b) => Number(a) - Number(b)): void {
    // 从队尾移除所有小于等于当前值的元素
    while (!this.deque.isEmpty() && compareFn(this.deque.peekBack()!.value, value) <= 0) {
      this.deque.removeBack();
    }
    this.deque.addBack({ value, index });
  }

  /**
   * 移除过期元素（超出窗口范围）
   * @param windowStart 窗口起始索引
   * @returns
   * @use Array.prototype.shift
   * @description 移除过期元素（超出窗口范围）
   * @example
   */
  removeOutdated(windowStart: number): void {
    while (!this.deque.isEmpty() && this.deque.peekFront()!.index < windowStart) {
      this.deque.removeFront();
    }
  }

  /**
   * 获取当前最大值
   * @returns 当前最大值
   * @use Array.prototype.peekFront
   * @description 获取当前最大值
   * @example
   */
  getMax(): T | undefined {
    return this.deque.isEmpty() ? undefined : this.deque.peekFront()!.value;
  }

  /**
   * 获取所有元素（用于可视化）
   * @returns 所有元素
   * @use Array.prototype.slice
   * @description 获取所有元素（用于可视化）
   * @example
   */
  getItems(): { value: T; index: number }[] {
    return this.deque.getItems();
  }

  /**
   * 检查是否为空
   * @returns 是否为空
   * @use Array.prototype.length
   * @description 检查是否为空
   * @example
   */
  isEmpty(): boolean {
    return this.deque.isEmpty();
  }
}

/**
 * 单调递增队列 - 用于维护窗口最小值
 * 队头始终是当前窗口的最小值
 */
export class MonotonicIncreasingDeque<T> {
  private deque: Deque<{ value: T; index: number }> = new Deque();

  /**
   * 添加元素，保持单调递增特性
   * @param value 添加的元素
   * @param index 添加的元素的索引
   * @param compareFn 比较函数
   * @returns
   * @use Array.prototype.push
   * @description 添加元素，保持单调递增特性
   * @example
   */
  push(value: T, index: number, compareFn: (a: T, b: T) => number = (a, b) => Number(a) - Number(b)): void {
    // 从队尾移除所有大于等于当前值的元素
    while (!this.deque.isEmpty() && compareFn(this.deque.peekBack()!.value, value) >= 0) {
      this.deque.removeBack();
    }
    this.deque.addBack({ value, index });
  }

    /**
   * 移除过期元素（超出窗口范围）
   * @param windowStart 窗口起始索引
   * @returns
   * @use Array.prototype.shift
   * @description 移除过期元素（超出窗口范围）
   * @example
   */
  removeOutdated(windowStart: number): void {
    while (!this.deque.isEmpty() && this.deque.peekFront()!.index < windowStart) {
      this.deque.removeFront();
    }
  }

  /**
   * 获取当前最小值
   * @returns 当前最小值
   * @use Array.prototype.peekFront
   * @description 获取当前最小值
   * @example
   */
  getMin(): T | undefined {
    return this.deque.isEmpty() ? undefined : this.deque.peekFront()!.value;
  }

  /**
   * 获取所有元素（用于可视化）
   * @returns 所有元素
   * @use Array.prototype.slice
   * @description 获取所有元素（用于可视化）
   * @example
   */
  getItems(): { value: T; index: number }[] {
    return this.deque.getItems();
  }

  /**
   * 检查是否为空
   * @returns 是否为空
   * @use Array.prototype.length
   * @description 检查是否为空
   * @example
   */
  isEmpty(): boolean {
    return this.deque.isEmpty();
  }
}

/**
 * 滑动窗口最大值算法
 * 时间复杂度: O(n)，每个元素最多入队出队各一次
 * 空间复杂度: O(k)，队列大小不超过窗口大小k
 * @param nums 数组
 * @param k 窗口大小
 * @returns 滑动窗口最大值
 * @use Array.prototype.push
 * @description 滑动窗口最大值算法
 * @example
 * const nums = [1, 3, -1, -3, 5, 3, 6, 7];
 * const k = 3;
 * const result = slidingWindowMaximum(nums, k);
 * console.log(result); // [3, 3, 5, 5, 6, 7]
 */
export function slidingWindowMaximum(nums: number[], k: number): number[] {
  if (nums.length === 0 || k === 0) return [];
  if (k === 1) return nums;

  const result: number[] = [];
  const deque = new MonotonicDecreasingDeque<number>();

  // 处理第一个窗口
  for (let i = 0; i < k; i++) {
    deque.push(nums[i], i);
  }
  result.push(deque.getMax()!);

  // 处理剩余窗口
  for (let i = k; i < nums.length; i++) {
    // 移除窗口左侧超出范围的元素
    deque.removeOutdated(i - k + 1);
    // 添加新元素
    deque.push(nums[i], i);
    // 记录当前窗口最大值
    result.push(deque.getMax()!);
  }

  return result;
}

/**
 * 滑动窗口最小值算法
 * 时间复杂度: O(n)
 * 空间复杂度: O(k)
 * @param nums 数组
 * @param k 窗口大小
 * @returns 滑动窗口最小值
 * @use Array.prototype.push
 * @description 滑动窗口最小值算法
 * @example
 * const nums = [1, 3, -1, -3, 5, 3, 6, 7];
 * const k = 3;
 * const result = slidingWindowMinimum(nums, k);
 * console.log(result); // [1, -1, -3, -3, 3, 3]
 */
export function slidingWindowMinimum(nums: number[], k: number): number[] {
  if (nums.length === 0 || k === 0) return [];
  if (k === 1) return nums;

  const result: number[] = [];
  const deque = new MonotonicIncreasingDeque<number>();

  // 处理第一个窗口
  for (let i = 0; i < k; i++) {
    deque.push(nums[i], i);
  }
  result.push(deque.getMin()!);

  // 处理剩余窗口
  for (let i = k; i < nums.length; i++) {
    // 移除窗口左侧超出范围的元素
    deque.removeOutdated(i - k + 1);
    // 添加新元素
    deque.push(nums[i], i);
    // 记录当前窗口最小值
    result.push(deque.getMin()!);
  }

  return result;
}

/**
 * 绝对差不超过限制的最长子数组
 * LeetCode 1438
 * @param nums 数组
 * @param limit 限制
 * @returns 最长子数组长度
 * @use Array.prototype.push
 * @description 绝对差不超过限制的最长子数组
 * @example
 * const nums = [8, 2, 4, 7];
 * const limit = 4;
 * const result = longestSubarray(nums, limit);
 * console.log(result); // 2
 */
export function longestSubarray(nums: number[], limit: number): number {
  const maxDeque = new MonotonicDecreasingDeque<number>();
  const minDeque = new MonotonicIncreasingDeque<number>();

  let left = 0;
  let right = 0;
  let maxLength = 0;

  while (right < nums.length) {
    // 添加右端点元素
    maxDeque.push(nums[right], right);
    minDeque.push(nums[right], right);

    // 检查当前窗口是否满足条件
    while (maxDeque.getMax()! - minDeque.getMin()! > limit) {
      // 移动左端点，缩小窗口
      left++;
      // 移除超出窗口范围的元素
      maxDeque.removeOutdated(left);
      minDeque.removeOutdated(left);
    }

    // 更新最大长度
    maxLength = Math.max(maxLength, right - left + 1);
    right++;
  }

  return maxLength;
}

/**
 * 使用单调队列优化的动态规划
 * 例如：最大子序和，长度不超过k的子数组最大和
 * @param nums 数组
 * @param k 窗口大小
 * @returns 最大子数组和
 * @use Array.prototype.push
 * @description 使用单调队列优化的动态规划
 * @example
 * const nums = [1, 2, 3, 4, 5];
 * const k = 3;
 * const result = maxSubarraySumWithLengthConstraint(nums, k);
 * console.log(result); // 9
 */
export function maxSubarraySumWithLengthConstraint(nums: number[], k: number): number {
  if (nums.length === 0) return 0;

  // 计算前缀和
  const prefixSum: number[] = [0];
  for (let i = 0; i < nums.length; i++) {
    prefixSum.push(prefixSum[i] + nums[i]);
  }

  let maxSum = -Infinity;
  const deque = new MonotonicIncreasingDeque<number>();

  // 初始时将前缀和0入队
  deque.push(prefixSum[0], 0);

  for (let i = 1; i <= nums.length; i++) {
    // 计算以当前位置结尾的子数组的最大和
    // 当前前缀和减去队列中的最小前缀和
    maxSum = Math.max(maxSum, prefixSum[i] - deque.getMin()!);

    // 移除超出窗口范围的元素
    deque.removeOutdated(i - k);

    // 添加当前前缀和
    deque.push(prefixSum[i], i);
  }

  return maxSum;
}

/**
 * 环形子数组的最大和
 * LeetCode 918
 * @param nums 数组
 * @returns 环形子数组的最大和
 * @use Array.prototype.reduce
 * @description 环形子数组的最大和
 * @example
 * const nums = [1, -2, 3, -2];
 * const result = maxSubarraySumCircular(nums);
 * console.log(result); // 3
 */
export function maxSubarraySumCircular(nums: number[]): number {
  if (nums.length === 0) return 0;

  // 计算数组总和
  const total = nums.reduce((sum, num) => sum + num, 0);

  // 计算最大子数组和（不考虑环形）
  let maxSum = nums[0];
  let currentMax = nums[0];

  // 计算最小子数组和（用于计算环形情况）
  let minSum = nums[0];
  let currentMin = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSum = Math.max(maxSum, currentMax);

    currentMin = Math.min(nums[i], currentMin + nums[i]);
    minSum = Math.min(minSum, currentMin);
  }

  // 如果最大和是负数，说明所有元素都是负数，返回最大元素
  if (maxSum < 0) return maxSum;

  // 环形最大和 = max(普通最大和, 总和 - 最小子数组和)
  return Math.max(maxSum, total - minSum);
}