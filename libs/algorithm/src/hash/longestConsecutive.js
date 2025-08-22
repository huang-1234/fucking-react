/**
 * @desc 最长连续序列
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  const numsSet = new Set(nums);
  let maxLen = 0;
  for (const num of numsSet) {
    let cur = num, curLen = 1;
    if (!numsSet.has(num - 1)) {
      while (numsSet.has(cur + 1)) {
        cur++;
        curLen++;
      }
    }
    maxLen = maxLen > curLen ? maxLen : curLen;
  }
  return maxLen;
};