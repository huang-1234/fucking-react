import { type ISchema } from '@formily/json-schema';

// 插件选项
const pluginOptions = [
  { label: 'HtmlWebpackPlugin', value: 'HtmlWebpackPlugin' },
  { label: 'MiniCssExtractPlugin', value: 'MiniCssExtractPlugin' },
  { label: 'CleanWebpackPlugin', value: 'CleanWebpackPlugin' },
  { label: 'CopyWebpackPlugin', value: 'CopyWebpackPlugin' },
  { label: 'DefinePlugin', value: 'DefinePlugin' },
  { label: 'ProvidePlugin', value: 'ProvidePlugin' },
  { label: 'HotModuleReplacementPlugin', value: 'HotModuleReplacementPlugin' },
  { label: 'TerserPlugin', value: 'TerserPlugin' },
  { label: 'CompressionPlugin', value: 'CompressionPlugin' },
  { label: 'BundleAnalyzerPlugin', value: 'BundleAnalyzerPlugin' },
  { label: 'DotenvPlugin', value: 'DotenvPlugin' },
  { label: 'WebpackManifestPlugin', value: 'WebpackManifestPlugin' },
];

// 插件默认配置
const pluginDefaults: Record<string, any> = {
  HtmlWebpackPlugin: {
    template: './public/index.html',
    filename: 'index.html',
    inject: true,
  },
  MiniCssExtractPlugin: {
    filename: '[name].[contenthash].css',
    chunkFilename: '[id].[contenthash].css',
  },
  CleanWebpackPlugin: {},
  CopyWebpackPlugin: {
    patterns: [
      { from: 'public', to: '' }
    ],
  },
  DefinePlugin: {
    'process.env.NODE_ENV': '"production"',
  },
  ProvidePlugin: {
    React: 'react',
  },
  HotModuleReplacementPlugin: {},
  TerserPlugin: {
    parallel: true,
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  CompressionPlugin: {
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/,
  },
  BundleAnalyzerPlugin: {
    analyzerMode: 'static',
    openAnalyzer: false,
  },
  DotenvPlugin: {
    path: '.env',
  },
  WebpackManifestPlugin: {
    fileName: 'manifest.json',
  },
};

/**
 * 插件配置表单Schema
 */
export const pluginConfigSchema: ISchema = {
  type: 'object',
  properties: {
    plugins: {
      type: 'array',
      title: '插件配置',
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
            'x-reactions': [
              {
                dependencies: ['.name'],
                fulfill: {
                  state: {
                    value: '{{$self.value}}',
                  },
                  schema: {
                    'x-component-props.options': pluginOptions,
                  },
                },
              },
              {
                dependencies: ['.name'],
                fulfill: {
                  state: {
                    'value{{$deps[0] && $form.setFieldState("plugins." + $index + ".options", state => {state.value = pluginDefaults[$deps[0]] || {}})}}': '{{null}}',
                  },
                },
              },
            ],
          },
          options: {
            type: 'object',
            title: '插件选项',
            'x-decorator': 'FormItem',
            'x-component': 'MonacoInput',
            'x-component-props': {
              language: 'json',
              height: 200,
              options: {
                minimap: { enabled: false },
              },
            },
            description: '插件配置选项（JSON 格式）',
            default: '{}',
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
              options: pluginDefaults.HtmlWebpackPlugin,
            },
          },
        },
      },
    },
  },
};
