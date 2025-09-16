
// 字符串方法代码示例
const stringMethodsCode = `// 字符串创建
const str1 = 'Hello';                // 字面量
const str2 = "World";                // 双引号字面量
const str3 = \`Hello \${str2}\`;      // 模板字面量
const str4 = new String('Hello');    // 构造函数（不推荐）

// 字符串属性
console.log(str1.length);            // 5

// 访问字符
console.log(str1[0]);                // 'H'
console.log(str1.charAt(0));         // 'H'
console.log(str1.charCodeAt(0));     // 72 (ASCII码)
console.log(String.fromCharCode(72)); // 'H'

// 字符串查找
console.log(str1.indexOf('l'));      // 2
console.log(str1.lastIndexOf('l'));  // 3
console.log(str1.includes('ell'));   // true
console.log(str1.startsWith('He'));  // true
console.log(str1.endsWith('lo'));    // true

// 字符串截取
console.log(str1.slice(1, 3));       // 'el'
console.log(str1.substring(1, 3));   // 'el'
console.log(str1.substr(1, 3));      // 'ell' (已废弃)

// 字符串转换
console.log(str1.toUpperCase());     // 'HELLO'
console.log('HELLO'.toLowerCase());  // 'hello'

// 字符串替换
console.log(str1.replace('l', 'x')); // 'Hexlo' (只替换第一个)
console.log(str1.replaceAll('l', 'x')); // 'Hexxo' (替换所有)

// 字符串分割
console.log('a,b,c'.split(','));     // ['a', 'b', 'c']

// 字符串去除空格
console.log('  hello  '.trim());     // 'hello'
console.log('  hello  '.trimStart()); // 'hello  '
console.log('  hello  '.trimEnd());   // '  hello'

// 字符串填充
console.log('5'.padStart(3, '0'));   // '005'
console.log('5'.padEnd(3, '0'));     // '500'

// 字符串重复
console.log('abc'.repeat(3));        // 'abcabcabc'

// 字符串比较
console.log('a' < 'b');              // true
console.log('a'.localeCompare('b')); // -1 (小于)`;

// 正则表达式与字符串
const regexCode = `// 正则表达式与字符串
const text = 'Hello, my email is example@email.com and phone is 123-456-7890';

// 匹配邮箱
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
console.log(text.match(emailRegex));  // ['example@email.com']

// 匹配电话号码
const phoneRegex = /\\d{3}-\\d{3}-\\d{4}/g;
console.log(text.match(phoneRegex));  // ['123-456-7890']

// 替换匹配内容
console.log(text.replace(emailRegex, '[EMAIL]'));
// 'Hello, my email is [EMAIL] and phone is 123-456-7890'

// 测试是否匹配
const isEmail = (str) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/.test(str);
console.log(isEmail('example@email.com'));  // true
console.log(isEmail('not-an-email'));       // false

// 使用exec进行迭代匹配
const regex = /\\w+/g;
let result;
while ((result = regex.exec(text)) !== null) {
  console.log(\`Found \${result[0]} at position \${result.index}\`);
}`;

// 字符串编码与国际化
const encodingCode = `// 字符串编码与国际化
// Unicode码点
console.log('\\u{1F600}');  // 😀
console.log('😀'.codePointAt(0));  // 128512
console.log(String.fromCodePoint(128512));  // 😀

// 字符串归一化
console.log('café'.normalize('NFC') === 'café'.normalize('NFC'));  // true

// 国际化比较
const collator = new Intl.Collator('zh-CN');
console.log(collator.compare('a', 'b'));  // -1

// 国际化日期格式化
const date = new Date();
const dateFormatter = new Intl.DateTimeFormat('zh-CN');
console.log(dateFormatter.format(date));  // 例如：2023/5/17

// 国际化数字格式化
const numberFormatter = new Intl.NumberFormat('zh-CN');
console.log(numberFormatter.format(1234567.89));  // 1,234,567.89`;

// 字符串性能优化
const performanceCode = `// 字符串性能优化
// 1. 使用 += 连接字符串（不推荐大量使用）
let result = '';
console.time('+=');
for (let i = 0; i < 10000; i++) {
  result += 'a';
}
console.timeEnd('+=');

// 2. 使用数组join（推荐大量连接）
console.time('array join');
const arr = [];
for (let i = 0; i < 10000; i++) {
  arr.push('a');
}
const result2 = arr.join('');
console.timeEnd('array join');

// 3. 字符串不可变性
const str = 'hello';
str[0] = 'H';  // 无效，字符串是不可变的
console.log(str);  // 仍然是 'hello'`;

// 字符串方法表格数据
const stringMethodsData = [
  {
    key: '1',
    method: 'length',
    description: '返回字符串的长度',
    example: "'hello'.length",
    result: '5'
  },
  {
    key: '2',
    method: 'charAt(index)',
    description: '返回指定位置的字符',
    example: "'hello'.charAt(1)",
    result: "'e'"
  },
  {
    key: '3',
    method: 'charCodeAt(index)',
    description: '返回指定位置字符的Unicode编码',
    example: "'hello'.charCodeAt(0)",
    result: '104'
  },
  {
    key: '4',
    method: 'indexOf(searchValue, fromIndex)',
    description: '返回字符串中指定值的第一次出现的位置',
    example: "'hello'.indexOf('l')",
    result: '2'
  },
  {
    key: '5',
    method: 'lastIndexOf(searchValue, fromIndex)',
    description: '返回字符串中指定值的最后一次出现的位置',
    example: "'hello'.lastIndexOf('l')",
    result: '3'
  },
  {
    key: '6',
    method: 'includes(searchString, position)',
    description: '判断一个字符串是否包含另一个字符串',
    example: "'hello'.includes('ell')",
    result: 'true'
  },
  {
    key: '7',
    method: 'startsWith(searchString, position)',
    description: '判断字符串是否以指定字符串开头',
    example: "'hello'.startsWith('he')",
    result: 'true'
  },
  {
    key: '8',
    method: 'endsWith(searchString, length)',
    description: '判断字符串是否以指定字符串结尾',
    example: "'hello'.endsWith('lo')",
    result: 'true'
  },
  {
    key: '9',
    method: 'slice(beginIndex, endIndex)',
    description: '提取字符串的一部分并返回新字符串',
    example: "'hello'.slice(1, 3)",
    result: "'el'"
  },
  {
    key: '10',
    method: 'substring(beginIndex, endIndex)',
    description: '提取字符串的一部分并返回新字符串',
    example: "'hello'.substring(1, 3)",
    result: "'el'"
  },
  {
    key: '11',
    method: 'toUpperCase()',
    description: '将字符串转换为大写',
    example: "'hello'.toUpperCase()",
    result: "'HELLO'"
  },
  {
    key: '12',
    method: 'toLowerCase()',
    description: '将字符串转换为小写',
    example: "'HELLO'.toLowerCase()",
    result: "'hello'"
  },
  {
    key: '13',
    method: 'replace(regexp|substr, newSubstr|function)',
    description: '替换字符串中的匹配项',
    example: "'hello'.replace('l', 'x')",
    result: "'hexlo'"
  },
  {
    key: '14',
    method: 'replaceAll(regexp|substr, newSubstr|function)',
    description: '替换字符串中的所有匹配项',
    example: "'hello'.replaceAll('l', 'x')",
    result: "'hexxo'"
  },
  {
    key: '15',
    method: 'split(separator, limit)',
    description: '将字符串分割成数组',
    example: "'a,b,c'.split(',')",
    result: "['a', 'b', 'c']"
  }
];

export {
  stringMethodsCode,
  regexCode,
  encodingCode,
  performanceCode,
  stringMethodsData
}