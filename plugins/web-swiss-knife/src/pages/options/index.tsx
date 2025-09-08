import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ConfigProvider, Layout, Menu, Typography, Card, Form,
  Switch, Input, Select, Button, Divider, message, Tabs,
  Row, Col, InputNumber, Space, Collapse
} from 'antd';
import {
  SecurityScanOutlined, DatabaseOutlined, DashboardOutlined,
  SettingOutlined, SaveOutlined, UndoOutlined,
  QuestionCircleOutlined, BulbOutlined
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';

import './style.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// 默认设置
const defaultSettings = {
  security: {
    enabled: true,
    autoScan: true,
    scanInterval: 60, // 分钟
    notifyLevel: 'high', // 通知级别：critical, high, medium, low, info
    rules: {
      xss: true,
      csrf: true,
      clickjacking: true,
      insecureContent: true,
      cookies: true,
      csp: true,
    }
  },
  cache: {
    enabled: true,
    monitorInterval: 30, // 秒
    maxEntries: 1000,
    showDetails: true
  },
  performance: {
    enabled: true,
    metrics: {
      fcp: true, // First Contentful Paint
      lcp: true, // Largest Contentful Paint
      fid: true, // First Input Delay
      cls: true, // Cumulative Layout Shift
      ttfb: true // Time to First Byte
    },
    sampleRate: 100, // 百分比
    autoReport: true
  },
  general: {
    theme: 'auto', // light, dark, auto
    language: 'zh-CN',
    devMode: false
  }
};

const App: React.FC = () => {
  /** 设置 */
  const [settings, setSettings] = useState(defaultSettings);
  /** 表单 */
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState('security');
  /** 是否折叠 */
  const [collapsed, setCollapsed] = useState(false);
  /** 是否加载 */
  const [loading, setLoading] = useState(false);
  /** 消息 */
  const [messageApi, contextHolder] = message.useMessage();

  // 加载设置
  useEffect(() => {
    // 检查 chrome.storage API 是否可用
    if (!chrome || !chrome.storage) {
      messageApi.error('Chrome API 不可用，请确保您在 Chrome 浏览器扩展中运行此页面');
      form.setFieldsValue(defaultSettings);
      return;
    }

    chrome.storage.sync.get('settings', (result) => {
      if (result.settings) {
        setSettings(result.settings);
        form.setFieldsValue(result.settings);
      } else {
        form.setFieldsValue(defaultSettings);
      }
    });
  }, [form, messageApi]);

  // 保存设置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 检查 chrome.storage API 是否可用
      if (!chrome || !chrome.storage) {
        setLoading(false);
        messageApi.error('Chrome API 不可用，无法保存设置');
        return;
      }

      chrome.storage.sync.set({ settings: values }, () => {
        setSettings(values);
        setLoading(false);
        messageApi.success('设置已保存');
      });
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 重置设置
  const handleReset = () => {
    form.setFieldsValue(defaultSettings);
    messageApi.info('设置已重置，请点击保存以应用更改');
  };

  // 检查是否在扩展环境中运行
  const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.extension !== undefined;

  // 如果不在扩展环境中，显示提示信息
  if (!isExtensionEnvironment) {
    return (
      <ConfigProvider locale={zhCN}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Title level={3}>Web Swiss Knife - 设置</Title>
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
      {contextHolder}
      <Layout style={{ minHeight: '100vh' }}>
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
                key: 'security',
                icon: <SecurityScanOutlined />,
                label: '安全检测设置'
              },
              {
                key: 'cache',
                icon: <DatabaseOutlined />,
                label: '缓存可视化设置'
              },
              {
                key: 'performance',
                icon: <DashboardOutlined />,
                label: '性能监控设置'
              },
              {
                key: 'general',
                icon: <SettingOutlined />,
                label: '常规设置'
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
            <Title level={4} style={{ margin: 0 }}>设置</Title>
            <Space>
              <Button
                icon={<UndoOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={loading}
              >
                保存
              </Button>
            </Space>
          </Header>
          <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={settings}
            >
              {activeKey === 'security' && (
                <div>
                  <Card title="安全检测设置" bordered={false}>
                    <Form.Item name={['security', 'enabled']} valuePropName="checked" label="启用安全检测">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'autoScan']} valuePropName="checked" label="自动扫描">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'scanInterval']} label="扫描间隔（分钟）">
                      <InputNumber min={1} max={1440} />
                    </Form.Item>

                    <Form.Item name={['security', 'notifyLevel']} label="通知级别">
                      <Select>
                        <Option value="critical">仅严重</Option>
                        <Option value="high">高危及以上</Option>
                        <Option value="medium">中危及以上</Option>
                        <Option value="low">低危及以上</Option>
                        <Option value="info">所有级别</Option>
                      </Select>
                    </Form.Item>

                    <Divider orientation="left">检测规则</Divider>

                    <Form.Item name={['security', 'rules', 'xss']} valuePropName="checked" label="XSS 攻击检测">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'rules', 'csrf']} valuePropName="checked" label="CSRF 漏洞检测">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'rules', 'clickjacking']} valuePropName="checked" label="点击劫持检测">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'rules', 'insecureContent']} valuePropName="checked" label="不安全内容检测">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'rules', 'cookies']} valuePropName="checked" label="Cookie 安全检测">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['security', 'rules', 'csp']} valuePropName="checked" label="内容安全策略检测">
                      <Switch />
                    </Form.Item>
                  </Card>
                </div>
              )}

              {activeKey === 'cache' && (
                <div>
                  <Card title="缓存可视化设置" bordered={false}>
                    <Form.Item name={['cache', 'enabled']} valuePropName="checked" label="启用缓存可视化">
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['cache', 'monitorInterval']} label="监控间隔（秒）">
                      <InputNumber min={5} max={300} />
                    </Form.Item>

                    <Form.Item name={['cache', 'maxEntries']} label="最大条目数">
                      <InputNumber min={100} max={10000} />
                    </Form.Item>

                    <Form.Item name={['cache', 'showDetails']} valuePropName="checked" label="显示详细信息">
                      <Switch />
                    </Form.Item>

                    <Collapse ghost>
                      <Panel header="高级设置" key="1">
                        <Paragraph type="secondary">
                          缓存可视化功能可以帮助您了解网站的缓存使用情况，包括 Service Worker 缓存、浏览器缓存等。
                          通过调整这些设置，您可以更好地监控和优化网站的缓存策略。
                        </Paragraph>
                      </Panel>
                    </Collapse>
                  </Card>
                </div>
              )}

              {activeKey === 'performance' && (
                <div>
                  <Card title="性能监控设置" bordered={false}>
                    <Form.Item name={['performance', 'enabled']} valuePropName="checked" label="启用性能监控">
                      <Switch />
                    </Form.Item>

                    <Divider orientation="left">监控指标</Divider>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['performance', 'metrics', 'fcp']} valuePropName="checked" label={
                          <Space>
                            <span>首次内容绘制 (FCP)</span>
                            <QuestionCircleOutlined />
                          </Space>
                        }>
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['performance', 'metrics', 'lcp']} valuePropName="checked" label={
                          <Space>
                            <span>最大内容绘制 (LCP)</span>
                            <QuestionCircleOutlined />
                          </Space>
                        }>
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['performance', 'metrics', 'fid']} valuePropName="checked" label={
                          <Space>
                            <span>首次输入延迟 (FID)</span>
                            <QuestionCircleOutlined />
                          </Space>
                        }>
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['performance', 'metrics', 'cls']} valuePropName="checked" label={
                          <Space>
                            <span>累积布局偏移 (CLS)</span>
                            <QuestionCircleOutlined />
                          </Space>
                        }>
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name={['performance', 'metrics', 'ttfb']} valuePropName="checked" label={
                      <Space>
                        <span>首字节时间 (TTFB)</span>
                        <QuestionCircleOutlined />
                      </Space>
                    }>
                      <Switch />
                    </Form.Item>

                    <Form.Item name={['performance', 'sampleRate']} label="采样率（%）">
                      <InputNumber min={1} max={100} />
                    </Form.Item>

                    <Form.Item name={['performance', 'autoReport']} valuePropName="checked" label="自动上报">
                      <Switch />
                    </Form.Item>

                    <Collapse ghost>
                      <Panel header="指标说明" key="1">
                        <ul style={{ paddingLeft: '20px' }}>
                          <li><Text strong>首次内容绘制 (FCP)</Text>：浏览器首次绘制来自 DOM 的内容的时间。</li>
                          <li><Text strong>最大内容绘制 (LCP)</Text>：页面主要内容完成加载的时间。</li>
                          <li><Text strong>首次输入延迟 (FID)</Text>：用户首次与页面交互到浏览器实际能够响应的时间。</li>
                          <li><Text strong>累积布局偏移 (CLS)</Text>：页面生命周期中发生的所有意外布局偏移的累积分数。</li>
                          <li><Text strong>首字节时间 (TTFB)</Text>：从请求页面到收到响应的第一个字节的时间。</li>
                        </ul>
                      </Panel>
                    </Collapse>
                  </Card>
                </div>
              )}

              {activeKey === 'general' && (
                <div>
                  <Card title="常规设置" bordered={false}>
                    <Form.Item name={['general', 'theme']} label="主题">
                      <Select>
                        <Option value="light">浅色</Option>
                        <Option value="dark">深色</Option>
                        <Option value="auto">跟随系统</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name={['general', 'language']} label="语言">
                      <Select>
                        <Option value="zh-CN">中文（简体）</Option>
                        <Option value="en-US">English</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name={['general', 'devMode']} valuePropName="checked" label={
                      <Space>
                        <span>开发者模式</span>
                        <BulbOutlined />
                        <Text type="secondary">（启用额外的调试信息）</Text>
                      </Space>
                    }>
                      <Switch />
                    </Form.Item>

                    <Divider />

                    <Paragraph type="secondary">
                      Web Swiss Knife 版本: 0.1.0<br />
                      © 2023 Web Swiss Knife 团队
                    </Paragraph>
                  </Card>
                </div>
              )}
            </Form>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<App />);
