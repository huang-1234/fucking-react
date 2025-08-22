/**
 * 给定一个字符串 s ，请你找出其中不含有重复字符的 最长 子串 的长度。
示例 1:

输入: s = "abcabcbb"
输出: 3
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
示例 2:

输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
示例 3:

输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。

提示：
0 <= s.length <= 5 * 104
s 由英文字母、数字、符号和空格组成
 */
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  let left = 0, maxLen = 0;
  const charMap = new Map(); // 存储字符及其最新索引

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (charMap.has(char) && charMap.get(char) >= left) {
      /**
       * @desc 非常重要的一个步骤
       * @desc 如果字符在字符串中出现过，则直接移动左边界到该字符的下一个位置
       */
      left = charMap.get(char) + 1; // 直接移动左边界
    }
    charMap.set(char, right); // 更新字符位置
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
};
