/**
 * 给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。



示例 1:

输入: nums = [1,2,3,4,5,6,7], k = 3
输出: [5,6,7,1,2,3,4]
解释:
向右轮转 1 步: [7,1,2,3,4,5,6]
向右轮转 2 步: [6,7,1,2,3,4,5]
向右轮转 3 步: [5,6,7,1,2,3,4]
示例 2:

输入：nums = [-1,-100,3,99], k = 2
输出：[3,99,-1,-100]
解释:
向右轮转 1 步: [99,-1,-100,3]
向右轮转 2 步: [3,99,-1,-100]
提示：

1 <= nums.length <= 105
-231 <= nums[i] <= 231 - 1
0 <= k <= 105
 */

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function (nums, k) {
  const len = nums.length;
  if (len <= 1 || k === 0) {
    return nums;
  }
  while (k--) {
    const temp = nums[len - 1];
    for (let i = len - 1;i > 0;i--) {
      nums[i] = nums[i - 1];
    }
    nums[0] = temp;
  }
  return nums;
};
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotateWtithQueue = function (nums, k) {
  const queue = []
  while (k--) {
    const temp = nums.pop();
    nums.unshift(temp);
  }
};

(function () {
  const nums = [1, 2, 3, 4, 5, 6, 7];
  const k = 3;
  console.log(rotate(nums, k));

  const k2 = 2;
  console.log(rotate(nums2, k2));
})();