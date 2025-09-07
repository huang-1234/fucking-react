import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { registerServiceWorker, unregisterServiceWorker } from '../core/register';
import { MockServiceWorkerRegistration, MockServiceWorker } from './mocks';
import { MessageType } from '../types';

describe('Service Worker 注册', () => {
  // 保存原始 navigator
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // 模拟 navigator.serviceWorker
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: {
          register: vi.fn(),
          ready: Promise.resolve(new MockServiceWorkerRegistration()),
          controller: new MockServiceWorker('/service-worker.js')
        }
      },
      configurable: true
    });

    // 模拟环境变量
    vi.stubGlobal('process', { env: { NODE_ENV: 'production' } });
  });

  afterEach(() => {
    // 恢复原始 navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true
    });

    vi.restoreAllMocks();
  });

  it('应该成功注册Service Worker', async () => {
    // 模拟成功注册
    const mockRegistration = new MockServiceWorkerRegistration();
    mockRegistration.active = new MockServiceWorker('/service-worker.js', 'activated');

    (navigator.serviceWorker.register as any).mockResolvedValue(mockRegistration);

    const onSuccess = vi.fn();
    const result = await registerServiceWorker({
      swPath: '/service-worker.js',
      onSuccess
    });

    expect(result).toBe(mockRegistration);
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/service-worker.js', { scope: '/' });
  });

  it('当浏览器不支持Service Worker时应该返回null', async () => {
    // 模拟浏览器不支持Service Worker
    Object.defineProperty(global, 'navigator', {
      value: {},
      configurable: true
    });

    const onError = vi.fn();
    const result = await registerServiceWorker({
      swPath: '/service-worker.js',
      onError
    });

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe('浏览器不支持Service Worker');
  });

  it('在开发环境中默认不启用Service Worker', async () => {
    // 模拟开发环境
    vi.stubGlobal('process', { env: { NODE_ENV: 'development' } });

    const result = await registerServiceWorker({
      swPath: '/service-worker.js'
    });

    expect(result).toBeNull();
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
  });

  it('在开发环境中可以通过enableInDev选项启用Service Worker', async () => {
    // 模拟开发环境
    vi.stubGlobal('process', { env: { NODE_ENV: 'development' } });

    // 模拟成功注册
    const mockRegistration = new MockServiceWorkerRegistration();
    (navigator.serviceWorker.register as any).mockResolvedValue(mockRegistration);

    const result = await registerServiceWorker({
      swPath: '/service-worker.js',
      enableInDev: true
    });

    expect(result).toBe(mockRegistration);
    expect(navigator.serviceWorker.register).toHaveBeenCalled();
  });

  it('当有新版本可用时应该调用onUpdate回调', async () => {
    // 模拟注册过程
    const mockRegistration = new MockServiceWorkerRegistration();
    const mockInstalling = new MockServiceWorker('/service-worker.js', 'installing');
    mockRegistration.installing = mockInstalling;

    (navigator.serviceWorker.register as any).mockResolvedValue(mockRegistration);

    const onUpdate = vi.fn();
    await registerServiceWorker({
      swPath: '/service-worker.js',
      onUpdate
    });

    // 模拟状态变化事件
    const stateChangeEvent = new Event('statechange');
    mockInstalling.state = 'installed';
    mockInstalling.onstatechange?.(stateChangeEvent);

    expect(onUpdate).toHaveBeenCalledWith(mockRegistration);
  });

  it('当Service Worker激活成功时应该调用onSuccess回调', async () => {
    // 模拟注册过程
    const mockRegistration = new MockServiceWorkerRegistration();
    const mockInstalling = new MockServiceWorker('/service-worker.js', 'installing');
    mockRegistration.installing = mockInstalling;

    (navigator.serviceWorker.register as any).mockResolvedValue(mockRegistration);

    const onSuccess = vi.fn();
    await registerServiceWorker({
      swPath: '/service-worker.js',
      onSuccess
    });

    // 模拟状态变化事件
    const stateChangeEvent = new Event('statechange');
    mockInstalling.state = 'activated';
    mockInstalling.onstatechange?.(stateChangeEvent);

    expect(onSuccess).toHaveBeenCalledWith(mockRegistration);
  });

  it('当注册失败时应该调用onError回调', async () => {
    // 模拟注册失败
    const error = new Error('注册失败');
    (navigator.serviceWorker.register as any).mockRejectedValue(error);

    const onError = vi.fn();
    const result = await registerServiceWorker({
      swPath: '/service-worker.js',
      onError
    });

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('应该成功注销Service Worker', async () => {
    // 模拟注销成功
    const mockRegistration = new MockServiceWorkerRegistration();
    vi.spyOn(mockRegistration, 'unregister').mockResolvedValue(true);

    (navigator.serviceWorker.ready as any) = Promise.resolve(mockRegistration);

    const result = await unregisterServiceWorker();

    expect(result).toBe(true);
    expect(mockRegistration.unregister).toHaveBeenCalled();
  });

  it('当浏览器不支持Service Worker时注销应该返回false', async () => {
    // 模拟浏览器不支持Service Worker
    Object.defineProperty(global, 'navigator', {
      value: {},
      configurable: true
    });

    const result = await unregisterServiceWorker();

    expect(result).toBe(false);
  });
});
