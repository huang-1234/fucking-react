import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Button, Modal, Form, Input, Select, Tabs } from 'antd';
import {
  TrackingRoot,
  wrapAntdComponents,
  createTrackedAntdComponent
} from '../src';

// 创建埋点增强版 Antd
const TrackedAntd = wrapAntdComponents({ Button, Modal, Form, Input, Select, Tabs });

// 或者单独包装特定组件
const TrackedButton = createTrackedAntdComponent(Button, 'button');
const TrackedModal = createTrackedAntdComponent(Modal, 'modal');

// 表单组件
const ContactForm = () => {
  const [form] = TrackedAntd.Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('表单提交:', values);
    form.resetFields();
  };

  return (
    <TrackedAntd.Form
      form={form}
      name="contact"
      onFinish={handleSubmit}
      layout="vertical"
      style={{ maxWidth: '500px', margin: '0 auto' }}
    >
      <TrackedAntd.Form.Item
        label="姓名"
        name="name"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <TrackedAntd.Input placeholder="请输入姓名" />
      </TrackedAntd.Form.Item>

      <TrackedAntd.Form.Item
        label="邮箱"
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <TrackedAntd.Input placeholder="请输入邮箱" />
      </TrackedAntd.Form.Item>

      <TrackedAntd.Form.Item
        label="主题"
        name="subject"
      >
        <TrackedAntd.Select placeholder="请选择主题">
          <TrackedAntd.Select.Option value="feedback">产品反馈</TrackedAntd.Select.Option>
          <TrackedAntd.Select.Option value="support">技术支持</TrackedAntd.Select.Option>
          <TrackedAntd.Select.Option value="other">其他</TrackedAntd.Select.Option>
        </TrackedAntd.Select>
      </TrackedAntd.Form.Item>

      <TrackedAntd.Form.Item
        label="留言"
        name="message"
        rules={[{ required: true, message: '请输入留言内容' }]}
      >
        <TrackedAntd.Input.TextArea rows={4} placeholder="请输入留言内容" />
      </TrackedAntd.Form.Item>

      <TrackedAntd.Form.Item>
        <TrackedAntd.Button type="primary" htmlType="submit">
          提交
        </TrackedAntd.Button>
      </TrackedAntd.Form.Item>
    </TrackedAntd.Form>
  );
};

// 弹窗示例
const ModalExample = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2>弹窗示例</h2>

      {/* 使用单独包装的按钮 */}
      <TrackedButton
        type="primary"
        onClick={() => setVisible(true)}
        data-tracking-label="打开弹窗"
      >
        打开弹窗
      </TrackedButton>

      {/* 使用单独包装的弹窗 */}
      <TrackedModal
        title="用户协议"
        open={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        data-tracking-label="用户协议弹窗"
      >
        <p>这是用户协议内容，点击确定表示您同意我们的条款。</p>
        <p>此操作将被埋点系统自动记录。</p>
      </TrackedModal>
    </div>
  );
};

// 标签页示例
const TabsExample = () => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2>标签页示例</h2>

      <TrackedAntd.Tabs defaultActiveKey="1">
        <TrackedAntd.Tabs.TabPane tab="产品介绍" key="1">
          <p>这是产品介绍内容，切换标签页时会自动记录埋点数据。</p>
        </TrackedAntd.Tabs.TabPane>
        <TrackedAntd.Tabs.TabPane tab="使用指南" key="2">
          <p>这是使用指南内容，切换标签页时会自动记录埋点数据。</p>
        </TrackedAntd.Tabs.TabPane>
        <TrackedAntd.Tabs.TabPane tab="常见问题" key="3">
          <p>这是常见问题内容，切换标签页时会自动记录埋点数据。</p>
        </TrackedAntd.Tabs.TabPane>
      </TrackedAntd.Tabs>
    </div>
  );
};

// 应用主组件
const App = () => {
  return (
    <TrackingRoot
      config={{
        serverUrl: 'https://analytics-api.example.com/collect',
        appId: 'antd-example',
        debug: true,
        autoTrackClicks: true,
        batchSize: 5,
        batchDelay: 3000
      }}
    >
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Antd 组件埋点示例</h1>
        <p>本示例展示了如何使用全埋点方案对 Antd 组件进行埋点增强。</p>

        <ModalExample />
        <TabsExample />
        <ContactForm />
      </div>
    </TrackingRoot>
  );
};

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
