import React, { useState } from 'react';
import { Row, Col, Button, Card, Typography, Divider, Space, Alert, Tabs } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';
import CodePreview from '@/components/CodePreview';
import { defaultBindingCode, implicitBindingCode, explicitBindingCode, newBindingCode, arrowFunctionCode, implementationCode, testCode } from './common';
const { Title, Paragraph, Text } = Typography;


const ThisBindingModule: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);

  const runTest = () => {
    try {
      // 创建一个沙箱环境来执行代码
      const sandbox = new Function(`
        ${implementationCode}

        try {
          function greet(greeting, punctuation) {
            return greeting + ', ' + this.name + punctuation;
          }

          const person = { name: 'Alice' };

          // 测试 myCall
          const callResult = greet.myCall(person, 'Hello', '!');

          // 测试 myApply
          const applyResult = greet.myApply(person, ['Hi', '?']);

          // 测试 myBind
          const boundGreet = greet.myBind(person, 'Hey');
          const bindResult = boundGreet('~');

          return {
            callResult,
            applyResult,
            bindResult
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

  const tabItems = [
    {
      key: 'defaultBinding',
      label: '默认绑定',
      children: (
        <Card bordered={false}>
          <CodePreview lang="javascript">
            {defaultBindingCode}
          </CodePreview>
          <Paragraph style={{ marginTop: 16 }}>
            默认绑定是指当函数独立调用时（没有其他绑定规则），this指向全局对象（非严格模式）或undefined（严格模式）。
          </Paragraph>
        </Card>
      )
    },
    {
      key: 'implicitBinding',
      label: '隐式绑定',
      children: (
        <Card bordered={false}>
          <CodePreview lang="javascript">
            {implicitBindingCode}
          </CodePreview>
          <Paragraph style={{ marginTop: 16 }}>
            隐式绑定发生在函数通过对象属性被调用时，this指向调用该函数的对象。但是，当函数被赋值给变量后再调用，隐式绑定会丢失。
          </Paragraph>
        </Card>
      )
    },
    {
      key: 'explicitBinding',
      label: '显式绑定',
      children: (
        <Card bordered={false}>
          <CodePreview lang="javascript">
            {explicitBindingCode}
          </CodePreview>
          <Paragraph style={{ marginTop: 16 }}>
            显式绑定通过call、apply或bind方法明确指定函数调用时的this值。bind方法创建一个新函数，其this值被永久绑定到指定对象。
          </Paragraph>
        </Card>
      )
    },
    {
      key: 'newBinding',
      label: 'new绑定',
      children: (
        <Card bordered={false}>
          <CodePreview lang="javascript">
            {newBindingCode}
          </CodePreview>
          <Paragraph style={{ marginTop: 16 }}>
            使用new关键字调用函数时，会创建一个新对象，并将函数的this指向这个新对象。这是构造函数模式的基础。
          </Paragraph>
        </Card>
      )
    },
    {
      key: 'arrowFunction',
      label: '箭头函数',
      children: (
        <Card bordered={false}>
          <CodePreview lang="javascript">
            {arrowFunctionCode}
          </CodePreview>
          <Paragraph style={{ marginTop: 16 }}>
            箭头函数没有自己的this，它的this继承自外层作用域。这使得箭头函数特别适合用在回调函数中，因为它会保留外层函数的this值。
          </Paragraph>
        </Card>
      )
    }
  ];

  return (
    <div>
      <Title level={3}>this绑定机制</Title>
      <Paragraph>
        JavaScript中的this关键字是函数执行上下文的一部分，它的值取决于函数的调用方式。
        理解this的绑定规则对于正确使用函数和方法至关重要。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="this绑定规则">
            <Tabs items={tabItems} />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="this绑定优先级">
            <Paragraph>
              当多个绑定规则同时适用时，遵循以下优先级（从高到低）：
            </Paragraph>
            <ol>
              <li><Text strong>new绑定</Text>：使用new关键字</li>
              <li><Text strong>显式绑定</Text>：使用call、apply或bind</li>
              <li><Text strong>隐式绑定</Text>：通过对象调用方法</li>
              <li><Text strong>默认绑定</Text>：独立函数调用</li>
            </ol>
            <Paragraph>
              <Text strong>特例</Text>：箭头函数不适用上述规则，它的this值继承自外层作用域，且无法被改变。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="手动实现call/apply/bind">
            <CodePreview lang="javascript">
              {implementationCode}
            </CodePreview>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                <Text strong>实现原理：</Text>
                这三个方法的核心思想是将函数作为目标对象的方法进行调用，从而改变this的指向。
              </Paragraph>

              <CodePreview lang="javascript">
                {testCode}
              </CodePreview>

              <Button type="primary" onClick={runTest}>
                运行测试
              </Button>

              {testResults && !testResults.error && (
                <Alert
                  message="测试结果"
                  description={
                    <>
                      <p>myCall 结果: <Text code>{testResults.callResult}</Text></p>
                      <p>myApply 结果: <Text code>{testResults.applyResult}</Text></p>
                      <p>myBind 结果: <Text code>{testResults.bindResult}</Text></p>
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
      </Row>
    </div>
  );
};

export default ThisBindingModule;
