import React, { useState, useRef, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Divider, Typography, Alert, List, Tag, InputNumber } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import { useDeque } from './hooks';
import { queueConfig } from './common';

const { Title, Text } = Typography;

interface DequeVisualizerProps {
  title?: string;
}

const initialItems = queueConfig.simple.initialArray;
const initialInputValue = queueConfig.simple.initialInputValue;
function getNumberValue(value: number | string) {
  return typeof value === 'number' ? value : Number(value?.toString()?.trim());
}
const DequeVisualizer: React.FC<DequeVisualizerProps> = ({ title = '双端队列可视化' }) => {
  const [inputValue, setInputValue] = useState<number>(initialInputValue);
  const {
    items,
    operations,
    addFront,
    addBack,
    removeFront,
    removeBack,
    clear,
    isEmpty,
    size
  } = useDeque<number>(initialItems);

  // 动画相关状态
  const [animatingItem, setAnimatingItem] = useState<{
    value: number;
    type: 'addFront' | 'addBack' | 'removeFront' | 'removeBack';
    position: { x: number; y: number };
    target: { x: number; y: number };
  } | null>(null);

  // 动画进度状态 - 移到组件顶层
  const [progress, setProgress] = useState(0);

  // 引用
  const frontButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const queueContainerRef = useRef<HTMLDivElement>(null);
  const frontRemoveButtonRef = useRef<HTMLButtonElement>(null);
  const backRemoveButtonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // 计算元素的目标位置
  const calculateTargetPosition = (type: 'addFront' | 'addBack' | 'removeFront' | 'removeBack') => {
    if (!queueContainerRef.current) return { x: 0, y: 0 };

    const containerRect = queueContainerRef.current.getBoundingClientRect();
    const containerCenterY = containerRect.top + containerRect.height / 2;

    if (type === 'addFront' || type === 'removeFront') {
      // 前端位置 (左侧)
      return {
        x: containerRect.left + 40,
        y: containerCenterY
      };
    } else {
      // 后端位置 (右侧)
      return {
        x: containerRect.right - 40,
        y: containerCenterY
      };
    }
  };

  // 计算按钮位置
  const calculateButtonPosition = (type: 'addFront' | 'addBack' | 'removeFront' | 'removeBack') => {
    let buttonRef;

    switch (type) {
      case 'addFront':
        buttonRef = frontButtonRef;
        break;
      case 'addBack':
        buttonRef = backButtonRef;
        break;
      case 'removeFront':
        buttonRef = frontRemoveButtonRef;
        break;
      case 'removeBack':
        buttonRef = backRemoveButtonRef;
        break;
    }

    if (!buttonRef.current) return { x: 0, y: 0 };

    const rect = buttonRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  // 处理动画效果 - 使用顶层useEffect
  useEffect(() => {
    if (!animatingItem) return;

    // 重置进度
    setProgress(0);
    startTimeRef.current = Date.now();

    const animationDuration = 500; // 毫秒

    const animationFrame = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(elapsed / animationDuration, 1);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animationFrame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animationFrame);

    // 清理函数
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animatingItem]); // 只在animatingItem变化时重新执行

  const handleAddFront = () => {
    const value = getNumberValue(inputValue);
    if (value) {
      // 设置动画起始状态
      setAnimatingItem({
        value,
        type: 'addFront',
        position: calculateButtonPosition('addFront'),
        target: calculateTargetPosition('addFront')
      });

      // 延迟执行实际的添加操作，等待动画完成
      setTimeout(() => {
        addFront(value);
        setInputValue(initialInputValue);
        setAnimatingItem(null);
      }, 500); // 动画持续时间
    }
  };

  const handleAddBack = () => {
    const value = getNumberValue(inputValue);
    if (value) {
      // 设置动画起始状态
      setAnimatingItem({
        value,
        type: 'addBack',
        position: calculateButtonPosition('addBack'),
        target: calculateTargetPosition('addBack')
      });

      // 延迟执行实际的添加操作，等待动画完成
      setTimeout(() => {
        addBack(value);
        setInputValue(initialInputValue);
        setAnimatingItem(null);
      }, 2000); // 动画持续时间
    }
  };

  const handleRemoveFront = () => {
    if (!isEmpty()) {
      const value = items[0];

      // 设置动画起始状态
      setAnimatingItem({
        value,
        type: 'removeFront',
        position: calculateTargetPosition('removeFront'),
        target: calculateButtonPosition('removeFront')
      });

      // 延迟执行实际的移除操作，等待动画完成
      setTimeout(() => {
        removeFront();
        setAnimatingItem(null);
      }, 500); // 动画持续时间
    }
  };

  const handleRemoveBack = () => {
    if (!isEmpty()) {
      const value = items[items.length - 1];

      // 设置动画起始状态
      setAnimatingItem({
        value,
        type: 'removeBack',
        position: calculateTargetPosition('removeBack'),
        target: calculateButtonPosition('removeBack')
      });

      // 延迟执行实际的移除操作，等待动画完成
      setTimeout(() => {
        removeBack();
        setAnimatingItem(null);
      }, 500); // 动画持续时间
    }
  };

  const handleClear = () => {
    clear();
  };

  // 渲染队列元素
  const renderDequeItems = () => {
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
      <div
        ref={queueContainerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 20,
          overflowX: 'auto',
          padding: '10px 0',
          position: 'relative'
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              width: 60,
              height: 60,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid #1890ff',
              margin: '0 4px',
              borderRadius: 4,
              backgroundColor: '#e6f7ff',
              position: 'relative',
              flexShrink: 0
            }}
          >
            <Text strong>{item}</Text>
            {index === 0 && (
              <div style={{
                position: 'absolute',
                top: -25,
                left: 0,
                right: 0,
                textAlign: 'center'
              }}>
                <Tag color="blue">Front</Tag>
              </div>
            )}
            {index === items.length - 1 && index !== 0 && (
              <div style={{
                position: 'absolute',
                top: -25,
                left: 0,
                right: 0,
                textAlign: 'center'
              }}>
                <Tag color="green">Back</Tag>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染操作历史
  const renderOperationHistory = () => {
    if (operations.length === 0) {
      return (
        <Alert
          message="无操作历史"
          description="执行队列操作后将在此显示"
          type="info"
          showIcon
        />
      );
    }

    return (
      <List
        size="small"
        bordered
        dataSource={[...operations].reverse().slice(0, 10)}
        renderItem={(op) => {
          let color = '';
          let icon = null;

          switch (op.type) {
            case 'addFront':
              color = 'blue';
              icon = <ArrowLeftOutlined />;
              break;
            case 'addBack':
              color = 'green';
              icon = <ArrowRightOutlined />;
              break;
            case 'removeFront':
              color = 'orange';
              icon = <MinusOutlined />;
              break;
            case 'removeBack':
              color = 'gold';
              icon = <MinusOutlined />;
              break;
            case 'clear':
              color = 'red';
              icon = <DeleteOutlined />;
              break;
          }

          return (
            <List.Item>
              <Tag color={color} icon={icon as any}>
                {op.type}
              </Tag>
              {op.value !== undefined && (
                <span style={{ marginLeft: 8 }}>
                  值: {op?.value?.toString?.() ?? ''}
                </span>
              )}
              <span style={{ marginLeft: 8, color: '#999' }}>
                {new Date(op.timestamp).toLocaleTimeString()}
              </span>
            </List.Item>
          );
        }}
      />
    );
  };

  // 渲染动画元素
  const renderAnimatingItem = () => {
    if (!animatingItem) return null;

    // 计算当前位置
    const currentX = animatingItem.position.x + (animatingItem.target.x - animatingItem.position.x) * progress;
    const currentY = animatingItem.position.y + (animatingItem.target.y - animatingItem.position.y) * progress;

    // 计算缩放和透明度
    const scale = animatingItem.type.startsWith('remove') ? 1 - progress * 0.5 : 0.5 + progress * 0.5;
    const opacity = animatingItem.type.startsWith('remove') ? 1 - progress : progress;

    return (
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: currentX - 30,
            top: currentY - 30,
            width: 60,
            height: 60,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #1890ff',
            borderRadius: 4,
            backgroundColor: '#e6f7ff',
            transform: `scale(${scale})`,
            opacity,
            transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
          }}
        >
          <Text strong>{animatingItem.value}</Text>
        </div>
      </div>
    );
  };

  return (
    <Card title={title} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>队列操作</Title>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                value={inputValue}
                onChange={(value) => setInputValue(value || 0)}
                onPressEnter={handleAddBack}
              />
              <Button
                ref={frontButtonRef}
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={handleAddFront}
                title="添加到队列前端"
              >
                前端添加
              </Button>
              <Button
                ref={backButtonRef}
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={handleAddBack}
                title="添加到队列后端"
              >
                后端添加
              </Button>
            </Space.Compact>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                ref={frontRemoveButtonRef}
                danger
                icon={<MinusOutlined />}
                onClick={handleRemoveFront}
                disabled={isEmpty()}
                title="从队列前端移除"
              >
                前端移除
              </Button>
              <Button
                ref={backRemoveButtonRef}
                danger
                icon={<MinusOutlined />}
                onClick={handleRemoveBack}
                disabled={isEmpty()}
                title="从队列后端移除"
              >
                后端移除
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClear}
                disabled={isEmpty()}
                title="清空队列"
              >
                清空
              </Button>
            </Space>

            <Alert
              message={`队列状态: ${isEmpty() ? '空' : '非空'} | 元素数量: ${size()}`}
              type={isEmpty() ? 'warning' : 'success'}
              showIcon
            />
          </Space>
        </Col>

        <Col span={24}>
          <Divider>队列可视化</Divider>
          {renderDequeItems()}
        </Col>

        <Col span={24}>
          <Divider>操作历史</Divider>
          {renderOperationHistory()}
        </Col>
      </Row>

      {/* 渲染动画元素 */}
      {renderAnimatingItem()}
    </Card>
  );
};

export default React.memo(DequeVisualizer);