import React, { useEffect } from 'react';
import { Button, Card, List, Modal, Form, Input } from 'antd';
import {
  initTracker,
  getTracker,
  TrackingRoot,
  TrackExposure,
  TrackClick,
  useExposureTracking,
  useClickTracking,
  usePageViewTracking,
  wrapAntdComponents
} from '../index';

// 创建埋点增强版 Antd
const TrackedAntd = wrapAntdComponents({ Button, Modal, Form, Input });

// 示例数据
const products = [
  { id: '1', name: '商品 A', price: 99.99, image: 'https://via.placeholder.com/150' },
  { id: '2', name: '商品 B', price: 149.99, image: 'https://via.placeholder.com/150' },
  { id: '3', name: '商品 C', price: 199.99, image: 'https://via.placeholder.com/150' },
];

// 产品卡片组件 - 使用 Hooks 方式
const ProductCard = ({ product }: { product: any }) => {
  // 跟踪元素曝光
  const ref = useExposureTracking({
    eventCategory: 'product',
    eventAction: 'exposure',
    eventLabel: product.name,
    productId: product.id
  });

  // 跟踪点击事件
  const handleClick = useClickTracking({
    eventCategory: 'product',
    eventAction: 'click',
    eventLabel: product.name,
    productId: product.id
  });

  return (
    <Card
      ref={ref}
      onClick={handleClick}
      hoverable
      cover={<img alt={product.name} src={product.image} />}
      style={{ width: 240, margin: '16px' }}
    >
      <Card.Meta title={product.name} description={`¥${product.price}`} />
    </Card>
  );
};

// 主页面组件
const HomePage = () => {
  // 跟踪页面浏览
  usePageViewTracking({
    pageName: '首页',
    pageCategory: 'home'
  });

  // 手动初始化埋点 SDK (通常在应用入口处初始化)
  useEffect(() => {
    if (!getTracker()) {
      initTracker({
        serverUrl: 'https://analytics-api.example.com/collect',
        appId: 'example-app',
        debug: true
      });
    }
  }, []);

  // 显示弹窗
  const showModal = () => {
    TrackedAntd.Modal.confirm({
      title: '确认订阅',
      content: '是否订阅我们的产品更新通知？',
      onOk: () => console.log('用户确认订阅')
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 使用 TrackExposure 组件跟踪曝光 */}
      <TrackExposure
        eventData={{
          eventCategory: 'banner',
          eventAction: 'exposure',
          eventLabel: '首页横幅'
        }}
      >
        <div
          style={{
            height: '200px',
            background: 'linear-gradient(to right, #4facfe, #00f2fe)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}
        >
          <h1 style={{ color: 'white' }}>夏季大促销</h1>
        </div>
      </TrackExposure>

      {/* 使用 TrackClick 组件跟踪点击 */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <TrackClick
          eventData={{
            eventCategory: 'button',
            eventAction: 'click',
            eventLabel: '查看全部'
          }}
          as="button"
          style={{
            padding: '8px 16px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          查看全部商品
        </TrackClick>

        {/* 使用增强后的 Antd 按钮 */}
        <TrackedAntd.Button
          type="primary"
          onClick={showModal}
          data-tracking-label="订阅按钮"
        >
          订阅通知
        </TrackedAntd.Button>
      </div>

      {/* 商品列表 */}
      <h2>热门商品</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 使用增强后的 Antd 表单 */}
      <div style={{ marginTop: '32px', maxWidth: '500px' }}>
        <h2>联系我们</h2>
        <TrackedAntd.Form name="contact">
          <TrackedAntd.Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <TrackedAntd.Input />
          </TrackedAntd.Form.Item>
          <TrackedAntd.Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
            <TrackedAntd.Input />
          </TrackedAntd.Form.Item>
          <TrackedAntd.Form.Item label="留言" name="message">
            <TrackedAntd.Input.TextArea />
          </TrackedAntd.Form.Item>
          <TrackedAntd.Form.Item>
            <TrackedAntd.Button type="primary" htmlType="submit">
              提交
            </TrackedAntd.Button>
          </TrackedAntd.Form.Item>
        </TrackedAntd.Form>
      </div>
    </div>
  );
};

// 应用入口组件
const App = () => {
  return (
    <TrackingRoot
      config={{
        serverUrl: 'https://analytics-api.example.com/collect',
        appId: 'example-app',
        debug: true,
        autoTrackClicks: true,
        batchSize: 5,
        batchDelay: 3000
      }}
    >
      <HomePage />
    </TrackingRoot>
  );
};

export default App;
