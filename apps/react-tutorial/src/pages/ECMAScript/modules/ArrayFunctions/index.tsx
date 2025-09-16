import React, { useState } from 'react';
import { Row, Col, Button, Card, Typography, Space, Alert, Input } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';
import CodePreview from '@/components/CodePreview';
import { mapCode, filterCode, reduceCode, testCode, fullCode } from './common';
const { Title, Paragraph, Text } = Typography;


const ArrayFunctionsModule: React.FC = () => {
  const [testInput, setTestInput] = useState('[1, 2, 3, 4, 5]');
  const [mapCallback, setMapCallback] = useState('x => x * 2');
  const [filterCallback, setFilterCallback] = useState('x => x > 2');
  const [reduceCallback, setReduceCallback] = useState('(acc, cur) => acc + cur');
  const [reduceInitial, setReduceInitial] = useState('0');
  const [testResults, setTestResults] = useState<any>(null);

  const runTest = () => {
    try {
      // 创建一个沙箱环境来执行代码
      const sandbox = new Function(`
        ${mapCode}
        ${filterCode}
        ${reduceCode}

        try {
          const arr = ${testInput};
          const mapFn = ${mapCallback};
          const filterFn = ${filterCallback};
          const reduceFn = ${reduceCallback};
          const reduceInitial = ${reduceInitial === '' ? 'undefined' : reduceInitial};

          const mapResult = arr.myMap(mapFn);
          const filterResult = arr.myFilter(filterFn);
          const reduceResult = arr.myReduce(reduceFn, reduceInitial);

          return {
            mapResult: mapResult,
            filterResult: filterResult,
            reduceResult: reduceResult
          };
        } catch (error) {
          return { error: error.message };
        }
      `)();

      setTestResults(sandbox);
    } catch (error) {
      console.error('测试执行错误:', error);
      setTestResults({ error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  return (
    <div>
      <Title level={3}>数组高阶函数实现</Title>
      <Paragraph>
        数组高阶函数是JavaScript中处理数组的强大工具，它们接受函数作为参数，使代码更加简洁和函数式。
        这里我们手动实现三个最常用的数组高阶函数：map、filter和reduce。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24} lg={8}>
          <Card title="map 实现">
            <CodeBlock code={mapCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              <Text>map方法创建一个新数组，其结果是该数组中的每个元素调用提供的函数后的返回值。</Text>
            </Paragraph>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card title="filter 实现">
            <CodeBlock code={filterCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              <Text>filter方法创建一个新数组，其包含通过所提供函数实现的测试的所有元素。</Text>
            </Paragraph>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card title="reduce 实现">
            <CodeBlock code={reduceCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              <Text>reduce方法对数组中的每个元素执行一个提供的reducer函数，将其结果汇总为单个返回值。</Text>
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="测试用例">
            <CodePreview lang="javascript">
              {testCode}
            </CodePreview>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="交互测试">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>输入数组：</Text>
                <Input
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder="例如: [1, 2, 3, 4]"
                />
              </div>

              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>map 回调函数：</Text>
                  <Input
                    value={mapCallback}
                    onChange={e => setMapCallback(e.target.value)}
                    placeholder="例如: x => x * 2"
                  />
                </Col>

                <Col span={8}>
                  <Text strong>filter 回调函数：</Text>
                  <Input
                    value={filterCallback}
                    onChange={e => setFilterCallback(e.target.value)}
                    placeholder="例如: x => x > 2"
                  />
                </Col>

                <Col span={8}>
                  <div>
                    <Text strong>reduce 回调函数：</Text>
                    <Input
                      value={reduceCallback}
                      onChange={e => setReduceCallback(e.target.value)}
                      placeholder="例如: (acc, cur) => acc + cur"
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>初始值：</Text>
                    <Input
                      value={reduceInitial}
                      onChange={e => setReduceInitial(e.target.value)}
                      placeholder="可选，例如: 0"
                    />
                  </div>
                </Col>
              </Row>

              <Button type="primary" onClick={runTest} style={{ marginTop: 16 }}>
                运行测试
              </Button>

              {testResults && !testResults.error && (
                <Alert
                  message="测试结果"
                  description={
                    <>
                      <p>map 结果: <Text code>{JSON.stringify(testResults.mapResult)}</Text></p>
                      <p>filter 结果: <Text code>{JSON.stringify(testResults.filterResult)}</Text></p>
                      <p>reduce 结果: <Text code>{JSON.stringify(testResults.reduceResult)}</Text></p>
                    </>
                  }
                  type="success"
                  showIcon
                />
              )}

              {testResults && testResults.error && (
                <Alert
                  message="测试执行错误"
                  description={testResults.error}
                  type="error"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="完整可编辑代码">
            <CodeBlock
              code={fullCode}
              language="javascript"
              readOnly={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ArrayFunctionsModule;
