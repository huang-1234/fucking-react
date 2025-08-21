import React from 'react';
import { createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  FormLayout,
  Input,
  Select,
  FormCollapse,
  ArrayItems,
} from '@formily/antd-v5';
import { basicConfigSchema } from '../schemas/basicConfig';
import { KeyValueList } from './KeyValueList';

// 创建SchemaField组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    Input,
    Select,
    FormCollapse,
    ArrayItems,
    KeyValueList,
  },
});

const BasicConfig: React.FC = () => {
  return (
    <Form layout="vertical">
      <SchemaField schema={basicConfigSchema} />
    </Form>
  );
};

export default React.memo(BasicConfig);