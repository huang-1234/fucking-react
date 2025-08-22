import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, Typography, Space } from 'antd';
import styles from '../index.module.less';

const { Text, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件，用于捕获子组件中的JavaScript错误
 * 防止整个应用崩溃，并提供友好的错误提示
 */
class ProtoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新状态，下一次渲染将显示错误UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    console.error('Protobuf组件错误:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 自定义的错误回退UI
      if (fallback) {
        return fallback;
      }

      // 默认错误UI
      return (
        <div className={styles.errorContainer}>
          <Alert
            type="error"
            message="组件发生错误"
            description={
              <Space direction="vertical">
                <Paragraph>
                  <Text strong>
                    Protobuf操作过程中发生错误。这可能是由于无效的Proto定义、解析错误或不支持的操作导致的。
                  </Text>
                </Paragraph>

                {error && (
                  <Paragraph>
                    <Text type="danger">{error.toString()}</Text>
                  </Paragraph>
                )}

                {errorInfo && (
                  <details style={{ whiteSpace: 'pre-wrap' }}>
                    <summary>查看组件堆栈</summary>
                    <Text code>{errorInfo.componentStack}</Text>
                  </details>
                )}

                <Button type="primary" onClick={this.handleReset}>
                  重试
                </Button>
              </Space>
            }
            showIcon
          />
        </div>
      );
    }

    return children;
  }
}

export default ProtoErrorBoundary;
