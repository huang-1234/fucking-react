function parseUrl(url) {
  const urlObj = new URL(url);
  const queryObj = {};
  const hashObj = {};
  const queryParams = new URLSearchParams(urlObj.search);
  for (const [key, value] of queryParams.entries()) {
    queryObj[key] = value;
  }
  const hashPart = urlObj.hash.substring(1);
  const hashParams = new URLSearchParams(hashPart);
  for (const [key, value] of hashParams.entries()) {
    hashObj[key] = value;
  }
  return { queryObj, hashObj };
}

const url = "https://www.taobao.com?a=1&b=2#c=3";
console.log(parseUrl(url)); // 输出: [{a:"1", b:"2"}, {c:"3"}]