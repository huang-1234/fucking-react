import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, Layout, Menu, Spin, Card, Badge, Tabs, Button, Empty, Statistic, Row, Col, Divider, Typography, theme, List, Avatar, Tag, Space, Switch, Select, InputNumber } from 'antd';
import { ReloadOutlined, SecurityScanOutlined, DatabaseOutlined, DashboardOutlined, SettingOutlined, FileOutlined, FileTextOutlined, LineChartOutlined, AreaChartOutlined, PieChartOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import { MessageType, ModuleId, ScanResult } from '../../types';

import './style.css';
import { menuItems, tabItems, TabKey } from './tabs';

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
  const [activeTab, setActiveTab] = useState(TabKey.security);
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
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);

    switch (key) {
      case TabKey.security:
        loadSecurityIssues();
        break;
      case TabKey.cache:
        loadCacheData();
        break;
      case TabKey.performance:
        loadPerformanceData();
        break;
      case TabKey.settings:
        loadSettings();
        break;
    }
  };

  // 加载缓存数据
  const loadCacheData = (forceRefresh = false) => {
    setCacheLoading(true);
    setCacheError(null);

    // 检查 chrome API 是否可用
    if (!chrome || !chrome.runtime) {
      setCacheError('Chrome API 不可用，请确保您在 Chrome 浏览器扩展中运行此页面');
      setCacheLoading(false);
      return;
    }

    // 获取当前标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        setCacheError('无法获取当前标签页');
        setCacheLoading(false);
        return;
      }

      const currentTab = tabs[0];
      const tabId = currentTab.id;

      // 如果强制刷新，先请求扫描
      if (forceRefresh) {
        requestCacheScan(tabId);
        return;
      }

      // 获取缓存数据
      chrome.runtime.sendMessage({
        type: MessageType.GET_CACHE_INFO,
        module: ModuleId.CACHE,
        payload: { tabId }
      }, (response) => {
        setCacheLoading(false);

        if (response && response.status === 'success') {
          const fetchedCache = response.data || [];
          setCacheData(fetchedCache);

          // 计算统计信息
          const stats = {
            total: fetchedCache.length,
            size: fetchedCache.reduce((sum: number, item: any) => sum + (item.size || 0), 0),
            jsSize: fetchedCache.filter((item: any) => item.type === 'javascript').reduce((sum: number, item: any) => sum + (item.size || 0), 0),
            cssSize: fetchedCache.filter((item: any) => item.type === 'stylesheet').reduce((sum: number, item: any) => sum + (item.size || 0), 0),
            imageSize: fetchedCache.filter((item: any) => item.type === 'image').reduce((sum: number, item: any) => sum + (item.size || 0), 0),
            otherSize: fetchedCache.filter((item: any) => !['javascript', 'stylesheet', 'image'].includes(item.type)).reduce((sum: number, item: any) => sum + (item.size || 0), 0)
          };
          setCacheStats(stats);
        } else {
          setCacheError('获取缓存数据失败: ' + (response?.message || '未知错误'));
        }
      });
    });
  };

  // 请求缓存扫描
  const requestCacheScan = (tabId?: number) => {
    setCacheLoading(true);
    setCacheError(null);

    const scanTab = (id: number) => {
      chrome.tabs.sendMessage(id, {
        type: MessageType.SCAN_PAGE,
        module: ModuleId.CACHE
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] 发送消息失败:', chrome.runtime.lastError);

          // 如果内容脚本未响应，尝试直接通过后台脚本扫描
          chrome.runtime.sendMessage({
            type: MessageType.SCAN_PAGE,
            module: ModuleId.CACHE,
            payload: { tabId: id }
          }, () => {
            // 扫描完成后重新加载缓存数据
            setTimeout(() => loadCacheData(), 500);
          });
        } else {
          // 扫描完成后重新加载缓存数据
          setTimeout(() => loadCacheData(), 500);
        }
      });
    };

    if (tabId) {
      scanTab(tabId);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          setCacheError('无法获取当前标签页');
          setCacheLoading(false);
          return;
        }

        scanTab(tabs[0].id!);
      });
    }
  };

  // 加载性能数据
  const loadPerformanceData = (forceRefresh = false) => {
    setPerfLoading(true);
    setPerfError(null);

    // 检查 chrome API 是否可用
    if (!chrome || !chrome.runtime) {
      setPerfError('Chrome API 不可用，请确保您在 Chrome 浏览器扩展中运行此页面');
      setPerfLoading(false);
      return;
    }

    // 获取当前标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        setPerfError('无法获取当前标签页');
        setPerfLoading(false);
        return;
      }

      const currentTab = tabs[0];
      const tabId = currentTab.id;

      // 如果强制刷新，先请求扫描
      if (forceRefresh) {
        requestPerfScan(tabId);
        return;
      }

      // 获取性能数据
      chrome.runtime.sendMessage({
        type: MessageType.GET_PERFORMANCE_DATA,
        module: ModuleId.PERFORMANCE,
        payload: { tabId }
      }, (response) => {
        setPerfLoading(false);

        if (response && response.status === 'success') {
          setPerformanceData(response.data || {});
        } else {
          setPerfError('获取性能数据失败: ' + (response?.message || '未知错误'));
        }
      });
    });
  };

  // 请求性能扫描
  const requestPerfScan = (tabId?: number) => {
    setPerfLoading(true);
    setPerfError(null);

    const scanTab = (id: number) => {
      chrome.tabs.sendMessage(id, {
        type: MessageType.SCAN_PAGE,
        module: ModuleId.PERFORMANCE
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] 发送消息失败:', chrome.runtime.lastError);

          // 如果内容脚本未响应，尝试直接通过后台脚本扫描
          chrome.runtime.sendMessage({
            type: MessageType.SCAN_PAGE,
            module: ModuleId.PERFORMANCE,
            payload: { tabId: id }
          }, () => {
            // 扫描完成后重新加载性能数据
            setTimeout(() => loadPerformanceData(), 500);
          });
        } else {
          // 扫描完成后重新加载性能数据
          setTimeout(() => loadPerformanceData(), 500);
        }
      });
    };

    if (tabId) {
      scanTab(tabId);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          setPerfError('无法获取当前标签页');
          setPerfLoading(false);
          return;
        }

        scanTab(tabs[0].id!);
      });
    }
  };

  // 加载设置
  const loadSettings = () => {
    setSettingsLoading(true);
    setSettingsError(null);

    // 检查 chrome API 是否可用
    if (!chrome || !chrome.storage) {
      setSettingsError('Chrome API 不可用，请确保您在 Chrome 浏览器扩展中运行此页面');
      setSettingsLoading(false);
      return;
    }

    // 从存储中获取设置
    chrome.storage.sync.get('settings', (result) => {
      setSettingsLoading(false);
      if (chrome.runtime.lastError) {
        setSettingsError('获取设置失败: ' + chrome.runtime.lastError.message);
        return;
      }

      if (result.settings) {
        setSettingsData(result.settings);
      }
    });
  };

  // 保存设置
  const saveSettings = (key: string, value: any) => {
    const newSettings = { ...settingsData };

    // 根据键路径设置值
    const keys = key.split('.');
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettingsData(newSettings);

    // 保存到存储
    chrome.storage.sync.set({ settings: newSettings }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存设置失败:', chrome.runtime.lastError);
        return;
      }

      // 通知后台脚本设置已更新
      chrome.runtime.sendMessage({
        type: MessageType.SET_CONFIG,
        payload: { settings: newSettings }
      });
    });
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

  // 缓存可视化状态
  const [cacheData, setCacheData] = useState<any[]>([]);
  const [cacheLoading, setCacheLoading] = useState(true);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({
    total: 0,
    size: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    otherSize: 0
  });

  // 渲染缓存可视化
  const renderCacheVisualization = () => {

    useEffect(() => {
      if (activeTab === 'cache') {
        loadCacheData();
      }
    }, [activeTab]);

    // 格式化文件大小
    const formatSize = (size: number) => {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (cacheLoading) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>;
    }

    if (cacheError) {
      return (
        <Empty
          description={<Text type="danger">{cacheError}</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadCacheData(true)}>重试</Button>
        </Empty>
      );
    }

    if (cacheData.length === 0) {
      return (
        <Empty
          description="未检测到缓存数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadCacheData(true)}>扫描缓存</Button>
        </Empty>
      );
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <Statistic title="总缓存数量" value={cacheStats.total} suffix="个" />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="总缓存大小" value={formatSize(cacheStats.size)} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Button type="primary" block onClick={() => loadCacheData(true)}>刷新缓存</Button>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="JavaScript"
                value={formatSize(cacheStats.jsSize)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="CSS"
                value={formatSize(cacheStats.cssSize)}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="图片"
                value={formatSize(cacheStats.imageSize)}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="其他"
                value={formatSize(cacheStats.otherSize)}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <List
          size="small"
          bordered
          dataSource={cacheData}
          renderItem={(item: any) => {
            const url = new URL(item.url);
            const pathname = url.pathname;
            const filename = pathname.split('/').pop() || pathname;

            let icon;
            let color;

            if (item.type === 'javascript') {
              icon = <FileOutlined />;
              color = '#1890ff';
            } else if (item.type === 'stylesheet') {
              icon = <FileTextOutlined />;
              color = '#52c41a';
            } else if (item.type === 'image') {
              icon = <FileOutlined />;
              color = '#722ed1';
            } else {
              icon = <FileOutlined />;
              color = '#fa8c16';
            }

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={icon} style={{ backgroundColor: color }} />}
                  title={<Text ellipsis={{ tooltip: item.url }}>{filename}</Text>}
                  description={
                    <Space>
                      <Tag color={color}>{item.type}</Tag>
                      <Text type="secondary">{formatSize(item.size)}</Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </>
    );
  };

  // 性能监控状态
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [perfLoading, setPerfLoading] = useState(true);
  const [perfError, setPerfError] = useState<string | null>(null);

  // 渲染性能监控
  const renderPerformanceMonitoring = () => {

    useEffect(() => {
      if (activeTab === 'performance') {
        loadPerformanceData();
      }
    }, [activeTab]);

    // 获取性能指标评级
    const getMetricRating = (metric: string, value: number): { color: string; rating: string } => {
      if (metric === 'fcp') {
        if (value <= 1800) return { color: '#52c41a', rating: '良好' };
        if (value <= 3000) return { color: '#faad14', rating: '需要改进' };
        return { color: '#f5222d', rating: '较差' };
      } else if (metric === 'lcp') {
        if (value <= 2500) return { color: '#52c41a', rating: '良好' };
        if (value <= 4000) return { color: '#faad14', rating: '需要改进' };
        return { color: '#f5222d', rating: '较差' };
      } else if (metric === 'fid') {
        if (value <= 100) return { color: '#52c41a', rating: '良好' };
        if (value <= 300) return { color: '#faad14', rating: '需要改进' };
        return { color: '#f5222d', rating: '较差' };
      } else if (metric === 'cls') {
        if (value <= 0.1) return { color: '#52c41a', rating: '良好' };
        if (value <= 0.25) return { color: '#faad14', rating: '需要改进' };
        return { color: '#f5222d', rating: '较差' };
      } else if (metric === 'ttfb') {
        if (value <= 800) return { color: '#52c41a', rating: '良好' };
        if (value <= 1800) return { color: '#faad14', rating: '需要改进' };
        return { color: '#f5222d', rating: '较差' };
      }
      return { color: '#1890ff', rating: '未知' };
    };

    if (perfLoading) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>;
    }

    if (perfError) {
      return (
        <Empty
          description={<Text type="danger">{perfError}</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadPerformanceData(true)}>重试</Button>
        </Empty>
      );
    }

    if (!performanceData || Object.keys(performanceData).length === 0) {
      return (
        <Empty
          description="未检测到性能数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadPerformanceData(true)}>分析性能</Button>
        </Empty>
      );
    }

    const { fcp, lcp, fid, cls, ttfb } = performanceData;
    const fcpRating = getMetricRating('fcp', fcp);
    const lcpRating = getMetricRating('lcp', lcp);
    const fidRating = getMetricRating('fid', fid);
    const clsRating = getMetricRating('cls', cls);
    const ttfbRating = getMetricRating('ttfb', ttfb);

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card size="small" title="Core Web Vitals 性能评分" extra={<Button type="primary" icon={<ReloadOutlined />} onClick={() => loadPerformanceData(true)}>刷新</Button>}>
              <Row gutter={16}>
                <Col span={8}>
                  <Card size="small" bordered={false} style={{ textAlign: 'center', background: lcpRating.color, color: 'white' }}>
                    <Statistic title="LCP" value={lcp ? `${Math.round(lcp)}ms` : 'N/A'} />
                    <div>{lcpRating.rating}</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bordered={false} style={{ textAlign: 'center', background: fidRating.color, color: 'white' }}>
                    <Statistic title="FID" value={fid ? `${Math.round(fid)}ms` : 'N/A'} />
                    <div>{fidRating.rating}</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bordered={false} style={{ textAlign: 'center', background: clsRating.color, color: 'white' }}>
                    <Statistic title="CLS" value={cls ? cls.toFixed(3) : 'N/A'} />
                    <div>{clsRating.rating}</div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="首次内容绘制 (FCP)">
              <Statistic
                title="加载时间"
                value={fcp ? Math.round(fcp) : 'N/A'}
                suffix="ms"
                valueStyle={{ color: fcpRating.color }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color={fcpRating.color}>{fcpRating.rating}</Tag>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  用户首次看到页面内容的时间
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="首字节时间 (TTFB)">
              <Statistic
                title="响应时间"
                value={ttfb ? Math.round(ttfb) : 'N/A'}
                suffix="ms"
                valueStyle={{ color: ttfbRating.color }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color={ttfbRating.color}>{ttfbRating.rating}</Tag>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  服务器响应时间
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Card
          size="small"
          title="性能指标说明"
          style={{ marginBottom: 16 }}
        >
          <List size="small">
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<AreaChartOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title="最大内容绘制 (LCP)"
                description="测量页面主要内容加载完成的时间，应小于 2.5 秒"
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<LineChartOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                title="首次输入延迟 (FID)"
                description="测量用户首次与页面交互的响应时间，应小于 100 毫秒"
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<PieChartOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                title="累积布局偏移 (CLS)"
                description="测量页面视觉稳定性，应小于 0.1"
              />
            </List.Item>
          </List>
        </Card>
      </>
    );
  };

  // 设置模块状态
  const [settingsData, setSettingsData] = useState<any>({
    security: {
      enabled: true,
      autoScan: true,
      notifyLevel: 'high'
    },
    cache: {
      enabled: true,
      refreshInterval: 30
    },
    performance: {
      enabled: true,
      metrics: {
        fcp: true,
        lcp: true,
        cls: true,
        fid: true,
        ttfb: true
      }
    },
    general: {
      theme: 'auto',
      language: 'zh-CN'
    }
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // 渲染设置模块
  const renderSettings = () => {

    useEffect(() => {
      if (activeTab === 'settings') {
        loadSettings();
      }
    }, [activeTab]);

    if (settingsLoading) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>;
    }

    if (settingsError) {
      return (
        <Empty
          description={<Text type="danger">{settingsError}</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={loadSettings}>重试</Button>
        </Empty>
      );
    }

    return (
      <>
        <Card size="small" title="安全检测设置" style={{ marginBottom: 16 }}>
          <List size="small">
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.security.enabled}
                  onChange={(checked) => saveSettings('security.enabled', checked)}
                />
              ]}
            >
              <List.Item.Meta
                title="启用安全检测"
                description="开启后将自动检测页面安全问题"
              />
            </List.Item>
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.security.autoScan}
                  onChange={(checked) => saveSettings('security.autoScan', checked)}
                  disabled={!settingsData.security.enabled}
                />
              ]}
            >
              <List.Item.Meta
                title="自动扫描"
                description="页面加载完成后自动扫描安全问题"
              />
            </List.Item>
            <List.Item
              actions={[
                <Select
                  value={settingsData.security.notifyLevel}
                  style={{ width: 100 }}
                  onChange={(value) => saveSettings('security.notifyLevel', value)}
                  disabled={!settingsData.security.enabled}
                >
                  <Select.Option value="critical">仅严重</Select.Option>
                  <Select.Option value="high">高危及以上</Select.Option>
                  <Select.Option value="medium">中危及以上</Select.Option>
                  <Select.Option value="low">低危及以上</Select.Option>
                  <Select.Option value="info">所有级别</Select.Option>
                </Select>
              ]}
            >
              <List.Item.Meta
                title="通知级别"
                description="设置需要通知的安全问题级别"
              />
            </List.Item>
          </List>
        </Card>

        <Card size="small" title="缓存可视化设置" style={{ marginBottom: 16 }}>
          <List size="small">
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.cache.enabled}
                  onChange={(checked) => saveSettings('cache.enabled', checked)}
                />
              ]}
            >
              <List.Item.Meta
                title="启用缓存可视化"
                description="开启后将监控页面缓存使用情况"
              />
            </List.Item>
            <List.Item
              actions={[
                <InputNumber
                  min={5}
                  max={300}
                  value={settingsData.cache.refreshInterval}
                  onChange={(value) => saveSettings('cache.refreshInterval', value)}
                  disabled={!settingsData.cache.enabled}
                  style={{ width: 100 }}
                  addonAfter="秒"
                />
              ]}
            >
              <List.Item.Meta
                title="刷新间隔"
                description="自动刷新缓存数据的时间间隔"
              />
            </List.Item>
          </List>
        </Card>

        <Card size="small" title="性能监控设置" style={{ marginBottom: 16 }}>
          <List size="small">
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.performance.enabled}
                  onChange={(checked) => saveSettings('performance.enabled', checked)}
                />
              ]}
            >
              <List.Item.Meta
                title="启用性能监控"
                description="开启后将监控页面性能指标"
              />
            </List.Item>
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.performance.metrics.lcp}
                  onChange={(checked) => saveSettings('performance.metrics.lcp', checked)}
                  disabled={!settingsData.performance.enabled}
                />
              ]}
            >
              <List.Item.Meta
                title="最大内容绘制 (LCP)"
                description="测量页面主要内容加载完成的时间"
              />
            </List.Item>
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.performance.metrics.fid}
                  onChange={(checked) => saveSettings('performance.metrics.fid', checked)}
                  disabled={!settingsData.performance.enabled}
                />
              ]}
            >
              <List.Item.Meta
                title="首次输入延迟 (FID)"
                description="测量用户首次与页面交互的响应时间"
              />
            </List.Item>
            <List.Item
              actions={[
                <Switch
                  checked={settingsData.performance.metrics.cls}
                  onChange={(checked) => saveSettings('performance.metrics.cls', checked)}
                  disabled={!settingsData.performance.enabled}
                />
              ]}
            >
              <List.Item.Meta
                title="累积布局偏移 (CLS)"
                description="测量页面视觉稳定性"
              />
            </List.Item>
          </List>
        </Card>

        <Card size="small" title="常规设置">
          <List size="small">
            <List.Item
              actions={[
                <Select
                  value={settingsData.general.theme}
                  style={{ width: 120 }}
                  onChange={(value) => saveSettings('general.theme', value)}
                >
                  <Select.Option value="light">浅色</Select.Option>
                  <Select.Option value="dark">深色</Select.Option>
                  <Select.Option value="auto">跟随系统</Select.Option>
                </Select>
              ]}
            >
              <List.Item.Meta
                title="主题"
                description="设置扩展的显示主题"
              />
            </List.Item>
            <List.Item
              actions={[
                <Select
                  value={settingsData.general.language}
                  style={{ width: 120 }}
                  onChange={(value) => saveSettings('general.language', value)}
                >
                  <Select.Option value="zh-CN">中文（简体）</Select.Option>
                  <Select.Option value="en-US">English</Select.Option>
                </Select>
              ]}
            >
              <List.Item.Meta
                title="语言"
                description="设置扩展的显示语言"
              />
            </List.Item>
          </List>
        </Card>
      </>
    );
  };

  // 检查是否在扩展环境中运行
  const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.extension !== undefined;
  console.log('isExtensionEnvironment', isExtensionEnvironment)

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
            items={menuItems}
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
                items={tabItems}
                style={{ flex: 1 }}
              />
            )}
            {activeTab !== 'settings' && (
              <Button
                type="primary"
                size={'small'}
                icon={<ReloadOutlined />}
                onClick={() => {
                  if (activeTab === 'security') {
                    loadSecurityIssues(true);
                  }
                }}
              >
                刷新
              </Button>
            )}
          </Header>
          <Content style={{ margin: '16px', padding: '16px', background: token.colorBgContainer }}>
            {activeTab === 'security' && renderSecurityIssues()}
            {activeTab === 'cache' && renderCacheVisualization()}
            {activeTab === 'performance' && renderPerformanceMonitoring()}
            {activeTab === 'settings' && renderSettings()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<App />);
