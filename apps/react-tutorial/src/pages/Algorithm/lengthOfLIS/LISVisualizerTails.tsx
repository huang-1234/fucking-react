import React, { useState, useEffect, useCallback } from 'react';
import { Button, Space, Card, Typography, Steps, Tag } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, StepBackwardOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface LISVisualizerTailsProps {
  array: number[];
}

interface BinarySearchState {
  left: number;
  right: number;
  mid: number;
  target: number;
  found: boolean;
  insertPosition: number;
}

interface AlgorithmState {
  tails: number[];
  currentNum: number;
  currentIndex: number;
  binarySearch: BinarySearchState | null;
  stepDescription: string;
  lisIndices: number[];
  finished: boolean;
  binarySearchStep: boolean;
  replaced: boolean;
  extended: boolean;
}

const LISVisualizerTails: React.FC<LISVisualizerTailsProps> = ({ array }) => {
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
        tails: [],
        currentNum: 0,
        currentIndex: -1,
        binarySearch: null,
        stepDescription: '数组为空，最长递增子序列长度为 0',
        lisIndices: [],
        finished: true,
        binarySearchStep: false,
        replaced: false,
        extended: false
      });
      return newSteps;
    }

    // 初始化 tails 数组和 lisIndices 数组
    const tails: number[] = [];
    const lisIndices: number[] = [];
    const tailsIndices: number[] = []; // 记录 tails 中每个位置对应的原数组索引

    // 添加初始状态
    newSteps.push({
      tails: [],
      currentNum: array[0],
      currentIndex: 0,
      binarySearch: null,
      stepDescription: '开始处理数组的第一个元素',
      lisIndices: [],
      finished: false,
      binarySearchStep: false,
      replaced: false,
      extended: false
    });

    // 处理第一个元素
    tails.push(array[0]);
    tailsIndices.push(0);
    lisIndices.push(0);

    newSteps.push({
      tails: [...tails],
      currentNum: array[0],
      currentIndex: 0,
      binarySearch: null,
      stepDescription: `将第一个元素 ${array[0]} 添加到 tails 数组`,
      lisIndices: [...lisIndices],
      finished: false,
      binarySearchStep: false,
      replaced: false,
      extended: true
    });

    // 处理剩余元素
    for (let i = 1; i < n; i++) {
      const num = array[i];

      // 当前考察的元素
      newSteps.push({
        tails: [...tails],
        currentNum: num,
        currentIndex: i,
        binarySearch: null,
        stepDescription: `考察元素 array[${i}] = ${num}`,
        lisIndices: [...lisIndices],
        finished: false,
        binarySearchStep: false,
        replaced: false,
        extended: false
      });

      // 二分查找过程
      let left = 0;
      let right = tails.length - 1;
      let insertPos = tails.length; // 默认插入位置

      // 二分查找开始
      newSteps.push({
        tails: [...tails],
        currentNum: num,
        currentIndex: i,
        binarySearch: {
          left,
          right,
          mid: -1,
          target: num,
          found: false,
          insertPosition: -1
        },
        stepDescription: `开始二分查找，寻找 ${num} 在 tails 数组中的位置`,
        lisIndices: [...lisIndices],
        finished: false,
        binarySearchStep: true,
        replaced: false,
        extended: false
      });

      // 二分查找过程
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        // 二分查找中间步骤
        newSteps.push({
          tails: [...tails],
          currentNum: num,
          currentIndex: i,
          binarySearch: {
            left,
            right,
            mid,
            target: num,
            found: false,
            insertPosition: -1
          },
          stepDescription: `二分查找：left=${left}, mid=${mid}, right=${right}, 比较 ${num} 和 ${tails[mid]}`,
          lisIndices: [...lisIndices],
          finished: false,
          binarySearchStep: true,
          replaced: false,
          extended: false
        });

        if (tails[mid] < num) {
          left = mid + 1;

          // 更新二分查找状态
          newSteps.push({
            tails: [...tails],
            currentNum: num,
            currentIndex: i,
            binarySearch: {
              left,
              right,
              mid,
              target: num,
              found: false,
              insertPosition: -1
            },
            stepDescription: `${tails[mid]} < ${num}，向右收缩查找范围，left = ${left}`,
            lisIndices: [...lisIndices],
            finished: false,
            binarySearchStep: true,
            replaced: false,
            extended: false
          });
        } else {
          right = mid - 1;
          insertPos = mid; // 更新插入位置

          // 更新二分查找状态
          newSteps.push({
            tails: [...tails],
            currentNum: num,
            currentIndex: i,
            binarySearch: {
              left,
              right,
              mid,
              target: num,
              found: false,
              insertPosition: insertPos
            },
            stepDescription: `${tails[mid]} >= ${num}，向左收缩查找范围，right = ${right}，更新插入位置 = ${insertPos}`,
            lisIndices: [...lisIndices],
            finished: false,
            binarySearchStep: true,
            replaced: false,
            extended: false
          });
        }
      }

      // 二分查找结束
      newSteps.push({
        tails: [...tails],
        currentNum: num,
        currentIndex: i,
        binarySearch: {
          left,
          right,
          mid: -1,
          target: num,
          found: insertPos < tails.length && tails[insertPos] === num,
          insertPosition: insertPos
        },
        stepDescription: `二分查找结束，${num} 应该插入到位置 ${insertPos}`,
        lisIndices: [...lisIndices],
        finished: false,
        binarySearchStep: true,
        replaced: false,
        extended: false
      });

      // 更新 tails 数组
      if (insertPos === tails.length) {
        // 扩展序列
        tails.push(num);
        tailsIndices.push(i);
        lisIndices.push(i);

        newSteps.push({
          tails: [...tails],
          currentNum: num,
          currentIndex: i,
          binarySearch: null,
          stepDescription: `${num} 大于 tails 中的所有元素，将其添加到 tails 末尾，扩展序列长度为 ${tails.length}`,
          lisIndices: [...lisIndices],
          finished: false,
          binarySearchStep: false,
          replaced: false,
          extended: true
        });
      } else {
        // 替换元素
        const oldValue = tails[insertPos];
        tails[insertPos] = num;
        tailsIndices[insertPos] = i;

        // 更新 lisIndices，保持最优路径
        const newLisIndices = reconstructLIS(array, tailsIndices, insertPos);
        lisIndices.length = 0;
        lisIndices.push(...newLisIndices);

        newSteps.push({
          tails: [...tails],
          currentNum: num,
          currentIndex: i,
          binarySearch: null,
          stepDescription: `用 ${num} 替换 tails[${insertPos}] = ${oldValue}，保持序列的最小结尾值`,
          lisIndices: [...lisIndices],
          finished: false,
          binarySearchStep: false,
          replaced: true,
          extended: false
        });
      }
    }

    // 最终结果
    newSteps.push({
      tails: [...tails],
      currentNum: -1,
      currentIndex: -1,
      binarySearch: null,
      stepDescription: `算法完成，最长递增子序列长度为 ${tails.length}`,
      lisIndices: [...lisIndices],
      finished: true,
      binarySearchStep: false,
      replaced: false,
      extended: false
    });

    return newSteps;
  }, [array]);

  // 重建最长递增子序列的索引
  const reconstructLIS = (arr: number[], tailsIndices: number[], upToLength: number): number[] => {
    const result: number[] = [];

    // 从 tails 数组中提取对应的原始索引
    for (let i = 0; i <= upToLength; i++) {
      result.push(tailsIndices[i]);
    }

    return result;
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
    tails: [],
    currentNum: 0,
    currentIndex: -1,
    binarySearch: null,
    stepDescription: '',
    lisIndices: [],
    finished: false,
    binarySearchStep: false,
    replaced: false,
    extended: false
  };

  return (
    <div className="lis-visualizer">
      <Card title="数组可视化" className="lis-array-card">
        <div className="lis-array-display">
          {array.map((num, index) => {
            const isCurrent = index === currentState.currentIndex;
            const isInLIS = currentState.lisIndices.includes(index);

            return (
              <div
                key={index}
                className={`lis-array-item ${isCurrent ? 'current' : ''} ${isInLIS ? 'in-lis' : ''}`}
              >
                <div className="lis-array-index">{index}</div>
                {num}
              </div>
            );
          })}
        </div>

        <div className="lis-tails-array">
          <Text strong>Tails 数组：</Text>
          {currentState.tails.map((value, index) => {
            const isHighlighted = currentState.binarySearch &&
              (index === currentState.binarySearch.mid ||
               index === currentState.binarySearch.insertPosition);
            const isReplaced = currentState.replaced &&
              index === (currentState.binarySearch?.insertPosition ?? -1);
            const isExtended = currentState.extended &&
              index === currentState.tails.length - 1;

            return (
              <div
                key={index}
                className={`lis-dp-item ${isHighlighted ? 'current' : ''} ${isReplaced ? 'updated' : ''} ${isExtended ? 'updated' : ''}`}
              >
                {value}
              </div>
            );
          })}
        </div>

        {currentState.binarySearch && (
          <div className="lis-info-panel" style={{ marginBottom: 16 }}>
            <Text strong>二分查找：</Text>
            <Paragraph>
              目标值：{currentState.currentNum}
            </Paragraph>
            <Paragraph>
              查找范围：left = {currentState.binarySearch.left}, right = {currentState.binarySearch.right}
            </Paragraph>
            {currentState.binarySearch.mid >= 0 && (
              <Paragraph>
                中间值：mid = {currentState.binarySearch.mid}, tails[mid] = {currentState.tails[currentState.binarySearch.mid]}
              </Paragraph>
            )}
            {currentState.binarySearch.insertPosition >= 0 && (
              <Paragraph>
                插入位置：{currentState.binarySearch.insertPosition}
              </Paragraph>
            )}
          </div>
        )}

        <div className="lis-info-panel">
          <Paragraph>
            <Text strong>当前步骤：</Text> {currentStep} / {maxStep}
          </Paragraph>
          <Paragraph>
            <Text strong>描述：</Text> {currentState.stepDescription}
          </Paragraph>
          {currentState.finished && (
            <Paragraph className="lis-result">
              <Text strong>最长递增子序列长度：</Text> {currentState.tails.length}
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

export default  React.memo(LISVisualizerTails);
