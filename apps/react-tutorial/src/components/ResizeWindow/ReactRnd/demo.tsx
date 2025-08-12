import React, { useState } from 'react';
import { Card, Typography, Switch, Input, Select, Space } from 'antd';
import ReactRnd from './index';
import './demo.less';

const { Title, Paragraph } = Typography;
const { Option } = Select;

/**
 * React-Rnd 组件演示
 */
const ReactRndDemo: React.FC = () => {
  // 控制选项
  const [enableResizing, setEnableResizing] = useState(true);
  const [enableDragging, setEnableDragging] = useState(true);
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [bounds, setBounds] = useState<string>('parent');

  // 尺寸和位置信息
  const [size, setSize] = useState({ width: '80%', height: 200 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 处理尺寸变化
  const handleResize = (_e: any, _dir: any, ref: any, _delta: any, position: any) => {
    setSize({
      width: ref.style.width,
      height: ref.style.height,
    });
    setPosition(position);
  };

  // 处理拖拽
  const handleDrag = (_e: any, d: any) => {
    setPosition({ x: d.x, y: d.y });
  };

  return (
    <div className="react-rnd-demo">
      <Card className="demo-controls">
        <Title level={4}>React-Rnd 组件演示</Title>
        <Paragraph>
          这是一个基于 react-rnd 库实现的可调整大小和可拖动的组件演示。
          你可以通过下面的控制选项来调整组件的行为。
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="control-item">
            <span>启用调整大小:</span>
            <Switch checked={enableResizing} onChange={setEnableResizing} />
          </div>

          <div className="control-item">
            <span>启用拖拽:</span>
            <Switch checked={enableDragging} onChange={setEnableDragging} />
          </div>

          <div className="control-item">
            <span>锁定宽高比:</span>
            <Switch checked={lockAspectRatio} onChange={setLockAspectRatio} />
          </div>

          <div className="control-item">
            <span>边界限制:</span>
            <Select value={bounds} style={{ width: 120 }} onChange={setBounds}>
              <Option value="parent">父元素</Option>
              <Option value="window">窗口</Option>
              <Option value="">无限制</Option>
            </Select>
          </div>
        </Space>

        <div className="status-display">
          <div>尺寸: {JSON.stringify(size)}</div>
          <div>位置: {JSON.stringify(position)}</div>
        </div>
      </Card>

      <div className="rnd-container">
        <ReactRnd
          enableResizing={enableResizing}
          enableDragging={enableDragging}
          lockAspectRatio={lockAspectRatio}
          bounds={bounds || undefined}
          defaultSize={{ width: '80%', height: 200 }}
          defaultPosition={{ x: 0, y: 0 }}
          onResize={handleResize}
          onDrag={handleDrag}
          className="custom-rnd"
        >
          <div className="rnd-content">
            <div className="drag-handle">拖拽区域 (整个组件可拖拽)</div>
            <div className="content-area">
              <Title level={5}>可调整大小和可拖动的组件</Title>
              <Paragraph>
                这是一个基于 react-rnd 库实现的组件。你可以：
              </Paragraph>
              <ul>
                <li>拖拽此组件移动位置</li>
                <li>从边缘或角落调整大小</li>
                <li>通过控制面板修改行为</li>
              </ul>
              <Input placeholder="你可以在这里输入内容" />
            </div>
          </div>
        </ReactRnd>
      </div>
    </div>
  );
};

export default ReactRndDemo;