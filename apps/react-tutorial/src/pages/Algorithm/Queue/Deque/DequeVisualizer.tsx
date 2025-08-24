import React, { useState } from 'react';
import { Card, Row, Col, Input, Button, Space, Divider, Typography, Alert, List, Tag, InputNumber } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useDeque } from './hooks';

const { Title, Text } = Typography;

interface DequeVisualizerProps {
  title?: string;
}

const initialItems = [1, 2, 3, 4, 5];
const initialInputValue = 1;
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

  const handleAddFront = () => {
    const value = getNumberValue(inputValue);
    if (value) {
      addFront(value);
      setInputValue(initialInputValue);
    }
  };

  const handleAddBack = () => {
    const value = getNumberValue(inputValue);
    if (value) {
      addBack(value);
      setInputValue(initialInputValue);
    }
  };

  const handleRemoveFront = () => {
    removeFront();
  };

  const handleRemoveBack = () => {
    removeBack();
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
    console.log('items', items);

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        overflowX: 'auto',
        padding: '10px 0'
      }}>
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
              <Tag color={color} icon={icon}>
                {op.type}
              </Tag>
              {op.value !== undefined && (
                <span style={{ marginLeft: 8 }}>
                  值: {op.value}
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

  return (
    <Card title={title} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>队列操作</Title>
            <Space.Compact style={{ width: '100%' }}>
              {/* <Input
                placeholder="输入元素值"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                onPressEnter={handleAddBack}
              /> */}
              <InputNumber
                value={inputValue}
                onChange={(value) => setInputValue(value || 0)}
                onPressEnter={handleAddBack}
              />
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={handleAddFront}
                title="添加到队列前端"
              >
                前端添加
              </Button>
              <Button
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
                danger
                icon={<MinusOutlined />}
                onClick={handleRemoveFront}
                disabled={isEmpty()}
                title="从队列前端移除"
              >
                前端移除
              </Button>
              <Button
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
    </Card>
  );
};

export default React.memo(DequeVisualizer);