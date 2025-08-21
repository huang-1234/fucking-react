import React from 'react';
import { createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  FormLayout,
  Input,
  Select,
  Switch,
  FormCollapse,
  NumberPicker,
} from '@formily/antd-v5';
import { optimizationConfigSchema } from '../schemas/optimizationConfig';

// 创建SchemaField组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    Input,
    Select,
    Switch,
    FormCollapse,
    NumberPicker,
  },
});

const OptimizationConfig: React.FC = () => {
  return (
    <Form layout="vertical">
      <SchemaField schema={optimizationConfigSchema} />
    </Form>
  );
};

export default React.memo(OptimizationConfig);