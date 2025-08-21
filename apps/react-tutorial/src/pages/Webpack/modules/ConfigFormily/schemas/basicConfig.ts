import { type ISchema } from '@formily/json-schema';

/**
 * 基本配置表单Schema
 */
export const basicConfigSchema: ISchema = {
  type: 'object',
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
      description: '定义构建环境，自动启用内置优化策略',
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
      description: '入口文件路径，支持单入口（字符串）或多入口（对象）',
      default: './src/index.js',
    },
    output: {
      type: 'object',
      title: '输出配置',
      'x-decorator': 'FormItem',
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
        publicPath: {
          type: 'string',
          title: '公共路径',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-component-props': {
            placeholder: '/',
          },
          default: '/',
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
      'x-component-props': {
        placeholder: '选择Source Map类型',
      },
      description: 'Source Map生成方式',
      default: 'source-map',
    },
    resolve: {
      type: 'object',
      title: '解析配置',
      'x-decorator': 'FormItem',
      'x-component': 'FormCollapse',
      'x-component-props': {
        className: 'form-collapse',
      },
      properties: {
        panel1: {
          type: 'void',
          'x-component': 'FormCollapse.CollapsePanel',
          'x-component-props': {
            header: '解析配置',
          },
          properties: {
            extensions: {
              type: 'array',
              title: '扩展名',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems',
              items: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
              'x-component-props': {
                itemClassName: 'array-item',
              },
              default: ['.js', '.jsx', '.ts', '.tsx'],
            },
            alias: {
              type: 'object',
              title: '别名',
              'x-decorator': 'FormItem',
              'x-component': 'KeyValueList',
              'x-component-props': {
                keyTitle: '别名',
                valueTitle: '路径',
              },
              default: {},
            },
          },
        },
      },
    },
  },
};