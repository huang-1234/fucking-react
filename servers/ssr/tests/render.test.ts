/**
 * SSR渲染测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable } from 'stream';
import { renderToStream } from '../src/server/middleware/render';

// 模拟React的renderToPipeableStream
vi.mock('react-dom/server', () => ({
  renderToPipeableStream: vi.fn((_element, options) => {
    const mockStream = new Readable({
      read() {
        this.push('<div id="root">测试内容</div>');
        this.push(null);
      }
    });

    // 调用onShellReady回调
    setTimeout(() => {
      options.onShellReady();
    }, 0);

    return { pipe: mockStream };
  })
}));

// 模拟服务端入口模块
vi.mock('../src/entry-server', () => ({
  render: vi.fn(async () => ({
    App: 'MockedApp',
    head: {
      title: '<title>测试标题</title>',
      meta: '<meta name="description" content="测试描述">',
      links: '',
      scripts: ''
    },
    state: { test: 'data' }
  }))
}));

describe('SSR渲染测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('应该返回正确的渲染流和状态', async () => {
    const result = await renderToStream({
      url: '/test',
      context: { testContext: true }
    });

    // 检查返回的结果
    expect(result).toBeDefined();
    expect(result.stream).toBeInstanceOf(Readable);
    expect(result.state).toEqual({ test: 'data' });
    expect(result.head).toEqual({
      title: '<title>测试标题</title>',
      meta: '<meta name="description" content="测试描述">',
      links: '',
      scripts: ''
    });

    // 验证entry-server的render函数被正确调用
    const { render } = await import('../src/entry-server');
    expect(render).toHaveBeenCalledWith('/test', { testContext: true });
  });

  it('应该能够从流中读取数据', async () => {
    const { stream } = await renderToStream({ url: '/test' });

    // 从流中读取数据
    let content = '';
    for await (const chunk of stream) {
      content += chunk.toString();
    }

    expect(content).toContain('<div id="root">测试内容</div>');
  });
});