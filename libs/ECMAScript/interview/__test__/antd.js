// 问题：对url进行拆解https://www.taobao.com?a=1&b=2#c=3 返回[{a:1,b:2},{c:3}]


// 问题：实现一个promise.finally的pollyfill



// 问题：找出一对字符串的相同的最长子串，aaabbbccc,abbbcd => abbbc

function getKVPair(kvString) {
  return kvString.split('&').reduce((p, n) => {
    const [key, value] = n?.split('=');
    p[key] = value
    return p
  }, {})
}
// 1
function parseUrl(url) {
  const [urlBase, urlParams] = url.split('?')
  // get route params and hash params
  const [routePar, hashPar] = urlParams.split('#')
  const result = [getKVPair(routePar), getKVPair(hashPar)];
  return result;
}


// 2 实现一个promise.finally的pollyfill
if (!Promise.prototype.finally) {
  Promise.prototype.finally = (cb) => {
    let count = 0;
    new Promise((rs, rj) => {
    }).then(res => {
      count++;
      cb()
    }).catch(err => {
      count++;
      cb()
    })
  }
}

// 3 找出一对字符串的相同的最长子串，aaabbbccc,abbbcd => abbbc

function findLongestCommonSubstring(str1, str2) {
  if (str1.length === 0 || str2.length === 0) {
    return '';
  }
  // 定义一个二维dp数组
  let minLen = 0, maxLen = 0;
  if(str1.length < str2.length) {
    minLen = str1.length;
    maxLen = str2.length;
  } else {
    minLen = str2.length;
    maxLen = str1.length;
  }
  let endIndex = 0;
  // 让 minLen 在外层循环优化性能
  const dp = new Array(minLen + 1).fill(0).map(() => Array(maxLen + 1).fill(0))
  // dp[i][j] 表示 str1.slice(i) 和 str2.slice(j) 的最长公共长度
  for(let i = 1; i < minLen; i++) {
    // 已经知道 dp[i-1][j-1]， dp[i-1][j]， dp[i][j-1]； 最后求dp[i][j]
    for(let j = maxLen; j > 0; j++) {
      // 增加一个
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = Math.max(dp[i-1][j-1], dp[i-1][j],  dp[i][j-1]) + 1;
        endIndex = i;
      } else {
        // 继续保持
        dp[i][j] = Math.max(dp[i-1][j-1], dp[i-1][j],  dp[i][j-1]);
      }
    }
  }
  return str1.slice(0, endIndex)
}

findLongestCommonSubstring('aaabbbccc', 'abbbcd')