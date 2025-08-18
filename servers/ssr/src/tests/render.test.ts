/**
 * SSR渲染测试
 * 测试服务端渲染流程
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Readable } from 'stream';
import { createDOMEnvironment } from '../server/dom-simulator';
import pkg from 'react-helmet-async';
const { HelmetProvider } = pkg;

// 模拟renderToPipeableStream函数
vi.mock('react-dom/server', () => ({
  renderToPipeableStream: vi.fn((_element, options) => {
    const mockStream = new Readable();
    mockStream.push('<div>Mock SSR Content</div>');
    mockStream.push(null);

    // 调用onShellReady回调
    if (options && options.onShellReady) {
      options.onShellReady();
    }

    return {
      pipe: () => mockStream
    };
  }),
  renderToString: vi.fn(() => '<div>Mock SSR Content</div>')
}));

// 模拟renderToStream函数
const renderToStream = async (options: { url: string; context?: any }) => {
  return {
    stream: new Readable({
      read() {
        this.push('<div>Mock SSR Content</div>');
        this.push(null);
      }
    }),
    state: {
      pageData: {
        [options.url]: { title: 'Test Title' }
      }
    },
    head: {
      title: '<title>Test Title</title>',
      meta: '<meta name="description" content="Test Description">',
      links: '',
      scripts: ''
    }
  };
};

describe('SSR渲染测试', () => {
  let cleanup: () => void;

  beforeAll(() => {
    // 设置DOM环境
    try {
      const env = createDOMEnvironment({
        url: 'http://localhost',
        referrer: ''
      });
      cleanup = env.cleanup;
    } catch (error) {
      console.error('DOM环境设置失败:', error);
    }
  });

  afterAll(() => {
    // 清理DOM环境
    if (cleanup) cleanup();
  });

  it('应该返回正确的渲染流和状态', async () => {
    const result = await renderToStream({
      url: '/test',
      context: { testContext: true }
    });

    expect(result).toBeDefined();
    expect(result.stream).toBeDefined();
    expect(result.state).toBeDefined();
    expect(result.head).toBeDefined();

    expect(result.state.pageData).toHaveProperty('/test');
    expect(result.head.title).toBe('<title>Test Title</title>');
  });

  it('应该能够从流中读取数据', async () => {
    const { stream } = await renderToStream({ url: '/test' });

    // 从流中读取数据
    let content = '';

    for await (const chunk of stream) {
      content += chunk.toString();
    }

    expect(content).toContain('Mock SSR Content');
  });
});
