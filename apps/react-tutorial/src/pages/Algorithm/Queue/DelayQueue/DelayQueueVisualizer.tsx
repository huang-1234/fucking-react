import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Space, InputNumber, Typography, Alert, Divider, Input, Progress } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDelayQueue } from './hooks';
import QueueVisualizerBase from '../components/QueueVisualizerBase';
import QueueItem, { QueueItemsContainer } from '../components/QueueItem';
import OperationHistory from '../components/OperationHistory';

const { Title, Text, Paragraph } = Typography;

interface DelayQueueVisualizerProps {
  title?: string;
}

const DelayQueueVisualizer: React.FC<DelayQueueVisualizerProps> = ({
  title = '延迟队列可视化'
}) => {
  // 输入值状态
  const [inputValue, setInputValue] = useState<string>('Item-1');
  const [inputDelay, setInputDelay] = useState<number>(5000);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchDelay, setBatchDelay] = useState<number>(3000);
  const [randomizeDelay, setRandomizeDelay] = useState<boolean>(true);
  const [pollInterval, setPollInterval] = useState<number>(1000);
  const [pollCount, setPollCount] = useState<number>(10);
  const [isAutoPolling, setIsAutoPolling] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // 使用延迟队列Hook
  const {
    state,
    add,
    poll,
    take,
    peek,
    clear,
    isEmpty,
    size,
    formatRemainingTime,
    addBatch,
    autoPoll
  } = useDelayQueue<string>([
    { item: 'Initial-1', delayMs: 8000 },
    { item: 'Initial-2', delayMs: 15000 },
    { item: 'Initial-3', delayMs: 3000 }
  ]);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // 处理添加元素
  const handleAdd = () => {
    if (inputValue) {
      add(inputValue, inputDelay);
      setInputValue(`Item-${Math.floor(Math.random() * 1000)}`);
    }
  };

  // 处理批量添加元素
  const handleAddBatch = () => {
    addBatch(batchCount, batchDelay, randomizeDelay);
  };

  // 处理轮询元素
  const handlePoll = () => {
    poll();
  };

  // 处理阻塞获取元素
  const handleTake = async () => {
    await take();
  };

  // 处理自动轮询
  const handleAutoPoll = async () => {
    setIsAutoPolling(true);
    await autoPoll(pollInterval, pollCount);
    setIsAutoPolling(false);
  };

  // 处理查看队首元素
  const handlePeek = () => {
    peek();
  };

  // 处理清空队列
  const handleClear = () => {
    clear();
  };

  // 计算元素的到期进度
  const calculateExpiryProgress = (expiry: number) => {
    const total = expiry - (expiry - 30000); // 假设最大延迟为30秒
    const remaining = Math.max(0, expiry - currentTime);
    const progress = Math.floor(((total - remaining) / total) * 100);
    return Math.min(100, Math.max(0, progress));
  };

  // 计算元素的剩余时间
  const calculateRemainingTime = (expiry: number) => {
    return Math.max(0, expiry - currentTime);
  };

  // 渲染队列元素
  const renderQueueItems = () => {
    if (isEmpty()) {
      return (
        <Alert
          message="队列为空"
          description="请添加元素到队列中"
          type="info"
          showIcon
        />
      );
    }

    // 按到期时间排序
    const sortedItems = [...state.items].sort((a, b) => a.expiry - b.expiry);

    return (
      <QueueItemsContainer>
        {sortedItems.map((item, index) => {
          const isExpired = item.expiry <= currentTime;
          const remainingTime = calculateRemainingTime(item.expiry);
          const progress = calculateExpiryProgress(item.expiry);

          return (
            <QueueItem
              key={`${item.item}-${index}`}
              value={
                <div style={{ textAlign: 'center' }}>
                  <div>{item.item as string}</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>
                    {isExpired ? (
                      <Text type="success">已到期</Text>
                    ) : (
                      <Text type="secondary">
                        剩余: {(remainingTime / 1000).toFixed(1)}s
                      </Text>
                    )}
                  </div>
                  <Progress
                    percent={progress}
                    size="small"
                    showInfo={false}
                    status={isExpired ? 'success' : 'active'}
                    style={{ marginTop: '2px' }}
                  />
                </div>
              }
              positionLabel={index === 0 ? 'Next' : undefined}
              labelColor={isExpired ? 'green' : 'blue'}
              backgroundColor={isExpired ? '#f6ffed' : '#e6f7ff'}
              borderColor={isExpired ? '#52c41a' : '#1890ff'}
              isHighlighted={isExpired}
              style={{ width: 100, height: 80 }}
            />
          );
        })}
      </QueueItemsContainer>
    );
  };

  // 渲染时间线
  const renderTimeline = () => {
    if (isEmpty()) {
      return null;
    }

    const now = currentTime;
    const maxTime = now + 30000; // 30秒后

    return (
      <div style={{ marginTop: 20, padding: '10px 0' }}>
        <div style={{ position: 'relative', height: 60, border: '1px solid #f0f0f0', borderRadius: 4 }}>
          {/* 当前时间指示器 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '0%',
              width: 2,
              backgroundColor: 'red',
              zIndex: 10
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -20,
              left: '0%',
              transform: 'translateX(-50%)',
              color: 'red',
              fontWeight: 'bold'
            }}
          >
            当前
          </div>

          {/* 元素到期时间点 */}
          {state.items.map((item, index) => {
            const position = ((item.expiry - now) / (maxTime - now)) * 100;
            const isVisible = position >= 0 && position <= 100;

            if (!isVisible) return null;

            return (
              <div key={index}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${position}%`,
                    width: 2,
                    backgroundColor: item.expiry <= now ? '#52c41a' : '#1890ff'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -20,
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    color: item.expiry <= now ? '#52c41a' : '#1890ff',
                    fontSize: 12
                  }}
                >
                  {(item.item as string).substring(0, 8)}
                </div>
              </div>
            );
          })}

          {/* 时间刻度 */}
          {[0, 5, 10, 15, 20, 25, 30].map(seconds => {
            const position = (seconds * 1000) / (maxTime - now) * 100;
            return (
              <div key={seconds}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    height: 10,
                    left: `${position}%`,
                    width: 1,
                    backgroundColor: '#d9d9d9'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 15,
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    color: '#999',
                    fontSize: 12
                  }}
                >
                  +{seconds}s
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染操作区域
  const renderOperationsContent = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入元素值"
              style={{ width: '60%' }}
            />
            <InputNumber
              addonBefore="延迟(ms)"
              value={inputDelay}
              onChange={(value) => setInputDelay(value || 5000)}
              min={100}
              max={30000}
              step={1000}
              style={{ width: '40%' }}
            />
          </Space.Compact>
        </Col>

        <Col span={24}>
          <Title level={5}>队列操作</Title>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加元素
            </Button>
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={handlePoll}
              disabled={isEmpty()}
            >
              轮询元素
            </Button>
            <Button
              icon={<ClockCircleOutlined />}
              onClick={handleTake}
            >
              阻塞获取
            </Button>
          </Space>
        </Col>

        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePeek}
              disabled={isEmpty()}
            >
              查看队首
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleClear}
              disabled={isEmpty()}
              danger
            >
              清空
            </Button>
          </Space>
        </Col>

        <Col span={24}>
          <Divider>批量操作</Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="批量添加" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>数量:</Text>
                    <InputNumber
                      value={batchCount}
                      onChange={(value) => setBatchCount(value || 1)}
                      min={1}
                      max={20}
                    />
                  </Space>
                  <Space>
                    <Text>基础延迟(ms):</Text>
                    <InputNumber
                      value={batchDelay}
                      onChange={(value) => setBatchDelay(value || 3000)}
                      min={100}
                      max={20000}
                      step={1000}
                    />
                  </Space>
                  <Space>
                    <Text>随机化延迟:</Text>
                    <input
                      type="checkbox"
                      checked={randomizeDelay}
                      onChange={(e) => setRandomizeDelay(e.target.checked)}
                    />
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddBatch}
                  >
                    批量添加
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="自动轮询" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>间隔(ms):</Text>
                    <InputNumber
                      value={pollInterval}
                      onChange={(value) => setPollInterval(value || 1000)}
                      min={100}
                      max={5000}
                      step={100}
                    />
                  </Space>
                  <Space>
                    <Text>次数:</Text>
                    <InputNumber
                      value={pollCount}
                      onChange={(value) => setPollCount(value || 10)}
                      min={1}
                      max={50}
                    />
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleAutoPoll}
                    loading={isAutoPolling}
                  >
                    自动轮询
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Space>
  );

  // 队列状态信息
  const statusInfo = `队列状态: ${isEmpty() ? '空' : '非空'} | 元素数量: ${size()} | 下一个到期元素: ${formatRemainingTime(state.nextExpiryDelay)}`;

  return (
    <QueueVisualizerBase
      title={title}
      description={
        <div>
          <Text>
            延迟队列是一种特殊的队列，其中的元素只有在其指定的延迟时间到期后才可被消费。
            延迟队列通常基于优先队列实现，按照元素的到期时间排序，提供以下操作：
          </Text>
          <ul>
            <li><Text strong>添加元素（add）</Text>：添加元素到队列中，并指定延迟时间</li>
            <li><Text strong>轮询元素（poll）</Text>：尝试获取已到期的元素，如果没有则返回null</li>
            <li><Text strong>阻塞获取（take）</Text>：获取已到期的元素，如果没有则阻塞等待</li>
            <li><Text strong>查看队首（peek）</Text>：查看下一个将到期的元素但不移除</li>
          </ul>
        </div>
      }
      operationsContent={renderOperationsContent()}
      visualizationContent={
        <>
          {renderQueueItems()}
          <Divider>时间线</Divider>
          {renderTimeline()}
        </>
      }
      statusInfo={statusInfo}
      historyContent={<OperationHistory operations={state.operations} />}
      extraContent={
        <Alert
          message="延迟队列工作原理"
          description={
            <Paragraph>
              延迟队列内部通常使用优先队列（最小堆）实现，按照元素的到期时间排序。
              队列会维护一个定时器，在最早到期的元素到期时触发，然后检查并处理所有已到期的元素。
              延迟队列广泛应用于定时任务调度、缓存过期策略、订单超时处理等场景。
            </Paragraph>
          }
          type="info"
          showIcon
        />
      }
      showExtra={true}
    />
  );
};

// Card组件
function Card({ title, children, style = {}, size = 'default' }: {
  title: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  size?: 'default' | 'small';
}) {
  return (
    <div
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: '2px',
        ...style
      }}
    >
      <div
        style={{
          borderBottom: '1px solid #f0f0f0',
          padding: size === 'small' ? '8px 12px' : '16px 24px',
          fontWeight: 500
        }}
      >
        {title}
      </div>
      <div style={{ padding: size === 'small' ? '12px' : '24px' }}>
        {children}
      </div>
    </div>
  );
}

export default React.memo(DelayQueueVisualizer);
