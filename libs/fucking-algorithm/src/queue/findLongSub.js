
/**
 * 给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。
 *
 * @param {number[]} nums 未排序的整数数组
 * @returns 最长连续序列的长度
 */
function findLongSubWithQueue(nums) {
  const numsLocal = nums.sort((a, b) => a - b);
  console.log('numsLocal', numsLocal)
  const len = nums.length;
  let queue = [numsLocal[0]], res = 0;
  for (let i = 2;i < len;i++) {
    const current = numsLocal[i];
    console.log(queue[queue.length - 1], current)

    /**
     * 对于从外面更新和从内侧更新，需要考虑清楚，这两种有哪些区别、为何对结果影响这么大
     */
    if (queue[queue.length - 1] + 1 === current) {
      queue.push(current)
    } else {
      // 如果当前元素不连续，则计算当前队列长度，在判断里面更新结果
      res = res > queue.length ? res : queue.length
      queue = [numsLocal[i]]
    }
    // 如果当前元素不连续，则计算当前队列长度，在判断外面更新结果
    res = res > queue.length ? res : queue.length
  }
  return res;
}

/**
 * @desc 核心算法过程：
 * 1. 使用set去重
 * 2. 遍历set，如果当前元素-1存在，则跳过
 * 3. 如果当前元素-1不存在，则以当前元素为起点，向后遍历，直到不连续为止
 * 4. 记录当前连续序列的长度，更新结果
 *
 * 使用set实现，时间复杂度为O(n)，空间复杂度为O(n)
 * @param {number[]} nums 未排序的整数数组
 * @returns 最长连续序列的长度
 */
function findLongSubWithSet(nums) {
  const set = new Set(nums);
  const len = nums.length;
  let res = 0;
  for (let i = 0; i < len; i++) {
    const current = nums[i];
    console.log('current', current)
    // 如果当前元素-1存在，则跳过；我们只做加1的遍历
    if (set.has(current - 1)) {
      console.log('current：跳过', current)
      continue;
    }

    console.log('current：开始遍历', current)
    // 如果当前元素-1不存在，则以当前元素为起点，向后遍历，直到不连续为止
    /**
     * 这里使用while循环，而不是for循环，是因为while循环可以跳过一些不必要的遍历
     * 比如：[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]
     * 当遍历到7时，7-1=6，6在set中存在，所以跳过7，直接遍历8
     * 当遍历到8时，8-1=7，7在set中不存在，所以以8为起点，向后遍历，直到不连续为止
     */
    let currentNum = current;
    let currentLength = 1;
    // 向后遍历，直到不连续为止
    while (set.has(currentNum + 1)) {

      currentNum++;
      currentLength++;
    }
    res = Math.max(res, currentLength);
  }
  return res;
}


const nums = [0, 3, 7, 2, 5, 8, 44, 6, 0, 1]
const result = findLongSubWithSet(nums)

console.log('result', result)
