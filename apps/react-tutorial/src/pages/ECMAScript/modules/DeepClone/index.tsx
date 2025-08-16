import React, { useState } from 'react';
import { Row, Col, Button, Card, Typography, Divider, Space, Alert } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import CodePreview from '../../../../components/CodePreview';

const { Title, Paragraph, Text } = Typography;

// 浅拷贝实现代码
const shallowCloneCode = `// 浅拷贝实现
function shallowClone(source) {
  if (source === null || typeof source !== 'object') return source;
  const target = Array.isArray(source) ? [] : {};
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}`;

// 深拷贝实现代码
const deepCloneCode = `// 深拷贝实现
function deepClone(source, map = new WeakMap()) {
  if (source === null || typeof source !== 'object') return source;
  if (map.has(source)) return map.get(source);

  const target = Array.isArray(source) ? [] : {};
  map.set(source, target);

  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key], map);
    }
  }
  return target;
}`;

// 测试代码
const testCode = `// 测试对象
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, { e: 4 }]
};

// 循环引用
obj.circle = obj;

const shallow = shallowClone(obj);
const deep = deepClone(obj);

console.log('浅拷贝测试:', shallow.b === obj.b); // true
console.log('深拷贝测试:', deep.b === obj.b);     // false
console.log('循环引用测试:', deep.circle === deep); // true`;

// 完整的可运行代码
const fullCode = `${shallowCloneCode}

${deepCloneCode}

${testCode}

// 运行测试
function runTest() {
  const obj = {
    a: 1,
    b: { c: 2 },
    d: [3, { e: 4 }]
  };

  // 循环引用
  obj.circle = obj;

  const shallow = shallowClone(obj);
  const deep = deepClone(obj);

  const results = {
    shallowTest: shallow.b === obj.b,
    deepTest: deep.b === obj.b,
    circleTest: deep.circle === deep,
    shallowObj: shallow,
    deepObj: deep
  };

  return results;
}`;

const DeepCloneModule: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);

  const runTest = () => {
    try {
      // 执行代码并获取结果
      const shallowClone = new Function(`
        ${shallowCloneCode}
        return shallowClone;
      `)();

      const deepClone = new Function(`
        ${deepCloneCode}
        return deepClone;
      `)();

      const obj = {
        a: 1,
        b: { c: 2 },
        d: [3, { e: 4 }],
        circle: undefined as any
      };

      // 循环引用
      obj.circle = obj;

      const shallow = shallowClone(obj);
      const deep = deepClone(obj);

      setTestResults({
        shallowTest: shallow.b === obj.b,
        deepTest: deep.b === obj.b,
        circleTest: deep.circle === deep,
        shallowObj: JSON.stringify(shallow, (key, value) => {
          if (key === 'circle') return '[循环引用]';
          return value;
        }, 2),
        deepObj: JSON.stringify(deep, (key, value) => {
          if (key === 'circle') return '[循环引用]';
          return value;
        }, 2)
      });
    } catch (error) {
      console.error('测试执行错误:', error);
      setTestResults({ error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  return (
    <div>
      <Title level={3}>深浅拷贝实现及测试</Title>
      <Paragraph>
        在JavaScript中，对象是引用类型。当我们复制一个对象时，实际上是复制了指向该对象的引用，而不是对象本身。
        这就是为什么我们需要深浅拷贝来创建对象的副本。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="概念解析">
            <Paragraph>
              <Text strong>浅拷贝：</Text>只复制对象的第一层属性，如果属性是引用类型，则复制引用而不是创建新的对象。
            </Paragraph>
            <Paragraph>
              <Text strong>深拷贝：</Text>递归复制对象的所有层级，创建一个完全独立的对象副本。
            </Paragraph>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="浅拷贝实现">
            <CodeBlock code={shallowCloneCode} language="javascript" />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="深拷贝实现">
            <CodeBlock code={deepCloneCode} language="javascript" />
            <Paragraph style={{ marginTop: 16 }}>
              <Text type="secondary">注意：此实现使用WeakMap处理循环引用问题。</Text>
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="测试用例">
            <CodePreview lang="javascript">
              {testCode}
            </CodePreview>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" onClick={runTest}>运行测试</Button>

              {testResults && !testResults.error && (
                <>
                  <Alert
                    message="测试结果"
                    description={
                      <>
                        <p>浅拷贝测试 (shallow.b === obj.b): <Text strong>{testResults.shallowTest ? '相同 ✓' : '不同 ✗'}</Text></p>
                        <p>深拷贝测试 (deep.b === obj.b): <Text strong>{testResults.deepTest ? '相同 ✗' : '不同 ✓'}</Text></p>
                        <p>循环引用测试 (deep.circle === deep): <Text strong>{testResults.circleTest ? '正确处理 ✓' : '处理失败 ✗'}</Text></p>
                      </>
                    }
                    type="success"
                    showIcon
                  />

                  <Divider>对象内容</Divider>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Card size="small" title="浅拷贝对象">
                        <pre>{testResults.shallowObj}</pre>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" title="深拷贝对象">
                        <pre>{testResults.deepObj}</pre>
                      </Card>
                    </Col>
                  </Row>
                </>
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

export default DeepCloneModule;
