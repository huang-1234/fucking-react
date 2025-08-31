
/**
 * @desc 查找数组中所有和为 target 的组合
 * @param {number[]} array
 * @param {number} target
 * @returns
 */
function findTargetSum(array, target) {
  const ans = [], n = array.length;
  const arraySort = array.sort((a, b) => a - b);
  let targetIdx = n;
  for (let i = 0;i < arraySort.length;i++) {
    const ele = arraySort[i];
    if (target <= ele) {
      targetIdx = i;
      break;
    }
  }
  // const memo = new Map()
  function dfs(sum, path = []) {
    if (sum === target) {
      ans.push(path)
      path = [];
      return;
    }
    for (let i = 0;i < targetIdx;i++) {
      const currentEle = arraySort[i];
      if (!path.includes(currentEle)) {
        if (currentEle + sum === target) {
          path.push(currentEle);
          sum += currentEle;
          // console.log('path 2', path, currentEle, sum)
          ans.push(path);
          path = [];
          return;
        } else if (currentEle + sum < target) {
          path.push(currentEle)
          sum += currentEle;
          dfs(sum, path)
        }
      }
      return;
    }
  }
  let sum = 0, path = []
  dfs(sum, path);

  return ans;
}
console.log(findTargetSum([1, 2, 3, 4, 5], 10))
console.log(findTargetSum([4, 3, 1, 2], 6))