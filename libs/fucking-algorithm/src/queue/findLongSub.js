
/**
 * 给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。
 *
 * @param {number[]} nums 未排序的整数数组
 * @returns 最长连续序列的长度
 */
function findLongSub(nums) {
  const numsLocal = nums.sort();
  const len = nums.length;
  let queue = [numsLocal[0]], res = 0;
  for (let i = 2;i < len;i++) {
    const current = numsLocal[i];
    console.log(queue[queue.length - 1], current)
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
 * 对于从外面更新和从内侧更新，需要考虑清楚，这两种有哪些区别、为何对结果影响这么大
 */

const nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]
const result = findLongSub(nums)

console.log('result', result)