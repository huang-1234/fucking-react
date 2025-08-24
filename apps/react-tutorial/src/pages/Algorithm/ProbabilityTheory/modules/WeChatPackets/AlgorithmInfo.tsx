import React from 'react';
import {
  Button,
  Input,
  Card,
  Typography,
  Space,
  Statistic,
  Row,
  Col,
  Divider,
  Tooltip,
} from 'antd';

import './WeChatPackets.less';

const { Title, Paragraph } = Typography;
export const AlgorithmInfo = React.memo(() => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <Card
      title="算法原理"
      style={{ marginBottom: 20 }}
      extra={
        <Button type="link" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '收起' : '展开'}
        </Button>
      }
    >
      <div className="algorithm-info">
        <Paragraph>
          <strong>微信红包算法</strong>
          使用二倍均值法实现公平的随机分配，核心原理是通过动态调整随机上限和期望值恒定的数学设计，确保每个参与者在概率意义上的平等。
        </Paragraph>

        <Title level={4}>二倍均值法原理</Title>
        <Paragraph>
          设当前剩余金额为M（单位：分），剩余人数为N，则：
          <ul>
            <li>
              <strong>随机金额范围</strong>：[0, 2M/N]
            </li>
            <li>
              <strong>期望值计算</strong>：E = (0 + 2M/N) / 2 = M/N
            </li>
          </ul>
        </Paragraph>

        <Title level={4}>公平性保证</Title>
        <Paragraph>
          无论分配顺序如何，每次抢红包的期望值严格等于当前剩余人均金额 M/N。这意味着：
          <ul>
            <li>
              <strong>先抢者</strong>
              ：面临更大的随机范围（上限较大），可能获得高额红包，也可能获得极小金额。
            </li>
            <li>
              <strong>后抢者</strong>：随机范围随M和N减少而收缩，但期望值始终与当前人均金额一致。
            </li>
          </ul>
        </Paragraph>

        <Title level={4}>边界保护机制</Title>
        <Paragraph>
          <ul>
            <li>
              <strong>最小金额</strong>：通过 Math.max(amount, 1) 确保每份
              ≥1分（0.01元），避免0元红包。
            </li>
            <li>
              <strong>安全上限</strong>：safeMax = remain - (n - i - 1)
              保证剩余金额足够后续分配（每人至少1分）。
            </li>
          </ul>
        </Paragraph>

        <Title level={4}>洗牌增强公平感</Title>
        <Paragraph>
          微信在算法完成后对红包序列随机排序，消除"越抢越少"的心理偏差，进一步增强公平性。
        </Paragraph>
        <Button type="link" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '收起' : '展开'}
        </Button>
      </div>
    </Card>
  );
});

export interface ExperimentStatistics {
  avg: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
}

export interface StatisticsContainerProps {
  experimentResults: number[];
  experimentStatistics: ExperimentStatistics;
}

export const StatisticsContainer = React.memo((props: StatisticsContainerProps) => {
  const { experimentResults, experimentStatistics } = props || {};
  const indicators = React.useMemo(() => {
    return [
      { title: '样本数量', value: experimentResults.length },
      { title: '平均值', value: experimentStatistics.avg.toFixed(2) },
      { title: '中位数', value: experimentStatistics.median.toFixed(2) },
      { title: '标准差', value: experimentStatistics.stdDev.toFixed(2) },
      { title: '最小值', value: experimentStatistics.min.toFixed(2) },
      { title: '最大值', value: experimentStatistics.max.toFixed(2) },
    ];
  }, [experimentResults, experimentStatistics]);
  return (
    <div className="statistics-container">
      {indicators.map((indicator) => (
        <div className="statistic-item">
          <div className="statistic-title">{indicator.title}</div>
          <div className="statistic-value">{indicator.value}</div>
        </div>
      ))}
    </div>
  );
});
