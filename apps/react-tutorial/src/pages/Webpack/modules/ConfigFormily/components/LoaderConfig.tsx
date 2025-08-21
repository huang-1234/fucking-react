import React from 'react';
import { createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  FormLayout,
  Input,
  Select,
  ArrayCollapse,
} from '@formily/antd-v5';
import { loaderConfigSchema } from '../schemas/loaderConfig';
import { MonacoInput } from './MonacoInput';

// 创建SchemaField组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    Input,
    Select,
    ArrayCollapse,
    MonacoInput,
  },
});

const LoaderConfig: React.FC = () => {
  return (
    <Form layout="vertical">
      <SchemaField schema={loaderConfigSchema} />
    </Form>
  );
};

export default React.memo(LoaderConfig);