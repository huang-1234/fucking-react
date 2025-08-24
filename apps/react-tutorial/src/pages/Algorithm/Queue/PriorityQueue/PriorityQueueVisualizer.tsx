import React, { useState } from 'react';
import { Row, Col, Button, Space, InputNumber, Select, Typography, Alert, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons';
import { usePriorityQueue, PriorityQueueType } from './hooks';
import QueueVisualizerBase from '../components/QueueVisualizerBase';
import QueueItem, { QueueItemsContainer } from '../components/QueueItem';
import OperationHistory from '../components/OperationHistory';
import TreeVisualization from '../components/TreeVisualization';

const { Text } = Typography;
const { Option } = Select;

interface PriorityQueueVisualizerProps {
  title?: string;
  queueType?: PriorityQueueType;
}

const PriorityQueueVisualizer: React.FC<PriorityQueueVisualizerProps> = ({
  title = '优先队列可视化',
  queueType = PriorityQueueType.MIN
}) => {
  // 输入值状态
  const [inputValue, setInputValue] = useState<number>(1);
  const [inputPriority, setInputPriority] = useState<number>(1);
  const [updateValue, setUpdateValue] = useState<number | null>(null);
  const [updatePriority, setUpdatePriority] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

  // 使用优先队列Hook
  const {
    items,
    operations,
    enqueue,
    dequeue,
    peek,
    clear,
    isEmpty,
    size,
    updatePriority: updateItemPriority,
    toTree,
    queueType: currentQueueType
  } = usePriorityQueue<number>(queueType, [
    { value: 1, priority: 5 },
    { value: 2, priority: 3 },
    { value: 3, priority: 8 },
    { value: 4, priority: 1 },
    { value: 5, priority: 7 }
  ]);

  // 处理入队
  const handleEnqueue = () => {
    if (inputValue !== null && inputPriority !== null) {
      enqueue(inputValue, inputPriority);
      setInputValue(prev => prev + 1);
    }
  };

  // 处理出队
  const handleDequeue = () => {
    dequeue();
  };

  // 处理查看队首元素
  const handlePeek = () => {
    peek();
  };

  // 处理清空队列
  const handleClear = () => {
    clear();
  };

  // 处理更新优先级
  const handleUpdatePriority = () => {
    if (updateValue !== null && updatePriority !== null) {
      updateItemPriority(updateValue, updatePriority);
    }
  };

  // 切换视图模式
  const handleViewModeChange = (mode: 'list' | 'tree') => {
    setViewMode(mode);
  };

  // 渲染队列元素（列表视图）
  const renderQueueItemsList = () => {
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
        {items.map((item, index) => (
          <QueueItem
            key={`${item.value}-${index}`}
            value={item.value}
            priority={item.priority}
            positionLabel={index === 0 ? (currentQueueType === PriorityQueueType.MIN ? 'Min' : 'Max') : undefined}
            labelColor={currentQueueType === PriorityQueueType.MIN ? 'green' : 'red'}
            backgroundColor={index === 0 ? (currentQueueType === PriorityQueueType.MIN ? '#f6ffed' : '#fff2f0') : '#e6f7ff'}
            borderColor={index === 0 ? (currentQueueType === PriorityQueueType.MIN ? '#52c41a' : '#ff4d4f') : '#1890ff'}
            isHighlighted={index === 0}
            onClick={() => setUpdateValue(item.value)}
          />
        ))}
      </QueueItemsContainer>
    );
  };

  // 渲染队列元素（树视图）
  const renderQueueItemsTree = () => {
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

    const treeData = toTree();
    return (
      <TreeVisualization
        treeData={treeData}
        defaultExpandedKeys={['node-0']}
        onSelect={(_, info) => {
          if (info.node && info.node.value) {
            setUpdateValue(info.node.value);
          }
        }}
      />
    );
  };

  // 渲染操作区域
  const renderOperationsContent = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              addonBefore="值"
              value={inputValue}
              onChange={value => setInputValue(value || 0)}
              style={{ width: '50%' }}
            />
            <InputNumber
              addonBefore="优先级"
              value={inputPriority}
              onChange={value => setInputPriority(value || 0)}
              style={{ width: '50%' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleEnqueue}
            >
              入队
            </Button>
          </Space.Compact>
        </Col>

        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              icon={<MinusOutlined />}
              onClick={handleDequeue}
              disabled={isEmpty()}
              danger
            >
              出队
            </Button>
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
          <Divider>更新优先级</Divider>
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              addonBefore="值"
              value={updateValue}
              onChange={value => setUpdateValue(value)}
              style={{ width: '50%' }}
              placeholder="选择元素"
            />
            <InputNumber
              addonBefore="新优先级"
              value={updatePriority}
              onChange={value => setUpdatePriority(value || 0)}
              style={{ width: '50%' }}
            />
            <Button
              icon={<SwapOutlined />}
              onClick={handleUpdatePriority}
              disabled={updateValue === null || isEmpty()}
            >
              更新
            </Button>
          </Space.Compact>
        </Col>

        <Col span={24}>
          <Divider>视图模式</Divider>
          <Select
            value={viewMode}
            onChange={handleViewModeChange}
            style={{ width: '100%' }}
          >
            <Option value="list">列表视图</Option>
            <Option value="tree">树视图</Option>
          </Select>
        </Col>
      </Row>
    </Space>
  );

  // 队列类型描述
  const queueTypeDescription = currentQueueType === PriorityQueueType.MIN
    ? '最小优先队列（数字越小优先级越高）'
    : '最大优先队列（数字越大优先级越高）';

  // 队列状态信息
  const statusInfo = `队列状态: ${isEmpty() ? '空' : '非空'} | 元素数量: ${size()} | 类型: ${queueTypeDescription}`;

  return (
    <QueueVisualizerBase
      title={title}
      description={
        <div>
          <Text>
            优先队列是一种特殊的队列，其中每个元素都有一个优先级，队列中的元素按照优先级顺序出队，而不是按照它们入队的顺序。
            优先队列通常基于二叉堆实现，支持以下操作：
          </Text>
          <ul>
            <li><Text strong>入队（Enqueue）</Text>：添加元素到队列中，时间复杂度 O(log n)</li>
            <li><Text strong>出队（Dequeue）</Text>：移除并返回队首元素（最高优先级），时间复杂度 O(log n)</li>
            <li><Text strong>查看（Peek）</Text>：查看队首元素但不移除，时间复杂度 O(1)</li>
          </ul>
          <Text>
            当前实现：{queueTypeDescription}
          </Text>
        </div>
      }
      operationsContent={renderOperationsContent()}
      visualizationContent={viewMode === 'list' ? renderQueueItemsList() : renderQueueItemsTree()}
      statusInfo={statusInfo}
      historyContent={<OperationHistory operations={operations} />}
    />
  );
};

export default React.memo(PriorityQueueVisualizer);
