/* cspell:disable */
import React, { useState, useMemo } from 'react';
import { Layout, Typography, Card, Tabs, Select, Switch, Input, Checkbox, Button as AntButton, Divider } from 'antd';
import { Splitter } from 'antd';
import Button from './DemoButton';
// 导入虚拟模块
import formilySchemas from 'virtual:formily-props';
console.log('Loaded formily schemas:', formilySchemas);
import FormSimple from './FormSimple';
import './App.css';

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

// 调试组件
interface DebugPanelProps {
  data: any;
}

const DebugPanel = ({ data }: DebugPanelProps) => {
  if (!data) return <Card title="插件调试信息">未加载虚拟模块数据</Card>;

  return (
    <Card title="插件调试信息" style={{ marginBottom: 16 }}>
      <div>
        <p><Text strong>模块时间戳:</Text> {data.timestamp}</p>
        <p><Text strong>加载组件数量:</Text> {data.count}</p>
        <p><Text strong>可用组件:</Text></p>
        <ul>
          {Object.keys(data.schemas || {}).map(key => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

function App() {
  // 打印导入的 schemas 进行调试
  console.log('Imported formily schemas:', formilySchemas);

  // 表单值状态
  const [formValues, setFormValues] = useState({
    size: 'medium',
    type: 'primary',
    disabled: false,
    round: false,
    loading: false,
    icon: ''
  });

  // 当前活跃的 schema 标签
  const [activeTab, setActiveTab] = useState('formilySchema');

  // 当前选择的组件
  const [activeComponent, setActiveComponent] = useState('button');

  // 获取按钮组件的 schema
  const allSchemas = useMemo(() => {
    console.log('Available schemas:', formilySchemas);
    if (!formilySchemas?.schemas) {
      console.warn('No schemas available in formilySchemas');
      return null;
    }

    const buttonPath = Object.keys(formilySchemas.schemas).find(path =>
      path.includes('DemoButton.tsx')
    );
    return buttonPath ? formilySchemas.schemas[buttonPath] : null;
  }, [formilySchemas]);

  // 获取表单组件的 schema
  const formSchemas = useMemo(() => {
    if (!formilySchemas?.schemas) return null;

    const formPath = Object.keys(formilySchemas.schemas).find(path =>
      path.includes('FormSimple.tsx')
    );
    return formPath ? formilySchemas.schemas[formPath] : null;
  }, [formilySchemas]);

  const buttonSchema = useMemo(() => {
    return allSchemas?.formilySchema || {
      type: 'object',
      properties: {
        size: {
          type: 'string',
          title: 'size',
          description: '按钮尺寸',
          'x-component': 'Select'
        },
        type: {
          type: 'string',
          title: 'type',
          description: '按钮类型',
          'x-component': 'Select'
        },
        disabled: {
          type: 'boolean',
          title: 'disabled',
          description: '是否禁用',
          'x-component': 'Switch'
        }
      }
    };
  }, [allSchemas]);

  // 生成组件代码字符串
  const generatedCode = useMemo(() => {
    const props = [];
    props.push(`size="${formValues.size}"`);
    props.push(`type="${formValues.type}"`);
    if (formValues.disabled) props.push('disabled');
    if (formValues.round) props.push('round');
    if (formValues.loading) props.push('loading');
    if (formValues.icon) props.push(`icon="${formValues.icon}"`);

    return `<Button\n  ${props.join('\n  ')}\n>\n  按钮文本\n</Button>`;
  }, [formValues]);

  const handleButtonClick = () => {
    alert('按钮被点击了!');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', width: '100vw' }}>
      <Header style={{ background: '#fff', padding: '0 10px' }}>
        <Title level={2}>Props to Formily Schema Demo (React)</Title>
      </Header>

      <Content
        style={{
          flex: '1 1 auto',
          padding: '12px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)', // 减去 Header 的高度(64px)
          overflowY: 'scroll',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.1) transparent',
          scrollbarGutter: 'stable'
        }}>
        <Paragraph className="description">
          这个示例展示了如何使用 props-to-schema 插件将 React 组件的 props 定义自动转换为 Formily Schema
        </Paragraph>

        {/* 插件调试信息 */}
        <DebugPanel data={formilySchemas} />

        {/* 表单组件预览 */}
        {/* <Card title="表单组件预览" style={{ marginBottom: 24 }}>
          <FormSimple />
        </Card> */}

        {/* 主要内容区域 - 使用 Splitter 分割 */}
        <Splitter style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: 24, flex: '1 1 auto', minHeight: '400px' }}>
          {/* 左侧配置面板 */}
          <Splitter.Panel
          // defaultSize="40%" min="30%" max="60%"
          >
            <Card title="按钮组件配置" bordered={false} style={{ height: '100%', overflow: 'auto' }}>
              <Card type="inner" title="生成的 Schema" style={{ marginBottom: 16 }}>
                <pre style={{ maxHeight: 150, overflow: 'auto' }}>{JSON.stringify(buttonSchema, null, 2)}</pre>
              </Card>

              <div style={{ padding: '16px 0' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>尺寸 (size):</Text>
                  <Select
                    style={{ width: '100%', marginTop: 8 }}
                    value={formValues.size}
                    onChange={(value) => handleFormChange('size', value)}
                    options={[
                      { label: '小型', value: 'small' },
                      { label: '中型', value: 'medium' },
                      { label: '大型', value: 'large' }
                    ]}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Text strong>类型 (type):</Text>
                  <Select
                    style={{ width: '100%', marginTop: 8 }}
                    value={formValues.type}
                    onChange={(value) => handleFormChange('type', value)}
                    options={[
                      { label: '默认', value: 'default' },
                      { label: '主要', value: 'primary' },
                      { label: '成功', value: 'success' },
                      { label: '警告', value: 'warning' },
                      { label: '危险', value: 'danger' }
                    ]}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Checkbox
                    checked={formValues.disabled}
                    onChange={(e) => handleFormChange('disabled', e.target.checked)}
                  >
                    禁用状态
                  </Checkbox>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Checkbox
                    checked={formValues.round}
                    onChange={(e) => handleFormChange('round', e.target.checked)}
                  >
                    圆角按钮
                  </Checkbox>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Checkbox
                    checked={formValues.loading}
                    onChange={(e) => handleFormChange('loading', e.target.checked)}
                  >
                    加载状态
                  </Checkbox>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Text strong>图标类名:</Text>
                  <Input
                    style={{ marginTop: 8 }}
                    value={formValues.icon}
                    onChange={(e) => handleFormChange('icon', e.target.value)}
                    placeholder="输入图标类名"
                  />
                </div>
              </div>
            </Card>
          </Splitter.Panel>

          {/* 右侧预览面板 */}
          <Splitter.Panel>
            <Card title="预览效果" bordered={false} style={{ height: '100%', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', border: '1px dashed #d9d9d9', borderRadius: 8, marginBottom: 16 }}
              >
                <Button
                  size={formValues.size as 'small' | 'medium' | 'large'}
                  type={formValues.type as 'default' | 'primary' | 'success' | 'warning' | 'danger'}
                  disabled={formValues.disabled}
                  round={formValues.round}
                  loading={formValues.loading}
                  icon={formValues.icon}
                  onClick={handleButtonClick}
                >
                  {formValues.loading ? '加载中...' : '示例按钮'}
                </Button>
              </div>

              <Card type="inner" title="当前配置" style={{ marginBottom: 16 }}>
                <pre style={{ maxHeight: 120, overflow: 'auto' }}>{JSON.stringify(formValues, null, 2)}</pre>
              </Card>

              <Card type="inner" title="生成的组件代码">
                <pre style={{ maxHeight: 120, overflow: 'auto' }}>{generatedCode}</pre>
              </Card>
            </Card>
          </Splitter.Panel>
        </Splitter>

        {/* Schema 信息区域 */}
        <Card title="完整的 Schema 信息" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <AntButton.Group>
              <AntButton
                type={activeComponent === 'button' ? 'primary' : 'default'}
                onClick={() => setActiveComponent('button')}
              >
                按钮组件
              </AntButton>
              <AntButton
                type={activeComponent === 'form' ? 'primary' : 'default'}
                onClick={() => setActiveComponent('form')}
              >
                表单组件
              </AntButton>
            </AntButton.Group>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="原始 Props" key="props">
              <pre style={{ maxHeight: 400, overflow: 'auto' }}>
                {activeComponent === 'button'
                  ? JSON.stringify(allSchemas?.props || {}, null, 2)
                  : JSON.stringify(formSchemas?.props || {}, null, 2)
                }
              </pre>
            </Tabs.TabPane>
            <Tabs.TabPane tab="JSON Schema" key="jsonSchema">
              <pre style={{ maxHeight: 400, overflow: 'auto' }}>
                {activeComponent === 'button'
                  ? JSON.stringify(allSchemas?.jsonSchema || {}, null, 2)
                  : JSON.stringify(formSchemas?.jsonSchema || {}, null, 2)
                }
              </pre>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Formily Schema" key="formilySchema">
              <pre style={{ maxHeight: 400, overflow: 'auto' }}>
                {activeComponent === 'button'
                  ? JSON.stringify(allSchemas?.formilySchema || {}, null, 2)
                  : JSON.stringify(formSchemas?.formilySchema || {}, null, 2)
                }
              </pre>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        Props to Schema Demo ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  );
}

export default App;