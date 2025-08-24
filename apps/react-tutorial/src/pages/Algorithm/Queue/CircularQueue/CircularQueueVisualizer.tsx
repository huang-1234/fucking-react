import React, { useState } from 'react';
import { Row, Col, Button, Space, InputNumber, Typography, Alert, Divider, Input, Radio } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useCircularQueue, CircularQueueType } from './hooks';
import QueueVisualizerBase from '../components/QueueVisualizerBase';
import QueueItem, { QueueItemsContainer } from '../components/QueueItem';
import OperationHistory from '../components/OperationHistory';

const { Title, Text, Paragraph } = Typography;
const { Group: RadioGroup } = Radio;

interface CircularQueueVisualizerProps {
  title?: string;
  capacity?: number;
  type?: CircularQueueType;
}

const CircularQueueVisualizer: React.FC<CircularQueueVisualizerProps> = ({
  title = '循环队列可视化',
  capacity = 8,
  type = CircularQueueType.STANDARD
}) => {
  // 输入值状态
  const [inputValue, setInputValue] = useState<string>('Item-1');
  const [batchCount, setBatchCount] = useState<number>(3);
  const [produceCount, setProduceCount] = useState<number>(10);
  const [consumeCount, setConsumeCount] = useState<number>(8);
  const [produceDelay, setProduceDelay] = useState<number>(500);
  const [consumeDelay, setConsumeDelay] = useState<number>(800);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [queueType, setQueueType] = useState<CircularQueueType>(type);

  // 使用循环队列Hook
  const {
    state,
    enqueue,
    dequeue,
    front,
    rear,
    clear,
    isEmpty,
    isFull,
    size,
    enqueueBatch,
    dequeueBatch,
    simulateRingBuffer
  } = useCircularQueue<string>(queueType, capacity);

  // 处理入队
  const handleEnqueue = () => {
    if (inputValue) {
      const success = enqueue(inputValue);
      if (success) {
        setInputValue(`Item-${Math.floor(Math.random() * 1000)}`);
      }
    }
  };

  // 处理出队
  const handleDequeue = () => {
    dequeue();
  };

  // 处理查看队首元素
  const handleFront = () => {
    front();
  };

  // 处理查看队尾元素
  const handleRear = () => {
    rear();
  };

  // 处理清空队列
  const handleClear = () => {
    clear();
  };

  // 处理批量入队
  const handleEnqueueBatch = () => {
    enqueueBatch(batchCount);
  };

  // 处理批量出队
  const handleDequeueBatch = () => {
    dequeueBatch(batchCount);
  };

  // 处理模拟环形缓冲区
  const handleSimulateRingBuffer = async () => {
    setIsSimulating(true);
    await simulateRingBuffer(produceCount, consumeCount, produceDelay, consumeDelay);
    setIsSimulating(false);
  };

  // 处理队列类型变更
  const handleQueueTypeChange = (e: any) => {
    setQueueType(e.target.value);
  };

  // 渲染循环队列
  const renderCircularQueue = () => {
    // 创建一个固定大小的数组，表示循环队列的缓冲区
    const buffer = state.items;
    const headIndex = state.headIndex;
    const tailIndex = state.tailIndex;

    // 计算每个位置的状态
    const positions = buffer.map((item, index) => {
      const isHead = index === headIndex && !isEmpty();
      const isTail = index === tailIndex && !isEmpty();
      const isOccupied = item !== null;

      return {
        item,
        isHead,
        isTail,
        isOccupied
      };
    });

    return (
      <div>
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Text>头指针: {headIndex}, 尾指针: {tailIndex}, 元素数量: {size()}</Text>
        </div>

        {/* 环形可视化 */}
        <div style={{ position: 'relative', width: '100%', height: 300 }}>
          <svg width="100%" height="100%" viewBox="-150 -150 300 300">
            {/* 绘制环 */}
            <circle cx="0" cy="0" r="120" fill="none" stroke="#f0f0f0" strokeWidth="40" />

            {/* 绘制位置标记 */}
            {positions.map((_, index) => {
              const angle = (index / buffer.length) * 2 * Math.PI - Math.PI / 2;
              const x = 120 * Math.cos(angle);
              const y = 120 * Math.sin(angle);

              return (
                <text
                  key={`index-${index}`}
                  x={x}
                  y={y - 30}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#999"
                >
                  {index}
                </text>
              );
            })}

            {/* 绘制元素 */}
            {positions.map((position, index) => {
              const angle = (index / buffer.length) * 2 * Math.PI - Math.PI / 2;
              const x = 120 * Math.cos(angle);
              const y = 120 * Math.sin(angle);

              return (
                <g key={`item-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={position.isOccupied ? '#e6f7ff' : 'white'}
                    stroke={position.isHead ? '#ff4d4f' : (position.isTail ? '#52c41a' : '#d9d9d9')}
                    strokeWidth={position.isHead || position.isTail ? 3 : 1}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill={position.isOccupied ? '#1890ff' : '#d9d9d9'}
                  >
                    {position.isOccupied ? (position.item as string).substring(0, 6) : '空'}
                  </text>
                  {position.isHead && (
                    <text
                      x={x}
                      y={y + 30}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#ff4d4f"
                      fontWeight="bold"
                    >
                      头
                    </text>
                  )}
                  {position.isTail && (
                    <text
                      x={x}
                      y={y + 30}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#52c41a"
                      fontWeight="bold"
                    >
                      尾
                    </text>
                  )}
                </g>
              );
            })}

            {/* 绘制头尾指针连接线 */}
            {!isEmpty() && (
              <>
                <line
                  x1="0"
                  y1="0"
                  x2={120 * Math.cos((headIndex / buffer.length) * 2 * Math.PI - Math.PI / 2) * 0.7}
                  y2={120 * Math.sin((headIndex / buffer.length) * 2 * Math.PI - Math.PI / 2) * 0.7}
                  stroke="#ff4d4f"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <line
                  x1="0"
                  y1="0"
                  x2={120 * Math.cos((tailIndex / buffer.length) * 2 * Math.PI - Math.PI / 2) * 0.7}
                  y2={120 * Math.sin((tailIndex / buffer.length) * 2 * Math.PI - Math.PI / 2) * 0.7}
                  stroke="#52c41a"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </>
            )}
          </svg>
        </div>

        {/* 线性可视化 */}
        <Divider>线性视图</Divider>
        <QueueItemsContainer>
          {buffer.map((item, index) => {
            const isHead = index === headIndex && !isEmpty();
            const isTail = index === tailIndex && !isEmpty();
            const isOccupied = item !== null;

            return (
              <QueueItem
                key={`linear-${index}`}
                value={
                  <div style={{ textAlign: 'center' }}>
                    <div>{isOccupied ? item as string : '空'}</div>
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>
                      索引: {index}
                    </div>
                  </div>
                }
                positionLabel={isHead ? '头' : (isTail ? '尾' : undefined)}
                labelColor={isHead ? 'red' : (isTail ? 'green' : undefined)}
                backgroundColor={isOccupied ? '#e6f7ff' : 'white'}
                borderColor={isHead ? '#ff4d4f' : (isTail ? '#52c41a' : '#d9d9d9')}
                isHighlighted={isHead || isTail}
              />
            );
          })}
        </QueueItemsContainer>
      </div>
    );
  };

  // 渲染操作区域
  const renderOperationsContent = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <RadioGroup
            value={queueType}
            onChange={handleQueueTypeChange}
            buttonStyle="solid"
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value={CircularQueueType.STANDARD}>标准循环队列</Radio.Button>
            <Radio.Button value={CircularQueueType.OVERWRITING}>覆盖式循环队列</Radio.Button>
          </RadioGroup>
        </Col>

        <Col span={24}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入元素值"
              style={{ width: '70%' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleEnqueue}
              disabled={isFull() && queueType === CircularQueueType.STANDARD}
            >
              入队
            </Button>
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={handleDequeue}
              disabled={isEmpty()}
            >
              出队
            </Button>
          </Space.Compact>
        </Col>

        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              icon={<EyeOutlined />}
              onClick={handleFront}
              disabled={isEmpty()}
            >
              查看队首
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={handleRear}
              disabled={isEmpty()}
            >
              查看队尾
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
            <Col span={24}>
              <Space style={{ width: '100%' }}>
                <Text>批量数量:</Text>
                <InputNumber
                  value={batchCount}
                  onChange={(value) => setBatchCount(value || 1)}
                  min={1}
                  max={capacity}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleEnqueueBatch}
                >
                  批量入队
                </Button>
                <Button
                  danger
                  icon={<MinusOutlined />}
                  onClick={handleDequeueBatch}
                  disabled={isEmpty()}
                >
                  批量出队
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Divider>环形缓冲区模拟</Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="生产者" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>数量:</Text>
                    <InputNumber
                      value={produceCount}
                      onChange={(value) => setProduceCount(value || 1)}
                      min={1}
                      max={50}
                    />
                  </Space>
                  <Space>
                    <Text>延迟(ms):</Text>
                    <InputNumber
                      value={produceDelay}
                      onChange={(value) => setProduceDelay(value || 500)}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </Space>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="消费者" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>数量:</Text>
                    <InputNumber
                      value={consumeCount}
                      onChange={(value) => setConsumeCount(value || 1)}
                      min={1}
                      max={50}
                    />
                  </Space>
                  <Space>
                    <Text>延迟(ms):</Text>
                    <InputNumber
                      value={consumeDelay}
                      onChange={(value) => setConsumeDelay(value || 800)}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </Space>
                </Space>
              </Card>
            </Col>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleSimulateRingBuffer}
                loading={isSimulating}
              >
                模拟环形缓冲区
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Space>
  );

  // 队列类型描述
  const queueTypeDescription = queueType === CircularQueueType.STANDARD
    ? '标准循环队列（队列已满时拒绝新元素）'
    : '覆盖式循环队列（队列已满时覆盖最旧的元素）';

  // 队列状态信息
  const statusInfo = `队列状态: ${isEmpty() ? '空' : (isFull() ? '满' : '部分填充')} | 元素数量: ${size()} | 容量: ${state.capacity} | 类型: ${queueTypeDescription}`;

  return (
    <QueueVisualizerBase
      title={title}
      description={
        <div>
          <Text>
            循环队列是一种使用定长数组和头尾指针实现的高效FIFO队列。通过模运算实现环形访问，
            避免了普通队列在出队操作时的数据搬移，提高了效率。循环队列提供以下操作：
          </Text>
          <ul>
            <li><Text strong>入队（enqueue）</Text>：添加元素到队列尾部，时间复杂度O(1)</li>
            <li><Text strong>出队（dequeue）</Text>：移除队首元素，时间复杂度O(1)</li>
            <li><Text strong>查看队首/队尾（front/rear）</Text>：查看队首/队尾元素但不移除，时间复杂度O(1)</li>
          </ul>
          <Paragraph>
            本可视化工具支持两种循环队列：
          </Paragraph>
          <ul>
            <li><Text strong>标准循环队列</Text>：队列已满时拒绝新元素</li>
            <li><Text strong>覆盖式循环队列</Text>：队列已满时覆盖最旧的元素，适用于缓冲区场景</li>
          </ul>
        </div>
      }
      operationsContent={renderOperationsContent()}
      visualizationContent={renderCircularQueue()}
      statusInfo={statusInfo}
      historyContent={<OperationHistory operations={state.operations} />}
      extraContent={
        <Alert
          message="循环队列应用场景"
          description={
            <Paragraph>
              循环队列在实时音视频流处理、嵌入式系统串口通信、滑动窗口统计等场景中有广泛应用。
              其高效的入队和出队操作（O(1)时间复杂度）以及固定的内存使用使其成为资源受限环境的理想选择。
              覆盖式循环队列特别适用于需要保留最新数据的实时数据流处理场景。
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

export default React.memo(CircularQueueVisualizer);
