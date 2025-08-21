import { type ISchema } from '@formily/json-schema';

/**
 * 优化配置表单Schema
 */
export const optimizationConfigSchema: ISchema = {
  type: 'object',
  properties: {
    optimization: {
      type: 'object',
      properties: {
        minimize: {
          type: 'boolean',
          title: '压缩代码',
          'x-decorator': 'FormItem',
          'x-component': 'Switch',
          'x-component-props': {
            defaultChecked: false,
          },
          description: '是否压缩代码（生产模式默认启用）',
          default: false,
        },
        splitChunks: {
          type: 'object',
          title: '代码分割',
          'x-decorator': 'FormItem',
          properties: {
            chunks: {
              type: 'string',
              title: '分割类型',
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              enum: [
                { label: 'all (所有代码)', value: 'all' },
                { label: 'async (异步代码)', value: 'async' },
                { label: 'initial (初始代码)', value: 'initial' },
              ],
              'x-component-props': {
                placeholder: '选择分割类型',
              },
              default: 'all',
            },
            minSize: {
              type: 'number',
              title: '最小尺寸',
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '最小尺寸（字节）',
                min: 0,
                step: 1000,
              },
              description: '生成块的最小大小（以字节为单位）',
              default: 20000,
            },
            maxSize: {
              type: 'number',
              title: '最大尺寸',
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '最大尺寸（字节）',
                min: 0,
                step: 1000,
              },
              description: '生成块的最大大小（以字节为单位）',
              default: 0,
            },
            cacheGroups: {
              type: 'object',
              title: '缓存组',
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
                    header: '缓存组配置',
                  },
                  properties: {
                    vendors: {
                      type: 'object',
                      title: '第三方库',
                      'x-decorator': 'FormItem',
                      properties: {
                        test: {
                          type: 'string',
                          title: '匹配规则',
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: '/node_modules/',
                          },
                          default: '/node_modules/',
                        },
                        name: {
                          type: 'string',
                          title: '名称',
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: 'vendors',
                          },
                          default: 'vendors',
                        },
                        priority: {
                          type: 'number',
                          title: '优先级',
                          'x-decorator': 'FormItem',
                          'x-component': 'NumberPicker',
                          'x-component-props': {
                            placeholder: '优先级',
                            min: -100,
                            max: 100,
                          },
                          default: 10,
                        },
                      },
                    },
                    common: {
                      type: 'object',
                      title: '公共模块',
                      'x-decorator': 'FormItem',
                      properties: {
                        name: {
                          type: 'string',
                          title: '名称',
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: 'common',
                          },
                          default: 'common',
                        },
                        minChunks: {
                          type: 'number',
                          title: '最小引用次数',
                          'x-decorator': 'FormItem',
                          'x-component': 'NumberPicker',
                          'x-component-props': {
                            placeholder: '最小引用次数',
                            min: 1,
                          },
                          default: 2,
                        },
                        priority: {
                          type: 'number',
                          title: '优先级',
                          'x-decorator': 'FormItem',
                          'x-component': 'NumberPicker',
                          'x-component-props': {
                            placeholder: '优先级',
                            min: -100,
                            max: 100,
                          },
                          default: 5,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        runtimeChunk: {
          type: 'string',
          title: '运行时代码',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          enum: [
            { label: '不分离', value: 'false' },
            { label: '单个文件', value: 'single' },
            { label: '多个文件', value: 'multiple' },
          ],
          'x-component-props': {
            placeholder: '选择运行时代码分离方式',
          },
          description: '将运行时代码拆分为独立的块',
          default: 'false',
        },
      },
    },
  },
};
