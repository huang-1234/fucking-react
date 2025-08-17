/**
 * 重复字符串压缩
 */
function repeatCompress(str) {
  const result = [];
  let count = 1;
  for (let i = 0;i < str.length;i++) {
    if (str[i] === str[i + 1]) {
      count++;
    } else {
      result.push(str[i]);
      count = 1;
    }
  }
  return result.join('');
}

/**
 * 重复字符串解压
 */
function repeatDecompress(str) {
  const result = [];
  for (let i = 0;i < str.length;i++) {
    if (str[i] === str[i + 1]) {
      result.push(str[i]);
    }
  }
  return result.join('');
}

// test
const str = 'aaabbbcccaaa';
// const compressed = repeatCompress(str);
// console.log(compressed);
// const decompressed = repeatDecompress(compressed);
// console.log(decompressed);


function test() {
  const str = 'aaabbbcccaaa';
  const compressed = repeatCompress(str);
  console.log(compressed);
  const decompressed = repeatDecompress(compressed);
  console.log(decompressed);
}

/**
 * @desc 对于字符串中连续的m个字符，可以表示为m[字符]，例如3[B]可以表示为BBB
 * 对于嵌套的重复字符串，可以表示为m[n[字符]]，例如HG[3|B[2|CA]]可以表示为HGBCACABCACABCACA
 * @example HG[3|B[2|CA]] -> HGBCACABCACABCACA
 * @param {string} str
 */

/**
 * @desc 对于字符串中连续的m个字符，可以表示为m[字符]，例如3[B]可以表示为BBB
 * 对于嵌套的重复字符串，可以表示为m[n[字符]]，例如HG[3|B[2|CA]]可以表示为HGBCACABCACABCACA
 * @example HG[3|B[2|CA]] -> HGBCACABCACABCACA
 * @param {string} str
 */
function repeatDecompress(str) {
  const stack = [];
  let current = "";

  for (let i = 0;i < str.length;i++) {
    const c = str[i];
    if (c === '[') {
      stack.push(current);
      stack.push('[');
      current = "";
    } else if (c === '|') {
      stack.push(current);
      stack.push('|');
      current = "";
    } else if (c === ']') {
      stack.push(current);
      const parts = [];
      let top = stack.pop();
      while (top !== '[') {
        parts.unshift(top);
        top = stack.pop();
      }
      const combined = parts.join('');
      const [numStr, ...strParts] = combined.split('|');
      const num = parseInt(numStr, 10);
      current = strParts.join('').repeat(num);
    } else {
      current += c;
    }
  }

  let result = current;
  while (stack.length) {
    result = stack.pop() + result;
  }
  return result;
}
function repeatDecompressWithRegex(str) {
  const regex = /(\d+)\[([^\]]+)\]/g;
  return str.replace(regex, (match, p1, p2) => {
    return p2.repeat(p1);
  });
}

// 测试用例
(function test() {
  switch (1) {
    case 1:

      console.log(repeatDecompress("HG[3|B[2|CA]]")); // "HGBCACABCACABCACA"
      console.log(repeatDecompress("a[2|b]"));        // "abb"
      console.log(repeatDecompress("3[2|A]"));         // "AAAAAA"
      console.log(repeatDecompress("abc"));            // "abc"
      console.log(repeatDecompress("[2|XY]Z"));        // "XYXYZ"
      break;
    case 2:
      console.log(repeatDecompressWithRegex("HG[3|B[2|CA]]")); // "HGBCACABCACABCACA"
      console.log(repeatDecompressWithRegex("a[2|b]"));        // "abb"
      console.log(repeatDecompressWithRegex("3[2|A]"));         // "AAAAAA"
      console.log(repeatDecompressWithRegex("abc"));            // "abc"
      console.log(repeatDecompressWithRegex("[2|XY]Z"));        // "XYXYZ"
      break;
    default:
      break;
  }
})(2)