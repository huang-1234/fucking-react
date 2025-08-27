import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Typography, Space, Slider, Divider, Table, InputNumber, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { generateMinPathSumSteps, minPathSumAsync } from '../al/minPathSum';
import type { StepCbParams } from '../al/step';
import CodeDisplay from '../components/CodeDisplay';
import './styles.less';

const { Title, Text, Paragraph } = Typography;

interface Step extends StepCbParams {
  fromTop: number | null;
  fromLeft: number | null;
}

interface DPCell {
  value: number;
  isHighlighted: boolean;
  isFromTop: boolean;
  isFromLeft: boolean;
  isPath: boolean;
}

// 核心算法代码
const coreCode = `function minPathSum(grid: number[][]): number {
  if (!grid.length || !grid[0].length) return 0;

  const m = grid.length;
  const n = grid[0].length;

  // 创建dp数组
  const dp: number[][] = Array(m).fill(0).map((_, i) =>
    Array(n).fill(0).map((_, j) => grid[i][j])
  );

  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
  }

  // 初始化第一列
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
  }

  // 状态转移
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  return dp[m - 1][n - 1];
}

// 空间优化版本
function minPathSumOptimized(grid: number[][]): number {
  if (!grid.length || !grid[0].length) return 0;

  const m = grid.length;
  const n = grid[0].length;
  const dp: number[] = new Array(n).fill(0);

  // 初始化第一个元素
  dp[0] = grid[0][0];

  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[j] = dp[j - 1] + grid[0][j];
  }

  // 状态转移
  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0]; // 更新第一列

    for (let j = 1; j < n; j++) {
      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
    }
  }

  return dp[n - 1];
}`;

const MinPathSumVisualizer: React.FC = () => {
  // 输入参数
  const [grid, setGrid] = useState<number[][]>([
    [1, 3, 1],
    [1, 5, 1],
    [4, 2, 1]
  ]);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);

  // DP表格数据
  const [dp, setDp] = useState<DPCell[][]>([]);
  const [result, setResult] = useState<number>(0);
  const [path, setPath] = useState<[number, number][]>([]);

  // 可视化状态
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(2);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showPath, setShowPath] = useState<boolean>(true);

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

  // 监听网格变化，重新计算DP表
  useEffect(() => {
    calculateDP();
  }, [grid]);

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

  // 高亮最短路径
  useEffect(() => {
    if (showPath && path.length > 0) {
      highlightPath();
    } else {
      // 移除路径高亮
      const newDp = [...dp];
      for (let i = 0; i < newDp.length; i++) {
        for (let j = 0; j < newDp[i].length; j++) {
          if (newDp[i][j]) {
            newDp[i][j] = { ...newDp[i][j], isPath: false };
          }
        }
      }
      setDp(newDp);
    }
  }, [showPath, path]);

  // 更新图表
  useEffect(() => {
    if (chart && dp.length > 0) {
      updateChart();
    }
  }, [dp, chart]);

  // 更新网格大小
  const updateGridSize = () => {
    const newGrid: number[][] = Array(rows).fill(0).map(() =>
      Array(cols).fill(0).map(() => Math.floor(Math.random() * 9) + 1)
    );
    setGrid(newGrid);
  };

  // 计算DP表和步骤
  const calculateDP = () => {
    if (!grid.length || !grid[0].length) return;

    const { steps: newSteps, result: res, dp: dpArray, path: pathArray } = generateMinPathSumSteps(grid);

    // 初始化DP表
    const newDp: DPCell[][] = Array(grid.length).fill(0).map(() =>
      Array(grid[0].length).fill(0).map(() => ({
        value: 0,
        isHighlighted: false,
        isFromTop: false,
        isFromLeft: false,
        isPath: false
      }))
    );

    // 填充DP表初始值
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        newDp[i][j] = {
          value: dpArray[i][j],
          isHighlighted: false,
          isFromTop: false,
          isFromLeft: false,
          isPath: false
        };
      }
    }

    setDp(newDp);
    setResult(res);
    setPath(pathArray);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // 异步计算DP表，实时可视化每一步
  const calculateDPAsync = async () => {
    if (!grid.length || !grid[0].length) return;

    setIsCalculating(true);
    setIsPlaying(false);

    // 初始化DP表
    const newDp: DPCell[][] = Array(grid.length).fill(0).map(() =>
      Array(grid[0].length).fill(0).map(() => ({
        value: 0,
        isHighlighted: false,
        isFromTop: false,
        isFromLeft: false,
        isPath: false
      }))
    );

    setDp(newDp);
    setSteps([]);

    const newSteps: Step[] = [];

    // 定义每一步的回调函数
    const onStep = (step: {
      i: number;
      j: number;
      value: number;
      fromTop: number | null;
      fromLeft: number | null;
      decision: string;
    }) => {
      newSteps.push({ ...step });

      // 更新DP表
      const dpCopy = [...newDp];

      // 重置高亮
      for (let i = 0; i < dpCopy.length; i++) {
        for (let j = 0; j < dpCopy[i].length; j++) {
          dpCopy[i][j] = {
            ...dpCopy[i][j],
            isHighlighted: false,
            isFromTop: false,
            isFromLeft: false
          };
        }
      }

      // 设置当前值和高亮
      if (step.i >= 0 && step.i < dpCopy.length && step.j >= 0 && step.j < dpCopy[step.i].length) {
        dpCopy[step.i][step.j] = {
          ...dpCopy[step.i][step.j],
          value: step.value,
          isHighlighted: true
        };
      }

      // 高亮依赖单元格
      if (step.fromTop !== null && step.i > 0) {
        dpCopy[step.i - 1][step.j] = {
          ...dpCopy[step.i - 1][step.j],
          isFromTop: true
        };
      }

      if (step.fromLeft !== null && step.j > 0) {
        dpCopy[step.i][step.j - 1] = {
          ...dpCopy[step.i][step.j - 1],
          isFromLeft: true
        };
      }

      setDp([...dpCopy]);
    };

    // 执行异步算法
    const result = await minPathSumAsync(
      grid,
      onStep,
      1000 / playSpeed
    );

    setResult(result.result);
    setPath(result.path);
    setSteps(newSteps);
    setIsCalculating(false);
  };

  // 更新可视化状态
  const updateVisualization = (stepIndex: number) => {
    const step = steps[stepIndex];
    const newDp = [...dp];

    // 重置所有单元格的高亮状态
    for (let i = 0; i < newDp.length; i++) {
      for (let j = 0; j < newDp[i].length; j++) {
        newDp[i][j] = {
          ...newDp[i][j],
          isHighlighted: false,
          isFromTop: false,
          isFromLeft: false
        };
      }
    }

    // 高亮当前单元格
    if (step.i >= 0 && step.i < newDp.length && step.j >= 0 && step.j < newDp[step.i].length) {
      newDp[step.i][step.j] = {
        ...newDp[step.i][step.j],
        isHighlighted: true,
        value: step.value
      };
    }

    // 高亮依赖单元格
    if (step.fromTop !== null && step.i > 0) {
      newDp[step.i - 1][step.j] = {
        ...newDp[step.i - 1][step.j],
        isFromTop: true
      };
    }

    if (step.fromLeft !== null && step.j > 0) {
      newDp[step.i][step.j - 1] = {
        ...newDp[step.i][step.j - 1],
        isFromLeft: true
      };
    }

    setDp(newDp);
  };

  // 高亮最短路径
  const highlightPath = () => {
    if (!path.length) return;

    const newDp = [...dp];

    // 重置路径高亮
    for (let i = 0; i < newDp.length; i++) {
      for (let j = 0; j < newDp[i].length; j++) {
        if (newDp[i][j]) {
          newDp[i][j] = { ...newDp[i][j], isPath: false };
        }
      }
    }

    // 高亮路径
    for (const [i, j] of path) {
      if (newDp[i] && newDp[i][j]) {
        newDp[i][j] = { ...newDp[i][j], isPath: true };
      }
    }

    setDp(newDp);
  };

  // 更新图表
  const updateChart = () => {
    if (!chart) return;

    const data: Array<{
      value: [number, number, number];
      itemStyle?: {
        color: string;
      };
    }> = [];

    for (let i = 0; i < dp.length; i++) {
      for (let j = 0; j < dp[i].length; j++) {
        const cell = dp[i][j];
        if (!cell) continue;

        let color = '#e8e8e8';

        if (cell.isPath) {
          color = '#ff7875';
        } else if (cell.isHighlighted) {
          color = '#faad14';
        } else if (cell.isFromTop) {
          color = '#52c41a';
        } else if (cell.isFromLeft) {
          color = '#1890ff';
        }

        data.push({
          value: [j, i, cell.value],
          itemStyle: {
            color
          }
        });
      }
    }

    const option = {
      tooltip: {
        formatter: function(params: any) {
          const value = params.value;
          return `位置 (${value[1]},${value[0]})<br/>值: ${value[2]}`;
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...grid.flat()) * 2,
        calculable: true,
        realtime: false,
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        },
        show: false
      },
      xAxis3D: {
        type: 'value',
        name: '列',
        min: -0.5,
        max: grid[0].length - 0.5
      },
      yAxis3D: {
        type: 'value',
        name: '行',
        min: -0.5,
        max: grid.length - 0.5
      },
      zAxis3D: {
        type: 'value',
        name: '路径和'
      },
      grid3D: {
        viewControl: {
          projection: 'orthographic',
          autoRotate: false
        }
      },
      series: [{
        type: 'bar3D',
        data: data,
        shading: 'lambert',
        label: {
          show: true,
          formatter: '{c}'
        }
      }]
    };

    chart.setOption(option as echarts.EChartsOption);
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
  const columns = grid[0]?.map((_, j) => ({
    title: <div className="cell-header">列 {j}</div>,
    dataIndex: j.toString(),
    key: j,
    width: 80,
    render: (_: any, record: any) => {
      const i = record.key;
      const cell = dp[i]?.[j];
      const gridValue = grid[i]?.[j];

      if (!cell) return null;

      return (
        <div
          className={`
            dp-cell
            ${cell.isHighlighted ? 'highlighted' : ''}
            ${cell.isFromTop ? 'matched' : ''}
            ${cell.isFromLeft ? 'path' : ''}
            ${cell.isPath ? 'path' : ''}
          `}
        >
          <div>{cell.value}</div>
          <div style={{ fontSize: '10px', color: '#888' }}>({gridValue})</div>
        </div>
      );
    }
  })) || [];

  // 生成表格数据
  const tableData = grid?.map((_, i) => ({
    key: i,
    ...Object.fromEntries(grid[0]?.map((_, j) => [j, {}]) || [])
  })) || [];

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
    const m = grid.length;
    const n = grid[0]?.length || 0;
    const timeComplexity = `O(${m}×${n}) = O(${m*n})`;
    const spaceComplexity = `O(${m}×${n})`;
    const actualSteps = m * n;

    return { timeComplexity, spaceComplexity, actualSteps };
  };

  return (
    <div className="lcs-visualizer">
      <Title level={2}>最小路径和问题可视化</Title>

      <Row gutter={16}>
        <Col span={8}>
          <CodeDisplay
            title="最小路径和问题核心算法"
            code={coreCode}
            language="typescript"
          />

          <Card title="算法输入" style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div className="input-group">
                  <Text>行数:</Text>
                  <InputNumber
                    value={rows}
                    onChange={value => setRows(Number(value))}
                    min={1}
                    max={10}
                    style={{ width: 120 }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="input-group">
                  <Text>列数:</Text>
                  <InputNumber
                    value={cols}
                    onChange={value => setCols(Number(value))}
                    min={1}
                    max={10}
                    style={{ width: 120 }}
                  />
                </div>
              </Col>
              <Col span={24} style={{ marginTop: 16 }}>
                <Button onClick={updateGridSize}>生成随机网格</Button>
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
                <Text strong>最小路径和</Text>问题是一个经典的二维动态规划问题。
              </Paragraph>

              <Divider orientation="left">状态定义</Divider>
              <Paragraph>
                <code>dp[i][j]</code>: 表示从左上角到位置(i,j)的最小路径和
              </Paragraph>

              <Divider orientation="left">状态转移方程</Divider>
              <Paragraph>
                <pre>
                  {`dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`}
                </pre>
              </Paragraph>

              <Divider orientation="left">边界条件</Divider>
              <Paragraph>
                <code>dp[0][0] = grid[0][0]</code><br />
                <code>dp[i][0] = dp[i-1][0] + grid[i][0]</code><br />
                <code>dp[0][j] = dp[0][j-1] + grid[0][j]</code>
              </Paragraph>

              <Divider orientation="left">结果</Divider>
              <Paragraph>
                最终结果为 <code>dp[m-1][n-1]</code>
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="问题描述" style={{ marginBottom: 20 }}>
            <Paragraph>
              给定一个包含非负整数的 m x n 网格 grid ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。
              说明：每次只能向下或者向右移动一步。
            </Paragraph>
            <Alert
              message="示例"
              description={
                <div>
                  <p>输入：grid = [[1,3,1],[1,5,1],[4,2,1]]</p>
                  <p>输出：7</p>
                  <p>解释：路径 1→3→1→1→1 的总和最小。</p>
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
                  type={showPath ? 'primary' : 'default'}
                  onClick={() => setShowPath(!showPath)}
                >
                  {showPath ? '隐藏最短路径' : '显示最短路径'}
                </Button>
              </Space>
            </div>

            <div className="step-info">
              <Text>{isCalculating ? '正在实时计算...' : getCurrentStepInfo()}</Text>
            </div>

            <div className="dp-table-container">
              <Table
                columns={[
                  {
                    title: '',
                    dataIndex: 'index',
                    key: 'index',
                    width: 80,
                    render: (_: any, record: any) => <div className="cell-header">行 {record.key}</div>
                  },
                  ...columns
                ]}
                dataSource={tableData}
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </div>

            <div className="result-info">
              <Text strong>最小路径和: </Text>
              <Text mark>{result}</Text>
            </div>
          </Card>

          <Card title="网格可视化" style={{ marginBottom: 20 }}>
            <div className="path-chart" ref={chartRef} style={{ height: 400 }}></div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MinPathSumVisualizer;