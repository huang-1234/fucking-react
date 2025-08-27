import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, Input, Typography, notification, Spin } from 'antd';
import { PlayCircleOutlined, CodeOutlined, ReloadOutlined, BugOutlined } from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import { safeLoadModule, loadModuleFromUrl, detectModuleType, ModuleType, moduleExamples } from '../Systemjs/base';
import { dashboard } from '../Systemjs/ModuleDashboard';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// 模块类型颜色映射
const typeColors: Record<ModuleType, string> = {
  [ModuleType.AMD]: '#1890ff',
  [ModuleType.CJS]: '#52c41a',
  [ModuleType.ESM]: '#722ed1',
  [ModuleType.UMD]: '#fa8c16',
  [ModuleType.IIFE]: '#f5222d',
};

// 示例URL列表
const EXAMPLE_URLS = [
  {
    name: 'Lodash (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
  },
  {
    name: 'React (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js'
  },
  {
    name: 'Moment.js (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js'
  },
  {
    name: 'Axios (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/axios@0.24.0/dist/axios.min.js'
  },
];

/**
 * 模块类型标签组件
 */
const ModuleTypeTag: React.FC<{ type: ModuleType }> = ({ type }) => {
  return (
    <div style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      backgroundColor: typeColors[type],
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px',
    }}>
      {type.toUpperCase()}
    </div>
  );
};

/**
 * 性能指标组件
 */
const PerformanceMetrics: React.FC<{ metrics: any[] }> = ({ metrics }) => {
  if (!metrics.length) {
    return <Text type="secondary">尚无加载指标数据</Text>;
  }

  return (
    <div>
      <Title level={5}>加载性能指标</Title>
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {metrics.map((metric, index) => (
          <Card size="small" key={index} style={{ marginBottom: '8px' }}>
            <div><Text strong>URL:</Text> {metric.url}</div>
            <div><Text strong>加载时间:</Text> {metric.duration.toFixed(2)}ms</div>
            {metric.size && <div><Text strong>大小:</Text> {(parseInt(metric.size) / 1024).toFixed(2)}KB</div>}
            <div><Text strong>时间戳:</Text> {new Date(metric.timestamp).toLocaleTimeString()}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * SystemJS演示组件
 */
const DemoSystem: React.FC = () => {
  const [url, setUrl] = useState('');
  const [moduleId, setModuleId] = useState('remote-module');
  const [code, setCode] = useState('');
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);
  const [moduleExports, setModuleExports] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('remote');
  const [selectedExample, setSelectedExample] = useState('');
  const [monitorActive, setMonitorActive] = useState(false);

  // 初始化
  useEffect(() => {
    // 启动性能监控
    dashboard.startLoadingMonitor();
    setMonitorActive(true);

    // 监听指标更新事件
    const handleMetricUpdate = (e: any) => {
      setMetrics(prev => [...prev, e.detail]);
    };

    window.addEventListener('systemjs-metric', handleMetricUpdate);

    return () => {
      // 清理
      window.removeEventListener('systemjs-metric', handleMetricUpdate);
      dashboard.stopLoadingMonitor();
    };
  }, []);

  // 切换监控状态
  const toggleMonitor = () => {
    if (monitorActive) {
      dashboard.stopLoadingMonitor();
      setMonitorActive(false);
    } else {
      dashboard.startLoadingMonitor();
      setMonitorActive(true);
    }
  };

  // 清除指标数据
  const clearMetrics = () => {
    dashboard.clearMetrics();
    setMetrics([]);
  };

  // 获取远程JS代码
  const fetchModuleCode = async () => {
    if (!url) {
      notification.error({ message: '请输入有效的URL' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP错误 ${response.status}: ${response.statusText}`);
      }

      const fetchedCode = await response.text();
      setCode(fetchedCode || '');

      // 检测模块类型
      const detectedType = detectModuleType(fetchedCode);
      setModuleType(detectedType);
    } catch (error) {
      console.error('获取模块代码失败:', error);
      notification.error({
        message: '获取模块失败',
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载模块
  const loadModule = async () => {
    if (!code) {
      notification.error({ message: '请先获取或输入模块代码' });
      return;
    }

    setLoading(true);
    try {
      const exports = await safeLoadModule(code, moduleId);
      setModuleExports(exports);
      notification.success({ message: '模块加载成功' });
    } catch (error) {
      console.error('模块加载失败:', error);
      notification.error({
        message: '模块加载失败',
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  // 直接从URL加载模块
  const loadModuleDirectly = async () => {
    if (!url) {
      notification.error({ message: '请输入有效的URL' });
      return;
    }

    setLoading(true);
    try {
      const exports = await loadModuleFromUrl(url, moduleId);
      setModuleExports(exports);

      // 获取代码用于显示
      const response = await fetch(url);
      const fetchedCode = await response.text();
      setCode(fetchedCode);

      // 检测模块类型
      const detectedType = detectModuleType(fetchedCode);
      setModuleType(detectedType);

      notification.success({ message: '模块加载成功' });
    } catch (error) {
      console.error('模块加载失败:', error);
      notification.error({
        message: '模块加载失败',
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载示例代码
  const loadExampleCode = (type: keyof typeof moduleExamples) => {
    setCode(moduleExamples[type]);
    setModuleType(ModuleType[type.toUpperCase() as keyof typeof ModuleType]);
    setSelectedExample(type);
  };

  // 渲染模块导出
  const renderExports = (exports: any) => {
    if (!exports) return null;

    try {
      // 处理不同类型的导出
      if (typeof exports === 'function') {
        return <Text code>Function: {exports.name || 'anonymous'}</Text>;
      } else if (typeof exports === 'object') {
        return (
          <div>
            {Object.keys(exports).map(key => (
              <div key={key} style={{ marginBottom: '8px' }}>
                <Text strong>{key}: </Text>
                <Text code>{renderExportValue(exports[key])}</Text>
              </div>
            ))}
          </div>
        );
      } else {
        return <Text code>{String(exports)}</Text>;
      }
    } catch (e) {
      return <Text type="danger">无法显示导出: {String(e)}</Text>;
    }
  };

  // 渲染导出值
  const renderExportValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return `Function: ${value.name || 'anonymous'}`;
    if (typeof value === 'object') return '[Object]';
    return String(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>SystemJS 模块加载演示</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="远程模块加载" key="remote">
          <Card title="加载远程JavaScript模块">
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Input
                  placeholder="输入JS模块URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ width: '500px' }}
                />
                <Input
                  placeholder="模块ID"
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  style={{ width: '200px' }}
                />
                <Button
                  type="primary"
                  icon={<CodeOutlined />}
                  onClick={fetchModuleCode}
                  loading={loading}
                >
                  获取代码
                </Button>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={loadModuleDirectly}
                  loading={loading}
                >
                  直接加载
                </Button>
              </Space>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>示例模块: </Text>
              <Space wrap>
                {EXAMPLE_URLS.map((example) => (
                  <Button
                    key={example.url}
                    onClick={() => setUrl(example.url)}
                    type={url === example.url ? 'primary' : 'default'}
                    size="small"
                  >
                    {example.name}
                  </Button>
                ))}
              </Space>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="本地模块示例" key="local">
          <Card title="本地模块示例">
            <div style={{ marginBottom: '16px' }}>
              <Text strong>选择模块类型: </Text>
              <Space wrap>
                {(Object.keys(moduleExamples) as Array<keyof typeof moduleExamples>).map((type) => (
                  <Button
                    key={type}
                    onClick={() => loadExampleCode(type)}
                    type={selectedExample === type ? 'primary' : 'default'}
                    size="small"
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </Space>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Input
                  placeholder="模块ID"
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  style={{ width: '200px' }}
                />
              </Space>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="性能监控" key="monitor">
          <Card title="SystemJS加载性能监控">
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Button
                  type={monitorActive ? 'primary' : 'default'}
                  onClick={toggleMonitor}
                  icon={<BugOutlined />}
                >
                  {monitorActive ? '停止监控' : '启动监控'}
                </Button>
                <Button
                  onClick={clearMetrics}
                  icon={<ReloadOutlined />}
                >
                  清除数据
                </Button>
              </Space>
            </div>

            <PerformanceMetrics metrics={metrics} />
          </Card>
        </TabPane>
      </Tabs>

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>模块代码</span>
                {moduleType && <ModuleTypeTag type={moduleType} />}
              </div>
            }
            extra={
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={loadModule}
                disabled={!code || loading}
              >
                加载模块
              </Button>
            }
          >
            <div style={{ height: '400px' }}>
              <MonacoEditor
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  readOnly: loading,
                }}
              />
            </div>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card title="模块导出">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin tip="加载中..." />
              </div>
            ) : moduleExports ? (
              <div style={{ height: '400px', overflow: 'auto' }}>
                {renderExports(moduleExports)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">尚未加载模块或模块无导出</Text>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoSystem;