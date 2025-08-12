import React, { useState } from 'react';
import { Card, Typography, Switch, Select, Space, InputNumber, Radio, Button, Divider } from 'antd';
import { CodeOutlined, LayoutOutlined, SettingOutlined } from '@ant-design/icons';
import ResizeWindow from '../../../components/ResizeWindow';
import type { ResizeDirection } from '../../../components/ResizeWindow';
import './ResizeWindowDemo.less';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

/**
 * ResizeWindow 组件演示
 */
const ResizeWindowDemo: React.FC = () => {
  // 控制选项
  const [resizable, setResizable] = useState(true);
  const [minHeight, setMinHeight] = useState(100);
  const [maxHeight, setMaxHeight] = useState(500);
  const [minWidth, setMinWidth] = useState(200);
  const [maxWidth, setMaxWidth] = useState(800);
  const [theme, setTheme] = useState<'default' | 'code' | 'panel'>('default');

  // 选择可调整方向
  const [directions, setDirections] = useState<ResizeDirection[]>(['right', 'bottom', 'bottomRight']);

  // 尺寸信息
  const [size, setSize] = useState({ width: '100%', height: 300 });

  // 处理尺寸变化
  const handleResize = (_width: number, height: number) => {
    // 防止不必要的状态更新
    if (size.height !== height) {
      // 保持宽度为字符串'100%'，只更新高度
      setSize({ width: size.width, height });
    }
  };

  // 获取主题样式
  const getThemeClass = () => {
    switch (theme) {
      case 'code':
        return 'code-theme';
      case 'panel':
        return 'panel-theme';
      default:
        return '';
    }
  };

  // 重置尺寸
  const resetSize = () => {
    setSize({ width: '100%', height: 300 });
  };

  return (
    <div className="resize-window-demo">
      <div className="demo-controls">
        <Card title="控制面板" size="small" extra={<SettingOutlined />}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="control-item">
              <span>启用调整大小:</span>
              <Switch checked={resizable} onChange={setResizable} />
            </div>

            <div className="control-item">
              <span>调整方向:</span>
              <Select
                mode="multiple"
                style={{ width: '70%' }}
                value={directions}
                onChange={(value) => setDirections(value as ResizeDirection[])}
                placeholder="选择可调整方向"
              >
                <Option value="top">顶部</Option>
                <Option value="right">右侧</Option>
                <Option value="bottom">底部</Option>
                <Option value="left">左侧</Option>
                <Option value="topRight">右上角</Option>
                <Option value="bottomRight">右下角</Option>
                <Option value="bottomLeft">左下角</Option>
                <Option value="topLeft">左上角</Option>
              </Select>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div className="control-item">
              <span>最小高度:</span>
              <InputNumber min={50} max={300} value={minHeight} onChange={(value) => setMinHeight(value || 100)} />
            </div>

            <div className="control-item">
              <span>最大高度:</span>
              <InputNumber min={300} max={1000} value={maxHeight} onChange={(value) => setMaxHeight(value || 500)} />
            </div>

            <div className="control-item">
              <span>最小宽度:</span>
              <InputNumber min={100} max={400} value={minWidth} onChange={(value) => setMinWidth(value || 200)} />
            </div>

            <div className="control-item">
              <span>最大宽度:</span>
              <InputNumber min={400} max={1200} value={maxWidth} onChange={(value) => setMaxWidth(value || 800)} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div className="control-item">
              <span>主题风格:</span>
              <Radio.Group value={theme} onChange={(e) => setTheme(e.target.value)}>
                <Radio.Button value="default">默认</Radio.Button>
                <Radio.Button value="code"><CodeOutlined /></Radio.Button>
                <Radio.Button value="panel"><LayoutOutlined /></Radio.Button>
              </Radio.Group>
            </div>

            <Button type="primary" onClick={resetSize} style={{ marginTop: 8 }}>
              重置尺寸
            </Button>
          </Space>
        </Card>

        <div className="status-display">
          <div className="status-item">
            <span>当前宽度:</span>
            <Text code>{typeof size.width === 'number' ? `${size.width}px` : size.width}</Text>
          </div>
          <div className="status-item">
            <span>当前高度:</span>
            <Text code>{`${size.height}px`}</Text>
          </div>
        </div>
      </div>

      <div className="resize-container">
        <ResizeWindow
          className={`demo-resize-window ${getThemeClass()}`}
          width={size.width}
          height={size.height}
          minHeight={minHeight}
          maxHeight={maxHeight}
          minWidth={minWidth}
          maxWidth={maxWidth}
          resizable={resizable}
          directions={directions}
          onResize={handleResize}
        >
          <div className="window-content">
            <div className="window-header">
              <div className="window-title">可调整大小的窗口</div>
              <div className="window-controls">
                <span className="window-control minimize"></span>
                <span className="window-control maximize"></span>
                <span className="window-control close"></span>
              </div>
            </div>
            <div className="window-body">
              <Title level={4}>ResizeWindow 组件演示</Title>
              <Paragraph>
                这是一个可以通过拖动边缘或角落来调整大小的组件。你可以：
              </Paragraph>
              <ul>
                <li>从边缘或角落拖动调整大小</li>
                <li>通过控制面板设置各种属性</li>
                <li>查看实时尺寸信息</li>
                <li>尝试不同的主题风格</li>
              </ul>
              <Paragraph>
                拖动窗口的<Text mark>边缘</Text>或<Text mark>角落</Text>来调整大小。
              </Paragraph>
              <div className="window-footer">
                状态: {resizable ? '可调整大小' : '已锁定大小'}
              </div>
            </div>
          </div>
        </ResizeWindow>
      </div>
    </div>
  );
};

export default ResizeWindowDemo;