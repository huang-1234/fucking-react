import React, { useState } from 'react';
import { Card, Row, Col, Button, Slider, InputNumber, Space, Divider, Typography, Alert, Table, Tag } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useSlidingWindow } from './hooks';
import { queueConfig } from './common';

const { Title, Text } = Typography;

interface DequeAlgorithmProps {
  title?: string;
}

const DequeAlgorithm: React.FC<DequeAlgorithmProps> = ({ title = '滑动窗口最值算法' }) => {
  const [customArray, setCustomArray] = useState<string>(queueConfig.complex.initialArray.join(','));

  const {
    state,
    isPlaying,
    speed,
    updateArray,
    updateWindowSize,
    stepForward,
    togglePlay,
    updateSpeed,
    resetWindow,
    completeAlgorithm
  } = useSlidingWindow(
    [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
    3
  );

  // 解析自定义数组
  const handleUpdateArray = () => {
    try {
      const newArray = customArray.split(',')
        .map(item => Number(item.trim()))
        .filter(num => !isNaN(num));

      if (newArray.length > 0) {
        updateArray(newArray);
      }
    } catch (error) {
      console.error('无效的数组输入:', error);
    }
  };

  // 渲染数组元素
  const renderArrayItems = () => {
    return (
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '10px 0',
        marginBottom: 20
      }}>
        {state.array.map((value, index) => {
          const isInCurrentWindow =
            index >= Math.max(0, state.currentIndex - state.windowSize) &&
            index < state.currentIndex;

          const isMaxInWindow =
            isInCurrentWindow &&
            state.maxDequeItems.some(item => item.index === index);

          const isMinInWindow =
            isInCurrentWindow &&
            state.minDequeItems.some(item => item.index === index);

          const isCurrent = index === state.currentIndex - 1;

          return (
            <div
              key={index}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: `2px solid ${isCurrent ? '#ff4d4f' : (isInCurrentWindow ? '#1890ff' : '#d9d9d9')}`,
                margin: '0 4px',
                borderRadius: 4,
                backgroundColor: isMaxInWindow ? '#ffccc7' : (isMinInWindow ? '#d9f7be' : (isInCurrentWindow ? '#e6f7ff' : 'white')),
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Text strong>{value}</Text>
              {isMaxInWindow && (
                <div style={{ position: 'absolute', top: -20, left: 0, right: 0, textAlign: 'center' }}>
                  <Tag color="red" style={{ fontSize: '10px', padding: '0 4px' }}>Max</Tag>
                </div>
              )}
              {isMinInWindow && (
                <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, textAlign: 'center' }}>
                  <Tag color="green" style={{ fontSize: '10px', padding: '0 4px' }}>Min</Tag>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染窗口指示器
  const renderWindowIndicator = () => {
    const windowStart = Math.max(0, state.currentIndex - state.windowSize);
    const windowEnd = state.currentIndex;

    return (
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '0 0 20px 0',
        marginLeft: 4
      }}>
        {state.array.map((_, index) => (
          <div
            key={index}
            style={{
              width: 40,
              margin: '0 4px',
              textAlign: 'center',
              flexShrink: 0
            }}
          >
            {index >= windowStart && index < windowEnd ? (
              <div style={{ height: 4, backgroundColor: '#1890ff' }} />
            ) : (
              <div style={{ height: 4, backgroundColor: 'transparent' }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染结果表格
  const renderResultTable = () => {
    if (state.maxValues.length === 0) {
      return (
        <Alert
          message="尚无结果"
          description="算法执行后将在此显示窗口最值"
          type="info"
          showIcon
        />
      );
    }

    const dataSource = state.maxValues.map((max, index) => ({
      key: index,
      windowIndex: index + 1,
      windowStart: index,
      windowEnd: index + state.windowSize - 1,
      maxValue: max,
      minValue: state.minValues[index]
    }));

    const columns = [
      {
        title: '窗口序号',
        dataIndex: 'windowIndex',
        key: 'windowIndex',
      },
      {
        title: '窗口范围',
        dataIndex: 'windowRange',
        key: 'windowRange',
        render: (_: any, record: any) => `[${record.windowStart}, ${record.windowEnd}]`
      },
      {
        title: '窗口最大值',
        dataIndex: 'maxValue',
        key: 'maxValue',
        render: (value: number) => <Tag color="red">{value}</Tag>
      },
      {
        title: '窗口最小值',
        dataIndex: 'minValue',
        key: 'minValue',
        render: (value: number) => <Tag color="green">{value}</Tag>
      }
    ];

    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        size="small"
        pagination={{ pageSize: 5 }}
      />
    );
  };

  // 渲染单调队列状态
  const renderDequeState = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card size="small" title="单调递减队列 (最大值)">
            {state.maxDequeItems.length > 0 ? (
              <div style={{ display: 'flex', overflowX: 'auto' }}>
                {state.maxDequeItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      margin: '0 4px',
                      border: '1px solid #ff4d4f',
                      borderRadius: 4,
                      backgroundColor: '#fff2f0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Text strong>{item.value}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>idx: {item.index}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">队列为空</Text>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="单调递增队列 (最小值)">
            {state.minDequeItems.length > 0 ? (
              <div style={{ display: 'flex', overflowX: 'auto' }}>
                {state.minDequeItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      margin: '0 4px',
                      border: '1px solid #52c41a',
                      borderRadius: 4,
                      backgroundColor: '#f6ffed',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Text strong>{item.value}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>idx: {item.index}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">队列为空</Text>
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Card title={title} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>算法配置</Title>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={customArray}
                onChange={(e) => setCustomArray(e.target.value)}
                placeholder="输入数组，用逗号分隔"
              />
              <Button type="primary" onClick={handleUpdateArray}>
                更新数组
              </Button>
            </Space.Compact>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: 12 }}>窗口大小:</Text>
              <Slider
                min={1}
                max={Math.max(1, state.array.length)}
                value={state.windowSize}
                onChange={updateWindowSize}
                style={{ flex: 1, marginRight: 12 }}
              />
              <InputNumber
                min={1}
                max={Math.max(1, state.array.length)}
                value={state.windowSize}
                onChange={(value) => updateWindowSize(value || 1)}
                style={{ width: 60 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: 12 }}>动画速度:</Text>
              <Slider
                min={100}
                max={2000}
                step={100}
                value={speed}
                onChange={updateSpeed}
                style={{ flex: 1, marginRight: 12 }}
              />
              <Text>{speed}ms</Text>
            </div>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetWindow}
              >
                重置
              </Button>
              <Button
                icon={<StepForwardOutlined />}
                onClick={stepForward}
                disabled={state.isComplete}
              >
                单步执行
              </Button>
              <Button
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={togglePlay}
                disabled={state.isComplete}
                type={isPlaying ? 'default' : 'primary'}
              >
                {isPlaying ? '暂停' : '播放'}
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={completeAlgorithm}
                disabled={state.isComplete}
                type="primary"
                danger
              >
                完成
              </Button>
            </Space>

            <Alert
              message={`当前状态: ${state.isComplete ? '已完成' : '执行中'} | 进度: ${state.currentIndex}/${state.array.length}`}
              type={state.isComplete ? 'success' : 'info'}
              showIcon
            />
          </Space>
        </Col>

        <Col span={24}>
          <Divider>数组可视化</Divider>
          {renderArrayItems()}
          {renderWindowIndicator()}
        </Col>

        <Col span={24}>
          <Divider>单调队列状态</Divider>
          {renderDequeState()}
        </Col>

        <Col span={24}>
          <Divider>算法结果</Divider>
          {renderResultTable()}
        </Col>
      </Row>
    </Card>
  );
};

export default React.memo(DequeAlgorithm);

// 辅助组件：输入框
function Input({ value, onChange, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: '4px 11px',
        width: '100%',
        border: '1px solid #d9d9d9',
        borderRadius: '2px',
        fontSize: '14px',
      }}
    />
  );
}
