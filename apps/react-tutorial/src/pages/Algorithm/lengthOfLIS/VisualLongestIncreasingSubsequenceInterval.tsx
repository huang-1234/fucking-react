import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Typography, Steps, Select, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, StepBackwardOutlined, ReloadOutlined } from '@ant-design/icons';
import { DEFAULT_PAIRS, TEST_CASES } from './data';

const { Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;



interface Pair {
  left: number;
  right: number;
}

interface AlgorithmState {
  pairs: Pair[];
  sortedPairs: Pair[];
  dp: number[];
  maxLength: number;
  currentI: number;
  currentJ: number;
  comparing: boolean;
  updated: boolean;
  chainIndices: number[];
  stepDescription: string;
  finished: boolean;
  algorithmType: 'dp' | 'greedy';
}

interface GreedyAlgorithmState {
  pairs: Pair[];
  sortedPairs: Pair[];
  currentPair: Pair | null;
  currentIndex: number;
  chain: Pair[];
  lastEnd: number;
  stepDescription: string;
  finished: boolean;
}

const VisualLongestIncreasingSubsequenceInterval: React.FC = () => {
  const [pairs, setPairs] = useState<Pair[]>(DEFAULT_PAIRS.map(p => ({ left: p[0], right: p[1] })));
  const [algorithmType, setAlgorithmType] = useState<'dp' | 'greedy'>('dp');
  const [playing, setPlaying] = useState<boolean>(false);
  const speed = 1000; // 播放速度，毫秒
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<AlgorithmState[] | GreedyAlgorithmState[]>([]);
  const [maxStep, setMaxStep] = useState<number>(0);
  const [testCase, setTestCase] = useState<string>('1');

  // 计算当前的最长数对链索引
  const calculateChainIndices = (sortedPairs: Pair[], dp: number[], upToIndex: number): number[] => {
    let indices: number[] = [];
    let maxLength = 0;
    let endIndex = -1;

    // 找到到目前为止的最长链的结束索引
    for (let i = 0; i <= upToIndex; i++) {
      if (dp[i] > maxLength) {
        maxLength = dp[i];
        endIndex = i;
      }
    }

    // 如果没有找到有效的结束索引，返回空数组
    if (endIndex === -1) return [];

    // 从结束索引开始回溯，构建最长数对链
    let currLength = dp[endIndex];
    indices.push(endIndex);

    for (let i = endIndex - 1; i >= 0; i--) {
      if (dp[i] === currLength - 1 && sortedPairs[i].right < sortedPairs[endIndex].left) {
        indices.push(i);
        endIndex = i;
        currLength--;
      }
    }

    return indices.reverse(); // 反转以获得正向顺序
  };

  // 计算最终的最长数对链索引
  const calculateFinalChainIndices = (sortedPairs: Pair[], dp: number[]): number[] => {
    let maxLength = 0;
    let endIndex = -1;

    // 找到最长链的结束索引
    for (let i = 0; i < dp.length; i++) {
      if (dp[i] > maxLength) {
        maxLength = dp[i];
        endIndex = i;
      }
    }

    // 如果没有找到有效的结束索引，返回空数组
    if (endIndex === -1) return [];

    // 从结束索引开始回溯，构建最长数对链
    let indices: number[] = [];
    let currLength = dp[endIndex];
    indices.push(endIndex);

    for (let i = endIndex - 1; i >= 0; i--) {
      if (dp[i] === currLength - 1 && sortedPairs[i].right < sortedPairs[indices[indices.length - 1]].left) {
        indices.push(i);
        currLength--;
      }
    }

    return indices.reverse(); // 反转以获得正向顺序
  };

  // 生成动态规划算法的所有步骤
  const generateDPSteps = useCallback(() => {
    const newSteps: AlgorithmState[] = [];
    const n = pairs.length;

    if (n === 0) {
      newSteps.push({
        pairs: [],
        sortedPairs: [],
        dp: [],
        maxLength: 0,
        currentI: -1,
        currentJ: -1,
        comparing: false,
        updated: false,
        chainIndices: [],
        stepDescription: '数对数组为空，最长数对链长度为 0',
        finished: true,
        algorithmType: 'dp',
      });
      return newSteps;
    }

    // 按照左端点排序
    const sortedPairs = [...pairs].sort((a, b) => a.left - b.left);

    // 初始化 dp 数组，所有元素初始值为 1
    const dp = new Array(n).fill(1);
    let maxLength = 1;

    // 添加初始状态
    newSteps.push({
      pairs,
      sortedPairs,
      dp: [...dp],
      maxLength,
      currentI: -1,
      currentJ: -1,
      comparing: false,
      updated: false,
      chainIndices: [0], // 初始时，第一个数对自成一个链
      stepDescription: '按照左端点排序数对，并初始化 dp 数组，每个元素的初始值为 1',
      finished: false,
      algorithmType: 'dp',
    });

    // 动态规划过程
    for (let i = 0; i < n; i++) {
      // 当前考察位置 i
      newSteps.push({
        pairs,
        sortedPairs,
        dp: [...dp],
        maxLength,
        currentI: i,
        currentJ: -1,
        comparing: false,
        updated: false,
        chainIndices: calculateChainIndices(sortedPairs, dp, i),
        stepDescription: `考察位置 i = ${i}，数对 [${sortedPairs[i].left}, ${sortedPairs[i].right}]`,
        finished: false,
        algorithmType: 'dp',
      });

      for (let j = 0; j < i; j++) {
        // 比较 sortedPairs[i] 和 sortedPairs[j]
        newSteps.push({
          pairs,
          sortedPairs,
          dp: [...dp],
          maxLength,
          currentI: i,
          currentJ: j,
          comparing: true,
          updated: false,
          chainIndices: calculateChainIndices(sortedPairs, dp, i),
          stepDescription: `比较数对 [${sortedPairs[i].left}, ${sortedPairs[i].right}] 和 [${sortedPairs[j].left}, ${sortedPairs[j].right}]`,
          finished: false,
          algorithmType: 'dp',
        });

        if (sortedPairs[i].left > sortedPairs[j].right) {
          // 如果当前数对的左端点大于之前数对的右端点，可以形成链
          const newDpI = Math.max(dp[i], dp[j] + 1);
          const dpUpdated = newDpI > dp[i];

          newSteps.push({
            pairs,
            sortedPairs,
            dp: [...dp],
            maxLength,
            currentI: i,
            currentJ: j,
            comparing: false,
            updated: dpUpdated,
            chainIndices: calculateChainIndices(sortedPairs, dp, i),
            stepDescription: dpUpdated
              ? `${sortedPairs[i].left} > ${sortedPairs[j].right}，可以形成链，更新 dp[${i}] = max(dp[${i}], dp[${j}] + 1) = max(${dp[i]}, ${dp[j]} + 1) = ${newDpI}`
              : `${sortedPairs[i].left} > ${sortedPairs[j].right}，可以形成链，但 dp[${i}] = ${dp[i]} 已经大于等于 dp[${j}] + 1 = ${dp[j] + 1}，不需要更新`,
            finished: false,
            algorithmType: 'dp',
          });

          if (dpUpdated) {
            dp[i] = newDpI;
            maxLength = Math.max(maxLength, dp[i]);

            // 更新后的状态
            newSteps.push({
              pairs,
              sortedPairs,
              dp: [...dp],
              maxLength,
              currentI: i,
              currentJ: -1,
              comparing: false,
              updated: true,
              chainIndices: calculateChainIndices(sortedPairs, dp, i),
              stepDescription: `更新后 dp[${i}] = ${dp[i]}，当前最长数对链长度为 ${maxLength}`,
              finished: false,
              algorithmType: 'dp',
            });
          }
        } else {
          // 不能形成链
          newSteps.push({
            pairs,
            sortedPairs,
            dp: [...dp],
            maxLength,
            currentI: i,
            currentJ: j,
            comparing: false,
            updated: false,
            chainIndices: calculateChainIndices(sortedPairs, dp, i),
            stepDescription: `${sortedPairs[i].left} <= ${sortedPairs[j].right}，不能形成链，dp[${i}] 保持为 ${dp[i]}`,
            finished: false,
            algorithmType: 'dp',
          });
        }
      }
    }

    // 最终结果
    newSteps.push({
      pairs,
      sortedPairs,
      dp: [...dp],
      maxLength,
      currentI: -1,
      currentJ: -1,
      comparing: false,
      updated: false,
      chainIndices: calculateFinalChainIndices(sortedPairs, dp),
      stepDescription: `算法完成，最长数对链长度为 ${maxLength}`,
      finished: true,
      algorithmType: 'dp',
    });

    return newSteps;
  }, [pairs]);

  // 生成贪心算法的所有步骤
  const generateGreedySteps = useCallback(() => {
    const newSteps: GreedyAlgorithmState[] = [];
    const n = pairs.length;

    if (n === 0) {
      newSteps.push({
        pairs: [],
        sortedPairs: [],
        currentPair: null,
        currentIndex: -1,
        chain: [],
        lastEnd: -Infinity,
        stepDescription: '数对数组为空，最长数对链长度为 0',
        finished: true,
      });
      return newSteps;
    }

    // 按照右端点排序
    const sortedPairs = [...pairs].sort((a, b) => a.right - b.right);

    // 添加初始状态
    newSteps.push({
      pairs,
      sortedPairs,
      currentPair: null,
      currentIndex: -1,
      chain: [],
      lastEnd: -Infinity,
      stepDescription: '按照右端点排序数对，准备贪心选择',
      finished: false,
    });

    // 贪心算法过程
    const chain: Pair[] = [];
    let lastEnd = -Infinity;

    for (let i = 0; i < n; i++) {
      const currentPair = sortedPairs[i];

      // 当前考察的数对
      newSteps.push({
        pairs,
        sortedPairs,
        currentPair,
        currentIndex: i,
        chain: [...chain],
        lastEnd,
        stepDescription: `考察数对 [${currentPair.left}, ${currentPair.right}]`,
        finished: false,
      });

      if (currentPair.left > lastEnd) {
        // 可以添加到链中
        chain.push(currentPair);
        const prevLastEnd = lastEnd;
        lastEnd = currentPair.right;

        newSteps.push({
          pairs,
          sortedPairs,
          currentPair,
          currentIndex: i,
          chain: [...chain],
          lastEnd,
          stepDescription: `${currentPair.left} > ${prevLastEnd}，可以添加到链中，更新 lastEnd = ${currentPair.right}`,
          finished: false,
        });
      } else {
        // 不能添加到链中
        newSteps.push({
          pairs,
          sortedPairs,
          currentPair,
          currentIndex: i,
          chain: [...chain],
          lastEnd,
          stepDescription: `${currentPair.left} <= ${lastEnd}，不能添加到链中`,
          finished: false,
        });
      }
    }

    // 最终结果
    newSteps.push({
      pairs,
      sortedPairs,
      currentPair: null,
      currentIndex: -1,
      chain,
      lastEnd,
      stepDescription: `算法完成，最长数对链长度为 ${chain.length}`,
      finished: true,
    });

    return newSteps;
  }, [pairs]);

  // 重置可视化
  const resetVisualization = useCallback(() => {
    setPlaying(false);
    setCurrentStep(0);
    const newSteps = algorithmType === 'dp' ? generateDPSteps() : generateGreedySteps();
    setSteps(newSteps);
    setMaxStep(newSteps.length - 1);
  }, [algorithmType, generateDPSteps, generateGreedySteps]);

  // 当算法类型或数对数组改变时重置可视化
  useEffect(() => {
    resetVisualization();
  }, [algorithmType, pairs, resetVisualization]);

  // 处理测试用例变更
  useEffect(() => {
    const selectedCase = TEST_CASES.find(c => c.value === testCase);
    if (selectedCase) {
      setPairs(selectedCase.pairs.map(p => ({ left: p[0], right: p[1] })));
    }
  }, [testCase]);

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
  const currentState = steps[currentStep];

  // 渲染数对
  const renderPair = (pair: Pair, index: number, isInChain: boolean, isCurrent: boolean, isCompared: boolean) => {
    const style: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '40px',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      margin: '4px',
      position: 'relative',
    };

    if (isCurrent) {
      style.borderColor = '#1890ff';
      style.backgroundColor = '#e6f7ff';
    }

    if (isCompared) {
      style.borderColor = '#faad14';
      style.backgroundColor = '#fffbe6';
    }

    if (isInChain) {
      style.borderColor = '#52c41a';
      style.backgroundColor = '#f6ffed';
    }

    return (
      <div key={index} style={style}>
        <div style={{ position: 'absolute', top: '-20px', fontSize: '12px', color: '#888' }}>{index}</div>
        [{pair.left}, {pair.right}]
      </div>
    );
  };

  return (
    <div className="lis-visualizer">
      <Card title="最长数对链可视化" className="lis-array-card">
        <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
          <Text strong>算法类型：</Text>
          <Select
            value={algorithmType}
            onChange={setAlgorithmType}
            style={{ width: 200 }}
          >
            <Option value="dp">动态规划 O(n²)</Option>
            <Option value="greedy">贪心算法 O(nlogn)</Option>
          </Select>

          <Text strong>测试用例：</Text>
          <Select
            value={testCase}
            onChange={setTestCase}
            style={{ width: 200 }}
          >
            {TEST_CASES.map(c => (
              <Option key={c.value} value={c.value}>{c.label}</Option>
            ))}
          </Select>
        </Space>

        <div style={{ marginBottom: '20px' }}>
          <Text strong>原始数对数组：</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '8px' }}>
            {pairs.map((pair, index) => {
              const isInChain = algorithmType === 'dp'
                ? (currentState as AlgorithmState)?.chainIndices?.includes(index)
                : (currentState as GreedyAlgorithmState)?.chain?.some(p => p.left === pair.left && p.right === pair.right);

              const isCurrent = algorithmType === 'dp'
                ? index === (currentState as AlgorithmState)?.currentI
                : (currentState as GreedyAlgorithmState)?.currentIndex === index;

              const isCompared = algorithmType === 'dp'
                ? index === (currentState as AlgorithmState)?.currentJ
                : false;

              return renderPair(pair, index, isInChain, isCurrent, isCompared);
            })}
          </div>
        </div>

        {algorithmType === 'dp' && (currentState as AlgorithmState)?.dp && (
          <div style={{ marginBottom: '20px' }}>
            <Text strong>DP 数组：</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '8px' }}>
              {(currentState as AlgorithmState).dp.map((value, index) => {
                const isCurrent = index === (currentState as AlgorithmState).currentI;
                const isUpdated = index === (currentState as AlgorithmState).currentI && (currentState as AlgorithmState).updated;

                const style: React.CSSProperties = {
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  margin: '4px',
                };

                if (isCurrent) {
                  style.borderColor = '#1890ff';
                  style.backgroundColor = '#e6f7ff';
                }

                if (isUpdated) {
                  style.borderColor = '#52c41a';
                  style.backgroundColor = '#f6ffed';
                }

                return (
                  <div key={index} style={style}>
                    {value}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {algorithmType === 'greedy' && (currentState as GreedyAlgorithmState)?.chain && (
          <div style={{ marginBottom: '20px' }}>
            <Text strong>当前链：</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '8px' }}>
              {(currentState as GreedyAlgorithmState).chain.map((pair, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '40px',
                    border: '1px solid #52c41a',
                    borderRadius: '4px',
                    margin: '4px',
                    backgroundColor: '#f6ffed',
                  }}
                >
                  [{pair.left}, {pair.right}]
                </div>
              ))}
            </div>
            <Text>最后一个数对的右端点：{(currentState as GreedyAlgorithmState).lastEnd}</Text>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5'
        }}>
          <Paragraph>
            <Text strong>当前步骤：</Text> {currentStep} / {maxStep}
          </Paragraph>
          <Paragraph>
            <Text strong>描述：</Text> {currentState?.stepDescription}
          </Paragraph>
          {currentState?.finished && (
            <Paragraph style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '16px' }}>
              <Text strong>最长数对链长度：</Text> {
                algorithmType === 'dp'
                  ? (currentState as AlgorithmState).maxLength
                  : (currentState as GreedyAlgorithmState).chain.length
              }
            </Paragraph>
          )}
        </div>
      </Card>

      <div style={{
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
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

export default React.memo(VisualLongestIncreasingSubsequenceInterval);