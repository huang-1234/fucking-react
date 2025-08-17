import React, { useState, useEffect, useCallback } from 'react';
import { Button, Space, Card, Typography, Steps, Tag } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, StepBackwardOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface LISVisualizerDPProps {
  array: number[];
}

interface AlgorithmState {
  dp: number[];
  maxLength: number;
  currentI: number;
  currentJ: number;
  comparing: boolean;
  updated: boolean;
  lisIndices: number[];
  stepDescription: string;
  finished: boolean;
}

const LISVisualizerDP: React.FC<LISVisualizerDPProps> = ({ array }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000); // 播放速度，毫秒
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<AlgorithmState[]>([]);
  const [maxStep, setMaxStep] = useState<number>(0);

  // 生成算法的所有步骤
  const generateSteps = useCallback(() => {
    const newSteps: AlgorithmState[] = [];
    const n = array.length;

    if (n === 0) {
      newSteps.push({
        dp: [],
        maxLength: 0,
        currentI: -1,
        currentJ: -1,
        comparing: false,
        updated: false,
        lisIndices: [],
        stepDescription: '数组为空，最长递增子序列长度为 0',
        finished: true
      });
      return newSteps;
    }

    // 初始化 dp 数组，所有元素初始值为 1
    const dp = new Array(n).fill(1);
    let maxLength = 1;

    // 添加初始状态
    newSteps.push({
      dp: [...dp],
      maxLength,
      currentI: -1,
      currentJ: -1,
      comparing: false,
      updated: false,
      lisIndices: [0], // 初始时，第一个元素自成一个子序列
      stepDescription: '初始化 dp 数组，每个元素的初始值为 1，表示至少包含自身的子序列长度',
      finished: false
    });

    // 动态规划过程
    for (let i = 1; i < n; i++) {
      // 当前考察位置 i
      newSteps.push({
        dp: [...dp],
        maxLength,
        currentI: i,
        currentJ: -1,
        comparing: false,
        updated: false,
        lisIndices: calculateLISIndices(array, dp, i),
        stepDescription: `考察位置 i = ${i}，值为 ${array[i]}`,
        finished: false
      });

      for (let j = 0; j < i; j++) {
        // 比较 array[i] 和 array[j]
        newSteps.push({
          dp: [...dp],
          maxLength,
          currentI: i,
          currentJ: j,
          comparing: true,
          updated: false,
          lisIndices: calculateLISIndices(array, dp, i),
          stepDescription: `比较 array[${i}] = ${array[i]} 和 array[${j}] = ${array[j]}`,
          finished: false
        });

        if (array[i] > array[j]) {
          // 如果 array[i] > array[j]，可以考虑更新 dp[i]
          const newDpI = Math.max(dp[i], dp[j] + 1);
          const dpUpdated = newDpI > dp[i];

          newSteps.push({
            dp: [...dp],
            maxLength,
            currentI: i,
            currentJ: j,
            comparing: false,
            updated: dpUpdated,
            lisIndices: calculateLISIndices(array, dp, i),
            stepDescription: dpUpdated
              ? `${array[i]} > ${array[j]}，更新 dp[${i}] = max(dp[${i}], dp[${j}] + 1) = max(${dp[i]}, ${dp[j]} + 1) = ${newDpI}`
              : `${array[i]} > ${array[j]}，但 dp[${i}] = ${dp[i]} 已经大于等于 dp[${j}] + 1 = ${dp[j] + 1}，不需要更新`,
            finished: false
          });

          if (dpUpdated) {
            dp[i] = newDpI;
            maxLength = Math.max(maxLength, dp[i]);

            // 更新后的状态
            newSteps.push({
              dp: [...dp],
              maxLength,
              currentI: i,
              currentJ: -1,
              comparing: false,
              updated: true,
              lisIndices: calculateLISIndices(array, dp, i),
              stepDescription: `更新后 dp[${i}] = ${dp[i]}，当前最长递增子序列长度为 ${maxLength}`,
              finished: false
            });
          }
        } else {
          // array[i] <= array[j]，不能形成递增子序列
          newSteps.push({
            dp: [...dp],
            maxLength,
            currentI: i,
            currentJ: j,
            comparing: false,
            updated: false,
            lisIndices: calculateLISIndices(array, dp, i),
            stepDescription: `${array[i]} <= ${array[j]}，不能形成递增子序列，dp[${i}] 保持为 ${dp[i]}`,
            finished: false
          });
        }
      }
    }

    // 最终结果
    newSteps.push({
      dp: [...dp],
      maxLength,
      currentI: -1,
      currentJ: -1,
      comparing: false,
      updated: false,
      lisIndices: calculateFinalLISIndices(array, dp),
      stepDescription: `算法完成，最长递增子序列长度为 ${maxLength}`,
      finished: true
    });

    return newSteps;
  }, [array]);

  // 计算当前的最长递增子序列索引
  const calculateLISIndices = (arr: number[], dp: number[], upToIndex: number): number[] => {
    let indices: number[] = [];
    let maxLength = 0;
    let endIndex = -1;

    // 找到到目前为止的最长子序列的结束索引
    for (let i = 0; i <= upToIndex; i++) {
      if (dp[i] > maxLength) {
        maxLength = dp[i];
        endIndex = i;
      }
    }

    // 如果没有找到有效的结束索引，返回空数组
    if (endIndex === -1) return [];

    // 从结束索引开始回溯，构建最长递增子序列
    let currLength = dp[endIndex];
    indices.push(endIndex);

    for (let i = endIndex - 1; i >= 0; i--) {
      if (dp[i] === currLength - 1 && arr[i] < arr[endIndex]) {
        indices.push(i);
        endIndex = i;
        currLength--;
      }
    }

    return indices.reverse(); // 反转以获得正向顺序
  };

  // 计算最终的最长递增子序列索引
  const calculateFinalLISIndices = (arr: number[], dp: number[]): number[] => {
    let maxLength = 0;
    let endIndex = -1;

    // 找到最长子序列的结束索引
    for (let i = 0; i < dp.length; i++) {
      if (dp[i] > maxLength) {
        maxLength = dp[i];
        endIndex = i;
      }
    }

    // 如果没有找到有效的结束索引，返回空数组
    if (endIndex === -1) return [];

    // 从结束索引开始回溯，构建最长递增子序列
    let indices: number[] = [];
    let currLength = dp[endIndex];
    indices.push(endIndex);

    for (let i = endIndex - 1; i >= 0; i--) {
      if (dp[i] === currLength - 1 && arr[i] < arr[indices[indices.length - 1]]) {
        indices.push(i);
        currLength--;
      }
    }

    return indices.reverse(); // 反转以获得正向顺序
  };

  // 重置可视化
  const resetVisualization = useCallback(() => {
    setPlaying(false);
    setCurrentStep(0);
    const newSteps = generateSteps();
    setSteps(newSteps);
    setMaxStep(newSteps.length - 1);
  }, [generateSteps]);

  // 当数组改变时重置可视化
  useEffect(() => {
    resetVisualization();
  }, [array, resetVisualization]);

  // 自动播放控制
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (playing && currentStep < maxStep) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (playing && currentStep >= maxStep) {
      setPlaying(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [playing, currentStep, maxStep, speed]);

  // 播放控制函数
  const togglePlay = () => setPlaying(!playing);
  const stepForward = () => currentStep < maxStep && setCurrentStep(currentStep + 1);
  const stepBackward = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  // 当前步骤的状态
  const currentState = steps[currentStep] || {
    dp: [],
    maxLength: 0,
    currentI: -1,
    currentJ: -1,
    comparing: false,
    updated: false,
    lisIndices: [],
    stepDescription: '',
    finished: false
  };

  return (
    <div className="lis-visualizer">
      <Card title="数组可视化" className="lis-array-card">
        <div className="lis-array-display">
          <Text strong>源数组：</Text>
          {array.map((num, index) => {
            const isCurrent = index === currentState.currentI;
            const isCompared = index === currentState.currentJ;
            const isInLIS = currentState.lisIndices.includes(index);

            return (
              <div
                key={index}
                className={`lis-array-item ${isCurrent ? 'current' : ''} ${isCompared ? 'compared' : ''} ${isInLIS ? 'in-lis' : ''}`}
              >
                <div className="lis-array-index">{index}</div>
                {num}
              </div>
            );
          })}
        </div>

        <div className="lis-dp-array">
          <Text strong>DP 数组：</Text>
          {currentState.dp.map((value, index) => {
            const isCurrent = index === currentState.currentI;
            const isUpdated = index === currentState.currentI && currentState.updated;

            return (
              <div
                key={index}
                className={`lis-dp-item ${isCurrent ? 'current' : ''} ${isUpdated ? 'updated' : ''}`}
              >
                {value}
              </div>
            );
          })}
        </div>

        <div className="lis-info-panel">
          <Paragraph>
            <Text strong>当前步骤：</Text> {currentStep} / {maxStep}
          </Paragraph>
          <Paragraph>
            <Text strong>描述：</Text> {currentState.stepDescription}
          </Paragraph>
          {currentState.finished && (
            <Paragraph className="lis-result">
              <Text strong>最长递增子序列长度：</Text> {currentState.maxLength}
            </Paragraph>
          )}
          {currentState.finished && currentState.lisIndices.length > 0 && (
            <Paragraph>
              <Text strong>最长递增子序列：</Text>
              [{currentState.lisIndices.map(idx => array[idx]).join(', ')}]
            </Paragraph>
          )}
        </div>
      </Card>

      <div className="lis-controls">
        <Button
          icon={<StepBackwardOutlined />}
          onClick={stepBackward}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        <Button
          icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={togglePlay}
          disabled={currentStep >= maxStep}
        >
          {playing ? '暂停' : '播放'}
        </Button>
        <Button
          icon={<StepForwardOutlined />}
          onClick={stepForward}
          disabled={currentStep >= maxStep}
        >
          下一步
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={resetVisualization}
        >
          重置
        </Button>
      </div>

      <Steps current={currentStep} size="small" progressDot style={{ marginTop: 20 }}>
        {steps.map((_, index) => (
          <Step key={index} />
        ))}
      </Steps>
    </div>
  );
};

export default React.memo(LISVisualizerDP);
