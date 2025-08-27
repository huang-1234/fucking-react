import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Typography, Space, Slider, Divider, Table, InputNumber, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { generateClimbStairsSteps, climbStairsAsync } from '../al/climbStairs';
import CodeDisplay from '../components/CodeDisplay';
import './styles.less';

const { Title, Text, Paragraph } = Typography;

interface Step {
  i: number;
  value: number;
  prev1: number;
  prev2: number;
}

interface DPCell {
  value: number;
  isHighlighted: boolean;
  isPrev1: boolean;
  isPrev2: boolean;
}

// 核心算法代码
const coreCode = `function climbStairs(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;

  // 定义dp数组
  const dp: number[] = new Array(n + 1).fill(0);

  // 初始状态
  dp[1] = 1;
  dp[2] = 2;

  // 状态转移
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// 空间优化版本
function climbStairsOptimized(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;

  let a = 1; // dp[1]
  let b = 2; // dp[2]

  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }

  return b;
}`;

const ClimbStairsVisualizer: React.FC = () => {
  // 输入参数
  const [n, setN] = useState<number>(6);

  // DP表格数据
  const [dp, setDp] = useState<DPCell[]>([]);
  const [result, setResult] = useState<number>(0);

  // 可视化状态
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(2);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

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

  // 监听n变化，重新计算DP表
  useEffect(() => {
    calculateDP();
  }, [n]);

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

  // 更新当前步骤的可视化
  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      updateVisualization(currentStep);
    }
  }, [currentStep]);

  // 更新图表
  useEffect(() => {
    if (chart && dp.length > 0) {
      updateChart();
    }
  }, [dp, chart]);

  // 计算DP表和步骤
  const calculateDP = () => {
    if (n <= 0) return;

    const { steps: newSteps, result: res, dp: dpArray } = generateClimbStairsSteps(n);

    // 初始化DP表
    const newDp: DPCell[] = Array(n + 1).fill(0).map(() => ({
      value: 0,
      isHighlighted: false,
      isPrev1: false,
      isPrev2: false
    }));

    // 填充DP表初始值
    for (let i = 1; i <= n; i++) {
      if (i <= dpArray.length) {
        newDp[i] = {
          value: dpArray[i - 1],
          isHighlighted: false,
          isPrev1: false,
          isPrev2: false
        };
      }
    }

    setDp(newDp);
    setResult(res);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // 异步计算DP表，实时可视化每一步
  const calculateDPAsync = async () => {
    if (n <= 0) return;

    setIsCalculating(true);
    setIsPlaying(false);

    // 初始化DP表
    const newDp: DPCell[] = Array(n + 1).fill(0).map(() => ({
      value: 0,
      isHighlighted: false,
      isPrev1: false,
      isPrev2: false
    }));

    setDp(newDp);
    setSteps([]);

    const newSteps: Step[] = [];

    // 定义每一步的回调函数
    const onStep = (step: {
      i: number;
      value: number;
      prev1: number;
      prev2: number;
    }) => {
      newSteps.push({ ...step });

      // 更新DP表
      const dpCopy = [...newDp];

      // 重置高亮
      for (let i = 0; i < dpCopy.length; i++) {
        dpCopy[i] = {
          ...dpCopy[i],
          isHighlighted: false,
          isPrev1: false,
          isPrev2: false
        };
      }

      // 设置当前值和高亮
      if (step.i >= 0 && step.i < dpCopy.length) {
        dpCopy[step.i] = {
          value: step.value,
          isHighlighted: true,
          isPrev1: false,
          isPrev2: false
        };
      }

      // 高亮依赖值
      if (step.i > 1) {
        dpCopy[step.i - 1] = {
          ...dpCopy[step.i - 1],
          isPrev1: true
        };
        dpCopy[step.i - 2] = {
          ...dpCopy[step.i - 2],
          isPrev2: true
        };
      }

      setDp([...dpCopy]);
    };

    // 执行异步算法
    const result = await climbStairsAsync(
      n,
      onStep,
      1000 / playSpeed
    );

    setResult(result.result);
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
        isPrev1: false,
        isPrev2: false
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
    if (step.i > 1) {
      newDp[step.i - 1] = {
        ...newDp[step.i - 1],
        isPrev1: true
      };
      newDp[step.i - 2] = {
        ...newDp[step.i - 2],
        isPrev2: true
      };
    }

    setDp(newDp);
  };

  // 更新图表
  const updateChart = () => {
    if (!chart) return;

    const xAxisData = Array.from({ length: dp.length }, (_, i) => i);
    const seriesData = dp.map(cell => cell.value);

    const highlightedIndex = dp.findIndex(cell => cell.isHighlighted);
    const prev1Index = dp.findIndex(cell => cell.isPrev1);
    const prev2Index = dp.findIndex(cell => cell.isPrev2);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        name: '楼梯阶数',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: '方案数',
        nameLocation: 'middle',
        nameGap: 30
      },
      series: [{
        data: seriesData.map((value, index) => {
          if (index === highlightedIndex) {
            return {
              value,
              itemStyle: { color: '#faad14' }
            };
          } else if (index === prev1Index) {
            return {
              value,
              itemStyle: { color: '#52c41a' }
            };
          } else if (index === prev2Index) {
            return {
              value,
              itemStyle: { color: '#1890ff' }
            };
          } else {
            return value;
          }
        }),
        type: 'bar',
        label: {
          show: true,
          position: 'top'
        }
      }]
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

  // 生成表格列
  const columns = [
    {
      title: '阶数 i',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text: number) => <div className="cell-header">{text}</div>
    },
    {
      title: '方案数 dp[i]',
      dataIndex: 'value',
      key: 'value',
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
              ${cell.isPrev1 ? 'matched' : ''}
              ${cell.isPrev2 ? 'path' : ''}
            `}
          >
            {cell.value}
          </div>
        );
      }
    }
  ];

  // 生成表格数据
  const tableData = Array.from({ length: dp.length }, (_, i) => ({
    key: i,
    index: i
  }));

  // 当前步骤信息
  const getCurrentStepInfo = () => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return '准备开始计算...';
    }

    const step = steps[currentStep];
    const i = step.i;

    if (i <= 2) {
      return `初始化：dp[${i}] = ${step.value}`;
    } else {
      return `计算 dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${step.prev1} + ${step.prev2} = ${step.value}`;
    }
  };

  // 性能分析
  const getPerformanceInfo = () => {
    const timeComplexity = `O(n)`;
    const spaceComplexity = `O(n)`;
    const actualSteps = n;

    return { timeComplexity, spaceComplexity, actualSteps };
  };

  return (
    <div className="lcs-visualizer">
      <Title level={2}>爬楼梯问题可视化</Title>

      <Row gutter={16}>
        <Col span={8}>
          <CodeDisplay
            title="爬楼梯问题核心算法"
            code={coreCode}
            language="typescript"
          />

          <Card title="算法输入" style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col span={24}>
                <div className="input-group">
                  <Text>楼梯阶数 n:</Text>
                  <InputNumber
                    value={n}
                    onChange={value => setN(Number(value))}
                    min={1}
                    max={20}
                    style={{ width: 120 }}
                  />
                </div>
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
                <Text strong>爬楼梯问题</Text>是一个经典的动态规划问题，可以通过递推关系解决。
              </Paragraph>

              <Divider orientation="left">状态定义</Divider>
              <Paragraph>
                <code>dp[i]</code>: 表示爬到第i阶楼梯的方案数
              </Paragraph>

              <Divider orientation="left">状态转移方程</Divider>
              <Paragraph>
                <pre>
                  {`dp[i] = dp[i-1] + dp[i-2]`}
                </pre>
              </Paragraph>

              <Divider orientation="left">边界条件</Divider>
              <Paragraph>
                <code>dp[1] = 1, dp[2] = 2</code>
              </Paragraph>

              <Divider orientation="left">结果</Divider>
              <Paragraph>
                最终结果为 <code>dp[n]</code>
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="问题描述" style={{ marginBottom: 20 }}>
            <Paragraph>
              假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？
            </Paragraph>
            <Alert
              message="示例"
              description={
                <div>
                  <p>输入：n = 2</p>
                  <p>输出：2</p>
                  <p>解释：有两种方法可以爬到楼顶。1. 1 阶 + 1 阶，2. 2 阶</p>
                  <p>输入：n = 3</p>
                  <p>输出：3</p>
                  <p>解释：有三种方法可以爬到楼顶。1. 1 阶 + 1 阶 + 1 阶，2. 1 阶 + 2 阶，3. 2 阶 + 1 阶</p>
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
              <Text strong>爬到第 {n} 阶的方案数: </Text>
              <Text mark>{result}</Text>
            </div>
          </Card>

          <Card title="动态规划图表可视化" style={{ marginBottom: 20 }}>
            <div className="path-chart" ref={chartRef} style={{ height: 400 }}></div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClimbStairsVisualizer;