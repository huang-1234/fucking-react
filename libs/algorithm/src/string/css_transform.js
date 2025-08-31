

/**
css 中经常有类似 background-image 这种通过 - 连接的字符，
通过 javascript 设置样式的时候需要将这种样式转换成 backgroundImage 驼峰格式，
请完成此转换功能
1. 以 - 为分隔符，将第二个起的非空单词首字母转为大写
2. -webkit-border-image 转换后的结果为 webkitBorderImage
'font-size' --> 'fontSize'
**/

/**
 *
 * @param {string} cssProperty
 */
function cssStyle2DomStyle(cssProperty) {
  const lowerCaseStr = cssProperty.toLowerCase()?.split('-')
  const cssPropVarFilter = lowerCaseStr.map(s => s?.trim()).filter(s => s)
  // console.log('cssPropVar', cssPropVarFilter)
  if (cssPropVarFilter[0] === '') {
    cssPropVarFilter.splice(0, 1)
  }
  if (cssPropVarFilter.length === 1) {
    return cssPropVarFilter[0];
  }
  let finalProperty = cssPropVarFilter[0], finalProperties = [cssPropVarFilter[0]]
  for (let i = 1;i < cssPropVarFilter.length;i++) {
    const safeStr = cssPropVarFilter[i]?.trim();
    if (safeStr?.length) {
      finalProperties.push(safeStr)
      finalProperty += safeStr?.charAt(0).toUpperCase() + safeStr.slice(1)
    }
  }
  console.log('finalProperties', finalProperties, finalProperty)
  return finalProperty
}
/**
 * 测试用例与输出
输入字符串	参数	输出结果	说明
"hello-world"		"helloWorld"	基础中划线转换
"hello_world"		"helloWorld"	基础下划线转换
"hello world"		"helloWorld"	基础空格转换
"hello--world"		"helloWorld"	连续分隔符处理
"HELLO-WORLD"		"helloWorld"	自动小写化处理
"hello-world"	pascalCase: true	"HelloWorld"	转换为大驼峰帕斯卡命名
"-hello-world"		"HelloWorld"	开头分隔符处理（隐含大驼峰）
""		""	空字符串处理
"hello-2-world"		"hello2World"	正确处理数字
 */
const cssStrings = [
  '-webkit-border-image',
  'webkit-border-image-  b---',
  'FONT-SIZE',
  'font-size',
  'HELLO-WORLD',
  'hello-2-world',
  // error case
  'hello--dfdf0--=======-world'
]
cssStrings.forEach(str => {
  // cssStyle2DomStyle(str)
})
/**
 * @example 没法处理下面两种case
 * 1. 'webkit-border-image-  b---'： 预期：webkitBorderImageB 实际： webkitBorderImageB-
 * @param {*} str
 * @returns
 */
function toCamelCase(str) {
  // 预编译正则表达式：匹配一个或多个连续的 -、_、: 或空白字符，并捕获其后紧跟的第一个字符
  const separatorRegex = /[\-_:\s]+(.)/g;

  // 使用 replace 方法进行替换
  // 第二个参数中使用回调函数，将捕获到的第一个字符转换为大写
  return str.replace(separatorRegex, (match, capturedChar) => {
    return capturedChar.toUpperCase();
  });
}

cssStrings.forEach(str => {
  console.log(toCamelCase(str))
})

