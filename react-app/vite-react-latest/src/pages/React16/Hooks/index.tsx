import React, { useState, useEffect } from 'react';
import { Typography, Divider, Card, Space, Button, InputNumber, Badge, Tabs, Alert } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';
import { useStateCode, useEffectCode, classComponentCode } from './react-text';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

/**
 * React 16 Hooks 示例组件
 * 演示React 16.8引入的Hooks基础用法
 */
const HooksDemo: React.FC = () => {
  // useState示例
  const [count, setCount] = useState(0);

  // useEffect示例 - 模拟componentDidMount
  useEffect(() => {
    document.title = `React 16 Hooks Demo - Count: ${count}`;

    // 模拟componentWillUnmount
    return () => {
      document.title = 'React多版本API学习平台';
    };
  }, [count]);

  // 使用从react-text.ts导入的代码字符串

  return (
    <div className="hooks-demo">
      <Typography>
        <Title level={2}>React 16: Hooks</Title>
        <Badge.Ribbon text="React 16.8+" color="green">
          <Alert
            message="Hooks是React 16.8引入的新特性"
            description="它允许你在不编写类的情况下使用state和其他React特性。Hooks是完全可选的，100%向后兼容，不包含任何破坏性改动。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        </Badge.Ribbon>

        <Paragraph>
          Hooks解决了React中的许多长期存在的问题，包括组件之间复用状态逻辑困难、复杂组件难以理解、
          以及类组件中的this指向问题。
        </Paragraph>

        <Divider orientation="left">基础Hooks演示</Divider>

        <Tabs defaultActiveKey="1">
          <TabPane tab="useState" key="1">
            <Card title="计数器示例">
              <Space direction="vertical" size="large">
                <div>
                  <Text strong>当前计数: </Text>
                  <Text style={{ fontSize: 24 }}>{count}</Text>
                </div>

                <Space>
                  <Button onClick={() => setCount(count - 1)}>减少</Button>
                  <Button type="primary" onClick={() => setCount(count + 1)}>增加</Button>
                  <Button onClick={() => setCount(0)}>重置</Button>
                </Space>

                <div>
                  <Text>直接设置值: </Text>
                  <InputNumber
                    value={count}
                    onChange={(value) => setCount(Number(value) || 0)}
                  />
                </div>

                <Divider />

                <CodeBlock code={useStateCode} />
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="useEffect" key="2">
            <Card title="副作用示例">
              <Space direction="vertical" size="large">
                <Alert
                  message="页面标题已更新"
                  description={`当前浏览器标签页的标题已被更新为: "React 16 Hooks Demo - Count: ${count}"`}
                  type="success"
                  showIcon
                />

                <div>
                  <Text strong>当前计数: </Text>
                  <Text style={{ fontSize: 24 }}>{count}</Text>
                </div>

                <Button type="primary" onClick={() => setCount(count + 1)}>
                  增加计数并更新标题
                </Button>

                <Divider />

                <CodeBlock code={useEffectCode} />
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="类组件对比" key="3">
            <Card title="类组件等效实现">
              <Space direction="vertical" size="large">
                <Alert
                  message="Hooks vs 类组件"
                  description="下面是使用类组件实现相同功能的代码。注意生命周期方法是如何分散相关逻辑的。"
                  type="info"
                  showIcon
                />

                <CodeBlock code={classComponentCode} />
              </Space>
            </Card>
          </TabPane>
        </Tabs>

        <Divider orientation="left">Hooks的规则</Divider>
        <Paragraph>
          使用Hooks需要遵循两条规则：
        </Paragraph>
        <ul>
          <li><Text strong>只在最顶层调用Hooks</Text> - 不要在循环、条件或嵌套函数中调用Hook</li>
          <li><Text strong>只在React函数组件中调用Hooks</Text> - 不要在普通JavaScript函数中调用</li>
        </ul>

        <Paragraph>
          Hooks的引入是React发展历程中的一个重要里程碑，它极大地改变了React组件的编写方式，
          使函数组件成为了React应用开发的主流选择。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default HooksDemo;