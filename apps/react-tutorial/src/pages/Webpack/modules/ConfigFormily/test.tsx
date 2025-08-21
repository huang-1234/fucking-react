import React from 'react';
import { Form, FormItem, Input } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { FormProvider, Field } from '@formily/react';
import './styles';

const TestForm: React.FC = () => {
  const form = createForm();

  return (
    <FormProvider form={form}>
      <Form layout="vertical">
        <Field
          name="username"
          title="用户名"
          required
          decorator={[FormItem]}
          component={[Input]}
        />
      </Form>
    </FormProvider>
  );
};

export default TestForm;