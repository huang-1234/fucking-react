import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ConfigProvider, Layout, Menu, Tabs, Card, Table, Button,
  Typography, Spin, Empty, Tag, Tooltip, Space, Drawer,
  Input, Select, Statistic, Row, Col, Divider, Badge
} from 'antd';
import {
  ReloadOutlined, SearchOutlined, InfoCircleOutlined,
  DeleteOutlined, EyeOutlined, SettingOutlined,
  DatabaseOutlined, DashboardOutlined, CodeOutlined,
  BarChartOutlined, LineChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';

import './style.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

// 缓存数据类型
interface CacheEntry {
  url: string;
  size: number;
  type: string;
  method: string;
  status: number;
  age: number;
  expires?: string;
  lastModified?: string;
  cacheControl?: string;
}

// 性能数据类型
interface PerformanceData {
  url: string;
  timestamp: number;
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

const App: React.FC = () => {
  const [activeKey, setActiveKey] = useState('cache');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    totalSize: 0,
    imageSize: 0,
    jsSize: 0,
    cssSize: 0,
    htmlSize: 0,
    otherSize: 0
  });

  // 模拟加载数据
  useEffect(() => {
    // 这里应该从 Chrome API 获取真实数据
    // 现在使用模拟数据
    const mockCacheData = Array(20).fill(0).map((_, i) => ({
      key: i.toString(),
      url: `https://example.com/assets/file${i}.${['js', 'css', 'png', 'jpg', 'html'][i % 5]}`,
      size: Math.floor(Math.random() * 1000000),
      type: ['javascript', 'stylesheet', 'image', 'image', 'document'][i % 5],
      method: 'GET',
      status: 200,
      age: Math.floor(Math.random() * 3600),
      expires: new Date(Date.now() + 86400000).toISOString(),
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      cacheControl: 'max-age=86400, public'
    }));

    const mockPerformanceData = Array(10).fill(0).map((_, i) => ({
      key: i.toString(),
      url: `https://example.com/page${i}.html`,
      timestamp: Date.now() - i * 3600000,
      fcp: Math.random() * 1000 + 500,
      lcp: Math.random() * 2000 + 1000,
      fid: Math.random() * 100 + 10,
      cls: Math.random() * 0.2,
      ttfb: Math.random() * 500 + 100
    }));

    setCacheEntries(mockCacheData);
    setPerformanceData(mockPerformanceData);

    // 计算缓存统计信息
    const stats = {
      totalEntries: mockCacheData.length,
      totalSize: mockCacheData.reduce((sum, entry) => sum + entry.size, 0),
      imageSize: mockCacheData.filter(e => e.type === 'image').reduce((sum, entry) => sum + entry.size, 0),
      jsSize: mockCacheData.filter(e => e.type === 'javascript').reduce((sum, entry) => sum + entry.size, 0),
      cssSize: mockCacheData.filter(e => e.type === 'stylesheet').reduce((sum, entry) => sum + entry.size, 0),
      htmlSize: mockCacheData.filter(e => e.type === 'document').reduce((sum, entry) => sum + entry.size, 0),
      otherSize: mockCacheData.filter(e => !['image', 'javascript', 'stylesheet', 'document'].includes(e.type)).reduce((sum, entry) => sum + entry.size, 0)
    };

    setCacheStats(stats);
  }, []);

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // 这里应该重新获取数据
    }, 1000);
  };

  // 查看详情
  const handleViewDetail = (record: any) => {
    setCurrentDetail(record);
    setDetailVisible(true);
  };

  // 格式化文件大小
  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 缓存表格列
  const cacheColumns: any[] = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (text: string) => {
        const url = new URL(text);
        return (
          <Tooltip title={text}>
            <span>{url.pathname}</span>
          </Tooltip>
        );
      },
      // 修复类型问题
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: CacheEntry) => {
        if (typeof value === 'string') {
          return record.url.toLowerCase().includes(value.toLowerCase());
        }
        return false;
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'javascript': 'blue',
          'stylesheet': 'green',
          'image': 'purple',
          'document': 'orange',
          'font': 'cyan'
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
      filters: [
        { text: 'JavaScript', value: 'javascript' },
        { text: 'CSS', value: 'stylesheet' },
        { text: '图片', value: 'image' },
        { text: 'HTML', value: 'document' },
        { text: '字体', value: 'font' },
        { text: '其他', value: 'other' }
      ],
      onFilter: (value: any, record: CacheEntry) => {
        if (typeof value === 'string') {
          return record.type === value;
        }
        return false;
      }
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      sorter: (a: CacheEntry, b: CacheEntry) => a.size - b.size,
      render: (size: number) => formatSize(size)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        if (status >= 200 && status < 300) return <Badge status="success" text={status} />;
        if (status >= 300 && status < 400) return <Badge status="processing" text={status} />;
        if (status >= 400 && status < 500) return <Badge status="warning" text={status} />;
        return <Badge status="error" text={status} />;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CacheEntry) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => console.log('删除', record)}
          />
        </Space>
      )
    }
  ];

  // 性能表格列
  const performanceColumns: any[] = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (text: string) => {
        const url = new URL(text);
        return (
          <Tooltip title={text}>
            <span>{url.pathname}</span>
          </Tooltip>
        );
      }
    },
    {
      title: 'FCP (ms)',
      dataIndex: 'fcp',
      key: 'fcp',
      sorter: (a: PerformanceData, b: PerformanceData) => (a.fcp || 0) - (b.fcp || 0),
      render: (value: number) => {
        let color = 'green';
        if (value > 1800) color = 'red';
        else if (value > 1000) color = 'orange';
        return <Text style={{ color }}>{value.toFixed(0)}</Text>;
      }
    },
    {
      title: 'LCP (ms)',
      dataIndex: 'lcp',
      key: 'lcp',
      sorter: (a: PerformanceData, b: PerformanceData) => (a.lcp || 0) - (b.lcp || 0),
      render: (value: number) => {
        let color = 'green';
        if (value > 2500) color = 'red';
        else if (value > 1800) color = 'orange';
        return <Text style={{ color }}>{value.toFixed(0)}</Text>;
      }
    },
    {
      title: 'FID (ms)',
      dataIndex: 'fid',
      key: 'fid',
      sorter: (a: PerformanceData, b: PerformanceData) => (a.fid || 0) - (b.fid || 0),
      render: (value: number) => {
        let color = 'green';
        if (value > 100) color = 'red';
        else if (value > 50) color = 'orange';
        return <Text style={{ color }}>{value.toFixed(0)}</Text>;
      }
    },
    {
      title: 'CLS',
      dataIndex: 'cls',
      key: 'cls',
      sorter: (a: PerformanceData, b: PerformanceData) => (a.cls || 0) - (b.cls || 0),
      render: (value: number) => {
        let color = 'green';
        if (value > 0.1) color = 'red';
        else if (value > 0.05) color = 'orange';
        return <Text style={{ color }}>{value.toFixed(3)}</Text>;
      }
    },
    {
      title: 'TTFB (ms)',
      dataIndex: 'ttfb',
      key: 'ttfb',
      sorter: (a: PerformanceData, b: PerformanceData) => (a.ttfb || 0) - (b.ttfb || 0),
      render: (value: number) => {
        let color = 'green';
        if (value > 600) color = 'red';
        else if (value > 300) color = 'orange';
        return <Text style={{ color }}>{value.toFixed(0)}</Text>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PerformanceData) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        />
      )
    }
  ];

  // 渲染缓存可视化
  const renderCacheVisualization = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>;
    }

    if (cacheEntries.length === 0) {
      return (
        <Empty
          description="未找到缓存数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleRefresh}>刷新</Button>
        </Empty>
      );
    }

    // 计算过滤后的条目
    const filteredEntries = searchText
      ? cacheEntries.filter(entry => entry.url.toLowerCase().includes(searchText.toLowerCase()))
      : cacheEntries;

    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic title="总条目" value={cacheStats.totalEntries} />
            </Col>
            <Col span={4}>
              <Statistic title="总大小" value={formatSize(cacheStats.totalSize)} />
            </Col>
            <Col span={4}>
              <Statistic title="JS" value={formatSize(cacheStats.jsSize)} />
            </Col>
            <Col span={4}>
              <Statistic title="CSS" value={formatSize(cacheStats.cssSize)} />
            </Col>
            <Col span={4}>
              <Statistic title="图片" value={formatSize(cacheStats.imageSize)} />
            </Col>
            <Col span={4}>
              <Statistic title="HTML" value={formatSize(cacheStats.htmlSize)} />
            </Col>
          </Row>
        </div>
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="搜索 URL"
              allowClear
              onSearch={setSearchText}
              style={{ width: 250 }}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">全部缓存</Option>
              <Option value="memory">内存缓存</Option>
              <Option value="disk">磁盘缓存</Option>
              <Option value="sw">Service Worker</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </div>
        <Table
          columns={cacheColumns}
          dataSource={filteredEntries.map((entry, i) => ({ ...entry, key: i }))}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 800 }}
        />
      </>
    );
  };

  // 渲染性能监控
  const renderPerformanceMonitoring = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>;
    }

    if (performanceData.length === 0) {
      return (
        <Empty
          description="未找到性能数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleRefresh}>刷新</Button>
        </Empty>
      );
    }

    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="搜索 URL"
              allowClear
              onSearch={setSearchText}
              style={{ width: 250 }}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">所有指标</Option>
              <Option value="fcp">FCP</Option>
              <Option value="lcp">LCP</Option>
              <Option value="fid">FID</Option>
              <Option value="cls">CLS</Option>
              <Option value="ttfb">TTFB</Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<LineChartOutlined />}>趋势图</Button>
            <Button icon={<BarChartOutlined />}>柱状图</Button>
            <Button icon={<PieChartOutlined />}>饼图</Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </Space>
        </div>
        <Table
          columns={performanceColumns}
          dataSource={performanceData}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 800 }}
        />
      </>
    );
  };

  // 检查是否在扩展环境中运行
  const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.extension !== undefined;

  // 如果不在扩展环境中，显示提示信息
  if (!isExtensionEnvironment) {
    return (
      <ConfigProvider locale={zhCN}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Title level={3}>Web Swiss Knife - 开发者工具</Title>
          <Paragraph>
            此页面需要在 Chrome 浏览器扩展环境中运行。
          </Paragraph>
          <Paragraph>
            请按照以下步骤安装此扩展：
          </Paragraph>
          <ol style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>打开 Chrome 浏览器</li>
            <li>访问 chrome://extensions/</li>
            <li>开启"开发者模式"</li>
            <li>点击"加载已解压的扩展程序"</li>
            <li>选择包含此扩展的目录</li>
          </ol>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN} theme={{ token: { borderRadius: 4 } }}>
      <Layout style={{ height: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          breakpoint="md"
          collapsedWidth={window.innerWidth < 768 ? 0 : 80}
        >
          <div style={{
            height: 32,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            {!collapsed && <Title level={5} style={{ margin: 0 }}>Web Swiss Knife</Title>}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={({ key }) => setActiveKey(key)}
            items={[
              {
                key: 'cache',
                icon: <DatabaseOutlined />,
                label: '缓存可视化'
              },
              {
                key: 'performance',
                icon: <DashboardOutlined />,
                label: '性能监控'
              },
              {
                key: 'code',
                icon: <CodeOutlined />,
                label: '代码分析'
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: '设置'
              }
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Title level={4} style={{ margin: 0 }}>
              {activeKey === 'cache' && '缓存可视化'}
              {activeKey === 'performance' && '性能监控'}
              {activeKey === 'code' && '代码分析'}
              {activeKey === 'settings' && '设置'}
            </Title>
            <Space>
              <Tooltip title="查看帮助">
                <Button icon={<InfoCircleOutlined />} />
              </Tooltip>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              >
                刷新
              </Button>
            </Space>
          </Header>
          <Content style={{ margin: '16px', padding: '16px', background: '#fff', overflow: 'auto' }}>
            {activeKey === 'cache' && renderCacheVisualization()}
            {activeKey === 'performance' && renderPerformanceMonitoring()}
            {activeKey === 'code' && (
              <Empty
                description="代码分析功能开发中"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            {activeKey === 'settings' && (
              <Empty
                description="设置功能开发中"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title="详细信息"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={500}
      >
        {currentDetail && (
          <div>
            <Paragraph>
              <Text strong>URL: </Text>
              <Text>{currentDetail.url}</Text>
            </Paragraph>
            {activeKey === 'cache' && (
              <>
                <Paragraph>
                  <Text strong>类型: </Text>
                  <Tag>{currentDetail.type}</Tag>
                </Paragraph>
                <Paragraph>
                  <Text strong>大小: </Text>
                  <Text>{formatSize(currentDetail.size)}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>HTTP 方法: </Text>
                  <Text>{currentDetail.method}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>状态码: </Text>
                  <Text>{currentDetail.status}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>缓存时间: </Text>
                  <Text>{currentDetail.age} 秒</Text>
                </Paragraph>
                {currentDetail.expires && (
                  <Paragraph>
                    <Text strong>过期时间: </Text>
                    <Text>{new Date(currentDetail.expires).toLocaleString()}</Text>
                  </Paragraph>
                )}
                {currentDetail.lastModified && (
                  <Paragraph>
                    <Text strong>最后修改: </Text>
                    <Text>{new Date(currentDetail.lastModified).toLocaleString()}</Text>
                  </Paragraph>
                )}
                {currentDetail.cacheControl && (
                  <Paragraph>
                    <Text strong>缓存控制: </Text>
                    <Text>{currentDetail.cacheControl}</Text>
                  </Paragraph>
                )}
              </>
            )}
            {activeKey === 'performance' && (
              <>
                <Paragraph>
                  <Text strong>时间戳: </Text>
                  <Text>{new Date(currentDetail.timestamp).toLocaleString()}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>首次内容绘制 (FCP): </Text>
                  <Text>{currentDetail.fcp?.toFixed(2)} ms</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>最大内容绘制 (LCP): </Text>
                  <Text>{currentDetail.lcp?.toFixed(2)} ms</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>首次输入延迟 (FID): </Text>
                  <Text>{currentDetail.fid?.toFixed(2)} ms</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>累积布局偏移 (CLS): </Text>
                  <Text>{currentDetail.cls?.toFixed(3)}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>首字节时间 (TTFB): </Text>
                  <Text>{currentDetail.ttfb?.toFixed(2)} ms</Text>
                </Paragraph>
              </>
            )}
          </div>
        )}
      </Drawer>
    </ConfigProvider>
  );
};

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<App />);
