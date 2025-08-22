/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function (height) {
  let maxRes = 0, n = height.length;
  let left = 0, right = n - 1;
  while (left < right) {
    if (height[left] < height[right]) {
      const minH = height[left];
      maxRes = Math.max(maxRes, minH * (right - left));
      left++
    } else {
      const minH = height[right];
      maxRes = Math.max(maxRes, minH * (right - left));
      right--;
    }
  }
  return maxRes
};


(function () {
  console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));
  console.log(maxArea([1, 1]));
  console.log(maxArea([4, 3, 2, 1, 4]));
})();