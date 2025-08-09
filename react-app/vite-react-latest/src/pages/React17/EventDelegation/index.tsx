import React, { useState, useRef, useEffect } from 'react';
import { Typography, Divider, Card, Space, Button, Alert, Switch, Tabs } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';
import { react16EventCode, react17EventCode } from '../hooks/react-text';

const { Title, Paragraph, Text } = Typography;

const { TabPane } = Tabs;

/**
 * React 17 Event Delegation 示例组件
 * 演示React 17中事件委托机制的变化
 */
const EventDelegationDemo: React.FC = () => {
  const [events, setEvents] = useState<string[]>([]);
  const [showVisual, setShowVisual] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 记录事件
  const logEvent = (message: string) => {
    setEvents(prev => [...prev, message]);
  };

  // 清除事件日志
  const clearEvents = () => {
    setEvents([]);
  };

  // 模拟添加document事件监听器
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // 只记录来自我们示例区域的点击
      if (containerRef.current?.contains(e.target as Node)) {
        logEvent('Document事件处理器: 捕获到点击事件');
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // 使用从react-text.ts导入的代码字符串

  return (
    <div className="event-delegation-demo" ref={containerRef}>
      <Typography>
        <Title level={2}>React 17: 事件委托机制变更</Title>
        <Paragraph>
          React 17对事件系统进行了重大改变，将事件处理从document级别移到了React渲染树的根DOM容器。
          这个变化对大多数应用来说是不可见的，但解决了React与其他技术嵌套使用时的问题。
        </Paragraph>

        <Alert
          message="内部变化"
          description="这是React内部实现的变化，不会影响你编写React组件的方式。组件中的事件处理器写法保持不变。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider orientation="left">事件委托机制对比</Divider>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="React 16 vs React 17事件系统">
            <Space>
              <Text>显示可视化对比:</Text>
              <Switch
                checked={showVisual}
                onChange={setShowVisual}
              />
            </Space>

            {showVisual && (
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '48%' }}>
                    <h3>React 16</h3>
                    <div style={{
                      border: '1px dashed #ccc',
                      padding: 20,
                      position: 'relative',
                      height: 300
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: 5,
                        backgroundColor: '#f0f0f0',
                        textAlign: 'center'
                      }}>
                        document
                      </div>
                      <div style={{
                        border: '1px solid #1890ff',
                        padding: 20,
                        marginTop: 30,
                        height: 250
                      }}>
                        <div style={{ textAlign: 'center', marginBottom: 10 }}>
                          React根节点
                        </div>
                        <div style={{
                          border: '1px solid #52c41a',
                          padding: 10,
                          marginTop: 10,
                          height: 180
                        }}>
                          <div style={{ textAlign: 'center', marginBottom: 10 }}>
                            React组件
                          </div>
                          <Button type="primary" onClick={() => logEvent('React 16按钮: 点击事件')}>
                            点击我
                          </Button>
                          <div style={{
                            position: 'absolute',
                            top: 50,
                            right: 30,
                            width: 120,
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
                              事件委托
                            </div>
                            <div style={{
                              border: '2px dashed #1890ff',
                              borderLeft: 'none',
                              borderBottom: 'none',
                              height: 100,
                              width: 100,
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                top: 50,
                                left: -10,
                                transform: 'rotate(-45deg)',
                                color: '#1890ff'
                              }}>
                                ↑
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '48%' }}>
                    <h3>React 17</h3>
                    <div style={{
                      border: '1px dashed #ccc',
                      padding: 20,
                      position: 'relative',
                      height: 300
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: 5,
                        backgroundColor: '#f0f0f0',
                        textAlign: 'center'
                      }}>
                        document
                      </div>
                      <div style={{
                        border: '1px solid #1890ff',
                        padding: 20,
                        marginTop: 30,
                        height: 250,
                        position: 'relative'
                      }}>
                        <div style={{ textAlign: 'center', marginBottom: 10 }}>
                          React根节点
                        </div>
                        <div style={{
                          border: '1px solid #52c41a',
                          padding: 10,
                          marginTop: 10,
                          height: 180
                        }}>
                          <div style={{ textAlign: 'center', marginBottom: 10 }}>
                            React组件
                          </div>
                          <Button type="primary" onClick={() => logEvent('React 17按钮: 点击事件')}>
                            点击我
                          </Button>
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: 70,
                          right: 30,
                          width: 80,
                          textAlign: 'center'
                        }}>
                          <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
                            事件委托
                          </div>
                          <div style={{
                            border: '2px dashed #1890ff',
                            borderLeft: 'none',
                            borderBottom: 'none',
                            height: 40,
                            width: 60,
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: 20,
                              left: -10,
                              transform: 'rotate(-45deg)',
                              color: '#1890ff'
                            }}>
                              ↑
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Divider />

            <Tabs defaultActiveKey="1">
              <TabPane tab="React 16" key="1">
                <CodeBlock code={react16EventCode} />
              </TabPane>
              <TabPane tab="React 17" key="2">
                <CodeBlock code={react17EventCode} />
              </TabPane>
            </Tabs>
          </Card>

          <Card title="事件日志">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Button type="primary" onClick={() => logEvent('组件内按钮: 点击事件')}>
                  触发事件
                </Button>
                <Button onClick={clearEvents}>
                  清除日志
                </Button>
              </Space>

              <div style={{
                border: '1px solid #d9d9d9',
                padding: 10,
                maxHeight: 200,
                overflowY: 'auto',
                marginTop: 10
              }}>
                {events.length === 0 ? (
                  <Text type="secondary">点击按钮查看事件日志...</Text>
                ) : (
                  events.map((event, index) => (
                    <div key={index} style={{ padding: '5px 0' }}>
                      {index + 1}. {event}
                    </div>
                  ))
                )}
              </div>
            </Space>
          </Card>
        </Space>

        <Divider orientation="left">为什么要改变事件委托?</Divider>
        <Paragraph>
          React 17更改事件委托机制的主要原因是：
        </Paragraph>
        <ul>
          <li><Text strong>支持多个React版本嵌套</Text> - 允许React 17嵌套在其他React版本中使用</li>
          <li><Text strong>解决与第三方代码的冲突</Text> - 减少与页面上其他JavaScript代码的干扰</li>
          <li><Text strong>简化React自身代码</Text> - 移除了一些处理特殊情况的复杂逻辑</li>
        </ul>

        <Paragraph>
          这个变化是React 17作为"过渡版本"的重要部分，为未来的React版本铺平了道路。
        </Paragraph>
      </Typography>
    </div>
  );
};



export default EventDelegationDemo;