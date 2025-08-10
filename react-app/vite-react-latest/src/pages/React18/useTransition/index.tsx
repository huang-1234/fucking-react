import React, { useState, useTransition, useDeferredValue, useEffect, useMemo } from 'react';
import { Typography, Divider, Card, Space, Input, List, Switch, Slider, Tag } from 'antd';
import { CodeBlock } from '@/components/CodeBlock';
import { debounce } from 'lodash-es';
import { useTransitionCode, useDeferredValueCode } from '../hooks/react-text';

const { Title, Paragraph, Text } = Typography;

// 生成大量数据用于演示
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is description for item ${i + 1}`
  }));
};

const ITEMS = generateItems(10000);

/**
 * React 18 useTransition 示例组件
 * 演示React 18引入的useTransition Hook
 */
const UseTransitionDemo: React.FC = () => {
  // 常规状态更新
  const [filterText, setFilterText] = useState('');
  const [items, setItems] = useState(ITEMS.slice(0, 100));

  // 使用useTransition的状态更新
  const [transitionFilterText, setTransitionFilterText] = useState('');
  const [isPending, startTransition] = useTransition();

  // 使用useDeferredValue的状态更新
  const [deferredFilterText, setDeferredFilterText] = useState('');
  const deferredValue = useDeferredValue(deferredFilterText);

  // 模拟延迟
  const [delay, setDelay] = useState(0);

  // 切换使用哪种过滤方式
  const [useTransitionFilter, setUseTransitionFilter] = useState(true);

  // 常规过滤
  useEffect(() => {
    const filterItems = () => {
      if (filterText) {
        // 添加人为延迟以模拟重计算
        const start = performance.now();
        while (performance.now() - start < delay) {
          // 空循环以模拟CPU密集型操作
        }

        setItems(
          ITEMS.filter(item =>
            item.name.toLowerCase().includes(filterText.toLowerCase())
          ).slice(0, 100)
        );
      } else {
        setItems(ITEMS.slice(0, 100));
      }
    };

    filterItems();
  }, [filterText, delay]);

  // 使用useTransition的过滤
  useEffect(() => {
    const filterItemsWithTransition = () => {
      startTransition(() => {
        if (transitionFilterText) {
          // 添加人为延迟以模拟重计算
          const start = performance.now();
          while (performance.now() - start < delay) {
            // 空循环以模拟CPU密集型操作
          }

          setItems(
            ITEMS.filter(item =>
              item.name.toLowerCase().includes(transitionFilterText.toLowerCase())
            ).slice(0, 100)
          );
        } else {
          setItems(ITEMS.slice(0, 100));
        }
      });
    };

    filterItemsWithTransition();
  }, [transitionFilterText, delay, startTransition]);

  // 使用useDeferredValue的过滤
  useEffect(() => {
    const filterItemsWithDeferred = () => {
      if (deferredValue) {
        // 添加人为延迟以模拟重计算
        const start = performance.now();
        while (performance.now() - start < delay) {
          // 空循环以模拟CPU密集型操作
        }

        setItems(
          ITEMS.filter(item =>
            item.name.toLowerCase().includes(deferredValue.toLowerCase())
          ).slice(0, 100)
        );
      } else {
        setItems(ITEMS.slice(0, 100));
      }
    };

    filterItemsWithDeferred();
  }, [deferredValue, delay]);

  // 处理输入变化的实际函数
  const handleInputChangeImpl = (value: string) => {
    if (useTransitionFilter) {
      setTransitionFilterText(value);
    } else {
      setFilterText(value);
    }
  };

  // 使用useMemo和debounce创建防抖处理的输入函数
  const debouncedInputChange = useMemo(
    () => debounce(handleInputChangeImpl, 300),
    [useTransitionFilter]
  );

  // 处理延迟输入变化的实际函数
  const handleDeferredInputChangeImpl = (value: string) => {
    setDeferredFilterText(value);
  };

  // 使用useMemo和debounce创建防抖处理的延迟输入函数
  const debouncedDeferredInputChange = useMemo(
    () => debounce(handleDeferredInputChangeImpl, 300),
    []
  );

  // 组件卸载时取消防抖函数的执行
  useEffect(() => {
    return () => {
      debouncedInputChange.cancel();
      debouncedDeferredInputChange.cancel();
    };
  }, [debouncedInputChange, debouncedDeferredInputChange]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedInputChange(value);
  };

  // 处理延迟输入变化
  const handleDeferredInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedDeferredInputChange(e.target.value);
  };

  // 使用从react-text.ts导入的代码字符串

  return (
    <div className="use-transition-demo">
      <Typography>
        <Title level={2}>React 18: useTransition</Title>
        <Paragraph>
          <Text strong>useTransition</Text> 是React 18引入的一个新Hook，它允许你将某些状态更新标记为非紧急，
          从而提高应用的响应性。这是React 18并发渲染特性的重要组成部分。
        </Paragraph>

        <Divider orientation="left">并发特性演示</Divider>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="设置">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>模拟计算延迟:</Text>
                <Slider
                  min={0}
                  max={500}
                  value={delay}
                  onChange={setDelay}
                  tipFormatter={value => `${value}ms`}
                  style={{ width: 300, marginLeft: 16 }}
                />
              </div>

              <div>
                <Text>使用模式:</Text>
                <Switch
                  checkedChildren="useTransition"
                  unCheckedChildren="常规更新"
                  checked={useTransitionFilter}
                  onChange={setUseTransitionFilter}
                  style={{ marginLeft: 16 }}
                />
              </div>
            </Space>
          </Card>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>过滤大数据集 ({useTransitionFilter ? 'useTransition' : '常规更新'})</span>
                  {isPending && useTransitionFilter && (
                    <Tag color="processing" style={{ marginLeft: 8 }}>更新中...</Tag>
                  )}
                </div>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="输入过滤文本..."
                  value={useTransitionFilter ? transitionFilterText : filterText}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />

                <List
                  size="small"
                  bordered
                  dataSource={items}
                  renderItem={item => (
                    <List.Item>
                      <div>
                        <div><Text strong>{item.name}</Text></div>
                        <div><Text type="secondary">{item.description}</Text></div>
                      </div>
                    </List.Item>
                  )}
                  style={{
                    height: 300,
                    overflow: 'auto',
                    opacity: isPending && useTransitionFilter ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                />
              </Space>
            </Card>

            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>使用useDeferredValue</span>
                  {deferredValue !== deferredFilterText && (
                    <Tag color="processing" style={{ marginLeft: 8 }}>更新中...</Tag>
                  )}
                </div>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="输入过滤文本..."
                  value={deferredFilterText}
                  onChange={handleDeferredInputChange}
                  style={{ width: '100%' }}
                />

                <div style={{
                  opacity: deferredValue !== deferredFilterText ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}>
                  <Text type="secondary">
                    当前延迟值: {deferredValue}
                  </Text>
                </div>
              </Space>
            </Card>
          </Space>

          <Divider orientation="left">API用法</Divider>

          <Card title="useTransition">
            <CodeBlock code={useTransitionCode} width="100%" />
          </Card>

          <Card title="useDeferredValue">
            <CodeBlock code={useDeferredValueCode} width="100%" />
          </Card>
        </Space>

        <Divider orientation="left">并发特性的优势</Divider>
        <Paragraph>
          React 18的并发特性带来以下优势：
        </Paragraph>
        <ul>
          <li><Text strong>更好的用户体验</Text> - 保持UI响应，避免输入延迟</li>
          <li><Text strong>性能优化</Text> - 允许浏览器在长任务之间插入更高优先级的工作</li>
          <li><Text strong>更平滑的过渡</Text> - 可以在后台准备新UI而不阻塞当前界面</li>
          <li><Text strong>更精细的控制</Text> - 开发者可以决定哪些更新是紧急的，哪些可以延迟</li>
        </ul>

        <Paragraph>
          useTransition和useDeferredValue是React 18中最重要的并发特性API，它们为构建响应迅速的应用提供了强大工具。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default UseTransitionDemo;