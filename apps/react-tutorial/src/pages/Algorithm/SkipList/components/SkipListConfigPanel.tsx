import React from 'react';
import { Card, Form, Slider, ColorPicker, InputNumber, Switch, Divider } from 'antd';
import type { Color } from 'antd/es/color-picker';

interface SkipListConfig {
  maxLevel: number;
  probability: number;
  nodeColor: string;
  linkColor: string;
  highlightColor: string;
  animationSpeed: number;
}

interface SkipListConfigPanelProps {
  config: SkipListConfig;
  onChange: (config: Partial<SkipListConfig>) => void;
  disabled?: boolean;
}

const SkipListConfigPanel: React.FC<SkipListConfigPanelProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handleMaxLevelChange = (value: number | null) => {
    if (value && value >= 4 && value <= 32) {
      onChange({ maxLevel: value });
    }
  };

  const handleProbabilityChange = (value: number) => {
    onChange({ probability: value });
  };

  const handleNodeColorChange = (color: Color) => {
    onChange({ nodeColor: color.toHexString() });
  };

  const handleLinkColorChange = (color: Color) => {
    onChange({ linkColor: color.toHexString() });
  };

  const handleHighlightColorChange = (color: Color) => {
    onChange({ highlightColor: color.toHexString() });
  };

  const handleAnimationSpeedChange = (value: number) => {
    onChange({ animationSpeed: value });
  };

  return (
    <Card title="配置面板" size="small">
      <Form layout="vertical" size="small">
        {/* 跳表参数配置 */}
        <Form.Item label="最大层级" tooltip="跳表的最大层级数，影响查找性能">
          <InputNumber
            min={4}
            max={32}
            value={config.maxLevel}
            onChange={handleMaxLevelChange}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="升级概率" tooltip="节点升级到下一层的概率，通常设置为0.5">
          <Slider
            min={0.1}
            max={0.9}
            step={0.05}
            value={config.probability}
            onChange={handleProbabilityChange}
            disabled={disabled}
            marks={{
              0.25: '0.25',
              0.5: '0.5',
              0.75: '0.75',
            }}
            tooltip={{ formatter: (value) => `${value}` }}
          />
        </Form.Item>

        <Divider />

        {/* 可视化样式配置 */}
        <Form.Item label="节点颜色">
          <ColorPicker
            value={config.nodeColor}
            onChange={handleNodeColorChange}
            disabled={disabled}
            showText
            size="small"
          />
        </Form.Item>

        <Form.Item label="连接线颜色">
          <ColorPicker
            value={config.linkColor}
            onChange={handleLinkColorChange}
            disabled={disabled}
            showText
            size="small"
          />
        </Form.Item>

        <Form.Item label="高亮颜色">
          <ColorPicker
            value={config.highlightColor}
            onChange={handleHighlightColorChange}
            disabled={disabled}
            showText
            size="small"
          />
        </Form.Item>

        <Form.Item label="动画速度 (ms)" tooltip="动画持续时间，毫秒">
          <Slider
            min={200}
            max={3000}
            step={100}
            value={config.animationSpeed}
            onChange={handleAnimationSpeedChange}
            disabled={disabled}
            marks={{
              500: '快',
              1000: '中',
              2000: '慢',
            }}
            tooltip={{ formatter: (value) => `${value}ms` }}
          />
        </Form.Item>

        {/* 配置预设 */}
        <Divider />
        
        <Form.Item label="快速配置">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onChange({
                maxLevel: 16,
                probability: 0.5,
                nodeColor: '#1890ff',
                linkColor: '#d9d9d9',
                highlightColor: '#ff4d4f',
                animationSpeed: 1000,
              })}
              disabled={disabled}
              style={{
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                background: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              默认配置
            </button>
            
            <button
              type="button"
              onClick={() => onChange({
                maxLevel: 8,
                probability: 0.25,
                nodeColor: '#52c41a',
                linkColor: '#b7eb8f',
                highlightColor: '#faad14',
                animationSpeed: 1500,
              })}
              disabled={disabled}
              style={{
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                background: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              教学模式
            </button>
            
            <button
              type="button"
              onClick={() => onChange({
                maxLevel: 24,
                probability: 0.75,
                nodeColor: '#722ed1',
                linkColor: '#d3adf7',
                highlightColor: '#eb2f96',
                animationSpeed: 500,
              })}
              disabled={disabled}
              style={{
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                background: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              高性能模式
            </button>
          </div>
        </Form.Item>

        {/* 配置说明 */}
        <Form.Item>
          <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
            <div><strong>最大层级:</strong> 影响跳表的查找性能，层级越高理论性能越好</div>
            <div><strong>升级概率:</strong> 0.5 是理论最优值，提供最佳的时间复杂度</div>
            <div><strong>动画速度:</strong> 调整可视化动画的播放速度</div>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SkipListConfigPanel;