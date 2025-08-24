import React from 'react';
import { Card, Button, Slider, Space, Select, Row, Col, Typography } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface DPControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStepChange: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const DPControls: React.FC<DPControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onPlay,
  onPause,
  onReset,
  onNext,
  onPrev,
  onStepChange,
  onSpeedChange
}) => {
  return (
    <Card title="控制面板">
      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              icon={<StepBackwardOutlined />}
              onClick={onPrev}
              disabled={currentStep <= 0 || isPlaying}
            />
            {isPlaying ? (
              <Button
                type="primary"
                icon={<PauseCircleOutlined />}
                onClick={onPause}
              >
                暂停
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={onPlay}
                disabled={currentStep >= totalSteps - 1}
              >
                播放
              </Button>
            )}
            <Button
              icon={<StepForwardOutlined />}
              onClick={onNext}
              disabled={currentStep >= totalSteps - 1 || isPlaying}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              disabled={isPlaying}
            >
              重置
            </Button>
          </Space>
        </Col>

        <Col span={18}>
          <Slider
            min={0}
            max={totalSteps - 1}
            value={currentStep}
            onChange={onStepChange}
            disabled={isPlaying}
            marks={{
              0: '开始',
              [totalSteps - 1]: '结束'
            }}
          />
        </Col>
        <Col span={6}>
          <Space>
            <Text>步骤:</Text>
            <Text strong>{`${currentStep + 1}/${totalSteps}`}</Text>
          </Space>
        </Col>

        <Col span={24}>
          <Space>
            <Text>播放速度:</Text>
            <Select
              value={playbackSpeed}
              onChange={onSpeedChange}
              style={{ width: 100 }}
            >
              <Option value={0.5}>0.5x</Option>
              <Option value={1}>1x</Option>
              <Option value={1.5}>1.5x</Option>
              <Option value={2}>2x</Option>
            </Select>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DPControls;
