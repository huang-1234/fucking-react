import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Typography } from 'antd';
import { LineChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { performanceMonitor } from '../tools/performance';
import styles from './PerformancePanel.module.less';

const { Title } = Typography;

interface PerformanceMetric {
  label: string;
  average: number;
  count: number;
  total: number;
}

const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const rawMetrics = performanceMonitor.getMetrics();
    const formattedMetrics = Object.entries(rawMetrics).map(([label, data]) => ({
      label,
      average: parseFloat(data.average.toFixed(2)),
      count: data.count,
      total: parseFloat(data.total.toFixed(2))
    }));

    setMetrics(formattedMetrics);
  }, [refreshKey]);

  const columns = [
    {
      title: '操作',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '平均耗时(ms)',
      dataIndex: 'average',
      key: 'average',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.average - b.average,
    },
    {
      title: '执行次数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '总耗时(ms)',
      dataIndex: 'total',
      key: 'total',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.total - b.total,
    },
  ];

  return (
    <Card className={styles.performancePanel} bordered={true}>
      <div className={styles.header}>
        <Title level={4}><LineChartOutlined /> 性能监控面板</Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => {
            performanceMonitor.reset();
            setRefreshKey(prev => prev + 1);
          }}
        >
          重置数据
        </Button>
      </div>
      <Table
        dataSource={metrics}
        columns={columns}
        rowKey="label"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default React.memo(PerformancePanel);
