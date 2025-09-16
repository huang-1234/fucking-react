import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Input, Select, Space, Table, Divider, Alert } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';
import { stringMethodsCode, regexCode, encodingCode, performanceCode, stringMethodsData } from './common';
import CodePreview from '@/components/CodePreview';
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;


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
            <CodePreview lang="javascript">
              {stringMethodsCode}
            </CodePreview>
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
            <CodePreview lang="javascript">
              {regexCode}
            </CodePreview>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="字符串编码与国际化">
            <Paragraph>
              JavaScript使用UTF-16编码表示字符串，支持Unicode字符集，可以处理各种语言和符号。
              ES6增强了对Unicode的支持，引入了新的API来处理码点和国际化问题。
            </Paragraph>
            <CodePreview lang="javascript">
              {encodingCode}
            </CodePreview>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="字符串性能优化">
            <Paragraph>
              字符串操作在JavaScript中很常见，但某些操作可能会影响性能。了解字符串的不可变性和优化技巧很重要。
            </Paragraph>
            <CodePreview lang="javascript">
              {performanceCode}
            </CodePreview>
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

export default React.memo(StringMethodsModule);
