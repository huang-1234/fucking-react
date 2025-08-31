// 问题：对url进行拆解https://www.taobao.com?a=1&b=2#c=3 返回[{a:1,b:2},{c:3}]


// 问题：实现一个promise.finally的pollyfill



// 问题：找出一对字符串的相同的最长子串，aaabbbccc,abbbcd => abbbc

function parseUrl(url) {
  const urlObj = new URL(url);
  const queryObj = {};
  const hashObj = {};

  // 解析查询参数部分
  const queryParams = new URLSearchParams(urlObj.search);
  for (const [key, value] of queryParams.entries()) {
    queryObj[key] = value;
  }

  // 解析哈希参数部分（需手动处理）
  const hashPart = urlObj.hash.substring(1); // 去掉开头的 '#'
  if (hashPart.includes('=')) {
    const hashParams = new URLSearchParams(hashPart);
    for (const [key, value] of hashParams.entries()) {
      hashObj[key] = value;
    }
  }

  return [queryObj, hashObj];
}

// 测试
const url = "https://www.taobao.com?a=1&b=2#c=3";
console.log(parseUrl(url)); // 输出: [{a:"1", b:"2"}, {c:"3"}]

// 问题：实现一个promise.finally的pollyfill
if (!Promise.prototype.finallyPolyfill) {
  Promise.prototype.finallyPolyfill = function (cb) {
    const promise = this;
    return promise.then(
      value => Promise.resolve(cb()).then(() => value),
      reason => Promise.resolve(cb()).then(() => { throw reason; })
    );
  };
}
const execPromise = false;
if (execPromise) {
  new Promise((resolve) => resolve(42))
    .finallyPolyfill(() => console.log("Cleanup"))
    .then(v => console.log(v)); // 输出: Cleanup → 42

}

// 问题：找出一对字符串的相同的最长子串，aaabbbccc,abbbcd => abbbc

/**
 * @description 找出两个字符串的最长公共子串
 * @see https://leetcode.cn/problems/longest-common-substring/
 * @param {string} str1
 * @param {string} str2
 * @returns {string}
 */
function findLongestCommonSubstring(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  let maxLen = 0;
  let endIndex = 0;

  for (let i = 1;i <= m;i++) {
    for (let j = 1;j <= n;j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLen) {
          maxLen = dp[i][j];
          endIndex = i - 1;
        }
      }
    }
  }

  return maxLen > 0
    ? str1.substring(endIndex - maxLen + 1, endIndex + 1)
    : "";
}

// 测试
console.log(findLongestCommonSubstring("aaabbbccc", "abbbcd")); // 输出: "abbbc"