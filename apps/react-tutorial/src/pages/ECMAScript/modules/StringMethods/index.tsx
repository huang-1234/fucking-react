import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Input, Select, Space, Table, Divider, Alert } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import CodePreview from '../../../../components/CodePreview';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

// 字符串方法表格列
const columns = [
  {
    title: '方法',
    dataIndex: 'method',
    key: 'method',
    render: (text: string) => <Text strong>{text}</Text>
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '示例',
    dataIndex: 'example',
    key: 'example',
    render: (text: string) => <Text code>{text}</Text>
  },
  {
    title: '结果',
    dataIndex: 'result',
    key: 'result',
    render: (text: string) => <Text code>{text}</Text>
  }
];

const StringMethodsModule: React.FC = () => {
  const [inputText, setInputText] = useState('Hello, World!');
  const [selectedMethod, setSelectedMethod] = useState('toUpperCase');
  const [methodParam, setMethodParam] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 执行字符串方法
  const executeMethod = () => {
    try {
      let methodResult;

      switch (selectedMethod) {
        case 'length':
          methodResult = inputText.length;
          break;
        case 'charAt':
          methodResult = inputText.charAt(parseInt(methodParam) || 0);
          break;
        case 'charCodeAt':
          methodResult = inputText.charCodeAt(parseInt(methodParam) || 0);
          break;
        case 'indexOf':
          methodResult = inputText.indexOf(methodParam);
          break;
        case 'lastIndexOf':
          methodResult = inputText.lastIndexOf(methodParam);
          break;
        case 'includes':
          methodResult = inputText.includes(methodParam);
          break;
        case 'startsWith':
          methodResult = inputText.startsWith(methodParam);
          break;
        case 'endsWith':
          methodResult = inputText.endsWith(methodParam);
          break;
        case 'slice':
          const [start, end] = methodParam.split(',').map(p => parseInt(p.trim()));
          methodResult = inputText.slice(start, end);
          break;
        case 'substring':
          const [subStart, subEnd] = methodParam.split(',').map(p => parseInt(p.trim()));
          methodResult = inputText.substring(subStart, subEnd);
          break;
        case 'toUpperCase':
          methodResult = inputText.toUpperCase();
          break;
        case 'toLowerCase':
          methodResult = inputText.toLowerCase();
          break;
        case 'replace':
          const [searchValue, replaceValue] = methodParam.split(',').map(p => p.trim());
          methodResult = inputText.replace(searchValue, replaceValue);
          break;
        case 'replaceAll':
          const [searchAllValue, replaceAllValue] = methodParam.split(',').map(p => p.trim());
          methodResult = inputText.replaceAll(searchAllValue, replaceAllValue);
          break;
        case 'split':
          methodResult = JSON.stringify(inputText.split(methodParam));
          break;
        case 'trim':
          methodResult = inputText.trim();
          break;
        case 'padStart':
          const [padStartLength, padStartChar] = methodParam.split(',').map(p => p.trim());
          methodResult = inputText.padStart(parseInt(padStartLength), padStartChar);
          break;
        case 'padEnd':
          const [padEndLength, padEndChar] = methodParam.split(',').map(p => p.trim());
          methodResult = inputText.padEnd(parseInt(padEndLength), padEndChar);
          break;
        case 'repeat':
          methodResult = inputText.repeat(parseInt(methodParam) || 1);
          break;
        default:
          methodResult = '未知方法';
      }

      setResult(String(methodResult));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setResult(null);
    }
  };

  // 获取方法参数提示
  const getMethodParamHint = () => {
    switch (selectedMethod) {
      case 'charAt':
      case 'charCodeAt':
        return '输入索引值 (例如: 0)';
      case 'indexOf':
      case 'lastIndexOf':
      case 'includes':
      case 'startsWith':
      case 'endsWith':
        return '输入要查找的子字符串';
      case 'slice':
      case 'substring':
        return '输入开始和结束索引，用逗号分隔 (例如: 0,3)';
      case 'replace':
      case 'replaceAll':
        return '输入要查找的字符串和替换值，用逗号分隔 (例如: a,b)';
      case 'split':
        return '输入分隔符 (例如: ,)';
      case 'padStart':
      case 'padEnd':
        return '输入长度和填充字符，用逗号分隔 (例如: 10,0)';
      case 'repeat':
        return '输入重复次数 (例如: 3)';
      default:
        return '';
    }
  };

  // 是否需要参数
  const needsParam = !['length', 'toUpperCase', 'toLowerCase', 'trim'].includes(selectedMethod);

  return (
    <div>
      <Title level={3}>JavaScript字符串方法</Title>
      <Paragraph>
        字符串是JavaScript中最常用的数据类型之一，用于表示文本数据。JavaScript提供了丰富的字符串操作方法，
        使得文本处理变得简单高效。本模块将介绍JavaScript字符串的创建、属性、方法以及相关的高级主题。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="字符串基础方法">
            <CodeBlock code={stringMethodsCode} language="javascript" />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="字符串方法交互演示">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>输入字符串：</Text>
                <Input
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="输入要操作的字符串"
                  style={{ marginTop: 8 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <Text strong>选择方法：</Text>
                  <Select
                    value={selectedMethod}
                    onChange={setSelectedMethod}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    <Option value="length">length</Option>
                    <Option value="charAt">charAt</Option>
                    <Option value="charCodeAt">charCodeAt</Option>
                    <Option value="indexOf">indexOf</Option>
                    <Option value="lastIndexOf">lastIndexOf</Option>
                    <Option value="includes">includes</Option>
                    <Option value="startsWith">startsWith</Option>
                    <Option value="endsWith">endsWith</Option>
                    <Option value="slice">slice</Option>
                    <Option value="substring">substring</Option>
                    <Option value="toUpperCase">toUpperCase</Option>
                    <Option value="toLowerCase">toLowerCase</Option>
                    <Option value="replace">replace</Option>
                    <Option value="replaceAll">replaceAll</Option>
                    <Option value="split">split</Option>
                    <Option value="trim">trim</Option>
                    <Option value="padStart">padStart</Option>
                    <Option value="padEnd">padEnd</Option>
                    <Option value="repeat">repeat</Option>
                  </Select>
                </div>

                {needsParam && (
                  <div style={{ flex: 1 }}>
                    <Text strong>参数：</Text>
                    <Input
                      value={methodParam}
                      onChange={e => setMethodParam(e.target.value)}
                      placeholder={getMethodParamHint()}
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  </div>
                )}
              </div>

              <Button type="primary" onClick={executeMethod} style={{ marginTop: 16 }}>
                执行
              </Button>

              {result !== null && (
                <Alert
                  message="执行结果"
                  description={
                    <div>
                      <Text code>{inputText}.{selectedMethod}({methodParam}) = {result}</Text>
                    </div>
                  }
                  type="success"
                  showIcon
                />
              )}

              {error && (
                <Alert
                  message="执行错误"
                  description={error}
                  type="error"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="字符串方法参考表">
            <Table
              columns={columns}
              dataSource={stringMethodsData}
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="正则表达式与字符串">
            <Paragraph>
              正则表达式是处理字符串的强大工具，可用于模式匹配、验证和替换操作。
            </Paragraph>
            <CodeBlock code={regexCode} language="javascript" />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="字符串编码与国际化">
            <Paragraph>
              JavaScript使用UTF-16编码表示字符串，支持Unicode字符集，可以处理各种语言和符号。
              ES6增强了对Unicode的支持，引入了新的API来处理码点和国际化问题。
            </Paragraph>
            <CodeBlock code={encodingCode} language="javascript" />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="字符串性能优化">
            <Paragraph>
              字符串操作在JavaScript中很常见，但某些操作可能会影响性能。了解字符串的不可变性和优化技巧很重要。
            </Paragraph>
            <CodeBlock code={performanceCode} language="javascript" />
            <Divider />
            <Title level={4}>字符串优化建议</Title>
            <ul>
              <li>大量字符串连接时，使用数组join而不是+=操作符</li>
              <li>避免在循环中频繁创建临时字符串</li>
              <li>使用模板字面量（<Text code>{'`${var}`'}</Text>）代替字符串拼接（<Text code>{'+'}</Text>）提高可读性</li>
              <li>正则表达式预编译：将频繁使用的正则表达式对象缓存起来</li>
              <li>字符串比较时，考虑使用===而不是==，以避免类型转换</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StringMethodsModule;
