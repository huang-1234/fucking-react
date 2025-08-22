/**
 * 给定两个字符串 s 和 p，找到 s 中所有 p 的 异位词 的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

异位词 指由相同字母重排列形成的字符串（包括相同的字符串）。



示例 1:

输入: s = "cbaebabacd", p = "abc"
输出: [0,6]
解释:
索引从0开始计数，
当 s = "cbaebabacd" 中的字符串 "cba" 找到匹配项时，起始索引为 0 。
当 s = "cbaebabacd" 中的字符串 "e" 找到匹配项时，起始索引为 3 。
当 s = "cbaebabacd" 中的字符串 "b" 找到匹配项时，起始索引为 4 。
当 s = "cbaebabacd" 中的字符串 "a" 找到匹配项时，起始索引为 5 。
示例 2:

输入: s = "abab", p = "ab"
输出: [0,1,2]
解释:
起始索引为 0 的子串是 "ab", 它是 "ab" 的异位词。
起始索引为 1 的子串是 "ba", 它是 "ab" 的异位词。
起始索引为 2 的子串是 "ab", 它是 "ab" 的异位词。


提示:

1 <= s.length, p.length <= 3 * 104
s 和 p 仅包含小写字母
 */
/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */
var findAnagrams = function (s, p) {
  const sLen = s.length, pLen = p.length;

  if (sLen < pLen) {
    return [];
  }

  const ans = [];
  const sCount = new Array(26).fill(0);
  const pCount = new Array(26).fill(0);
  for (let i = 0;i < pLen;++i) {
    ++sCount[s[i].charCodeAt() - 'a'.charCodeAt()];
    ++pCount[p[i].charCodeAt() - 'a'.charCodeAt()];
  }

  if (sCount.toString() === pCount.toString()) {
    ans.push(0);
  }

  for (let i = 0;i < sLen - pLen;++i) {
    --sCount[s[i].charCodeAt() - 'a'.charCodeAt()];
    ++sCount[s[i + pLen].charCodeAt() - 'a'.charCodeAt()];

    if (sCount.toString() === pCount.toString()) {
      ans.push(i + 1);
    }
  }

  return ans;
};
