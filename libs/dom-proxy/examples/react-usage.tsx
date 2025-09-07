import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  TrackingRoot,
  TrackExposure,
  TrackClick,
  useExposureTracking,
  useClickTracking,
  usePageViewTracking
} from '../src';

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
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onClick={handleClick}
      style={{
        border: '1px solid #eee',
        borderRadius: '4px',
        padding: '16px',
        margin: '16px',
        width: '240px'
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={{ width: '100%', height: 'auto' }}
      />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button>加入购物车</button>
    </div>
  );
};

// 主页面组件
const HomePage = () => {
  // 跟踪页面浏览
  usePageViewTracking({
    pageName: '首页',
    pageCategory: 'home'
  });

  // 示例数据
  const products = [
    { id: '1', name: '商品 A', price: 99.99, image: 'https://via.placeholder.com/150' },
    { id: '2', name: '商品 B', price: 149.99, image: 'https://via.placeholder.com/150' },
    { id: '3', name: '商品 C', price: 199.99, image: 'https://via.placeholder.com/150' },
  ];

  return (
    <div>
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
      <div style={{ marginBottom: '24px' }}>
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
      </div>

      {/* 商品列表 */}
      <h2>热门商品</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
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

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
