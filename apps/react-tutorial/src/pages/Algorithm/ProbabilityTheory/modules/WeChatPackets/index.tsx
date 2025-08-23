import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Typography, Space, Statistic, Row, Col, Divider, Tooltip } from 'antd';
import { RedEnvelopeOutlined, ExperimentOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { ProbabilityTheory } from '@fucking-algorithm/algorithm/ProbabilityTheory/base';
import './WeChatPackets.less';

const { Title, Text, Paragraph } = Typography;

// 微信红包可视化组件
const WeChatPackets: React.FC = () => {
  // 红包参数
  const [totalAmount, setTotalAmount] = useState<number>(100);
  const [peopleCount, setPeopleCount] = useState<number>(10);
  const [packets, setPackets] = useState<number[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  // 实验参数
  const [experimentCount, setExperimentCount] = useState<number>(100);
  const [targetIndex, setTargetIndex] = useState<number>(7);
  const [experimentResults, setExperimentResults] = useState<number[]>([]);
  const [experimentStatistics, setExperimentStatistics] = useState<{
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
  }>({
    min: 0,
    max: 0,
    avg: 0,
    median: 0,
    stdDev: 0
  });

  // 图表引用
  const distributionChartRef = useRef<HTMLDivElement>(null);
  const experimentChartRef = useRef<HTMLDivElement>(null);

  // 分布图表实例
  const [distributionChart, setDistributionChart] = useState<echarts.ECharts | null>(null);
  const [experimentChart, setExperimentChart] = useState<echarts.ECharts | null>(null);

  // 初始化
  useEffect(() => {
    generatePackets();

    // 初始化图表
    if (distributionChartRef.current) {
      const chart = echarts.init(distributionChartRef.current);
      setDistributionChart(chart);
    }

    if (experimentChartRef.current) {
      const chart = echarts.init(experimentChartRef.current);
      setExperimentChart(chart);
    }

    // 清理函数
    return () => {
      if (distributionChart) {
        distributionChart.dispose();
      }

      if (experimentChart) {
        experimentChart.dispose();
      }
    };
  }, []);

  // 窗口大小变化时重新调整图表
  useEffect(() => {
    const handleResize = () => {
      if (distributionChart) {
        distributionChart.resize();
      }

      if (experimentChart) {
        experimentChart.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [distributionChart, experimentChart]);

  // 更新分布图表
  useEffect(() => {
    if (distributionChart && packets.length > 0) {
      const option: echarts.EChartsOption = {
        title: {
          text: '红包金额分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} 元'
        },
        xAxis: {
          type: 'category',
          data: packets.map((_, index) => `红包${index + 1}`),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '金额 (元)'
        },
        series: [
          {
            name: '红包金额',
            type: 'bar',
            data: packets.map((amount, index) => ({
              value: amount,
              itemStyle: {
                color: index === highlightIndex ? '#faad14' : '#f5222d'
              }
            })),
            label: {
              show: true,
              position: 'top',
              formatter: '{c} 元'
            }
          }
        ]
      };

      distributionChart.setOption(option);
    }
  }, [packets, highlightIndex, distributionChart]);

  // 更新实验图表
  useEffect(() => {
    if (experimentChart && experimentResults.length > 0) {
      // 计算数据分布
      const min = Math.floor(Math.min(...experimentResults) * 10) / 10;
      const max = Math.ceil(Math.max(...experimentResults) * 10) / 10;
      const step = 0.5; // 每0.5元一个区间
      const buckets: number[] = [];

      // 初始化桶
      for (let i = min; i <= max; i += step) {
        buckets.push(0);
      }

      // 统计每个区间的数量
      experimentResults.forEach(result => {
        const index = Math.floor((result - min) / step);
        if (index >= 0 && index < buckets.length) {
          buckets[index]++;
        }
      });

      // 生成区间标签
      const labels = [];
      for (let i = min; i <= max; i += step) {
        labels.push(`${i.toFixed(1)}-${(i + step).toFixed(1)}`);
      }

      const option: echarts.EChartsOption = {
        title: {
          text: `第${targetIndex}号红包金额分布 (${experimentCount}次实验)`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} 次'
        },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '频次'
        },
        series: [
          {
            name: '频次',
            type: 'bar',
            data: buckets,
            itemStyle: {
              color: '#1890ff'
            }
          },
          {
            name: '正态分布拟合',
            type: 'line',
            smooth: true,
            data: buckets.map((_, index) => {
              const x = min + index * step + step / 2;
              return ProbabilityTheory.normalPdf(x, experimentStatistics.avg, experimentStatistics.stdDev) * experimentCount * step;
            }),
            itemStyle: {
              color: '#52c41a'
            }
          }
        ]
      };

      experimentChart.setOption(option);
    }
  }, [experimentResults, experimentStatistics, targetIndex, experimentCount, experimentChart]);

  // 生成红包
  const generatePackets = () => {
    try {
      const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);
      setPackets(result);
      setHighlightIndex(-1);
    } catch (error) {
      console.error('生成红包失败:', error);
    }
  };

  // 运行实验
  const runExperiment = () => {
    try {
      const results: number[] = [];

      // 运行多次实验
      for (let i = 0; i < experimentCount; i++) {
        const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);

        // 记录目标位置的金额
        if (targetIndex > 0 && targetIndex <= result.length) {
          results.push(result[targetIndex - 1]);
        }
      }

      setExperimentResults(results);

      // 计算统计数据
      if (results.length > 0) {
        // 排序用于计算中位数
        const sorted = [...results].sort((a, b) => a - b);

        const min = Math.min(...results);
        const max = Math.max(...results);
        const avg = results.reduce((sum, val) => sum + val, 0) / results.length;
        const median = results.length % 2 === 0
          ? (sorted[results.length / 2 - 1] + sorted[results.length / 2]) / 2
          : sorted[Math.floor(results.length / 2)];

        // 计算标准差
        const variance = results.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / results.length;
        const stdDev = Math.sqrt(variance);

        setExperimentStatistics({
          min,
          max,
          avg,
          median,
          stdDev
        });
      }
    } catch (error) {
      console.error('运行实验失败:', error);
    }
  };

  // 处理红包点击
  const handlePacketClick = (index: number) => {
    setHighlightIndex(index);
  };

  // 渲染红包
  const renderPackets = () => {
    return packets.map((amount, index) => (
      <Tooltip key={index} title={`红包${index + 1}: ${amount.toFixed(2)}元`}>
        <div
          className={`packet ${index === highlightIndex ? 'highlight' : ''}`}
          onClick={() => handlePacketClick(index)}
        >
          <div className="packet-index">{index + 1}</div>
          {amount.toFixed(2)}
        </div>
      </Tooltip>
    ));
  };

  return (
    <div className="wechat-packets-container">
      <Title level={2}>微信红包算法可视化</Title>

      <Card title="红包参数配置" style={{ marginBottom: 20 }}>
        <div className="operations-container">
          <div className="input-group">
            <Text className="input-label">总金额 (元):</Text>
            <Input
              className="input-field"
              type="number"
              value={totalAmount}
              onChange={e => setTotalAmount(Number(e.target.value))}
              min={0.01}
            />
          </div>

          <div className="input-group">
            <Text className="input-label">红包个数:</Text>
            <Input
              className="input-field"
              type="number"
              value={peopleCount}
              onChange={e => setPeopleCount(Number(e.target.value))}
              min={1}
            />
          </div>

          <Button
            type="primary"
            icon={<RedEnvelopeOutlined />}
            onClick={generatePackets}
          >
            生成红包
          </Button>
        </div>
      </Card>

      <Card title="红包分配结果" style={{ marginBottom: 20 }}>
        <div className="packets-visualization">
          {renderPackets()}
        </div>

        <div className="chart-container" ref={distributionChartRef}></div>

        <div className="statistics-container">
          <div className="statistic-item">
            <div className="statistic-title">总金额</div>
            <div className="statistic-value">
              {packets.reduce((sum, val) => sum + val, 0).toFixed(2)} 元
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">平均金额</div>
            <div className="statistic-value">
              {(packets.reduce((sum, val) => sum + val, 0) / packets.length).toFixed(2)} 元
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">最小红包</div>
            <div className="statistic-value">
              {packets.length > 0 ? Math.min(...packets).toFixed(2) : '0.00'} 元
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">最大红包</div>
            <div className="statistic-value">
              {packets.length > 0 ? Math.max(...packets).toFixed(2) : '0.00'} 元
            </div>
          </div>
        </div>
      </Card>

      <Card title="红包概率分布实验" style={{ marginBottom: 20 }}>
        <div className="operations-container">
          <div className="input-group">
            <Text className="input-label">实验次数:</Text>
            <Input
              className="input-field"
              type="number"
              value={experimentCount}
              onChange={e => setExperimentCount(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="input-group">
            <Text className="input-label">目标红包序号:</Text>
            <Input
              className="input-field"
              type="number"
              value={targetIndex}
              onChange={e => setTargetIndex(Number(e.target.value))}
              min={1}
              max={peopleCount}
            />
          </div>

          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={runExperiment}
          >
            运行实验
          </Button>
        </div>

        <div className="chart-container" ref={experimentChartRef}></div>

        <div className="statistics-container">
          <div className="statistic-item">
            <div className="statistic-title">样本数量</div>
            <div className="statistic-value">
              {experimentResults.length}
            </div>
          </div>

          <div className="statistic-item highlight">
            <div className="statistic-title">平均值</div>
            <div className="statistic-value">
              {experimentStatistics.avg.toFixed(2)} 元
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">中位数</div>
            <div className="statistic-value">
              {experimentStatistics.median.toFixed(2)} 元
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">标准差</div>
            <div className="statistic-value">
              {experimentStatistics.stdDev.toFixed(2)}
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">最小值</div>
            <div className="statistic-value">
              {experimentStatistics.min.toFixed(2)} 元
            </div>
          </div>

          <div className="statistic-item">
            <div className="statistic-title">最大值</div>
            <div className="statistic-value">
              {experimentStatistics.max.toFixed(2)} 元
            </div>
          </div>
        </div>
      </Card>

      <Card title="算法原理" style={{ marginBottom: 20 }}>
        <div className="algorithm-info">
          <Paragraph>
            <strong>微信红包算法</strong>使用二倍均值法实现公平的随机分配，核心原理是通过动态调整随机上限和期望值恒定的数学设计，确保每个参与者在概率意义上的平等。
          </Paragraph>

          <Title level={4}>二倍均值法原理</Title>
          <Paragraph>
            设当前剩余金额为M（单位：分），剩余人数为N，则：
            <ul>
              <li><strong>随机金额范围</strong>：[0, 2M/N]</li>
              <li><strong>期望值计算</strong>：E = (0 + 2M/N) / 2 = M/N</li>
            </ul>
          </Paragraph>

          <Title level={4}>公平性保证</Title>
          <Paragraph>
            无论分配顺序如何，每次抢红包的期望值严格等于当前剩余人均金额 M/N。这意味着：
            <ul>
              <li><strong>先抢者</strong>：面临更大的随机范围（上限较大），可能获得高额红包，也可能获得极小金额。</li>
              <li><strong>后抢者</strong>：随机范围随M和N减少而收缩，但期望值始终与当前人均金额一致。</li>
            </ul>
          </Paragraph>

          <Title level={4}>边界保护机制</Title>
          <Paragraph>
            <ul>
              <li><strong>最小金额</strong>：通过 Math.max(amount, 1) 确保每份 ≥1分（0.01元），避免0元红包。</li>
              <li><strong>安全上限</strong>：safeMax = remain - (n - i - 1) 保证剩余金额足够后续分配（每人至少1分）。</li>
            </ul>
          </Paragraph>

          <Title level={4}>洗牌增强公平感</Title>
          <Paragraph>
            微信在算法完成后对红包序列随机排序，消除"越抢越少"的心理偏差，进一步增强公平性。
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(WeChatPackets);
