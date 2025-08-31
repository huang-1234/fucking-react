import React, { useState } from 'react';
import { Row, Col, Button, Space, InputNumber, Typography, Alert, Divider, Input, Badge } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useBlockingQueue } from './hooks';
import QueueVisualizerBase from '../components/QueueVisualizerBase';
import QueueItem, { QueueItemsContainer } from '../components/QueueItem';
import OperationHistory from '../components/OperationHistory';

const { Title, Text, Paragraph } = Typography;

interface BlockingQueueVisualizerProps {
  title?: string;
  capacity?: number;
}

const BlockingQueueVisualizer: React.FC<BlockingQueueVisualizerProps> = ({
  title = '阻塞队列可视化',
  capacity = 5
}) => {
  // 输入值状态
  const [inputValue, setInputValue] = useState<string>('Item-1');
  const [inputTimeout, setInputTimeout] = useState<number>(2000);
  const [producerCount, setProducerCount] = useState<number>(5);
  const [producerDelay, setProducerDelay] = useState<number>(1000);
  const [consumerCount, setConsumerCount] = useState<number>(5);
  const [consumerDelay, setConsumerDelay] = useState<number>(1500);
  const [isSimulatingProducer, setIsSimulatingProducer] = useState<boolean>(false);
  const [isSimulatingConsumer, setIsSimulatingConsumer] = useState<boolean>(false);

  // 使用阻塞队列Hook
  const {
    state,
    offer,
    offerWithTimeout,
    put,
    poll,
    pollWithTimeout,
    take,
    peek,
    clear,
    isEmpty,
    isFull,
    size,
    simulateProducer,
    simulateConsumer
  } = useBlockingQueue<string>(capacity);

  // 处理非阻塞入队
  const handleOffer = () => {
    if (inputValue) {
      const success = offer(inputValue);
      if (success) {
        setInputValue(`Item-${Math.floor(Math.random() * 1000)}`);
      }
    }
  };

  // 处理带超时入队
  const handleOfferWithTimeout = async () => {
    if (inputValue) {
      const success = await offerWithTimeout(inputValue, inputTimeout);
      if (success) {
        setInputValue(`Item-${Math.floor(Math.random() * 1000)}`);
      }
    }
  };

  // 处理阻塞入队
  const handlePut = async () => {
    if (inputValue) {
      const success = await put(inputValue, inputTimeout);
      if (success) {
        setInputValue(`Item-${Math.floor(Math.random() * 1000)}`);
      }
    }
  };

  // 处理非阻塞出队
  const handlePoll = () => {
    poll();
  };

  // 处理带超时出队
  const handlePollWithTimeout = async () => {
    await pollWithTimeout(inputTimeout);
  };

  // 处理阻塞出队
  const handleTake = async () => {
    await take(inputTimeout);
  };

  // 处理查看队首元素
  const handlePeek = () => {
    peek();
  };

  // 处理清空队列
  const handleClear = () => {
    clear();
  };

  // 处理模拟生产者
  const handleSimulateProducer = async () => {
    setIsSimulatingProducer(true);
    await simulateProducer(producerCount, producerDelay, inputTimeout);
    setIsSimulatingProducer(false);
  };

  // 处理模拟消费者
  const handleSimulateConsumer = async () => {
    setIsSimulatingConsumer(true);
    await simulateConsumer(consumerCount, consumerDelay, inputTimeout);
    setIsSimulatingConsumer(false);
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

    return (
      <QueueItemsContainer>
        {state.items.map((item, index) => (
          <QueueItem
            key={`${item}-${index}`}
            value={item}
            positionLabel={index === 0 ? 'Front' : (index === state.items.length - 1 ? 'Back' : undefined)}
            labelColor={index === 0 ? 'blue' : 'green'}
            backgroundColor="#e6f7ff"
            borderColor="#1890ff"
          />
        ))}
      </QueueItemsContainer>
    );
  };

  // 渲染等待线程状态
  const renderWaitingThreads = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Badge count={state.waitingProducers} overflowCount={999} style={{ backgroundColor: '#52c41a' }}>
            <Card title="等待的生产者" style={{ width: '100%', textAlign: 'center' }}>
              <Text>{state.waitingProducers} 个线程等待入队</Text>
            </Card>
          </Badge>
        </Col>
        <Col span={12}>
          <Badge count={state.waitingConsumers} overflowCount={999} style={{ backgroundColor: '#1890ff' }}>
            <Card title="等待的消费者" style={{ width: '100%', textAlign: 'center' }}>
              <Text>{state.waitingConsumers} 个线程等待出队</Text>
            </Card>
          </Badge>
        </Col>
      </Row>
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
              addonBefore="超时(ms)"
              value={inputTimeout}
              onChange={(value) => setInputTimeout(value || 2000)}
              min={100}
              max={10000}
              step={100}
              style={{ width: '40%' }}
            />
          </Space.Compact>
        </Col>

        <Col span={24}>
          <Title level={5}>入队操作</Title>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOffer}
              disabled={isFull()}
            >
              非阻塞入队
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOfferWithTimeout}
            >
              超时入队
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handlePut}
            >
              阻塞入队
            </Button>
          </Space>
        </Col>

        <Col span={24}>
          <Title level={5}>出队操作</Title>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={handlePoll}
              disabled={isEmpty()}
            >
              非阻塞出队
            </Button>
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={handlePollWithTimeout}
            >
              超时出队
            </Button>
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={handleTake}
            >
              阻塞出队
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
          <Divider>线程模拟</Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="生产者线程" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>数量:</Text>
                    <InputNumber
                      value={producerCount}
                      onChange={(value) => setProducerCount(value || 1)}
                      min={1}
                      max={20}
                    />
                  </Space>
                  <Space>
                    <Text>延迟(ms):</Text>
                    <InputNumber
                      value={producerDelay}
                      onChange={(value) => setProducerDelay(value || 1000)}
                      min={100}
                      max={5000}
                      step={100}
                    />
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleSimulateProducer}
                    loading={isSimulatingProducer}
                  >
                    模拟生产者
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="消费者线程" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>数量:</Text>
                    <InputNumber
                      value={consumerCount}
                      onChange={(value) => setConsumerCount(value || 1)}
                      min={1}
                      max={20}
                    />
                  </Space>
                  <Space>
                    <Text>延迟(ms):</Text>
                    <InputNumber
                      value={consumerDelay}
                      onChange={(value) => setConsumerDelay(value || 1500)}
                      min={100}
                      max={5000}
                      step={100}
                    />
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleSimulateConsumer}
                    loading={isSimulatingConsumer}
                  >
                    模拟消费者
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
  const statusInfo = `队列状态: ${isEmpty() ? '空' : (isFull() ? '满' : '部分填充')} | 元素数量: ${size()} | 容量: ${state.capacity}`;

  return (
    <QueueVisualizerBase
      title={title}
      description={
        <div>
          <Text>
            阻塞队列是一种特殊的队列，支持线程同步。当队列为空时，消费者线程会被阻塞；当队列已满时，生产者线程会被阻塞。
            阻塞队列通常用于实现生产者-消费者模式，提供以下操作：
          </Text>
          <ul>
            <li><Text strong>阻塞入队（put）</Text>：当队列已满时，线程会被阻塞，直到有空间可用</li>
            <li><Text strong>阻塞出队（take）</Text>：当队列为空时，线程会被阻塞，直到有元素可用</li>
            <li><Text strong>非阻塞入队（offer）</Text>：尝试入队，如果队列已满则立即返回false</li>
            <li><Text strong>非阻塞出队（poll）</Text>：尝试出队，如果队列为空则立即返回null</li>
            <li><Text strong>超时入队/出队</Text>：尝试入队/出队，如果在指定时间内无法完成则放弃</li>
          </ul>
        </div>
      }
      operationsContent={renderOperationsContent()}
      visualizationContent={
        <>
          {renderQueueItems()}
          <Divider>等待线程</Divider>
          {renderWaitingThreads()}
        </>
      }
      statusInfo={statusInfo}
      historyContent={<OperationHistory operations={state.operations} />}
      extraContent={
        <Alert
          message="阻塞队列模拟说明"
          description={
            <Paragraph>
              在浏览器环境中，JavaScript是单线程的，无法真正实现线程阻塞。
              此可视化工具通过异步操作模拟了阻塞行为，并显示等待的生产者和消费者数量。
              在实际多线程环境中，阻塞队列会真正挂起线程，直到条件满足。
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

export default React.memo(BlockingQueueVisualizer);
