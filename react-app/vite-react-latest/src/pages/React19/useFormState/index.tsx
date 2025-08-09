import React, { useState, useRef, useEffect } from 'react';
import { Typography, Divider, Card, Space, Button, Alert, Form, Input, Select, Spin, Result } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';
import { codeuseFormState, traditionalFormCode } from '../hooks/react-text';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// 模拟useFormState Hook
const useFormState = (action: (state: any, formData: FormData) => Promise<any>, initialState: any) => {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const formAction = async (formData: FormData) => {
    setIsPending(true);
    try {
      const result = await action(state, formData);
      setState(result);
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return [state, formAction, isPending];
};

/**
 * React 19 useFormState 示例组件
 * 演示React 19引入的useFormState Hook
 */
const UseFormStateDemo: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // 模拟表单提交处理函数
  const submitAction = async (_prevState: any, formData: FormData) => {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 1000));

    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    // 模拟表单验证
    if (!username || username.length < 3) {
      return {
        error: '用户名至少需要3个字符',
        field: 'username'
      };
    }

    if (!email || !email.includes('@')) {
      return {
        error: '请输入有效的邮箱地址',
        field: 'email'
      };
    }

    // 成功提交
    return {
      success: true,
      data: { username, email, role }
    };
  };

  // 使用模拟的useFormState
  const [formState, formAction, isPending] = useFormState(submitAction, {});

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formAction(formData);
    }
  };

  // 显示成功信息
  useEffect(() => {
    if (formState.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [formState]);



  return (
    <div className="use-form-state-demo">
      <Typography>
        <Title level={2}>React 19: useFormState</Title>
        <Paragraph>
          <Text strong>useFormState</Text> 是React 19引入的新Hook，它简化了表单处理并提高了性能。
          这个Hook与React的服务器组件和Actions功能协同工作，为表单处理提供了一种新的范式。
        </Paragraph>

        <Alert
          message="服务器组件功能"
          description="useFormState主要设计用于与React服务器组件和Actions一起使用。在本演示中，我们模拟了其行为，但在实际应用中，它需要在支持服务器组件的环境中使用。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider orientation="left">useFormState演示</Divider>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {showSuccess ? (
            <Result
              status="success"
              title="表单提交成功!"
              subTitle={`用户 ${formState.data?.username} (${formState.data?.email}) 已创建为 ${formState.data?.role} 角色。`}
            />
          ) : (
            <Card title="用户注册表单">
              <Spin spinning={isPending} tip="提交中...">
                <Form layout="vertical">
                  <form ref={formRef} onSubmit={handleSubmit}>
                    {formState.error && (
                      <Alert
                        message={formState.error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    <Form.Item
                      label="用户名"
                      validateStatus={formState.field === 'username' ? 'error' : ''}
                      name="username"
                    >
                      <Input
                        placeholder="请输入用户名"
                      />
                    </Form.Item>

                    <Form.Item
                      label="邮箱"
                      validateStatus={formState.field === 'email' ? 'error' : ''}
                      name="email"
                    >
                      <Input
                        type="email"
                        placeholder="请输入邮箱"
                      />
                    </Form.Item>

                    <Form.Item label="角色" name="role">
                      <Select
                        defaultValue="user"
                        style={{ width: '100%' }}
                      >
                        <Option value="user">普通用户</Option>
                        <Option value="admin">管理员</Option>
                        <Option value="editor">编辑</Option>
                      </Select>
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                      style={{ marginTop: 16 }}
                    >
                      创建用户
                    </Button>
                  </form>
                </Form>
              </Spin>
            </Card>
          )}

          <Divider orientation="left">代码对比</Divider>

          <Card title="使用useFormState">
            <CodeBlock code={codeuseFormState} />

            <Alert
              message="优势"
              description="useFormState将表单状态与服务器操作紧密集成，简化了表单处理流程，减少了样板代码，并提供了更好的性能和用户体验。"
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>

          <Card title="传统表单处理">
            <CodeBlock code={traditionalFormCode} />

            <Alert
              message="缺点"
              description="传统的表单处理需要手动管理多个状态、处理表单提交、执行验证和错误处理，导致代码冗长且容易出错。"
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Space>

        <Divider orientation="left">useFormState的优势</Divider>
        <Paragraph>
          useFormState带来以下优势：
        </Paragraph>
        <ul>
          <li><Text strong>简化表单处理</Text> - 减少样板代码，简化状态管理</li>
          <li><Text strong>渐进式增强</Text> - 表单可以在JavaScript禁用的情况下工作</li>
          <li><Text strong>更好的性能</Text> - 优化重渲染，只更新需要变化的部分</li>
          <li><Text strong>与服务器组件集成</Text> - 无缝连接客户端表单和服务器操作</li>
          <li><Text strong>内置的乐观UI</Text> - 提供更好的用户体验</li>
        </ul>

        <Paragraph>
          useFormState是React 19中最实用的新特性之一，它代表了React团队对表单处理的新思考，
          使表单处理变得更简单、更高效。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default UseFormStateDemo;