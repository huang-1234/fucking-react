import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Input, Button, Table, Typography, Space, Slider, Divider } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { generateLCSSteps, findLongestCommonSubstringAsync } from '../al/findLongestCommonSubstring';
import type { StepCallback } from '../al/findLongestCommonSubstring';
import CodeDisplay from '../components/CodeDisplay';
import './styles.less';

const { Title, Text, Paragraph } = Typography;

interface Step {
  i: number;
  j: number;
  prev?: { i: number; j: number };
  matched: boolean;
  value: number;
}

interface DPCell {
  value: number;
  isHighlighted: boolean;
  isMatched: boolean;
  isPath: boolean;
}

// 核心算法代码
const coreCode = `function findLongestCommonSubstring(str1: string, str2: string): string {
  if (str1.length === 0 || str2.length === 0) {
    return '';
  }

  // 定义一个二维dp数组
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  // 记录最长子串的长度和结束位置
  let maxLength = 0;
  let endIndex = 0;

  // 填充dp数组
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;

        // 更新最长子串信息
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i - 1;
        }
      } else {
        dp[i][j] = 0;
      }
    }
  }

  // 提取最长公共子串
  return str1.substring(endIndex - maxLength + 1, endIndex + 1);
}

// 带返回DP表格的版本
function findLongestCommonSubstringWithDP(str1: string, str2: string): {
  result: string;
  dp: number[][];
  maxLength: number;
  endIndex: number;
} {
  if (str1.length === 0 || str2.length === 0) {
    return { result: '', dp: [[0]], maxLength: 0, endIndex: 0 };
  }

  // 定义一个二维dp数组
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  // 记录最长子串的长度和结束位置
  let maxLength = 0;
  let endIndex = 0;

  // 填充dp数组
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;

        // 更新最长子串信息
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i - 1;
        }
      } else {
        dp[i][j] = 0;
      }
    }
  }

  // 提取最长公共子串
  const commonSubstring = str1.substring(endIndex - maxLength + 1, endIndex + 1);

  return {
    result: commonSubstring,
    dp,
    maxLength,
    endIndex
  };
}`;

const LongestCommonSubstringVisualizer: React.FC = () => {
  // 输入字符串
  const [str1, setStr1] = useState<string>('aaabbbccc');
  const [str2, setStr2] = useState<string>('abbbcd');

  // DP表格数据
  const [dp, setDp] = useState<DPCell[][]>([]);
  const [maxLength, setMaxLength] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);
  const [result, setResult] = useState<string>('');

  // 可视化状态
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(2);
  const [highlightPath, setHighlightPath] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // 图表引用
  const pathChartRef = useRef<HTMLDivElement>(null);
  const [pathChart, setPathChart] = useState<echarts.ECharts | null>(null);

  // 初始化
  useEffect(() => {
    calculateDP();

    // 初始化路径图表
    if (pathChartRef.current) {
      const chart = echarts.init(pathChartRef.current);
      setPathChart(chart);
    }

    // 清理函数
    return () => {
      if (pathChart) {
        pathChart.dispose();
      }
    };
  }, []);

  // 窗口大小变化时重新调整图表
  useEffect(() => {
    const handleResize = () => {
      if (pathChart) {
        pathChart.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pathChart]);

  // 监听字符串变化，重新计算DP表
  useEffect(() => {
    if (str1 && str2) {
      calculateDP();
    }
  }, [str1, str2]);

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

  // 高亮最长公共子串路径
  useEffect(() => {
    if (highlightPath && maxLength > 0) {
      highlightLCSPath();
    } else {
      // 移除路径高亮
      const newDp = [...dp];
      for (let i = 0; i < newDp.length; i++) {
        for (let j = 0; j < newDp[i].length; j++) {
          newDp[i][j] = { ...newDp[i][j], isPath: false };
        }
      }
      setDp(newDp);
    }
  }, [highlightPath, maxLength, endIndex]);

  // 更新路径图表
  useEffect(() => {
    if (pathChart && dp.length > 0) {
      updatePathChart();
    }
  }, [dp, pathChart]);

  // 计算DP表和步骤
  const calculateDP = () => {
    if (!str1 || !str2) return;

    const { steps: newSteps, result: commonStr, maxLength: maxLen, endIndex: endIdx } = generateLCSSteps(str1, str2);

    const m = str1.length;
    const n = str2.length;

    // 初始化DP表
    const newDp: DPCell[][] = Array(m + 1).fill(0).map(() =>
      Array(n + 1).fill(0).map(() => ({
        value: 0,
        isHighlighted: false,
        isMatched: false,
        isPath: false
      }))
    );

    // 填充DP表初始值
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const matched = str1[i-1] === str2[j-1];
        const step = newSteps.find(s => s.i === i && s.j === j);
        if (step) {
          newDp[i][j] = {
            value: step.value,
            isHighlighted: false,
            isMatched: matched,
            isPath: false
          };
        }
      }
    }

    setDp(newDp);
    setMaxLength(maxLen);
    setEndIndex(endIdx);
    setResult(commonStr);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // 异步计算DP表，实时可视化每一步
  const calculateDPAsync = async () => {
    if (!str1 || !str2) return;

    setIsCalculating(true);
    setIsPlaying(false);

    const m = str1.length;
    const n = str2.length;

    // 初始化DP表
    const newDp: DPCell[][] = Array(m + 1).fill(0).map(() =>
      Array(n + 1).fill(0).map(() => ({
        value: 0,
        isHighlighted: false,
        isMatched: false,
        isPath: false
      }))
    );

    setDp(newDp);
    setSteps([]);

    const newSteps: Step[] = [];

    // 定义每一步的回调函数
    const onStep: StepCallback = (step) => {
      newSteps.push({ ...step });

      // 更新DP表
      const dpCopy = [...newDp];

      // 重置高亮
      for (let i = 0; i < dpCopy.length; i++) {
        for (let j = 0; j < dpCopy[i].length; j++) {
          dpCopy[i][j] = { ...dpCopy[i][j], isHighlighted: false };
        }
      }

      // 设置当前单元格的值和高亮
      if (step.i >= 0 && step.i < dpCopy.length && step.j >= 0 && step.j < dpCopy[step.i].length) {
        dpCopy[step.i][step.j] = {
          value: step.value,
          isHighlighted: true,
          isMatched: step.matched,
          isPath: false
        };
      }

      // 高亮依赖单元格
      if (step.prev) {
        const { i, j } = step.prev;
        if (i >= 0 && i < dpCopy.length && j >= 0 && j < dpCopy[i].length) {
          dpCopy[i][j] = { ...dpCopy[i][j], isHighlighted: true };
        }
      }

      setDp([...dpCopy]);
    };

    // 执行异步算法
    const result = await findLongestCommonSubstringAsync(
      str1,
      str2,
      onStep,
      1000 / playSpeed
    );

    setMaxLength(result.maxLength);
    setEndIndex(result.endIndex);
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
      for (let j = 0; j < newDp[i].length; j++) {
        newDp[i][j] = { ...newDp[i][j], isHighlighted: false };
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
    if (step.prev) {
      const { i, j } = step.prev;
      if (i >= 0 && i < newDp.length && j >= 0 && j < newDp[i].length) {
        newDp[i][j] = { ...newDp[i][j], isHighlighted: true };
      }
    }

    setDp(newDp);
  };

  // 高亮最长公共子串路径
  const highlightLCSPath = () => {
    if (maxLength === 0) return;

    const newDp = [...dp];
    let i = endIndex + 1;
    let j = 0;

    // 找到最大值所在列
    for (let col = 0; col < newDp[i].length; col++) {
      if (newDp[i][col].value === maxLength) {
        j = col;
        break;
      }
    }

    // 从最大值开始回溯
    while (i > 0 && j > 0 && newDp[i][j].value > 0) {
      newDp[i][j] = { ...newDp[i][j], isPath: true };
      i--;
      j--;
    }

    setDp(newDp);
  };

  // 更新路径图表
  const updatePathChart = () => {
    if (!pathChart) return;

    const nodes: any[] = [];
    const links: any[] = [];

    // 添加节点
    for (let i = 0; i <= str1.length; i++) {
      for (let j = 0; j <= str2.length; j++) {
        const cell = dp[i]?.[j];
        if (!cell) continue;

        nodes.push({
          name: `(${i},${j})`,
          value: cell.value,
          x: j * 60,
          y: i * 60,
          itemStyle: {
            color: cell.isPath ? '#ff7875' :
                   cell.isMatched ? '#91cc75' :
                   cell.value > 0 ? '#73d13d' : '#f0f0f0',
            borderWidth: cell.isHighlighted ? 2 : 0,
            borderColor: '#faad14'
          },
          label: {
            show: cell.value > 0 || (i === 0 || j === 0),
            formatter: cell.value > 0 ? `{b}\n${cell.value}` : '{b}'
          },
          symbolSize: cell.value > 0 ? 30 + cell.value * 3 : 20
        });
      }
    }

    // 添加边（状态转移关系）
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (dp[i][j].value > 0) {
          links.push({
            source: `(${i-1},${j-1})`,
            target: `(${i},${j})`,
            lineStyle: {
              color: dp[i][j].isPath ? '#ff7875' : '#91cc75',
              width: dp[i][j].isPath ? 3 : 1
            }
          });
        }
      }
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        formatter: '{b}: {c}'
      },
      animation: true,
      series: [{
        type: 'graph',
        layout: 'none',
        symbolSize: 30,
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 8],
        data: nodes,
        links: links,
        lineStyle: {
          opacity: 0.9,
          width: 1,
          curveness: 0
        }
      }]
    };

    pathChart.setOption(option);
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
      title: '',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (text: string) => <div className="cell-header">{text}</div>
    },
    ...(str2 ? ['', ...str2.split('')].map((char, j) => ({
      title: <div className="cell-header">{char}</div>,
      dataIndex: j.toString(),
      key: j,
      width: 50,
      render: (_: any, record: any) => {
        const i = record.key;
        const cell = dp[i]?.[j];

        if (!cell) return null;

        return (
          <div
            className={`
              dp-cell
              ${cell.isHighlighted ? 'highlighted' : ''}
              ${cell.isMatched ? 'matched' : ''}
              ${cell.isPath ? 'path' : ''}
            `}
          >
            {cell.value > 0 ? cell.value : ''}
          </div>
        );
      }
    })) : [])
  ];

  // 生成表格数据
  const tableData = str1 ?
    ['', ...str1.split('')].map((char, i) => ({
      key: i,
      index: char,
      ...Object.fromEntries(Array(str2.length + 1).fill(0).map((_, j) => [j, {}]))
    })) : [];

  // 当前步骤信息
  const getCurrentStepInfo = () => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return '准备开始计算...';
    }

    const step = steps[currentStep];

    if (currentStep === 0) {
      return '初始化DP表，所有值设为0';
    }

    const i = step.i;
    const j = step.j;

    if (step.matched) {
      return `比较 str1[${i-1}]="${str1[i-1]}" 和 str2[${j-1}]="${str2[j-1]}"：匹配！
              dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${step.value}`;
    } else {
      return `比较 str1[${i-1}]="${str1[i-1]}" 和 str2[${j-1}]="${str2[j-1]}"：不匹配，重置为0`;
    }
  };

  // 性能分析
  const getPerformanceInfo = () => {
    const m = str1.length;
    const n = str2.length;
    const timeComplexity = `O(${m}×${n}) = O(${m*n})`;
    const spaceComplexity = `O(${m}×${n})`;
    const actualSteps = m * n;

    return { timeComplexity, spaceComplexity, actualSteps };
  };

  return (
    <div className="lcs-visualizer">
      <Title level={2}>最长公共子串算法可视化</Title>

      <Row gutter={16}>
        <Col span={8}>
          <CodeDisplay
            title="最长公共子串问题核心算法"
            code={coreCode}
            language="typescript"
          />

          <Card title="算法输入" style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col span={24}>
                <div className="input-group">
                  <Text>字符串1:</Text>
                  <Input
                    value={str1}
                    onChange={e => setStr1(e.target.value)}
                    placeholder="输入第一个字符串"
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="input-group">
                  <Text>字符串2:</Text>
                  <Input
                    value={str2}
                    onChange={e => setStr2(e.target.value)}
                    placeholder="输入第二个字符串"
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
                <Text strong>最长公共子串</Text>问题是寻找两个字符串中最长的共同子串。
              </Paragraph>

              <Divider orientation="left">状态定义</Divider>
              <Paragraph>
                <code>dp[i][j]</code>: 表示以str1[i-1]和str2[j-1]结尾的最长公共子串长度
              </Paragraph>

              <Divider orientation="left">状态转移方程</Divider>
              <Paragraph>
                <pre>
                  {`if str1[i-1] === str2[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = 0`}
                </pre>
              </Paragraph>

              <Divider orientation="left">边界条件</Divider>
              <Paragraph>
                <code>dp[0][j] = 0, dp[i][0] = 0</code>
              </Paragraph>

              <Divider orientation="left">结果</Divider>
              <Paragraph>
                最长公共子串的长度为dp数组中的最大值，位置需要记录最大值出现的位置。
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col span={16}>
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
              <Text strong>最长公共子串: </Text>
              <Text mark>{result}</Text>
              <Text>, 长度: {maxLength}</Text>
            </div>
          </Card>

          <Card title="状态转移路径可视化" style={{ marginBottom: 20 }}>
            <div className="path-chart" ref={pathChartRef} style={{ height: 400 }}></div>
            <div style={{ marginTop: 16 }}>
              <Button
                type={highlightPath ? 'primary' : 'default'}
                onClick={() => setHighlightPath(!highlightPath)}
              >
                {highlightPath ? '隐藏最优路径' : '显示最优路径'}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LongestCommonSubstringVisualizer;