
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

const nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]
const result = findLongSub(nums)

console.log('result', result)