import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Typography, Space, Slider, Divider, Table, Input, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { generateLISSteps, lengthOfLISAsync } from '../al/lengthOfLIS';
import type { StepCbParamsBase, StepCbLIS } from '../al/step';
import CodeDisplay from '../components/CodeDisplay';
import './styles.less';

const { Title, Text, Paragraph } = Typography;

interface Step extends StepCbLIS {
  // 继承自StepCbLIS，已经包含了所需的所有属性
}

interface DPCell {
  value: number;
  isHighlighted: boolean;
  isPrev: boolean;
  isInSequence: boolean;
}

// 核心算法代码
const coreCode = `function lengthOfLIS(nums: number[]): number {
  if (!nums.length) return 0;

  const n = nums.length;
  const dp: number[] = new Array(n).fill(1); // 每个元素至少是长度为1的子序列

  // 状态转移
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  // 找出最大值
  return Math.max(...dp);
}

// 贪心 + 二分查找优化版本 O(n log n)
function lengthOfLISOptimized(nums: number[]): number {
  if (!nums.length) return 0;

  const tails: number[] = [];

  for (const num of nums) {
    let left = 0, right = tails.length;

    // 二分查找
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // 如果找到了合适的位置，更新tails数组
    if (left === tails.length) {
      tails.push(num);
    } else {
      tails[left] = num;
    }
  }

  return tails.length;
}

// 重建最长上升子序列
function getLISSequence(nums: number[], dp: number[]): number[] {
  const n = nums.length;
  let maxLength = 0;
  let maxIndex = 0;

  // 找到最大长度和对应的索引
  for (let i = 0; i < n; i++) {
    if (dp[i] > maxLength) {
      maxLength = dp[i];
      maxIndex = i;
    }
  }

  // 从后向前重建序列
  const sequence: number[] = [];
  let currLength = maxLength;
  let currIndex = maxIndex;

  for (let i = currIndex; i >= 0; i--) {
    if (dp[i] === currLength) {
      sequence.unshift(nums[i]);
      currLength--;
    }
  }

  return sequence;
}`;

const LongestIncreasingSubsequenceVisualizer: React.FC = () => {
  // 输入参数
  const [nums, setNums] = useState<number[]>([10, 9, 2, 5, 3, 7, 101, 18]);
  const [numsInput, setNumsInput] = useState<string>('10,9,2,5,3,7,101,18');

  // DP表格数据
  const [dp, setDp] = useState<DPCell[]>([]);
  const [result, setResult] = useState<number>(0);
  const [sequence, setSequence] = useState<number[]>([]);

  // 可视化状态
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(2);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showSequence, setShowSequence] = useState<boolean>(true);

  // 图表引用
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);

  // 初始化
  useEffect(() => {
    calculateDP();

    // 初始化图表
    if (chartRef.current) {
      const newChart = echarts.init(chartRef.current);
      setChart(newChart);
    }

    // 清理函数
    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, []);

  // 窗口大小变化时重新调整图表
  useEffect(() => {
    const handleResize = () => {
      if (chart) {
        chart.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chart]);

  // 更新当前步骤的可视化
  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      updateVisualization(currentStep);
    }
  }, [currentStep]);

  // 高亮最长上升子序列
  useEffect(() => {
    if (showSequence && sequence.length > 0) {
      highlightSequence();
    } else {
      // 移除序列高亮
      const newDp = [...dp];
      for (let i = 0; i < newDp.length; i++) {
        if (newDp[i]) {
          newDp[i] = { ...newDp[i], isInSequence: false };
        }
      }
      setDp(newDp);
    }
  }, [showSequence, sequence]);

  // 更新图表
  useEffect(() => {
    if (chart && dp.length > 0) {
      updateChart();
    }
  }, [dp, chart]);

  // 解析输入数组
  const parseInputArray = () => {
    try {
      const parsed = numsInput.split(',').map(s => parseInt(s.trim(), 10));
      if (parsed.some(isNaN)) {
        throw new Error('包含非数字');
      }
      setNums(parsed);
    } catch (error) {
      alert('请输入有效的数字数组，用逗号分隔');
    }
  };

  // 设置示例数组
  const setExample1 = () => {
    setNumsInput('10,9,2,5,3,7,101,18');
    setNums([10, 9, 2, 5, 3, 7, 101, 18]);
  };

  const setExample2 = () => {
    setNumsInput('0,1,0,3,2,3');
    setNums([0, 1, 0, 3, 2, 3]);
  };

  const setExample3 = () => {
    setNumsInput('7,7,7,7,7,7,7');
    setNums([7, 7, 7, 7, 7, 7, 7]);
  };

  // 计算DP表和步骤
  const calculateDP = () => {
    if (!nums.length) return;

    const { steps: newSteps, result: res, dp: dpArray, sequence: seq } = generateLISSteps(nums);

    // 初始化DP表
    const newDp: DPCell[] = Array(nums.length).fill(0).map((_, i) => ({
      value: dpArray[i],
      isHighlighted: false,
      isPrev: false,
      isInSequence: false
    }));

    setDp(newDp);
    setResult(res);
    setSequence(seq);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // 异步计算DP表，实时可视化每一步
  const calculateDPAsync = async () => {
    if (!nums.length) return;

    setIsCalculating(true);
    setIsPlaying(false);

    // 初始化DP表
    const newDp: DPCell[] = Array(nums.length).fill(0).map(() => ({
      value: 1, // 初始值都是1
      isHighlighted: false,
      isPrev: false,
      isInSequence: false
    }));

    setDp(newDp);
    setSteps([]);

    const newSteps: Step[] = [];

    // 定义每一步的回调函数
    const onStep = (step: StepCbLIS) => {
      newSteps.push(step as Step);

      // 更新DP表
      const dpCopy = [...newDp];

      // 重置高亮
      for (let i = 0; i < dpCopy.length; i++) {
        dpCopy[i] = {
          ...dpCopy[i],
          isHighlighted: false,
          isPrev: false
        };
      }

      // 设置当前值和高亮
      if (step.i >= 0 && step.i < dpCopy.length) {
        dpCopy[step.i] = {
          ...dpCopy[step.i],
          value: step.value,
          isHighlighted: true
        };
      }

      // 高亮依赖值
      if (step.j !== null && step.j >= 0 && step.j < dpCopy.length) {
        dpCopy[step.j] = {
          ...dpCopy[step.j],
          isPrev: true
        };
      }

      setDp([...dpCopy]);
    };

    // 执行异步算法
    const result = await lengthOfLISAsync(
      nums,
      onStep,
      1000 / playSpeed
    );

    setResult(result.result);
    setSequence(result.sequence);
    setSteps(newSteps);
    setIsCalculating(false);
  };

  // 更新可视化状态
  const updateVisualization = (stepIndex: number) => {
    const step = steps[stepIndex];
    const newDp = [...dp];

    // 重置所有单元格的高亮状态
    for (let i = 0; i < newDp.length; i++) {
      newDp[i] = {
        ...newDp[i],
        isHighlighted: false,
        isPrev: false
      };
    }

    // 高亮当前单元格
    if (step.i >= 0 && step.i < newDp.length) {
      newDp[step.i] = {
        ...newDp[step.i],
        isHighlighted: true,
        value: step.value
      };
    }

    // 高亮依赖单元格
    if (step.j !== null && step.j >= 0 && step.j < newDp.length) {
      newDp[step.j] = {
        ...newDp[step.j],
        isPrev: true
      };
    }

    setDp(newDp);
  };

  // 高亮最长上升子序列
  const highlightSequence = () => {
    if (!sequence.length) return;

    const newDp = [...dp];

    // 重置序列高亮
    for (let i = 0; i < newDp.length; i++) {
      newDp[i] = { ...newDp[i], isInSequence: false };
    }

    // 高亮序列
    for (const num of sequence) {
      const index = nums.indexOf(num);
      if (index !== -1) {
        newDp[index] = { ...newDp[index], isInSequence: true };
      }
    }

    setDp(newDp);
  };

  // 更新图表
  const updateChart = () => {
    if (!chart) return;

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const index = params[0].dataIndex;
          return `索引: ${index}<br/>值: ${nums[index]}<br/>LIS长度: ${dp[index].value}`;
        }
      },
      legend: {
        data: ['数组值', 'LIS长度']
      },
      xAxis: {
        type: 'category',
        data: nums.map((_, i) => i),
        name: '索引',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: '值',
        nameLocation: 'middle',
        nameGap: 30
      },
      series: [
        {
          name: '数组值',
          type: 'bar',
          data: nums.map((value, index) => {
            const cell = dp[index];
            if (!cell) return { value };

            let itemStyle: any = {};

            if (cell.isInSequence) {
              itemStyle.color = '#ff7875';
            } else if (cell.isHighlighted) {
              itemStyle.color = '#faad14';
            } else if (cell.isPrev) {
              itemStyle.color = '#52c41a';
            }

            return {
              value,
              itemStyle
            };
          })
        },
        {
          name: 'LIS长度',
          type: 'line',
          yAxisIndex: 0,
          data: dp.map(cell => cell.value),
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    };

    chart.setOption(option);
  };

  // 控制播放
  const handlePlay = () => {
    if (currentStep === steps.length - 1) {
      // 如果已经到最后一步，重新开始
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  // 单步执行
  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 重置
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    calculateDP();
  };

  // 自动播放
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 / playSpeed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isPlaying, currentStep, steps, playSpeed]);

  // 生成表格列
  const columns = [
    {
      title: '索引',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text: number) => <div className="cell-header">{text}</div>
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: 80,
      render: (_: any, record: any) => {
        const i = record.key;
        return <div className="cell-header">{nums[i]}</div>;
      }
    },
    {
      title: 'LIS长度',
      dataIndex: 'lisLength',
      key: 'lisLength',
      width: 120,
      render: (_: any, record: any) => {
        const i = record.key;
        const cell = dp[i];

        if (!cell) return null;

        return (
          <div
            className={`
              dp-cell
              ${cell.isHighlighted ? 'highlighted' : ''}
              ${cell.isPrev ? 'matched' : ''}
              ${cell.isInSequence ? 'path' : ''}
            `}
          >
            {cell.value}
          </div>
        );
      }
    }
  ];

  // 生成表格数据
  const tableData = nums.map((_, i) => ({
    key: i,
    index: i
  }));

  // 当前步骤信息
  const getCurrentStepInfo = () => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return '准备开始计算...';
    }

    const step = steps[currentStep];
    return step.decision;
  };

  // 性能分析
  const getPerformanceInfo = () => {
    const n = nums.length;
    const timeComplexity = `O(n²) = O(${n*n})`;
    const spaceComplexity = `O(n) = O(${n})`;
    const actualSteps = steps.length;

    return { timeComplexity, spaceComplexity, actualSteps };
  };

  return (
    <div className="lcs-visualizer">
      <Title level={2}>最长上升子序列问题可视化</Title>

      <Row gutter={16}>
        <Col span={8}>
          <CodeDisplay
            title="最长上升子序列问题核心算法"
            code={coreCode}
            language="typescript"
          />

          <Card title="算法输入" style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col span={24}>
                <div className="input-group">
                  <Text>数组 (逗号分隔):</Text>
                  <Input
                    value={numsInput}
                    onChange={e => setNumsInput(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <Space>
                  <Button onClick={parseInputArray}>解析数组</Button>
                  <Button onClick={setExample1}>示例1</Button>
                  <Button onClick={setExample2}>示例2</Button>
                  <Button onClick={setExample3}>示例3</Button>
                </Space>
              </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <Space>
                  <Button type="primary" onClick={calculateDP}>计算</Button>
                  <Button
                    type="primary"
                    onClick={calculateDPAsync}
                    loading={isCalculating}
                    disabled={isCalculating}
                  >
                    实时可视化计算
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card title="性能分析" style={{ marginBottom: 20 }}>
            <div className="performance-info">
              <p><Text strong>时间复杂度:</Text> {getPerformanceInfo().timeComplexity}</p>
              <p><Text strong>空间复杂度:</Text> {getPerformanceInfo().spaceComplexity}</p>
              <p><Text strong>实际计算步数:</Text> {getPerformanceInfo().actualSteps}</p>
            </div>
          </Card>

          <Card title="算法原理" style={{ marginBottom: 20 }}>
            <div className="algorithm-info">
              <Paragraph>
                <Text strong>最长上升子序列</Text>问题是一个经典的动态规划问题。
              </Paragraph>

              <Divider orientation="left">状态定义</Divider>
              <Paragraph>
                <code>dp[i]</code>: 表示以nums[i]结尾的最长上升子序列长度
              </Paragraph>

              <Divider orientation="left">状态转移方程</Divider>
              <Paragraph>
                <pre>
                  {`dp[i] = max(dp[j] + 1) for j in [0, i-1] if nums[i] > nums[j]`}
                </pre>
              </Paragraph>

              <Divider orientation="left">边界条件</Divider>
              <Paragraph>
                <code>dp[i] = 1</code> (每个元素至少是长度为1的子序列)
              </Paragraph>

              <Divider orientation="left">结果</Divider>
              <Paragraph>
                最终结果为 <code>max(dp[i])</code> for i in [0, n-1]
              </Paragraph>

              <Divider orientation="left">优化</Divider>
              <Paragraph>
                使用贪心+二分查找可以将时间复杂度优化到O(n log n)
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="问题描述" style={{ marginBottom: 20 }}>
            <Paragraph>
              给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。
              子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。
            </Paragraph>
            <Alert
              message="示例"
              description={
                <div>
                  <p>输入：nums = [10,9,2,5,3,7,101,18]</p>
                  <p>输出：4</p>
                  <p>解释：最长递增子序列是 [2,3,7,101]，因此长度为 4 。</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Card>

          <Card title="动态规划表格" style={{ marginBottom: 20 }}>
            <div className="controls">
              <Space>
                <Button
                  type="primary"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handlePlay}
                  disabled={isCalculating}
                >
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <Button
                  icon={<StepForwardOutlined />}
                  onClick={handleStep}
                  disabled={currentStep >= steps.length - 1 || isCalculating}
                >
                  下一步
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={isCalculating}
                >
                  重置
                </Button>
                <Text>速度:</Text>
                <Slider
                  min={1}
                  max={10}
                  value={playSpeed}
                  onChange={value => setPlaySpeed(value)}
                  style={{ width: 100 }}
                  disabled={isCalculating}
                />
                <Button
                  type={showSequence ? 'primary' : 'default'}
                  onClick={() => setShowSequence(!showSequence)}
                >
                  {showSequence ? '隐藏最长子序列' : '显示最长子序列'}
                </Button>
              </Space>
            </div>

            <div className="step-info">
              <Text>{isCalculating ? '正在实时计算...' : getCurrentStepInfo()}</Text>
            </div>

            <div className="dp-table-container">
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </div>

            <div className="result-info">
              <Text strong>最长上升子序列长度: </Text>
              <Text mark>{result}</Text>
              <br />
              <Text strong>最长上升子序列: </Text>
              <Text mark>[{sequence.join(', ')}]</Text>
            </div>
          </Card>

          <Card title="数组可视化" style={{ marginBottom: 20 }}>
            <div className="path-chart" ref={chartRef} style={{ height: 400 }}></div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LongestIncreasingSubsequenceVisualizer;