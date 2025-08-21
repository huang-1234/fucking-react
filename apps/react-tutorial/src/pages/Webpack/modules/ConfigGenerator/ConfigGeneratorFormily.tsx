import React, { useMemo } from 'react';
import { Card, Tabs, Button } from 'antd';
import { createForm } from '@formily/core';
import { FormProvider, createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  FormLayout,
  Input,
  Select,
  Switch,
  ArrayCollapse,
  FormCollapse,
} from '@formily/antd-v5';
import MonacoEditor from '@monaco-editor/react';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import './ConfigGenerator.less';

const { TabPane } = Tabs;

// 自定义Monaco编辑器组件
const MonacoInput = (props: any) => {
  const { value, onChange } = props;

  return (
    <MonacoEditor
      height="120px"
      language="json"
      value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || '{}'}
      onChange={(val) => {
        try {
          onChange(JSON.parse(val || '{}'));
        } catch (e) {
          // 解析错误时不更新
        }
      }}
      options={{ minimap: { enabled: false } }}
    />
  );
};

// 创建SchemaField组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    Input,
    Select,
    Switch,
    ArrayCollapse,
    FormCollapse,
    MonacoInput,
    Card,
  },
});

// Loader选项
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

// 插件选项
const pluginOptions = [
  { label: 'HtmlWebpackPlugin', value: 'HtmlWebpackPlugin' },
  { label: 'MiniCssExtractPlugin', value: 'MiniCssExtractPlugin' },
  { label: 'CleanWebpackPlugin', value: 'CleanWebpackPlugin' },
  { label: 'CopyWebpackPlugin', value: 'CopyWebpackPlugin' },
  { label: 'DefinePlugin', value: 'DefinePlugin' },
  { label: 'ProvidePlugin', value: 'ProvidePlugin' },
];

// 表单Schema定义
const schema = {
  type: 'object',
  properties: {
    basicConfig: {
      type: 'void',
      'x-component': 'Card',
      'x-component-props': {
        title: '基本配置',
        className: 'config-card',
      },
      properties: {
        mode: {
          type: 'string',
          title: '模式',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          enum: [
            { label: 'development', value: 'development' },
            { label: 'production', value: 'production' },
            { label: 'none', value: 'none' },
          ],
          'x-component-props': {
            placeholder: '选择构建模式',
          },
          default: 'development',
        },
        entry: {
          type: 'string',
          title: '入口文件',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-component-props': {
            placeholder: './src/index.js',
          },
          default: './src/index.js',
        },
        output: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              title: '输出路径',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: 'dist',
              },
              default: 'dist',
            },
            filename: {
              type: 'string',
              title: '文件名模板',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '[name].[contenthash].js',
              },
              default: '[name].[contenthash].js',
            },
          },
        },
        devtool: {
          type: 'string',
          title: 'Source Map',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          enum: [
            { label: 'source-map', value: 'source-map' },
            { label: 'eval', value: 'eval' },
            { label: 'eval-source-map', value: 'eval-source-map' },
            { label: 'cheap-source-map', value: 'cheap-source-map' },
            { label: 'cheap-module-source-map', value: 'cheap-module-source-map' },
            { label: 'inline-source-map', value: 'inline-source-map' },
            { label: 'hidden-source-map', value: 'hidden-source-map' },
            { label: 'nosources-source-map', value: 'nosources-source-map' },
          ],
          default: 'source-map',
        },
      },
    },
    optimizationConfig: {
      type: 'void',
      'x-component': 'Card',
      'x-component-props': {
        title: '优化配置',
        className: 'config-card',
      },
      properties: {
        optimization: {
          type: 'object',
          properties: {
            minimize: {
              type: 'boolean',
              title: '压缩代码',
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              default: false,
            },
            splitChunks: {
              type: 'object',
              properties: {
                chunks: {
                  type: 'string',
                  title: '代码分割',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  enum: [
                    { label: 'all', value: 'all' },
                    { label: 'async', value: 'async' },
                    { label: 'initial', value: 'initial' },
                  ],
                  default: 'all',
                },
              },
            },
          },
        },
      },
    },
    loaderConfig: {
      type: 'void',
      'x-component': 'Card',
      'x-component-props': {
        title: 'Loader 配置',
        className: 'config-card',
      },
      properties: {
        module: {
          type: 'object',
          properties: {
            rules: {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayCollapse',
              items: {
                type: 'object',
                'x-component': 'ArrayCollapse.CollapsePanel',
                'x-component-props': {
                  header: '规则 {{index + 1}}',
                },
                properties: {
                  index: {
                    type: 'void',
                    'x-component': 'ArrayCollapse.Index',
                  },
                  remove: {
                    type: 'void',
                    'x-component': 'ArrayCollapse.Remove',
                  },
                  moveUp: {
                    type: 'void',
                    'x-component': 'ArrayCollapse.MoveUp',
                  },
                  moveDown: {
                    type: 'void',
                    'x-component': 'ArrayCollapse.MoveDown',
                  },
                  test: {
                    type: 'string',
                    title: '文件匹配',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: '\\.jsx?$',
                    },
                    required: true,
                  },
                  use: {
                    type: 'array',
                    title: '使用 Loader',
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-component-props': {
                      mode: 'multiple',
                      placeholder: '选择 Loader',
                      options: loaderOptions,
                    },
                    required: true,
                  },
                  exclude: {
                    type: 'string',
                    title: '排除目录',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: 'node_modules',
                    },
                  },
                },
              },
              properties: {
                addition: {
                  type: 'void',
                  title: '添加规则',
                  'x-component': 'ArrayCollapse.Addition',
                  'x-component-props': {
                    defaultValue: {
                      test: '\\.jsx?$',
                      use: ['babel-loader'],
                      exclude: 'node_modules',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    pluginConfig: {
      type: 'void',
      'x-component': 'Card',
      'x-component-props': {
        title: '插件配置',
        className: 'config-card',
      },
      properties: {
        plugins: {
          type: 'array',
          'x-decorator': 'FormItem',
          'x-component': 'ArrayCollapse',
          items: {
            type: 'object',
            'x-component': 'ArrayCollapse.CollapsePanel',
            'x-component-props': {
              header: '插件 {{index + 1}}',
            },
            properties: {
              index: {
                type: 'void',
                'x-component': 'ArrayCollapse.Index',
              },
              remove: {
                type: 'void',
                'x-component': 'ArrayCollapse.Remove',
              },
              moveUp: {
                type: 'void',
                'x-component': 'ArrayCollapse.MoveUp',
              },
              moveDown: {
                type: 'void',
                'x-component': 'ArrayCollapse.MoveDown',
              },
              name: {
                type: 'string',
                title: '插件名称',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-component-props': {
                  placeholder: '选择插件',
                  options: pluginOptions,
                },
                required: true,
              },
              options: {
                type: 'object',
                title: '插件选项',
                'x-decorator': 'FormItem',
                'x-component': 'MonacoInput',
                default: {},
              },
            },
          },
          properties: {
            addition: {
              type: 'void',
              title: '添加插件',
              'x-component': 'ArrayCollapse.Addition',
              'x-component-props': {
                defaultValue: {
                  name: 'HtmlWebpackPlugin',
                  options: {},
                },
              },
            },
          },
        },
      },
    },
  },
};

// 生成Webpack配置代码
const generateWebpackConfig = (values: any): string => {
  const formatValue = (value: any, indent = 2): string => {
    if (value === undefined || value === null) {
      return 'undefined';
    }

    if (typeof value === 'string') {
      if (value.startsWith('/') && value.endsWith('/')) {
        // 正则表达式
        return value.replace(/^\/|\/$/g, '');
      }
      return `'${value}'`;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return `[\n${' '.repeat(indent + 2)}${value
          .map(v => formatValue(v, indent + 2))
          .join(`,\n${' '.repeat(indent + 2)}`)}\n${' '.repeat(indent)}]`;
      }

      if (Object.keys(value).length === 0) return '{}';

      return `{\n${Object.entries(value)
        .map(([k, v]) => `${' '.repeat(indent + 2)}${k}: ${formatValue(v, indent + 2)}`)
        .join(',\n')}\n${' '.repeat(indent)}}`;
    }

    return String(value);
  };

  // 处理插件
  const pluginsCode = values.plugins && values.plugins.length > 0
    ? values.plugins.map((plugin: any) => {
        return `new ${plugin.name}(${
          Object.keys(plugin.options || {}).length > 0
            ? formatValue(plugin.options, 4)
            : ''
        })`;
      }).join(',\n    ')
    : '';

  // 处理规则
  const rulesCode = values.module && values.module.rules
    ? values.module.rules.map((rule: any) => {
        return `{
      test: /${rule.test}/,
      use: [${(rule.use || []).map((loader: string) => `'${loader}'`).join(', ')}]${
          rule.exclude ? `,\n      exclude: /${rule.exclude}/` : ''
        }
    }`;
      }).join(',\n    ')
    : '';

  return `// webpack.config.js
const path = require('path');
${values.plugins && values.plugins.length > 0 ? `${values.plugins.map((p: any) => `const ${p.name} = require('${p.name.toLowerCase()}');`).join('\n')}` : ''}

module.exports = {
  mode: ${formatValue(values.mode)},
  entry: ${formatValue(values.entry)},
  output: {
    path: path.resolve(__dirname, ${formatValue(values.output.path)}),
    filename: ${formatValue(values.output.filename)}
  },
  ${values.devtool ? `devtool: ${formatValue(values.devtool)},` : ''}
  ${
    values.optimization
      ? `optimization: ${formatValue(values.optimization)},`
      : ''
  }
  ${
    values.module && values.module.rules && values.module.rules.length > 0
      ? `module: {
    rules: [
    ${rulesCode}
    ]
  },`
      : ''
  }
  ${
    values.plugins && values.plugins.length > 0
      ? `plugins: [
    ${pluginsCode}
  ],`
      : ''
  }
};`;
};

const ConfigGeneratorFormily: React.FC = () => {
  // 创建表单实例
  const form = useMemo(() => createForm({
    initialValues: {
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
            exclude: 'node_modules',
          },
        ],
      },
      plugins: [],
    },
  }), []);

  // 生成配置代码
  const configCode = useMemo(() => {
    return generateWebpackConfig(form.values);
  }, [form.values]);

  return (
    <div className="webpack-config-generator">
      <h2>Webpack 配置生成器 (Formily)</h2>
      <FormProvider form={form}>
        <Tabs defaultActiveKey="form">
          <TabPane tab="配置表单" key="form">
            <Form layout="vertical">
              <SchemaField schema={schema} />
            </Form>
          </TabPane>

          <TabPane tab="生成配置" key="code">
            <MonacoEditor
              height="600px"
              language="javascript"
              value={configCode}
              options={{ readOnly: true }}
            />
            <div className="action-buttons">
              <Button type="primary">复制代码</Button>
              <Button>下载配置文件</Button>
            </div>
          </TabPane>
        </Tabs>
      </FormProvider>
    </div>
  );
};

export default React.memo(ConfigGeneratorFormily);