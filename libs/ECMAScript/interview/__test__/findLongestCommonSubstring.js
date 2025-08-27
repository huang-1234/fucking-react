/**
 * @description 找出两个字符串的最长公共子串
 * 算法步骤
 * 1. 定义一个二维dp数组
 * 2. 初始化dp数组
 * 3. 遍历str1和str2
 * 4. 如果str1[i] === str2[j]，则dp[i][j] = dp[i-1][j-1] + 1
 * 5. 否则dp[i][j] = 0
 * 6. 返回dp数组中的最大值
 *
 * @param {string} str1
 * @param {string} str2
 * @returns {string}
 */
function findLongestCommonSubstring(str1, str2) {
  if (str1.length === 0 || str2.length === 0) {
    return '';
  }
  // 定义一个二维dp数组
  let minLen = str1.length, maxLen = str2.length;
  let endIndex = 0, maxLength = 0;
  // 让 minLen 在外层循环优化性能
  const dp = new Array(minLen + 1).fill(0);
  for (let i = 0; i <= minLen; i++) {
    dp[i] = new Array(maxLen + 1).fill(0);
  }
  // dp[i][j] 表示 str1.slice(i) 和 str2.slice(j) 的最长公共长度
  for(let i = 1; i <= minLen; i++) {
    // 已经知道 dp[i-1][j-1]， dp[i-1][j]， dp[i][j-1]； 最后求dp[i][j]
    for(let j = 1; j <= maxLen; j++) {
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        // 更新最大长度和结束索引
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i - 1;
        }
      }
    }
  }
  const commonStr = str1.slice(endIndex - maxLength + 1, endIndex + 1)
  return commonStr
}

findLongestCommonSubstring('aaabbbccc', 'abbbcd')