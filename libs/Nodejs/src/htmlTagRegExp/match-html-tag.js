/**
 *
 * @param {string} html
 * @returns
 */
function isValidHTML(html) {
  // 实现代码
  if (html.length === 0) {
    return true
  }
  /**
   * 写一个识别html tag的正则表达式
   * 1. <[^>]+> 匹配所有标签
   * 2. g 全局匹配
   * 3.
   */
  const htmlTagRegExp = /<[^>]+>/g;
  const htmlTagArray = html.match(htmlTagRegExp);
  console.log('htmlTagArray', htmlTagArray)
  return htmlTagArray?.length > 0;
}
// 示例
isValidHTML("<div><p>Hello</p></div>"); // true
isValidHTML("<div><span></div></span>"); // false（标签未正确嵌套）
isValidHTML("<p><a href='#'>Link</a></p>"); // true
isValidHTML("<div>"); // false（未闭合标签）
isValidHTML("<img />"); // true

console.log(isValidHTML("<div><p>Hello</p></div>")); // true
console.log(isValidHTML("<div><span></div></span>")); // false
console.log(isValidHTML("<p><a href='#'>Link</a></p>")); // true
console.log(isValidHTML("<div>")); // false
console.log(isValidHTML("<img />")); // true

console.log(isValidHTML("")); // true
console.log(isValidHTML("<")); // false
console.log(isValidHTML(">")); // false
console.log(isValidHTML("/>")); // false
console.log(isValidHTML("/>")); // false
// function isValidHTML(html) {
//   // 实现代码
//   if (html.length === 0) {
//     return true
//   } else if (html.length >= 1) {
//     return html?.[0] === '<'
//   }
//   let len = html.length;
//   const htmlTagRegExp = /<[^>]+>/g;
//   const htmlTagArray = html.match(htmlTagRegExp);
//   console.log(htmlTagArray);
//   return false;
// }
// // 示例
// isValidHTML("<div><p>Hello</p></div>"); // true
// isValidHTML("<div><span></div></span>"); // false（标签未正确嵌套）
// isValidHTML("<p><a href='#'>Link</a></p>"); // true
// isValidHTML("<div>"); // false（未闭合标签）
// isValidHTML("<img />"); // true
