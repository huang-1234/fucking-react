import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Typography, Space, Statistic, Row, Col, Divider, Tooltip } from 'antd';
import { RedEnvelopeOutlined, ExperimentOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { ProbabilityTheory } from '@fucking-algorithm/algorithm/ProbabilityTheory/base';
import './WeChatPackets.less';
import { AlgorithmInfo, StatisticsContainer } from './AlgorithmInfo';
import { calcExperimentResults, useExperiment, useExperimentChart, usePackets } from './hooks';
const { Title, Text } = Typography;

// 微信红包可视化组件
const WeChatPackets: React.FC = () => {
  // 红包参数
  const {
    totalAmount, peopleCount, packets, highlightIndex,
    setTotalAmount, setPeopleCount, setPackets, setHighlightIndex
  } = usePackets({ initTotalAmount: 100, initPeopleCount: 100 });

  const { distributionChartRef, experimentChartRef, distributionChart, experimentChart, setDistributionChart, setExperimentChart } = useExperimentChart();
  const { experimentCount, targetIndex, experimentResults, experimentStatistics, setExperimentCount, setTargetIndex, setExperimentResults, setExperimentStatistics } = useExperiment();

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
      for (let i = min;i <= max;i += step) {
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
      for (let i = min;i <= max;i += step) {
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
    const { experimentResults, experimentStatistics } = calcExperimentResults(totalAmount, peopleCount, targetIndex, experimentCount) || {};
    setExperimentResults(experimentResults);
    setExperimentStatistics(experimentStatistics);
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

        <StatisticsContainer experimentResults={experimentResults} experimentStatistics={experimentStatistics} />
      </Card>

      <AlgorithmInfo />
    </div>
  );
};

export default React.memo(WeChatPackets);
