import { type ISchema } from '@formily/json-schema';

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
  { label: 'html-loader', value: 'html-loader' },
  { label: 'raw-loader', value: 'raw-loader' },
  { label: 'vue-loader', value: 'vue-loader' },
  { label: 'svelte-loader', value: 'svelte-loader' },
];

/**
 * Loader配置表单Schema
 */
export const loaderConfigSchema: ISchema = {
  type: 'object',
  properties: {
    module: {
      type: 'object',
      properties: {
        rules: {
          type: 'array',
          title: 'Loader 规则',
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
                description: '正则表达式，用于匹配文件',
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
                description: 'Loader 从右到左执行',
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
                description: '排除的文件或目录',
              },
              include: {
                type: 'string',
                title: '包含目录',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: 'src',
                },
                description: '包含的文件或目录',
              },
              options: {
                type: 'object',
                title: 'Loader 选项',
                'x-decorator': 'FormItem',
                'x-component': 'MonacoInput',
                'x-component-props': {
                  language: 'json',
                  height: 150,
                  options: {
                    minimap: { enabled: false },
                  },
                },
                description: 'Loader 配置选项（JSON 格式）',
                default: '{}',
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
};
