import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Radio, Slider } from 'antd';
import { LineChartOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { ModelProbabilityVisual } from '../../al/ProbabilityTheoryVisual';
import './ProbabilityTheoryVisual.less';

const { Title, Paragraph } = Typography;
const { Group: RadioGroup, Button: RadioButton } = Radio;

type DistributionType = 'normal' | 'uniform' | 'binomial';

// 概率论可视化组件
const ProbabilityTheoryVisual: React.FC = () => {
  // 分布类型和参数
  const [distributionType, setDistributionType] = useState<DistributionType>('normal');
  const [params, setParams] = useState({
    normal: {
      mu: 0,
      sigma: 1
    },
    uniform: {
      a: 0,
      b: 10
    },
    binomial: {
      n: 10,
      p: 0.5
    }
  });

  // 图表引用
  const chartRef = useRef<HTMLDivElement>(null);

  // 图表实例
  const [chart, setChart] = useState<echarts.ECharts | null>(null);

  // 初始化
  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      const newChart = echarts.init(chartRef.current);
      setChart(newChart);

      // 初始绘制
      updateChart(newChart);
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

  // 分布类型或参数变化时更新图表
  useEffect(() => {
    if (chart) {
      updateChart(chart);
    }
  }, [distributionType, params, chart]);

  // 更新图表
  const updateChart = (chartInstance: echarts.ECharts) => {
    // 根据分布类型获取参数
    const currentParams = params[distributionType];

    // 生成数据
    const data = generateDistributionData(distributionType, currentParams);

    // 设置图表选项
    const option: echarts.EChartsOption = {
      title: {
        text: getDistributionTitle(),
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      xAxis: {
        type: 'value',
        name: 'x'
      },
      yAxis: {
        type: 'value',
        name: distributionType === 'binomial' ? 'P(X=x)' : 'f(x)'
      },
      series: [
        {
          name: distributionType,
          type: distributionType === 'binomial' ? 'bar' : 'line',
          data: data,
          smooth: true,
          sampling: 'average',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.5)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          }
        }
      ]
    };

    chartInstance.setOption(option);
  };

  // 生成分布数据
  const generateDistributionData = (
    type: DistributionType,
    params: any
  ): [number, number][] => {
    const points: [number, number][] = [];
    let range: [number, number] = [0, 0];

    switch (type) {
      case 'normal':
        range = [params.mu - 4 * params.sigma, params.mu + 4 * params.sigma];
        break;
      case 'uniform':
        range = [params.a - 1, params.b + 1];
        break;
      case 'binomial':
        range = [0, params.n];
        break;
    }

    const step = type === 'binomial' ? 1 : (range[1] - range[0]) / 200;

    for (let x = range[0]; x <= range[1]; x += step) {
      let y = 0;

      switch (type) {
        case 'normal':
          y = ModelProbabilityVisual.normalPdf(x, params.mu, params.sigma);
          break;
        case 'uniform':
          y = ModelProbabilityVisual.uniformPdf(x, params.a, params.b);
          break;
        case 'binomial':
          y = ModelProbabilityVisual.binomialPmf(Math.round(x), params.n, params.p);
          break;
      }

      points.push([x, y]);
    }

    return points;
  };

  // 获取分布标题
  const getDistributionTitle = (): string => {
    switch (distributionType) {
      case 'normal':
        return `正态分布 N(μ=${params.normal.mu}, σ=${params.normal.sigma})`;
      case 'uniform':
        return `均匀分布 U(${params.uniform.a}, ${params.uniform.b})`;
      case 'binomial':
        return `二项分布 B(n=${params.binomial.n}, p=${params.binomial.p})`;
      default:
        return '概率分布';
    }
  };

  // 处理分布类型变化
  const handleDistributionChange = (e: any) => {
    setDistributionType(e.target.value);
  };

  // 处理参数变化
  const handleParamChange = (
    distribution: DistributionType,
    param: string,
    value: number
  ) => {
    setParams(prev => ({
      ...prev,
      [distribution]: {
        ...prev[distribution],
        [param]: value
      }
    }));
  };

  // 渲染参数控制
  const renderParamControls = () => {
    switch (distributionType) {
      case 'normal':
        return (
          <>
            <div className="parameter-control">
              <div className="parameter-label">
                <span>均值 (μ)</span>
                <span className="parameter-value">{params.normal.mu}</span>
              </div>
              <Slider
                min={-10}
                max={10}
                step={0.1}
                value={params.normal.mu}
                onChange={value => handleParamChange('normal', 'mu', value)}
              />
            </div>

            <div className="parameter-control">
              <div className="parameter-label">
                <span>标准差 (σ)</span>
                <span className="parameter-value">{params.normal.sigma}</span>
              </div>
              <Slider
                min={0.1}
                max={5}
                step={0.1}
                value={params.normal.sigma}
                onChange={value => handleParamChange('normal', 'sigma', value)}
              />
            </div>
          </>
        );

      case 'uniform':
        return (
          <>
            <div className="parameter-control">
              <div className="parameter-label">
                <span>下界 (a)</span>
                <span className="parameter-value">{params.uniform.a}</span>
              </div>
              <Slider
                min={-10}
                max={params.uniform.b - 0.1}
                step={0.1}
                value={params.uniform.a}
                onChange={value => handleParamChange('uniform', 'a', value)}
              />
            </div>

            <div className="parameter-control">
              <div className="parameter-label">
                <span>上界 (b)</span>
                <span className="parameter-value">{params.uniform.b}</span>
              </div>
              <Slider
                min={params.uniform.a + 0.1}
                max={20}
                step={0.1}
                value={params.uniform.b}
                onChange={value => handleParamChange('uniform', 'b', value)}
              />
            </div>
          </>
        );

      case 'binomial':
        return (
          <>
            <div className="parameter-control">
              <div className="parameter-label">
                <span>试验次数 (n)</span>
                <span className="parameter-value">{params.binomial.n}</span>
              </div>
              <Slider
                min={1}
                max={50}
                step={1}
                value={params.binomial.n}
                onChange={value => handleParamChange('binomial', 'n', value)}
              />
            </div>

            <div className="parameter-control">
              <div className="parameter-label">
                <span>成功概率 (p)</span>
                <span className="parameter-value">{params.binomial.p}</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={params.binomial.p}
                onChange={value => handleParamChange('binomial', 'p', value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // 获取分布统计量
  const getDistributionStatistics = () => {
    switch (distributionType) {
      case 'normal':
        return {
          mean: params.normal.mu,
          variance: Math.pow(params.normal.sigma, 2),
          stdDev: params.normal.sigma
        };
      case 'uniform':
        return {
          mean: (params.uniform.a + params.uniform.b) / 2,
          variance: Math.pow(params.uniform.b - params.uniform.a, 2) / 12,
          stdDev: Math.abs(params.uniform.b - params.uniform.a) / Math.sqrt(12)
        };
      case 'binomial':
        return {
          mean: params.binomial.n * params.binomial.p,
          variance: params.binomial.n * params.binomial.p * (1 - params.binomial.p),
          stdDev: Math.sqrt(params.binomial.n * params.binomial.p * (1 - params.binomial.p))
        };
      default:
        return {
          mean: 0,
          variance: 0,
          stdDev: 0
        };
    }
  };

  // 渲染统计量
  const renderStatistics = () => {
    const stats = getDistributionStatistics();

    return (
      <div className="statistics-container">
        <div className="statistic-item">
          <div className="statistic-title">期望值 (均值)</div>
          <div className="statistic-value">{stats.mean.toFixed(2)}</div>
        </div>

        <div className="statistic-item">
          <div className="statistic-title">方差</div>
          <div className="statistic-value">{stats.variance.toFixed(2)}</div>
        </div>

        <div className="statistic-item">
          <div className="statistic-title">标准差</div>
          <div className="statistic-value">{stats.stdDev.toFixed(2)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="probability-theory-container">
      <Title level={2}>概率分布可视化</Title>

      <Card title="分布类型选择" style={{ marginBottom: 20 }}>
        <div className="distribution-selector">
          <RadioGroup value={distributionType} onChange={handleDistributionChange}>
            <RadioButton value="normal">
              <LineChartOutlined /> 正态分布
            </RadioButton>
            <RadioButton value="uniform">
              <LineChartOutlined /> 均匀分布
            </RadioButton>
            <RadioButton value="binomial">
              <BarChartOutlined /> 二项分布
            </RadioButton>
          </RadioGroup>
        </div>

        <div className="parameter-controls">
          {renderParamControls()}
        </div>
      </Card>

      <Card title={getDistributionTitle()} style={{ marginBottom: 20 }}>
        <div className="chart-container" ref={chartRef}></div>

        {renderStatistics()}
      </Card>

      <Card title="概率分布知识" style={{ marginBottom: 20 }}>
        <div className="algorithm-info">
          <Title level={4}>正态分布 (Normal Distribution)</Title>
          <Paragraph>
            正态分布是一种连续型概率分布，其概率密度函数呈钟形曲线。它由两个参数决定：均值μ和标准差σ。
          </Paragraph>

          <Title level={4}>均匀分布 (Uniform Distribution)</Title>
          <Paragraph>
            均匀分布是一种连续型概率分布，在指定区间内取值的概率相等。它由两个参数决定：下界a和上界b。
          </Paragraph>

          <Title level={4}>二项分布 (Binomial Distribution)</Title>
          <Paragraph>
            二项分布是一种离散型概率分布，描述n次独立的是/否试验中成功次数的概率。它由两个参数决定：试验次数n和单次试验成功概率p。
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ProbabilityTheoryVisual;