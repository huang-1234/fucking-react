import React from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input } from 'antd';
import PropTypes from 'prop-types';

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

export interface FormSimpleProps {
  /** 表单标题 */
  title?: string;
  /** 表单布局方式 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 是否显示记住我选项 */
  showRemember?: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 表单提交处理函数 */
  onSubmit?: (values: FieldType) => void;
}

const FormSimple: React.FC<FormSimpleProps> = ({
  title = '登录表单',
  layout = 'horizontal',
  showRemember = true,
  submitText = 'Submit',
  onSubmit = onFinish
}) => (
  <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    initialValues={{ remember: true }}
    onFinish={onSubmit}
    onFinishFailed={onFinishFailed}
    layout={layout}
    autoComplete="off"
  >
    {title && <h2>{title}</h2>}
    <Form.Item<FieldType>
      label="Username"
      name="username"
      rules={[{ required: true, message: 'Please input your username!' }]}
    >
      <Input />
    </Form.Item>

    <Form.Item<FieldType>
      label="Password"
      name="password"
      rules={[{ required: true, message: 'Please input your password!' }]}
    >
      <Input.Password />
    </Form.Item>

    {showRemember && (
      <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
        <Checkbox>Remember me</Checkbox>
      </Form.Item>
    )}

    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        {submitText}
      </Button>
    </Form.Item>
  </Form>
);

// @ts-ignore - PropTypes are used for props-to-schema extraction
FormSimple.propTypes = {
  /** 表单标题 */
  title: PropTypes.string,
  /** 表单布局方式 */
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  /** 是否显示记住我选项 */
  showRemember: PropTypes.bool,
  /** 提交按钮文本 */
  submitText: PropTypes.string,
  /** 表单提交处理函数 */
  onSubmit: PropTypes.func
};

// We're using default values in the function parameters instead of defaultProps
// but keeping this for props-to-schema extraction
// @ts-ignore
FormSimple.defaultProps = {
  title: '登录表单',
  layout: 'horizontal',
  showRemember: true,
  submitText: 'Submit'
};

export default FormSimple;