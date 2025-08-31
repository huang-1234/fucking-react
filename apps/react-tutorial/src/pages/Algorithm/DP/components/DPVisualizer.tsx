import React, { useState } from 'react';
import { Row, Col, Card, Typography, Alert, Tabs } from 'antd';
import { useDP } from '../hooks/useDP';
import DPGraph from './DPGraph';
import DecisionLog from './DecisionLog';
import DPControls from './DPControls';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface DPVisualizerProps {
  title: string;
  description: string;
  algorithm: 'houseRobber' | 'lis' | 'knapsack01';
  inputs: any[];
  originalData?: number[];
}

const DPVisualizer: React.FC<DPVisualizerProps> = ({
  title,
  description,
  algorithm,
  inputs,
  originalData
}) => {
  const {
    steps,
    currentStep,
    currentState,
    isPlaying,
    playbackSpeed,
    totalSteps,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    goToStep,
    setSpeed
  } = useDP(algorithm, ...inputs);

  return (
    <div style={{ padding: '16px 0' }}>
      <Card>
        <Title level={3}>{title}</Title>
        <Paragraph>{description}</Paragraph>

        {currentState && (
          <Alert
            message={`当前决策: ${currentState.decision}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <DPGraph
              data={currentState?.dp || []}
              originalData={originalData}
              highlightIndices={currentState?.highlightIndices}
              title="动态规划数组"
            />
          </Col>
          <Col xs={24} lg={8}>
            <DPControls
              currentStep={currentStep}
              totalSteps={totalSteps}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onNext={nextStep}
              onPrev={prevStep}
              onStepChange={goToStep}
              onSpeedChange={setSpeed}
            />
          </Col>
          <Col span={24}>
            <DecisionLog
              steps={steps}
              currentStep={currentStep}
              maxSteps={10}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DPVisualizer;
