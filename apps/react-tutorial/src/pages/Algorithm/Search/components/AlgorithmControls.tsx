import React from 'react';
import { Button, Slider, Space, Tooltip, InputNumber, Select, Form } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';

interface AlgorithmControlsProps {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前步骤 */
  currentStep: number;
  /** 总步骤数 */
  totalSteps: number;
  /** 播放速度 (毫秒) */
  speed: number;
  /** 算法选项 */
  algorithmOptions?: { value: string; label: string }[];
  /** 当前选择的算法 */
  selectedAlgorithm?: string;
  /** 是否显示设置 */
  showSettings?: boolean;
  /** 播放回调 */
  onPlay: () => void;
  /** 暂停回调 */
  onPause: () => void;
  /** 重置回调 */
  onReset: () => void;
  /** 下一步回调 */
  onStepForward: () => void;
  /** 上一步回调 */
  onStepBackward: () => void;
  /** 速度改变回调 */
  onSpeedChange: (speed: number) => void;
  /** 步骤改变回调 */
  onStepChange?: (step: number) => void;
  /** 算法改变回调 */
  onAlgorithmChange?: (algorithm: string) => void;
}

const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  algorithmOptions,
  selectedAlgorithm,
  showSettings = true,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onStepChange,
  onAlgorithmChange
}) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* 算法选择 */}
      {algorithmOptions && algorithmOptions.length > 0 && (
        <Form.Item label="算法选择" style={{ marginBottom: 16 }}>
          <Select
            value={selectedAlgorithm}
            onChange={onAlgorithmChange}
            options={algorithmOptions}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}

      {/* 控制按钮 */}
      <Space style={{ width: '100%', justifyContent: 'center' }}>
        <Tooltip title="重置">
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            shape="circle"
          />
        </Tooltip>
        <Tooltip title="上一步">
          <Button
            icon={<StepBackwardOutlined />}
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            shape="circle"
          />
        </Tooltip>
        {isPlaying ? (
          <Tooltip title="暂停">
            <Button
              type="primary"
              icon={<PauseCircleOutlined />}
              onClick={onPause}
              shape="circle"
              size="large"
            />
          </Tooltip>
        ) : (
          <Tooltip title="播放">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={onPlay}
              shape="circle"
              size="large"
              disabled={currentStep >= totalSteps}
            />
          </Tooltip>
        )}
        <Tooltip title="下一步">
          <Button
            icon={<StepForwardOutlined />}
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            shape="circle"
          />
        </Tooltip>
        {showSettings && (
          <Tooltip title="设置">
            <Button
              icon={<SettingOutlined />}
              shape="circle"
            />
          </Tooltip>
        )}
      </Space>

      {/* 进度条 */}
      <Space.Compact style={{ width: '100%', marginTop: 16 }}>
        <Slider
          min={0}
          max={totalSteps}
          value={currentStep}
          onChange={onStepChange}
          style={{ flex: 1 }}
          tooltip={{ formatter: (value) => `步骤 ${value}/${totalSteps}` }}
        />
        <InputNumber
          min={0}
          max={totalSteps}
          value={currentStep}
          onChange={onStepChange}
          style={{ width: 70 }}
        />
      </Space.Compact>

      {/* 速度控制 */}
      <Form.Item label="速度控制" style={{ marginTop: 16, marginBottom: 0 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Slider
            min={50}
            max={2000}
            step={50}
            value={speed}
            onChange={onSpeedChange}
            style={{ flex: 1 }}
            tooltip={{ formatter: (value) => `${value} ms` }}
            marks={{
              50: '快',
              1000: '中',
              2000: '慢'
            }}
            reverse
          />
          <InputNumber
            min={50}
            max={2000}
            step={50}
            value={speed}
            onChange={(value) => onSpeedChange(value || 500)}
            style={{ width: 70 }}
            formatter={(value) => `${value}ms`}
            parser={(value) => Number(value?.replace('ms', '') || 500)}
          />
        </Space.Compact>
      </Form.Item>
    </Space>
  );
};

export default AlgorithmControls;
