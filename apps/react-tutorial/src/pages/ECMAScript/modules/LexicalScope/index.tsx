import React, { useState } from 'react';
import { Row, Col, Button, Card, Typography, Divider, Steps } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// 词法作用域示例代码
const lexicalScopeCode = `function outer() {
  const a = 10;

  function inner() {
    const b = 20;
    console.log(a + b); // 访问外部作用域变量
  }

  return inner;
}

const innerFn = outer();
innerFn(); // 输出: 30`;

// 闭包示例代码
const closureCode = `function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1`;

// 作用域链示例
const scopeChainCode = `var global = 'global';

function outer() {
  var outerVar = 'outer';

  function middle() {
    var middleVar = 'middle';

    function inner() {
      var innerVar = 'inner';

      console.log(innerVar);   // 'inner' - 当前作用域
      console.log(middleVar);  // 'middle' - 父级作用域
      console.log(outerVar);   // 'outer' - 祖父级作用域
      console.log(global);     // 'global' - 全局作用域
    }

    inner();
  }

  middle();
}

outer();`;

// 块级作用域示例
const blockScopeCode = `function blockScopeDemo() {
  // var 声明的变量没有块级作用域
  if (true) {
    var varVariable = 'var变量';
    let letVariable = 'let变量';
    const constVariable = 'const变量';
  }

  console.log(varVariable);     // 'var变量' - 可访问
  console.log(letVariable);     // ReferenceError: letVariable is not defined
  console.log(constVariable);   // ReferenceError: constVariable is not defined
}

blockScopeDemo();`;

const LexicalScopeModule: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [executionContext, setExecutionContext] = useState<any[]>([]);

  // 模拟执行闭包示例
  const simulateClosureExecution = () => {
    setCurrentStep(0);
    setExecutionContext([
      {
        step: 0,
        description: '全局执行上下文',
        scopeChain: ['全局作用域'],
        variables: {}
      }
    ]);

    // 模拟执行步骤
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;

        switch (next) {
          case 1:
            setExecutionContext(prev => [
              ...prev,
              {
                step: 1,
                description: '执行 createCounter 函数',
                scopeChain: ['createCounter作用域', '全局作用域'],
                variables: { count: 0 }
              }
            ]);
            break;
          case 2:
            setExecutionContext(prev => [
              ...prev,
              {
                step: 2,
                description: 'createCounter 返回对象，形成闭包',
                scopeChain: ['闭包作用域', '全局作用域'],
                variables: { counter: '{ increment, decrement }' }
              }
            ]);
            break;
          case 3:
            setExecutionContext(prev => [
              ...prev,
              {
                step: 3,
                description: '执行 counter.increment()',
                scopeChain: ['increment作用域', '闭包作用域', '全局作用域'],
                variables: { count: 1 }
              }
            ]);
            break;
          case 4:
            setExecutionContext(prev => [
              ...prev,
              {
                step: 4,
                description: '执行 counter.increment()',
                scopeChain: ['increment作用域', '闭包作用域', '全局作用域'],
                variables: { count: 2 }
              }
            ]);
            break;
          case 5:
            setExecutionContext(prev => [
              ...prev,
              {
                step: 5,
                description: '执行 counter.decrement()',
                scopeChain: ['decrement作用域', '闭包作用域', '全局作用域'],
                variables: { count: 1 }
              }
            ]);
            break;
          default:
            clearInterval(timer);
        }

        return next > 5 ? 5 : next;
      });
    }, 1500);
  };

  return (
    <div>
      <Title level={3}>函数词法作用域解析</Title>
      <Paragraph>
        词法作用域是JavaScript中变量查找和访问规则的基础，它决定了变量在嵌套函数中的可见性。
        理解词法作用域对于掌握闭包、变量提升等概念至关重要。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="词法作用域基本概念">
            <Paragraph>
              <Text strong>词法作用域（Lexical Scope）</Text>是指在代码编写阶段就确定的作用域结构。JavaScript引擎在解析代码时，
              会根据函数声明的位置（而非调用位置）来确定其作用域。
            </Paragraph>
            <Paragraph>
              当访问一个变量时，JavaScript引擎会先在当前作用域中查找，如果找不到，则向上级作用域查找，直到全局作用域。
              这个查找链被称为<Text strong>作用域链（Scope Chain）</Text>。
            </Paragraph>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="词法作用域示例">
            <CodeBlock code={lexicalScopeCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              在这个例子中，inner函数可以访问outer函数中定义的变量a，这就是词法作用域的体现。
              即使inner函数在全局作用域中被调用，它仍然可以访问其定义时所处的词法作用域中的变量。
            </Paragraph>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="闭包示例">
            <CodeBlock code={closureCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              闭包是词法作用域的实际应用。在这个例子中，increment和decrement函数形成了闭包，
              它们可以访问createCounter函数中的count变量，即使createCounter函数已经执行完毕。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="作用域链示例">
            <CodeBlock code={scopeChainCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              这个例子展示了嵌套函数中的作用域链。inner函数可以访问其自身作用域、middle作用域、outer作用域以及全局作用域中的变量。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="块级作用域（ES6）">
            <CodeBlock code={blockScopeCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              ES6引入了let和const关键字，它们声明的变量具有块级作用域。这与var声明的变量不同，var声明的变量只有函数作用域。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="闭包执行可视化">
            <Button
              type="primary"
              onClick={simulateClosureExecution}
              style={{ marginBottom: 16 }}
            >
              模拟执行闭包示例
            </Button>

            <Steps current={currentStep} direction="vertical">
              <Step title="全局执行上下文" description="程序开始执行" />
              <Step title="执行 createCounter 函数" description="创建局部变量 count = 0" />
              <Step title="返回对象，形成闭包" description="返回的对象中的方法可以访问 count 变量" />
              <Step title="执行 counter.increment()" description="count 变为 1" />
              <Step title="再次执行 counter.increment()" description="count 变为 2" />
              <Step title="执行 counter.decrement()" description="count 变为 1" />
            </Steps>

            {executionContext.length > 0 && currentStep > 0 && (
              <div style={{ marginTop: 24 }}>
                <Divider>执行上下文</Divider>
                <Card size="small" title={`步骤 ${currentStep}: ${executionContext[currentStep].description}`}>
                  <div>
                    <Text strong>作用域链: </Text>
                    {executionContext[currentStep].scopeChain.join(' → ')}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>变量: </Text>
                    {Object.entries(executionContext[currentStep].variables).map(([key, value]) => (
                      <div key={key} style={{ marginLeft: 16 }}>
                        {key}: {value as string}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LexicalScopeModule;
