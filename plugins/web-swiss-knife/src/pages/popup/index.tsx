import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, Layout, Menu, Spin, Card, Badge, Tabs, Button, Empty, Statistic, Row, Col, Divider, Typography, theme } from 'antd';
import { ReloadOutlined, SecurityScanOutlined, DatabaseOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import { MessageType, ModuleId, ScanResult } from '../../types';

import './style.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface SecuritySummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

const App: React.FC = () => {
  const [issues, setIssues] = useState<ScanResult[]>([]);
  const [summary, setSummary] = useState<SecuritySummary>({
    total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('security');
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = theme.useToken();

  // 加载安全问题
  const loadSecurityIssues = (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    console.log('loadSecurityIssues', chrome);

    // 检查 chrome.tabs API 是否可用
    if (!chrome || !chrome.tabs) {
      setError('Chrome API 不可用，请确保您在 Chrome 浏览器扩展中运行此页面');
      setLoading(false);
      return;
    }

    // 获取当前标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        setError('无法获取当前标签页');
        setLoading(false);
        return;
      }

      const currentTab = tabs[0];
      const tabId = currentTab.id;

      // 如果强制刷新，先请求扫描
      if (forceRefresh) {
        requestScan(tabId);
        return;
      }

      // 获取安全问题
      chrome.runtime.sendMessage({
        type: MessageType.GET_SECURITY_ISSUES,
        module: ModuleId.SECURITY,
        payload: { tabId }
      }, (response) => {
        setLoading(false);

        if (response && response.status === 'success') {
          const fetchedIssues = response.issues || [];
          const fetchedSummary = response.summary || {
            total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0
          };

          setIssues(fetchedIssues);
          setSummary(fetchedSummary);
        } else {
          setError('获取安全问题失败: ' + (response?.message || '未知错误'));
        }
      });
    });
  };

  // 请求扫描
  const requestScan = (tabId?: number) => {
    setLoading(true);
    setError(null);

    // 检查 chrome API 是否可用
    if (!chrome || !chrome.tabs || !chrome.runtime) {
      setError('Chrome API 不可用，请确保您在 Chrome 浏览器扩展中运行此页面');
      setLoading(false);
      return;
    }

    const scanTab = (id: number) => {
      chrome.tabs.sendMessage(id, {
        type: MessageType.SCAN_PAGE,
        module: ModuleId.SECURITY
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] 发送消息失败:', chrome.runtime.lastError);

          // 如果内容脚本未响应，尝试直接通过后台脚本扫描
          chrome.runtime.sendMessage({
            type: MessageType.SCAN_PAGE,
            module: ModuleId.SECURITY,
            payload: { tabId: id }
          }, () => {
            // 扫描完成后重新加载问题列表
            setTimeout(() => loadSecurityIssues(), 500);
          });
        } else {
          // 扫描完成后重新加载问题列表
          setTimeout(() => loadSecurityIssues(), 500);
        }
      });
    };

    if (tabId) {
      scanTab(tabId);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          setError('无法获取当前标签页');
          setLoading(false);
          return;
        }

        scanTab(tabs[0].id!);
      });
    }
  };

  // 初始化
  useEffect(() => {
    console.log('[Popup] 弹出窗口已加载');
    loadSecurityIssues();
  }, []);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);

    switch (key) {
      case 'security':
        loadSecurityIssues();
        break;
      case 'cache':
        // TODO: 加载缓存数据
        break;
      case 'performance':
        // TODO: 加载性能数据
        break;
    }
  };

  // 渲染安全问题列表
  const renderSecurityIssues = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>;
    }

    if (error) {
      return (
        <Empty
          description={<Text type="danger">{error}</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadSecurityIssues(true)}>重试</Button>
        </Empty>
      );
    }

    if (issues.length === 0) {
      return (
        <Empty
          description="未检测到安全问题"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadSecurityIssues(true)}>开始扫描</Button>
        </Empty>
      );
    }

    // 按严重程度排序
    const sortedIssues = [...issues].sort((a, b) => {
      const levelOrder = {
        'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4,
        level: 5
      };
      return levelOrder[a.level] - levelOrder[b.level];
    });

    return (
      <>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Statistic title="总计" value={summary.total} />
          </Col>
          <Col span={5}>
            <Statistic title="严重" value={summary.critical} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
          <Col span={5}>
            <Statistic title="高危" value={summary.high} valueStyle={{ color: '#fa8c16' }} />
          </Col>
          <Col span={5}>
            <Statistic title="中危" value={summary.medium} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={5}>
            <Statistic title="低危/信息" value={summary.low + summary.info} valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>
        <Divider style={{ margin: '8px 0' }} />
        {sortedIssues.map((issue, index) => {
          const levelColor = {
            'critical': '#ff4d4f',
            'high': '#fa8c16',
            'medium': '#faad14',
            'low': '#52c41a',
            'info': '#1890ff'
          }[issue.level] || '#1890ff';

          const levelText = {
            'critical': '严重',
            'high': '高危',
            'medium': '中危',
            'low': '低危',
            'info': '信息'
          }[issue.level] || issue.level;

          return (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 8 }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{issue.ruleId}</Text>
                  <Badge
                    count={levelText}
                    style={{ backgroundColor: levelColor }}
                  />
                </div>
              }
            >
              <Paragraph>{issue.message}</Paragraph>
              {issue.suggestion && (
                <Paragraph type="secondary" style={{
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  padding: 8,
                  borderRadius: 4
                }}>
                  建议: {issue.suggestion}
                </Paragraph>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: token.colorTextSecondary }}>
                <div>{new URL(issue.url).pathname}</div>
                <div>检测时间: {new Date(issue.timestamp).toLocaleString()}</div>
              </div>
            </Card>
          );
        })}
      </>
    );
  };

  // 渲染缓存可视化
  const renderCacheVisualization = () => {
    return (
      <Empty
        description="缓存可视化功能开发中"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  };

  // 渲染性能监控
  const renderPerformanceMonitoring = () => {
    return (
      <Empty
        description="性能监控功能开发中"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  };

  // 检查是否在扩展环境中运行
  const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.extension !== undefined;

  // 如果不在扩展环境中，显示提示信息
  if (!isExtensionEnvironment) {
    return (
      <ConfigProvider locale={zhCN}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Title level={3}>Web Swiss Knife</Title>
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
      <Layout style={{ minHeight: '500px' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{ display: window.innerWidth < 600 ? 'none' : 'block' }}
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
            selectedKeys={[activeTab]}
            onClick={({ key }) => handleTabChange(key)}
            items={[
              {
                key: 'security',
                icon: <SecurityScanOutlined />,
                label: '安全检测'
              },
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
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {window.innerWidth < 600 && (
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={[
                  { key: 'security', label: '安全检测' },
                  { key: 'cache', label: '缓存可视化' },
                  { key: 'performance', label: '性能监控' }
                ]}
                style={{ flex: 1 }}
              />
            )}
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => loadSecurityIssues(true)}
            >
              刷新
            </Button>
          </Header>
          <Content style={{ margin: '16px', padding: '16px', background: token.colorBgContainer }}>
            {activeTab === 'security' && renderSecurityIssues()}
            {activeTab === 'cache' && renderCacheVisualization()}
            {activeTab === 'performance' && renderPerformanceMonitoring()}
            {activeTab === 'settings' && <Empty description="设置功能开发中" />}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<App />);
