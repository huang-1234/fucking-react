import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Space, Typography, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { demoSteps } from './common';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;



const SkipListDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  // 模拟代码执行
  const executeStep = (stepIndex: number) => {
    const step = demoSteps[stepIndex];
    const newOutput = [...output];

    // 模拟执行结果
    switch (stepIndex) {
      case 0:
        newOutput.push('跳表已创建，最大层级: 16，升级概率: 0.5');
        break;
      case 1:
        newOutput.push('插入结果: true');
        newOutput.push('当前数据: [5]');
        break;
      case 2:
        newOutput.push('插入 3: true');
        newOutput.push('插入 8: true');
        newOutput.push('插入 1: true');
        newOutput.push('插入 9: true');
        newOutput.push('当前数据: [1, 3, 5, 8, 9]');
        break;
      case 3:
        newOutput.push('找到节点，值为: 8');
        break;
      case 4:
        newOutput.push('删除结果: true');
        newOutput.push('删除后数据: [1, 5, 8, 9]');
        break;
      case 5:
        newOutput.push('第0层: [1, 5, 8, 9]');
        newOutput.push('第1层: [1, 8, 9]');
        newOutput.push('第2层: [8]');
        break;
    }

    setOutput(newOutput);
  };

  // 自动播放
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && currentStep < demoSteps.length) {
      timer = setTimeout(() => {
        executeStep(currentStep);
        setCurrentStep(prev => prev + 1);
      }, 2000);
    } else if (currentStep >= demoSteps.length) {
      setIsPlaying(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (currentStep >= demoSteps.length) {
      handleReset();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setOutput([]);
  };

  const handleStepClick = (step: number) => {
    if (!isPlaying) {
      setCurrentStep(step);
      // 执行到指定步骤
      const newOutput: string[] = [];
      for (let i = 0; i < step; i++) {
        // 这里可以添加每步的输出逻辑
      }
      setOutput(newOutput);
    }
  };

  return (
    <Card title="跳表操作演示" style={{ marginBottom: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 控制按钮 */}
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handlePlay}
            disabled={isPlaying}
          >
            播放
          </Button>
          <Button
            icon={<PauseCircleOutlined />}
            onClick={handlePause}
            disabled={!isPlaying}
          >
            暂停
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            重置
          </Button>
        </Space>

        {/* 步骤展示 */}
        <Steps
          current={currentStep}
          direction="vertical"
          size="small"
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          {demoSteps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              onClick={() => handleStepClick(index)}
              style={{ cursor: isPlaying ? 'default' : 'pointer' }}
            />
          ))}
        </Steps>

        {/* 当前步骤详情 */}
        {currentStep > 0 && currentStep <= demoSteps.length && (
          <Alert
            message={demoSteps[currentStep - 1]?.title}
            description={demoSteps[currentStep - 1]?.explanation}
            type="info"
            showIcon
          />
        )}

        {/* 代码展示 */}
        {currentStep > 0 && currentStep <= demoSteps.length && (
          <Card size="small" title="执行代码">
            <pre style={{
              background: '#f6f8fa',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
            }}>
              {typeof demoSteps[currentStep - 1]?.code === 'string' ? demoSteps[currentStep - 1]?.code: demoSteps[currentStep - 1]?.code?.()}
            </pre>
          </Card>
        )}

        {/* 输出结果 */}
        {output.length > 0 && (
          <Card size="small" title="执行结果">
            <div style={{
              background: '#000',
              color: '#00ff00',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {output.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </Card>
        )}

        {/* 概念说明 */}
        <Card size="small" title="跳表核心概念">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>多层索引：</Text>
              <Text>跳表通过多层链表实现快速查找，上层作为下层的索引</Text>
            </div>
            <div>
              <Text strong>概率平衡：</Text>
              <Text>通过随机化避免了复杂的平衡操作，实现简单</Text>
            </div>
            <div>
              <Text strong>有序性：</Text>
              <Text>底层链表始终保持有序，支持高效的范围查询</Text>
            </div>
            <div>
              <Text strong>时间复杂度：</Text>
              <Text>平均情况下查找、插入、删除都是 O(log n)</Text>
            </div>
          </Space>
        </Card>
      </Space>
    </Card>
  );
};

export default SkipListDemo;