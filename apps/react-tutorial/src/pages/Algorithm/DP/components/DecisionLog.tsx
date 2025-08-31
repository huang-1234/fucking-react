import React from 'react';
import { Card, List, Typography, Tag } from 'antd';
import type { DPState } from '../al';

const { Text } = Typography;

interface DecisionLogProps {
  steps: DPState[];
  currentStep: number;
  maxSteps?: number;
}

const DecisionLog: React.FC<DecisionLogProps> = ({
  steps,
  currentStep,
  maxSteps = 5
}) => {
  // 获取要显示的步骤
  const getVisibleSteps = () => {
    if (steps.length <= maxSteps) {
      return steps;
    }

    // 计算开始和结束索引，确保当前步骤在中间
    let startIdx = Math.max(0, currentStep - Math.floor(maxSteps / 2));
    let endIdx = Math.min(steps.length, startIdx + maxSteps);

    // 如果结束索引达到了数组末尾，调整开始索引
    if (endIdx === steps.length) {
      startIdx = Math.max(0, endIdx - maxSteps);
    }

    return steps.slice(startIdx, endIdx);
  };

  const visibleSteps = getVisibleSteps();

  return (
    <Card title="决策日志" style={{ marginTop: 16 }}>
      <List
        size="small"
        bordered
        dataSource={visibleSteps}
        renderItem={(step) => (
          <List.Item style={{
            backgroundColor: step.step === currentStep ? '#e6f7ff' : 'transparent',
            borderLeft: step.step === currentStep ? '3px solid #1890ff' : 'none',
            paddingLeft: step.step === currentStep ? 13 : 16
          }}>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Tag color={step.step === currentStep ? 'blue' : 'default'}>
                  步骤 {step.step}
                </Tag>
                {step.step === currentStep && (
                  <Tag color="green">当前</Tag>
                )}
              </div>
              <Text>{step.decision}</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DecisionLog;
