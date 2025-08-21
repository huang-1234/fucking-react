import React, { useState, useMemo } from 'react';
import { Form, Input, Select, Switch, Button, Card, Tabs } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import './ConfigGenerator.less';

const { Option } = Select;
const { TabPane } = Tabs;

interface WebpackConfigProps {
  mode: 'development' | 'production' | 'none';
  entry: string;
  output: {
    path: string;
    filename: string;
  };
  devtool: string;
  optimization: {
    minimize: boolean;
    splitChunks: {
      chunks: 'async' | 'initial' | 'all';
    };
  };
  module: {
    rules: Array<{
      test: string;
      use: string[];
      exclude?: string;
    }>;
  };
  plugins: Array<{
    name: string;
    options: Record<string, any>;
  }>;
}

const defaultConfig: WebpackConfigProps = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: 'dist',
    filename: '[name].[contenthash].js',
  },
  devtool: 'source-map',
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: '\\.jsx?$',
        use: ['babel-loader'],
        exclude: '/node_modules/',
      },
    ],
  },
  plugins: [],
};

const loaderOptions = [
  { label: 'babel-loader', value: 'babel-loader' },
  { label: 'ts-loader', value: 'ts-loader' },
  { label: 'css-loader', value: 'css-loader' },
  { label: 'style-loader', value: 'style-loader' },
  { label: 'sass-loader', value: 'sass-loader' },
  { label: 'less-loader', value: 'less-loader' },
  { label: 'file-loader', value: 'file-loader' },
  { label: 'url-loader', value: 'url-loader' },
];

const pluginOptions = [
  { label: 'HtmlWebpackPlugin', value: 'html-webpack-plugin' },
  { label: 'MiniCssExtractPlugin', value: 'mini-css-extract-plugin' },
  { label: 'CleanWebpackPlugin', value: 'clean-webpack-plugin' },
  { label: 'CopyWebpackPlugin', value: 'copy-webpack-plugin' },
  { label: 'DefinePlugin', value: 'define-plugin' },
  { label: 'ProvidePlugin', value: 'provide-plugin' },
];

const ConfigGenerator: React.FC = () => {
  const [form] = Form.useForm();
  const [config, setConfig] = useState<WebpackConfigProps>(defaultConfig);
  const [activeTab, setActiveTab] = useState<string>('form');

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    setConfig(prevConfig => ({
      ...prevConfig,
      ...values,
    }));
  };

  const addRule = () => {
    const newRules = [...config.module.rules, { test: '\\.css$', use: ['style-loader', 'css-loader'] }];
    setConfig({
      ...config,
      module: {
        ...config.module,
        rules: newRules,
      },
    });
    form.setFieldsValue({
      module: {
        rules: newRules,
      },
    });
  };

  const removeRule = (index: number) => {
    const newRules = [...config.module.rules];
    newRules.splice(index, 1);
    setConfig({
      ...config,
      module: {
        ...config.module,
        rules: newRules,
      },
    });
    form.setFieldsValue({
      module: {
        rules: newRules,
      },
    });
  };

  const addPlugin = () => {
    const newPlugins = [...config.plugins, { name: 'HtmlWebpackPlugin', options: {} }];
    setConfig({
      ...config,
      plugins: newPlugins,
    });
    form.setFieldsValue({
      plugins: newPlugins,
    });
  };

  const removePlugin = (index: number) => {
    const newPlugins = [...config.plugins];
    newPlugins.splice(index, 1);
    setConfig({
      ...config,
      plugins: newPlugins,
    });
    form.setFieldsValue({
      plugins: newPlugins,
    });
  };

  const updatePluginOptions = (index: number, options: Record<string, any>) => {
    const newPlugins = [...config.plugins];
    newPlugins[index] = {
      ...newPlugins[index],
      options,
    };
    setConfig({
      ...config,
      plugins: newPlugins,
    });
    form.setFieldsValue({
      plugins: newPlugins,
    });
  };

  const generateConfigCode = useMemo(() => {
    const formatValue = (value: any): string => {
      if (typeof value === 'string') {
        if (value.startsWith('/') && value.endsWith('/')) {
          // 正则表达式
          return value.replace(/^\/|\/$/g, '');
        }
        return `'${value}'`;
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return `[${value.map(formatValue).join(', ')}]`;
        }
        return `{
${Object.entries(value)
  .map(([k, v]) => `    ${k}: ${formatValue(v)}`)
  .join(',\n')}
  }`;
      }
      return String(value);
    };

    const pluginsCode = config.plugins
      .map(
        plugin => `new ${plugin.name}(${
          Object.keys(plugin.options).length
            ? formatValue(plugin.options)
            : ''
        })`
      )
      .join(',\n    ');

    const rulesCode = config.module.rules
      .map(
        rule => `{
      test: /${rule.test}/,
      use: [${rule.use.map(loader => `'${loader}'`).join(', ')}]${
          rule.exclude ? `,\n      exclude: /${rule.exclude}/` : ''
        }
    }`
      )
      .join(',\n    ');

    return `// webpack.config.js
const path = require('path');
${config.plugins.length > 0 ? `${config.plugins.map(p => `const ${p.name} = require('${p.name.toLowerCase()}');`).join('\n')}` : ''}

module.exports = {
  mode: '${config.mode}',
  entry: '${config.entry}',
  output: {
    path: path.resolve(__dirname, '${config.output.path}'),
    filename: '${config.output.filename}'
  },
  devtool: '${config.devtool}',
  optimization: {
    minimize: ${config.optimization.minimize},
    splitChunks: {
      chunks: '${config.optimization.splitChunks.chunks}'
    }
  },
  module: {
    rules: [
    ${rulesCode}
    ]
  }${config.plugins.length > 0 ? `,
  plugins: [
    ${pluginsCode}
  ]` : ''}
};`;
  }, [config]);

  return (
    <div className="webpack-config-generator">
      <h2>Webpack 配置生成器</h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="配置表单" key="form">
          <Form
            form={form}
            layout="vertical"
            initialValues={config}
            onValuesChange={handleFormChange}
          >
            <Card title="基本配置" className="config-card">
              <Form.Item name="mode" label="模式">
                <Select>
                  <Option value="development">development</Option>
                  <Option value="production">production</Option>
                  <Option value="none">none</Option>
                </Select>
              </Form.Item>

              <Form.Item name="entry" label="入口文件">
                <Input placeholder="./src/index.js" />
              </Form.Item>

              <Form.Item label="输出配置">
                <Input.Group compact>
                  <Form.Item name={['output', 'path']} noStyle>
                    <Input placeholder="输出路径" style={{ width: '50%' }} />
                  </Form.Item>
                  <Form.Item name={['output', 'filename']} noStyle>
                    <Input placeholder="文件名模板" style={{ width: '50%' }} />
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Form.Item name="devtool" label="Source Map">
                <Select>
                  <Option value="source-map">source-map</Option>
                  <Option value="eval">eval</Option>
                  <Option value="eval-source-map">eval-source-map</Option>
                  <Option value="cheap-source-map">cheap-source-map</Option>
                  <Option value="cheap-module-source-map">cheap-module-source-map</Option>
                  <Option value="inline-source-map">inline-source-map</Option>
                  <Option value="hidden-source-map">hidden-source-map</Option>
                  <Option value="nosources-source-map">nosources-source-map</Option>
                </Select>
              </Form.Item>
            </Card>

            <Card title="优化配置" className="config-card">
              <Form.Item name={['optimization', 'minimize']} label="压缩代码" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name={['optimization', 'splitChunks', 'chunks']} label="代码分割">
                <Select>
                  <Option value="all">all</Option>
                  <Option value="async">async</Option>
                  <Option value="initial">initial</Option>
                </Select>
              </Form.Item>
            </Card>

            <Card
              title="Loader 配置"
              className="config-card"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={addRule}>
                  添加 Loader
                </Button>
              }
            >
              {config.module.rules.map((rule, index) => (
                <div key={index} className="rule-item">
                  <div className="rule-header">
                    <h4>Rule #{index + 1}</h4>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => removeRule(index)}
                    />
                  </div>
                  <Form.Item label="文件匹配" name={['module', 'rules', index, 'test']}>
                    <Input placeholder="\.css$" />
                  </Form.Item>
                  <Form.Item label="使用 Loader" name={['module', 'rules', index, 'use']}>
                    <Select mode="multiple" options={loaderOptions} />
                  </Form.Item>
                  <Form.Item label="排除目录" name={['module', 'rules', index, 'exclude']}>
                    <Input placeholder="node_modules" />
                  </Form.Item>
                </div>
              ))}
            </Card>

            <Card
              title="插件配置"
              className="config-card"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={addPlugin}>
                  添加插件
                </Button>
              }
            >
              {config.plugins.map((plugin, index) => (
                <div key={index} className="plugin-item">
                  <div className="plugin-header">
                    <h4>Plugin #{index + 1}</h4>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => removePlugin(index)}
                    />
                  </div>
                  <Form.Item label="插件名称" name={['plugins', index, 'name']}>
                    <Select options={pluginOptions.map(option => ({ label: option.label, value: option.label }))} />
                  </Form.Item>
                  <Form.Item label="插件选项">
                    <MonacoEditor
                      height="100px"
                      language="json"
                      value={JSON.stringify(plugin.options, null, 2)}
                      onChange={(value) => {
                        try {
                          updatePluginOptions(index, JSON.parse(value || '{}'));
                        } catch (e) {
                          // 解析错误，不更新
                        }
                      }}
                      options={{ minimap: { enabled: false } }}
                    />
                  </Form.Item>
                </div>
              ))}
            </Card>
          </Form>
        </TabPane>
        <TabPane tab="生成配置" key="code">
          <MonacoEditor
            height="600px"
            language="javascript"
            value={generateConfigCode}
            options={{ readOnly: true }}
          />
          <div className="action-buttons">
            <Button type="primary">复制代码</Button>
            <Button>下载配置文件</Button>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(ConfigGenerator);
