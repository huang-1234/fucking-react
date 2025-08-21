import React, { useState, useEffect } from 'react';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import * as ReactFormilyAntdComponents from '@formily/antd-v5';
import { Card, Drawer, Button, List, Typography, Space } from 'antd';
import { ISchema } from '@formily/json-schema';
import formilySchemas from '../formily-schemas.json';
const {
  Form,
  FormItem,
  Input,
  Select,
  Switch,
  NumberPicker,
  ArrayItems,
  FormLayout,
  ...restFormilyAntdComponents
} = ReactFormilyAntdComponents;
const { Title, Text } = Typography;

// 创建SchemaField组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    Switch,
    NumberPicker,
    ArrayItems,
    ...restFormilyAntdComponents,
  },
});

interface FormilySchemaRendererProps {
  onSubmit?: (values: any) => void;
}

const FormilySchemaRenderer: React.FC<FormilySchemaRendererProps> = ({ onSubmit }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<ISchema | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // 从formily-schemas.json中获取所有组件的schema
  const schemas = formilySchemas.schemas || {};
  const componentPaths = Object.keys(schemas);

  // 打开抽屉并设置选中的schema
  const openDrawer = (path: string) => {
    const schema = schemas[path];
    if (schema) {
      // 创建一个新的表单实例
      const form = createForm();

      // 设置选中的schema和路径
      setSelectedSchema(schema);
      setSelectedPath(path);

      // 重置表单值
      setFormValues({});

      // 打开抽屉
      setDrawerVisible(true);
    }
  };

  // 关闭抽屉
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // 处理表单提交
  const handleFormSubmit = (values: any) => {
    setFormValues(values);
    if (onSubmit) {
      onSubmit(values);
    }
  };

  // 处理表单值变化
  const handleFormChange = (values: any) => {
    setFormValues(values);
  };

  // 格式化schema为Formily可用的格式
  const formatSchema = (schema: any): ISchema => {
    if (!schema) return { type: 'object', properties: {} };

    const properties: Record<string, any> = {};

    // 处理每个属性
    Object.entries(schema.properties || {}).forEach(([key, propSchema]: [string, any]) => {
      properties[key] = {
        type: propSchema.type || 'string',
        title: propSchema.title || key,
        'x-decorator': propSchema['x-decorator'] || 'FormItem',
        'x-component': propSchema['x-component'] || 'Input',
        enum: propSchema.enum ?
          propSchema.enum.map((item: string) => {
            // 处理带引号的枚举值
            const cleanValue = item.replace(/^"(.*)"$/, '$1');
            return {
              label: cleanValue,
              value: cleanValue
            };
          }) : undefined,
        default: propSchema.default ?
          propSchema.default.replace(/^"(.*)"$/, '$1') : undefined,
      };
    });

    return {
      type: 'object',
      properties
    };
  };

  return (
    <div>
      <Card title={`组件Schema列表 (${componentPaths.length})`}>
        <List
          bordered
          dataSource={componentPaths}
          renderItem={(path) => (
            <List.Item>
              <Button
                type="link"
                onClick={() => openDrawer(path)}
                style={{ textAlign: 'left', width: '100%' }}
              >
                {path}
              </Button>
            </List.Item>
          )}
        />
      </Card>

      <Drawer
        title={`组件Schema表单 - ${selectedPath}`}
        placement="right"
        width={600}
        onClose={closeDrawer}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={closeDrawer}>关闭</Button>
          </Space>
        }
      >
        {selectedSchema && (
          <div>
            <Form
              layout="vertical"
              onAutoSubmit={handleFormSubmit}
              onChange={handleFormChange}
            >
              <SchemaField schema={formatSchema(selectedSchema)} />
              <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                提交
              </Button>
            </Form>

            {Object.keys(formValues).length > 0 && (
              <Card title="表单值" style={{ marginTop: 16 }}>
                <pre>{JSON.stringify(formValues, null, 2)}</pre>
              </Card>
            )}

            <Card title="Schema定义" style={{ marginTop: 16 }}>
              <pre>{JSON.stringify(selectedSchema, null, 2)}</pre>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FormilySchemaRenderer;
