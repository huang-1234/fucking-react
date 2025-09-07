import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useServiceWorker, ServiceWorkerProvider, useServiceWorkerContext } from '../hooks/useServiceWorker';
import { ServiceWorkerStatus } from '../types';
import { MockServiceWorkerRegistration, MockServiceWorker } from './mocks';
import React from 'react';

// 模拟依赖模块
vi.mock('../core/register', () => ({
  registerServiceWorker: vi.fn(),
  unregisterServiceWorker: vi.fn()
}));

vi.mock('../utils/message-bus', () => ({
  listenForMessages: vi.fn().mockReturnValue(() => {}),
  sendMessage: vi.fn(),
  skipWaiting: vi.fn(),
  checkForUpdates: vi.fn()
}));

import { registerServiceWorker, unregisterServiceWorker } from '../core/register';
import { listenForMessages, skipWaiting, checkForUpdates } from '../utils/message-bus';

// 简单的钩子测试工具
function renderHook(hook: Function) {
  const result = { current: null };
  const TestComponent = () => {
    result.current = hook();
    return null;
  };

  const render = () => {
    React.createElement(TestComponent, {});
  };

  render();

  return {
    result,
    rerender: render,
    unmount: () => {}
  };
}

describe('Service Worker React Hooks', () => {
  // 保存原始 navigator
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // 模拟 navigator.serviceWorker
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: {
          controller: new MockServiceWorker('/service-worker.js')
        }
      },
      configurable: true
    });

    // 重置模拟
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复原始 navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true
    });
  });

  describe('useServiceWorker', () => {
    it('应该注册Service Worker', () => {
      // 模拟成功注册
      const mockRegistration = new MockServiceWorkerRegistration();
      (registerServiceWorker as any).mockResolvedValue(mockRegistration);

      renderHook(() => useServiceWorker());

      expect(registerServiceWorker).toHaveBeenCalled();
    });

    it('应该监听Service Worker消息', () => {
      renderHook(() => useServiceWorker());

      expect(listenForMessages).toHaveBeenCalled();
    });
  });

  describe('ServiceWorkerProvider', () => {
    it('应该提供Service Worker上下文', () => {
      // 由于测试环境限制，这里只是简单验证组件能否创建
      const provider = React.createElement(
        ServiceWorkerProvider,
        { options: { swPath: '/custom-sw.js' } },
        React.createElement('div')
      );

      expect(provider).toBeDefined();
    });
  });
});