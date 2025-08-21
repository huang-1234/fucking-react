/**
 * @desc 全排列
 * @param {number[]} nums
 * @return {number[][]}
 * @returns
 */
var permute = function (nums) {
  let res = [];
  /**
   * @desc 回溯
   * @param {number[]} nums
   * @param {number[]} track
   */
  function backtrack(nums, track) {
    if (track.length === nums.length) {
      res.push(track.slice());
      return;
    }
    for (let i = 0;i < nums.length;i++) {
      if (track.includes(nums[i])) continue;
      track.push(nums[i]);
      backtrack(nums, track);
      track.pop();
    }
  }
  backtrack(nums, []);
  return res;
};


(function test() {
  console.log(permute([1, 2, 3]));
  // console.log(permute([0, 1]));
  // console.log(permute([1]));
  // console.log(permute([1, 2, 3, 4]));
  // console.log(permute([1, 2, 3, 4, 5]));
}())