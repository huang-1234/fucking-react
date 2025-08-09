import React, { useState } from 'react';
import { Typography, Divider, Card, Space, Button, Alert } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';
import { react15Code, react16Code } from '../hooks/react-text';

const { Title, Paragraph, Text } = Typography;

/**
 * React 15 Fragments 示例组件
 * 演示React 15中不支持Fragments的情况
 */
const FragmentsDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);

  // 模拟React 15中的错误
  const triggerError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  // 使用从react-text.ts导入的代码字符串

  return (
    <div className="fragments-demo">
      <Typography>
        <Title level={2}>React 15: 无 Fragments 支持</Title>
        <Paragraph>
          在 React 15 中，每个组件必须返回单个根元素，不支持返回多个并列元素。
          这导致了许多不必要的包装 <Text code>div</Text> 元素，增加了DOM层级。
        </Paragraph>

        <Divider orientation="left">React 15 中的写法</Divider>
        <Card>
          <CodeBlock code={react15Code} language="jsx" />
        </Card>

        <Divider orientation="left">React 16+ 中的写法</Divider>
        <Card>
          <CodeBlock code={react16Code} language="jsx" />
        </Card>

        <Divider orientation="left">实时演示</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title="模拟React 15错误">
            <Paragraph>
              点击下面的按钮模拟在React 15中尝试返回多个根元素时会发生的错误：
            </Paragraph>
            <Button type="primary" danger onClick={triggerError}>
              触发React 15错误
            </Button>

            {showError && (
              <Alert
                message="React 15 错误"
                description="Adjacent JSX elements must be wrapped in an enclosing tag"
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Space>

        <Divider orientation="left">为什么需要Fragments?</Divider>
        <Paragraph>
          Fragments解决了以下问题：
        </Paragraph>
        <ul>
          <li>避免添加不必要的DOM节点</li>
          <li>在表格(<Text code>tr</Text>/<Text code>td</Text>)等特殊结构中更有用</li>
          <li>使组件返回值更加灵活</li>
          <li>提高渲染性能</li>
        </ul>

        <Paragraph>
          React 16引入了Fragments，是React组件模型的一个重要改进。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default FragmentsDemo;