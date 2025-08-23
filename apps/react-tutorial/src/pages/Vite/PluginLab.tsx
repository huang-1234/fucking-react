import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Select, Switch, Button, Tooltip, Tag, Space, Alert, Collapse } from 'antd';
import { PlusOutlined, CloseOutlined, QuestionCircleOutlined, CodeOutlined } from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import './index.less';

const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

interface Plugin {
  name: string;
  enabled: boolean;
  options: Record<string, any>;
  description: string;
  category: 'framework' | 'optimization' | 'build' | 'development' | 'custom';
}

interface PluginLabProps {
  onApplyPlugins?: (plugins: Plugin[]) => void;
}

const defaultPlugins: Plugin[] = [
  {
    name: '@vitejs/plugin-react',
    enabled: true,
    options: {
      fastRefresh: true,
      babel: {
        plugins: []
      }
    },
    description: '为 React 项目提供快速刷新和 JSX 支持',
    category: 'framework'
  },
  {
    name: '@vitejs/plugin-vue',
    enabled: false,
    options: {
      reactivityTransform: false,
      customElement: false
    },
    description: '为 Vue 单文件组件提供支持',
    category: 'framework'
  },
  {
    name: 'vite-plugin-compression',
    enabled: false,
    options: {
      algorithm: 'gzip',
      ext: '.gz'
    },
    description: '压缩构建产物，减小体积',
    category: 'optimization'
  },
  {
    name: 'vite-plugin-pwa',
    enabled: false,
    options: {
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vite App',
        short_name: 'Vite App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    },
    description: '将应用转换为渐进式 Web 应用 (PWA)',
    category: 'build'
  },
  {
    name: 'vite-plugin-inspect',
    enabled: false,
    options: {},
    description: '检查 Vite 插件的中间状态',
    category: 'development'
  }
];

const pluginTemplates = [
  {
    name: 'vite-plugin-html',
    description: '处理 HTML 文件',
    category: 'build'
  },
  {
    name: 'vite-plugin-windicss',
    description: 'WindiCSS 集成',
    category: 'framework'
  },
  {
    name: 'vite-plugin-pages',
    description: '基于文件系统的路由',
    category: 'development'
  },
  {
    name: 'vite-plugin-ssr',
    description: '服务端渲染支持',
    category: 'build'
  },
  {
    name: 'vite-plugin-svgr',
    description: '将 SVG 作为 React 组件导入',
    category: 'optimization'
  }
];

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'framework': return 'blue';
    case 'optimization': return 'green';
    case 'build': return 'orange';
    case 'development': return 'purple';
    case 'custom': return 'magenta';
    default: return 'default';
  }
};

const PluginLab: React.FC<PluginLabProps> = ({ onApplyPlugins }) => {
  const [plugins, setPlugins] = useState<Plugin[]>(defaultPlugins);
  const [activeTab, setActiveTab] = useState<string>('plugins');
  const [customPluginCode, setCustomPluginCode] = useState<string>(`// 自定义 Vite 插件示例
export default function myPlugin() {
  return {
    name: 'my-plugin',

    // 在构建开始前调用
    buildStart() {
      console.log('构建开始');
    },

    // 转换代码
    transform(code, id) {
      if (id.endsWith('.vue')) {
        return code.replace('<!-- 注释 -->', '');
      }
    },

    // 在构建结束后调用
    buildEnd() {
      console.log('构建结束');
    }
  }
}`);

  const handlePluginToggle = (index: number, enabled: boolean) => {
    const newPlugins = [...plugins];
    newPlugins[index].enabled = enabled;
    setPlugins(newPlugins);
  };

  const handlePluginOptionsChange = (index: number, options: Record<string, any>) => {
    const newPlugins = [...plugins];
    newPlugins[index].options = options;
    setPlugins(newPlugins);
  };

  const addPlugin = (template?: any) => {
    const newPlugin: Plugin = template ? {
      name: template.name,
      enabled: true,
      options: {},
      description: template.description,
      category: template.category
    } : {
      name: 'custom-plugin',
      enabled: true,
      options: {},
      description: '自定义插件',
      category: 'custom'
    };

    setPlugins([...plugins, newPlugin]);
  };

  const removePlugin = (index: number) => {
    const newPlugins = [...plugins];
    newPlugins.splice(index, 1);
    setPlugins(newPlugins);
  };

  const generateConfigCode = () => {
    const enabledPlugins = plugins.filter(plugin => plugin.enabled);

    const pluginImports = enabledPlugins.map(plugin => {
      const importName = plugin.name.replace(/^@/, '').replace(/[/-]/g, '_');
      return `import ${importName} from '${plugin.name}'`;
    }).join('\n');

    const pluginInitializations = enabledPlugins.map(plugin => {
      const importName = plugin.name.replace(/^@/, '').replace(/[/-]/g, '_');
      const options = Object.keys(plugin.options).length > 0
        ? JSON.stringify(plugin.options, null, 2)
        : '';

      return options
        ? `    ${importName}(${options})`
        : `    ${importName}()`;
    }).join(',\n');

    return `// vite.config.js
import { defineConfig } from 'vite'
${pluginImports}
${enabledPlugins.length === 0 ? '' : '\n'}export default defineConfig({
  plugins: [
${pluginInitializations}
  ],
  // 其他 Vite 配置
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
})`;
  };

  const handleApplyPlugins = () => {
    if (onApplyPlugins) {
      onApplyPlugins(plugins.filter(plugin => plugin.enabled));
    }
  };

  return (
    <div className="plugin-lab">
      <h2>Vite 插件实验室</h2>

      <Alert
        message="Vite 插件系统介绍"
        description={
          <div>
            <p>Vite 插件系统基于 Rollup 插件 API，提供了一组在 Vite 特定生命周期中运行的钩子。</p>
            <p>通过插件，你可以：</p>
            <ul>
              <li>转换代码和资源</li>
              <li>提供自定义开发服务器中间件</li>
              <li>注入环境变量和配置</li>
              <li>扩展 Vite 命令行接口</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="插件配置" key="plugins">
          <div className="plugin-controls" style={{ marginBottom: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => addPlugin()}
              >
                添加自定义插件
              </Button>
              <Select
                placeholder="从模板添加插件"
                style={{ width: 200 }}
                onChange={(value) => {
                  const template = pluginTemplates.find(t => t.name === value);
                  if (template) {
                    addPlugin(template);
                  }
                }}
                value={undefined}
              >
                {pluginTemplates.map(template => (
                  <Option key={template.name} value={template.name}>
                    {template.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </div>

          {plugins.map((plugin, index) => (
            <Card
              key={index}
              className="plugin-card"
              title={
                <div className="plugin-header">
                  <Space>
                    <span>{plugin.name}</span>
                    <Tag color={getCategoryColor(plugin.category)}>
                      {plugin.category}
                    </Tag>
                  </Space>
                  <Space>
                    <Switch
                      checked={plugin.enabled}
                      onChange={(checked) => handlePluginToggle(index, checked)}
                    />
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => removePlugin(index)}
                    />
                  </Space>
                </div>
              }
              extra={
                <Tooltip title={plugin.description}>
                  <QuestionCircleOutlined />
                </Tooltip>
              }
            >
              <Form layout="vertical">
                <Form.Item
                  label="插件名称"
                  tooltip="插件的 npm 包名"
                >
                  <Input
                    value={plugin.name}
                    onChange={(e) => {
                      const newPlugins = [...plugins];
                      newPlugins[index].name = e.target.value;
                      setPlugins(newPlugins);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="插件选项"
                  tooltip="传递给插件的配置选项"
                >
                  <MonacoEditor
                    height="120px"
                    language="json"
                    value={JSON.stringify(plugin.options, null, 2)}
                    onChange={(value) => {
                      try {
                        handlePluginOptionsChange(index, JSON.parse(value || '{}'));
                      } catch (e) {
                        // 解析错误，不更新
                      }
                    }}
                    options={{ minimap: { enabled: false } }}
                  />
                </Form.Item>

                <Form.Item label="描述">
                  <Input
                    value={plugin.description}
                    onChange={(e) => {
                      const newPlugins = [...plugins];
                      newPlugins[index].description = e.target.value;
                      setPlugins(newPlugins);
                    }}
                  />
                </Form.Item>

                <Form.Item label="分类">
                  <Select
                    value={plugin.category}
                    onChange={(value) => {
                      const newPlugins = [...plugins];
                      newPlugins[index].category = value;
                      setPlugins(newPlugins);
                    }}
                  >
                    <Option value="framework">框架集成</Option>
                    <Option value="optimization">优化</Option>
                    <Option value="build">构建</Option>
                    <Option value="development">开发工具</Option>
                    <Option value="custom">自定义</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          ))}

          <div className="action-buttons">
            <Button type="primary" onClick={handleApplyPlugins}>
              应用插件配置
            </Button>
          </div>
        </TabPane>

        <TabPane tab="配置预览" key="preview">
          <Card className="code-preview">
            <MonacoEditor
              height="500px"
              language="javascript"
              value={generateConfigCode()}
              options={{ readOnly: true }}
            />
            <div className="action-buttons">
              <Button>复制代码</Button>
              <Button type="primary">下载配置文件</Button>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="自定义插件开发" key="custom">
          <Card>
            <Alert
              message="自定义插件开发指南"
              description="Vite 插件是兼容 Rollup 插件 API 的对象，可以使用额外的 Vite 特有 API 处理特定场景。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Collapse defaultActiveKey={['1']}>
              <Panel header="插件 API 钩子" key="1">
                <ul>
                  <li><strong>buildStart</strong> - 构建开始时调用</li>
                  <li><strong>resolveId</strong> - 解析模块 ID</li>
                  <li><strong>load</strong> - 加载模块内容</li>
                  <li><strong>transform</strong> - 转换模块内容</li>
                  <li><strong>buildEnd</strong> - 构建结束时调用</li>
                  <li><strong>configureServer</strong> - Vite 特有，配置开发服务器</li>
                  <li><strong>transformIndexHtml</strong> - Vite 特有，转换 HTML</li>
                </ul>
              </Panel>
              <Panel header="插件开发最佳实践" key="2">
                <ul>
                  <li>始终为插件提供一个明确的名称（name 属性）</li>
                  <li>使用约定的前缀：vite-plugin-*</li>
                  <li>在适当的构建阶段应用转换，避免不必要的处理</li>
                  <li>使用 apply: 'build' 或 'serve' 指定插件应用的环境</li>
                  <li>使用 enforce: 'pre' 或 'post' 控制插件执行顺序</li>
                </ul>
              </Panel>
            </Collapse>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <CodeOutlined style={{ marginRight: 8 }} />
                <h3 style={{ margin: 0 }}>编写自定义插件</h3>
              </div>
              <MonacoEditor
                height="400px"
                language="javascript"
                value={customPluginCode}
                onChange={(value) => setCustomPluginCode(value || '')}
              />
            </div>

            <div className="action-buttons">
              <Button>重置示例</Button>
              <Button type="primary">测试插件</Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PluginLab;
