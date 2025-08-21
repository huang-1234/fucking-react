import React, { useState, useEffect } from 'react';
import { Button, Card, Progress, Spin, Table, Tabs, Tooltip, Alert, Row, Col, Statistic } from 'antd';
import { BarChartOutlined, ClockCircleOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import './index.less';

const { TabPane } = Tabs;

interface BuildResult {
  tool: 'webpack' | 'vite';
  phase: 'cold' | 'hmr' | 'build';
  duration: number;
  memory: number;
  moduleCount: number;
  timestamp: number;
}

interface BundleComparatorProps {
  onComplete?: (time: number) => void;
}

const BundleComparator: React.FC<BundleComparatorProps> = ({ onComplete }) => {
  const [webpackTime, setWebpackTime] = useState<number | null>(null);
  const [viteTime, setViteTime] = useState<number | null>(null);
  const [webpackLoading, setWebpackLoading] = useState<boolean>(false);
  const [viteLoading, setViteLoading] = useState<boolean>(false);
  const [buildHistory, setBuildHistory] = useState<BuildResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('comparison');
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);

  // 模拟构建过程
  const runBuild = async (tool: 'webpack' | 'vite', phase: 'cold' | 'hmr' | 'build' = 'cold') => {
    const setLoading = tool === 'webpack' ? setWebpackLoading : setViteLoading;
    const setTime = tool === 'webpack' ? setWebpackTime : setViteTime;

    setLoading(true);

    try {
      // 模拟API调用，实际项目中应调用后端服务
      const start = Date.now();

      // 模拟不同工具的构建时间差异
      const delay = tool === 'webpack'
        ? phase === 'cold' ? 3000 + Math.random() * 2000 : phase === 'hmr' ? 1000 + Math.random() * 800 : 5000 + Math.random() * 3000
        : phase === 'cold' ? 300 + Math.random() * 200 : phase === 'hmr' ? 50 + Math.random() * 30 : 1000 + Math.random() * 500;

      await new Promise(resolve => setTimeout(resolve, delay));

      const duration = Date.now() - start;
      setTime(duration);

      if (onComplete) {
        onComplete(duration);
      }

      // 添加到构建历史
      const newBuildResult: BuildResult = {
        tool,
        phase,
        duration,
        memory: tool === 'webpack' ? 800 + Math.random() * 400 : 400 + Math.random() * 200,
        moduleCount: tool === 'webpack' ? 1000 + Math.floor(Math.random() * 500) : 1000 + Math.floor(Math.random() * 500),
        timestamp: Date.now()
      };

      setBuildHistory(prev => [...prev, newBuildResult]);

    } finally {
      setLoading(false);
    }
  };

  // 渲染图表
  const renderChart = () => {
    const chartDom = document.getElementById('comparison-chart');
    if (!chartDom) return;

    const chart = echarts.init(chartDom);
    setChartInstance(chart);

    // 从构建历史中提取最新的每种类型的构建结果
    const latestResults: Record<string, BuildResult> = {};
    buildHistory.forEach(result => {
      const key = `${result.tool}-${result.phase}`;
      if (!latestResults[key] || latestResults[key].timestamp < result.timestamp) {
        latestResults[key] = result;
      }
    });

    // 准备图表数据
    const phases = ['cold', 'hmr', 'build'];
    const webpackData = phases.map(phase => {
      const key = `webpack-${phase}`;
      return latestResults[key]?.duration || 0;
    });

    const viteData = phases.map(phase => {
      const key = `vite-${phase}`;
      return latestResults[key]?.duration || 0;
    });

    const option = {
      title: {
        text: 'Webpack vs Vite 构建性能对比',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const webpack = params[0].value;
          const vite = params[1].value;
          const diff = webpack > 0 && vite > 0 ? (webpack / vite).toFixed(1) : 'N/A';
          return `${params[0].name}<br/>
                  Webpack: ${webpack}ms<br/>
                  Vite: ${vite}ms<br/>
                  差异倍数: ${diff}x`;
        }
      },
      legend: {
        data: ['Webpack', 'Vite'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['冷启动', 'HMR热更新', '生产构建']
      },
      yAxis: {
        type: 'log',
        name: '时间 (ms)',
        axisLabel: {
          formatter: '{value} ms'
        }
      },
      series: [
        {
          name: 'Webpack',
          type: 'bar',
          data: webpackData,
          itemStyle: {
            color: '#e74c3c'
          }
        },
        {
          name: 'Vite',
          type: 'bar',
          data: viteData,
          itemStyle: {
            color: '#2ecc71'
          }
        }
      ]
    };

    chart.setOption(option);

    // 响应式调整
    window.addEventListener('resize', () => {
      chart.resize();
    });
  };

  // 当构建历史更新时重绘图表
  useEffect(() => {
    if (buildHistory.length > 0) {
      renderChart();
    }
  }, [buildHistory]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [chartInstance]);

  // 构建历史表格列
  const columns = [
    {
      title: '构建工具',
      dataIndex: 'tool',
      key: 'tool',
      render: (text: string) => text === 'webpack' ? 'Webpack' : 'Vite'
    },
    {
      title: '构建阶段',
      dataIndex: 'phase',
      key: 'phase',
      render: (text: string) => {
        switch (text) {
          case 'cold': return '冷启动';
          case 'hmr': return 'HMR热更新';
          case 'build': return '生产构建';
          default: return text;
        }
      }
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: BuildResult, b: BuildResult) => a.duration - b.duration,
      render: (text: number) => `${text} ms`
    },
    {
      title: '内存占用',
      dataIndex: 'memory',
      key: 'memory',
      sorter: (a: BuildResult, b: BuildResult) => a.memory - b.memory,
      render: (text: number) => `${Math.round(text)} MB`
    },
    {
      title: '模块数量',
      dataIndex: 'moduleCount',
      key: 'moduleCount',
      sorter: (a: BuildResult, b: BuildResult) => a.moduleCount - b.moduleCount,
    },
    {
      title: '时间戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: number) => new Date(text).toLocaleString()
    }
  ];

  return (
    <div className="bundle-comparator">
      <h2>Webpack vs Vite 构建性能对比</h2>

      <Alert
        message="构建性能对比说明"
        description={
          <div>
            <p>此工具模拟对比 Webpack 和 Vite 在不同场景下的构建性能差异：</p>
            <ul>
              <li><strong>冷启动</strong>：首次启动开发服务器的时间</li>
              <li><strong>HMR热更新</strong>：修改文件后的热更新响应时间</li>
              <li><strong>生产构建</strong>：构建生产环境优化包的时间</li>
            </ul>
            <p>注意：实际性能会因项目规模、配置和硬件环境而异。</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="性能对比" key="comparison">
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card title="冷启动" bordered={false}>
                <div className="build-actions">
                  <Button
                    type="primary"
                    onClick={() => runBuild('webpack', 'cold')}
                    loading={webpackLoading && !viteLoading}
                    icon={<ClockCircleOutlined />}
                  >
                    运行 Webpack
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => runBuild('vite', 'cold')}
                    loading={viteLoading && !webpackLoading}
                    icon={<ThunderboltOutlined />}
                  >
                    运行 Vite
                  </Button>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="HMR热更新" bordered={false}>
                <div className="build-actions">
                  <Button
                    type="primary"
                    onClick={() => runBuild('webpack', 'hmr')}
                    loading={webpackLoading && !viteLoading}
                    icon={<ClockCircleOutlined />}
                  >
                    运行 Webpack
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => runBuild('vite', 'hmr')}
                    loading={viteLoading && !webpackLoading}
                    icon={<ThunderboltOutlined />}
                  >
                    运行 Vite
                  </Button>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="生产构建" bordered={false}>
                <div className="build-actions">
                  <Button
                    type="primary"
                    onClick={() => runBuild('webpack', 'build')}
                    loading={webpackLoading && !viteLoading}
                    icon={<ClockCircleOutlined />}
                  >
                    运行 Webpack
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => runBuild('vite', 'build')}
                    loading={viteLoading && !webpackLoading}
                    icon={<ThunderboltOutlined />}
                  >
                    运行 Vite
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>

          <Card>
            {(webpackLoading || viteLoading) ? (
              <div className="loading-container">
                <Spin size="large" tip={`${webpackLoading ? 'Webpack' : 'Vite'} 构建中...`} />
              </div>
            ) : (
              <div>
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={12}>
                    <Statistic
                      title="Webpack 最新构建时间"
                      value={webpackTime || 0}
                      suffix="ms"
                      valueStyle={{ color: '#e74c3c' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Vite 最新构建时间"
                      value={viteTime || 0}
                      suffix="ms"
                      valueStyle={{ color: '#2ecc71' }}
                      prefix={<RocketOutlined />}
                    />
                  </Col>
                </Row>

                {webpackTime && viteTime ? (
                  <Row>
                    <Col span={24}>
                      <div className="comparison-result">
                        <Tooltip title="Webpack 与 Vite 的性能差异倍数">
                          <Statistic
                            title="性能差异"
                            value={(webpackTime / viteTime).toFixed(1)}
                            suffix="x 倍"
                            valueStyle={{ color: '#3498db' }}
                            prefix={<BarChartOutlined />}
                          />
                        </Tooltip>
                        <div className="comparison-progress">
                          <div className="progress-label">Webpack</div>
                          <Progress
                            percent={100}
                            strokeColor="#e74c3c"
                            showInfo={false}
                            strokeWidth={20}
                          />
                          <div className="progress-value">{webpackTime} ms</div>
                        </div>
                        <div className="comparison-progress">
                          <div className="progress-label">Vite</div>
                          <Progress
                            percent={viteTime / webpackTime * 100}
                            strokeColor="#2ecc71"
                            showInfo={false}
                            strokeWidth={20}
                          />
                          <div className="progress-value">{viteTime} ms</div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : null}
              </div>
            )}

            {buildHistory.length > 0 && (
              <div id="comparison-chart" className="comparison-chart"></div>
            )}
          </Card>
        </TabPane>

        <TabPane tab="构建历史" key="history">
          <Card>
            <Table
              dataSource={buildHistory}
              columns={columns}
              rowKey={(record) => `${record.tool}-${record.phase}-${record.timestamp}`}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="技术原理" key="theory">
          <Card>
            <h3>Webpack 与 Vite 的核心差异</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>Webpack</th>
                  <th>Vite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>开发服务器启动</td>
                  <td>需要预先打包所有模块</td>
                  <td>无需打包，按需编译</td>
                </tr>
                <tr>
                  <td>模块处理方式</td>
                  <td>Bundle 基础（打包所有模块）</td>
                  <td>ESM 基础（原生模块）</td>
                </tr>
                <tr>
                  <td>HMR 实现</td>
                  <td>通过 Chunk 替换，需要重新构建依赖链</td>
                  <td>精确模块替换，无需重新构建</td>
                </tr>
                <tr>
                  <td>缓存策略</td>
                  <td>文件系统缓存，增量编译</td>
                  <td>浏览器缓存 + 预构建缓存</td>
                </tr>
                <tr>
                  <td>生产构建</td>
                  <td>自身构建引擎</td>
                  <td>基于 Rollup 构建</td>
                </tr>
                <tr>
                  <td>内存占用</td>
                  <td>较高（需维护完整依赖图）</td>
                  <td>较低（按需加载）</td>
                </tr>
              </tbody>
            </table>

            <h3>性能差异原因</h3>
            <ul className="theory-list">
              <li>
                <strong>冷启动差异</strong>：Webpack 需要解析所有模块依赖并构建完整的依赖图，而 Vite 仅在浏览器请求时按需编译。
              </li>
              <li>
                <strong>HMR 差异</strong>：Webpack 需要重新构建受影响的模块链，而 Vite 通过 ESM 导入精确替换修改的模块。
              </li>
              <li>
                <strong>构建策略</strong>：Vite 在开发环境利用浏览器原生 ESM 能力，避免了不必要的打包过程。
              </li>
              <li>
                <strong>预构建优化</strong>：Vite 预构建仅针对 node_modules 中的依赖，且结果可缓存复用。
              </li>
            </ul>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BundleComparator;
