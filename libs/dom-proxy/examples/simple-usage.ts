import { initTracker, getTracker } from '../src';

// 初始化埋点 SDK
initTracker({
  serverUrl: 'https://analytics-api.example.com/collect',
  appId: 'example-app',
  version: '1.0.0',
  debug: true,
  batchSize: 10,
  batchDelay: 5000,
  autoTrackClicks: true
});

// 手动跟踪事件
getTracker().track({
  eventType: 'custom',
  eventCategory: 'product',
  eventAction: 'view',
  eventLabel: 'Product XYZ',
  productId: '123',
  productPrice: 99.99
});

// 跟踪元素曝光
document.addEventListener('DOMContentLoaded', () => {
  // 单个元素曝光跟踪
  const bannerElement = document.querySelector('.banner');
  if (bannerElement) {
    getTracker().trackExposure({
      element: bannerElement as HTMLElement,
      eventData: {
        eventCategory: 'banner',
        eventAction: 'exposure',
        eventLabel: 'Summer Sale',
        bannerId: 'summer-2023'
      }
    });
  }

  // 批量元素曝光跟踪
  getTracker().trackExposures('.product-card', {
    eventCategory: 'product',
    eventAction: 'exposure',
    eventLabel: 'Product Card'
  });

  // 设置用户ID
  getTracker().setUserId('user-123');

  // 立即发送队列中的所有事件
  getTracker().flush();
});

// 页面卸载前清理
window.addEventListener('beforeunload', () => {
  getTracker().destroy();
});
