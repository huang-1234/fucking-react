import React, { useState } from 'react';
import { Typography, Divider, Card, Space, Button, Alert, Switch } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';
import { errorBoundaryCode } from '../hooks/react-text';

const { Title, Paragraph, Text } = Typography;

// 模拟可能会抛出错误的组件
const BuggyCounter: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  const [count, setCount] = useState(0);

  if (shouldThrow && count > 3) {
    throw new Error('计数器崩溃了！');
  }

  return (
    <div>
      <p>计数: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        增加
      </Button>
    </div>
  );
};

// 模拟React 16的错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // 更新状态，下次渲染时显示降级UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以将错误日志上报给服务器
    console.log('错误信息:', error);
    console.log('错误组件栈:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // 自定义降级UI
      return this.props.fallback || (
        <Alert
          message="组件出错了"
          description={this.state.error?.message || '发生了未知错误'}
          type="error"
          showIcon
        />
      );
    }

    return this.props.children;
  }
}

/**
 * React 16 Error Boundaries 示例组件
 * 演示React 16引入的错误边界功能
 */
const ErrorBoundariesDemo: React.FC = () => {
  const [enableErrorBoundary, setEnableErrorBoundary] = useState(true);

  // 使用从react-text.ts导入的代码字符串

  return (
    <div className="error-boundaries-demo">
      <Typography>
        <Title level={2}>React 16: Error Boundaries</Title>
        <Paragraph>
          错误边界(Error Boundaries)是React 16引入的一个重要特性，它允许捕获子组件树中的JavaScript错误，
          记录错误并显示备用UI，而不是让整个组件树崩溃。
        </Paragraph>

        <Alert
          message="注意"
          description="错误边界只能捕获组件渲染、生命周期方法和整个组件树以下的构造函数中的错误。它不能捕获事件处理器、异步代码、服务端渲染错误或自身抛出的错误。"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider orientation="left">错误边界示例</Divider>

        <Card title="实时演示">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space>
              <Text>启用错误边界:</Text>
              <Switch
                checked={enableErrorBoundary}
                onChange={setEnableErrorBoundary}
              />
            </Space>

            <Alert
              message="使用说明"
              description="点击'增加'按钮直到计数超过3，组件将会抛出错误。如果启用了错误边界，将显示错误提示而不是崩溃。"
              type="info"
              showIcon
            />

            <Card title="测试组件" size="small">
              {enableErrorBoundary ? (
                <ErrorBoundary>
                  <BuggyCounter shouldThrow={true} />
                </ErrorBoundary>
              ) : (
                <BuggyCounter shouldThrow={true} />
              )}
            </Card>

            <Divider />

            <CodeBlock code={errorBoundaryCode} width="100%" />
          </Space>
        </Card>

        <Divider orientation="left">错误边界的工作原理</Divider>
        <Paragraph>
          错误边界通过以下两个生命周期方法工作：
        </Paragraph>
        <ul>
          <li>
            <Text code>static getDerivedStateFromError(error)</Text> -
            用于渲染备用UI
          </li>
          <li>
            <Text code>componentDidCatch(error, errorInfo)</Text> -
            用于记录错误信息
          </li>
        </ul>

        <Paragraph>
          错误边界的引入极大地提高了React应用的健壮性，让应用可以更优雅地处理运行时错误，
          而不是在用户面前完全崩溃。
        </Paragraph>

        <Divider orientation="left">使用场景</Divider>
        <Paragraph>
          错误边界适合放置在以下位置：
        </Paragraph>
        <ul>
          <li>顶层路由组件 - 捕获整个应用的错误</li>
          <li>重要的UI区域 - 防止局部UI崩溃影响整体</li>
          <li>第三方组件包装 - 隔离可能不稳定的第三方组件</li>
        </ul>
      </Typography>
    </div>
  );
};

export default ErrorBoundariesDemo;