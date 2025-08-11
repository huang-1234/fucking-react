import React, { useState, useEffect } from 'react';
import { Typography, Divider, Card, Space, Button, Alert, Switch, Tabs, Badge, List } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';
import { reactCompilerAdvantages } from '../common';
import { unoptimizedCode, optimizedCode, manualOptimizationCode } from '../hooks/compiler';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

/**
 * React 19 React Compiler 示例组件
 * 演示React 19引入的React Compiler功能
 */
const ReactCompilerDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [enableCompiler, setEnableCompiler] = useState(true);
  const [renderCount, setRenderCount] = useState({ parent: 0, child: 0 });

  // 模拟组件重渲染
  useEffect(() => {
    setRenderCount(prev => ({
      ...prev,
      parent: prev.parent + 1
    }));
  }, [count]);

  // 模拟子组件重渲染
  const handleChildRender = () => {
    setRenderCount(prev => ({
      ...prev,
      child: prev.child + 1
    }));
  };

  // 重置计数器
  const resetCounters = () => {
    setCount(0);
    setRenderCount({ parent: 0, child: 0 });
  };


  return (
    <div className="react-compiler-demo">
      <Typography>
        <Title level={2}>React 19: React Compiler</Title>
        <Badge.Ribbon text="实验性功能" color="purple">
          <Alert
            message="React Compiler是React 19的重要新特性"
            description="React Compiler是一个编译时优化工具，它可以自动分析你的React组件并应用优化，减少不必要的重渲染，而无需手动添加memo或其他优化代码。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        </Badge.Ribbon>

        <Divider orientation="left">React Compiler演示</Divider>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="重渲染优化演示">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text>启用React Compiler优化:</Text>
                <Switch
                  checked={enableCompiler}
                  onChange={setEnableCompiler}
                />
              </Space>

              <div style={{
                border: '1px solid #f0f0f0',
                padding: 16,
                marginTop: 16,
                background: '#fafafa'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>父组件</Text>
                  <Badge
                    count={renderCount.parent}
                    style={{ backgroundColor: '#1890ff', marginLeft: 8 }}
                    title="渲染次数"
                  />
                </div>

                <Space>
                  <Text>计数: {count}</Text>
                  <Button onClick={() => setCount(count + 1)}>
                    增加
                  </Button>
                </Space>

                <div style={{
                  border: '1px solid #d9d9d9',
                  padding: 16,
                  marginTop: 16,
                  background: enableCompiler ? '#f6ffed' : '#fff1f0',
                  position: 'relative'
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>子组件</Text>
                    <Badge
                      count={enableCompiler ? 1 : renderCount.child}
                      style={{
                        backgroundColor: enableCompiler ? '#52c41a' : '#f5222d',
                        marginLeft: 8
                      }}
                      title="渲染次数"
                    />
                  </div>

                  <Text>这个子组件不依赖父组件的状态</Text>

                  <Button
                    size="small"
                    onClick={handleChildRender}
                    style={{ marginLeft: 8 }}
                  >
                    触发子组件渲染
                  </Button>

                  {enableCompiler && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: '#52c41a',
                      color: '#fff',
                      padding: '2px 8px',
                      fontSize: 12,
                      borderBottomLeftRadius: 4
                    }}>
                      已优化
                    </div>
                  )}
                </div>

                <Button
                  onClick={resetCounters}
                  style={{ marginTop: 16 }}
                >
                  重置计数器
                </Button>
              </div>
            </Space>
          </Card>

          <Divider orientation="left">代码对比</Divider>

          <Tabs defaultActiveKey="1">
            <TabPane tab="未优化代码" key="1">
              <Card title="传统React代码">
                <CodeBlock code={unoptimizedCode} width="100%" />

                <Alert
                  message="性能问题"
                  description="在传统React中，当父组件重新渲染时，所有子组件默认也会重新渲染，即使它们不依赖于变化的状态。"
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </Card>
            </TabPane>

            <TabPane tab="React Compiler优化" key="2">
              <Card title="React Compiler自动优化">
                <CodeBlock code={optimizedCode} width="100%" />

                <Alert
                  message="自动优化"
                  description="React Compiler会在构建时分析组件，并自动应用优化，避免不必要的重渲染。开发者不需要手动添加优化代码。"
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </Card>
            </TabPane>

            <TabPane tab="手动优化对比" key="3">
              <Card title="传统手动优化方式">
                <CodeBlock code={manualOptimizationCode} width="100%" />

                <Alert
                  message="手动优化的缺点"
                  description="传统的手动优化需要开发者显式添加memo、useMemo等，增加了代码复杂度，且容易遗漏或过度优化。"
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Space>

        <Paragraph style={{ fontSize: 16, fontWeight: 500 }}>
          React Compiler带来以下优势：
        </Paragraph>
        {reactCompilerAdvantages?.map(ad => {
          return (
            <Paragraph key={ad.title}>
              <Text strong>{ad.title}</Text> - {ad.description}
            </Paragraph>
          )
        })}

        <Paragraph>
          React Compiler代表了React团队对未来React应用性能优化的新方向，通过将优化从手动转向自动，
          让开发者可以专注于业务逻辑，而不是性能优化细节。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default ReactCompilerDemo;