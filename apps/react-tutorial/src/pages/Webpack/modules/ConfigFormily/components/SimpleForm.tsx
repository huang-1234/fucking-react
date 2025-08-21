import React from 'react';
import { Card, Tabs } from 'antd';
import { Form, FormItem, Input, Select, Switch } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { FormProvider, Field } from '@formily/react';
import MonacoEditor from '@monaco-editor/react';
import '../styles';

const { TabPane } = Tabs;

const SimpleForm: React.FC = () => {
  // 创建表单实例
  const form = createForm({
    initialValues: {
      mode: 'development',
      entry: './src/index.js',
      output: {
        path: 'dist',
        filename: '[name].[contenthash].js',
      },
    },
  });

  // 生成配置代码
  const configCode = JSON.stringify(form.values, null, 2);

  return (
    <div className="webpack-config-formily">
      <h2>Webpack 配置生成器 (简化版)</h2>
      <FormProvider form={form}>
        <Tabs defaultActiveKey="form">
          <TabPane tab="配置表单" key="form">
            <Card title="基本配置" className="config-card">
              <Form layout="vertical">
                <Field
                  name="mode"
                  title="模式"
                  decorator={[FormItem]}
                  component={[
                    Select,
                    {
                      placeholder: '选择构建模式',
                      options: [
                        { label: 'development', value: 'development' },
                        { label: 'production', value: 'production' },
                        { label: 'none', value: 'none' },
                      ],
                    },
                  ]}
                />
                <Field
                  name="entry"
                  title="入口文件"
                  decorator={[FormItem]}
                  component={[
                    Input,
                    {
                      placeholder: './src/index.js',
                    },
                  ]}
                />
                <Field
                  name="output.path"
                  title="输出路径"
                  decorator={[FormItem]}
                  component={[
                    Input,
                    {
                      placeholder: 'dist',
                    },
                  ]}
                />
                <Field
                  name="output.filename"
                  title="文件名模板"
                  decorator={[FormItem]}
                  component={[
                    Input,
                    {
                      placeholder: '[name].[contenthash].js',
                    },
                  ]}
                />
                <Field
                  name="optimization.minimize"
                  title="压缩代码"
                  decorator={[FormItem]}
                  component={[
                    Switch,
                    {
                      defaultChecked: false,
                    },
                  ]}
                />
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="生成配置" key="code">
            <MonacoEditor
              height="300px"
              language="json"
              value={configCode}
              options={{ readOnly: true }}
            />
          </TabPane>
        </Tabs>
      </FormProvider>
    </div>
  );
};

export default React.memo(SimpleForm);
