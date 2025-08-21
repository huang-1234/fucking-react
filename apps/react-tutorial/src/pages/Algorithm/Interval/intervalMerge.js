
/**
 * @desc 合并重叠区间 intervalMerge
 * @param {number[][]} intervals
 * @return {number[][]}
*/
var merge = (intervals) => {
  if (intervals.length <= 1) {
    return intervals
  }
  /**
   * 排序
   */
  intervals.sort((a, b) => a[0] - b[0]);
  let current = intervals[0], result = [], len = intervals.length;
  for (let i = 1;i < len;i++) {
    const next = intervals[i];
    /**
     * @desc
     * 1. 满足条件则将两个区间合并为一个区间，并更新当前区间的结束位置,
     * 2. 否则将当前区间加入结果数组中，并更新当前区间为下一个区间
     */
    if (current[1] >= next[0]) {
      // 获取两个区间的并集
      current = [current[0], Math.max(current[1], next[1])]
    } else {
      // 否则，将当前区间加入结果中，并更新当前区间为下一个区间
      result.push(current);
      // 更新当前区间为下一个区间
      current = next;
    }
  }
  // 遍历结束后，将最后一个区间加入结果中
  result.push(current);
  return result;
}

(function () {
  console.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]]));
  console.log(merge([[1, 4], [4, 5]]));
})()