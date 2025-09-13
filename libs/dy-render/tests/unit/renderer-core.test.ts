import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RendererCore } from '../../src/core/renderer-core';
import { DySchema } from '../../types/schema';
import { IStyleBasic } from '../../types/style';

// 模拟DOM环境
const setupMockDOM = () => {
  // 模拟document.createElement
  global.document = {
    createElement: vi.fn((tag) => {
      const element = {
        tagName: tag.toUpperCase(),
        style: {},
        className: '',
        children: [],
        textContent: '',
        setAttribute: vi.fn((name, value) => {
          (element as any)[name] = value;
        }),
        appendChild: vi.fn((child) => {
          element.children.push(child);
          return child;
        }),
        addEventListener: vi.fn(),
      };
      return element;
    }),
    body: {
      appendChild: vi.fn(),
    },
    importNode: vi.fn((node, deep) => node),
  } as any;

  // 模拟HTMLElement
  global.HTMLElement = class HTMLElement {} as any;
};

// 清理模拟
const cleanupMockDOM = () => {
  delete (global as any).document;
  delete (global as any).HTMLElement;
};

describe('RendererCore', () => {
  beforeEach(() => {
    setupMockDOM();
  });

  afterEach(() => {
    cleanupMockDOM();
    vi.clearAllMocks();
  });

  it('should create a renderer instance', () => {
    const renderer = new RendererCore();
    expect(renderer).toBeDefined();
  });

  it('should initialize with assets', async () => {
    const renderer = new RendererCore();

    const mockComponent = { is: 'div' };
    const mockUtils = {
      formatDate: vi.fn(),
    };

    await renderer.init({
      components: {
        'test': mockComponent,
      },
      utils: mockUtils,
    });

    // 验证上下文中是否有工具函数
    const context = renderer.getContext();
    expect(context).toBeDefined();
  });

  it('should render a simple schema', async () => {
    const renderer = new RendererCore();

    // 模拟组件
    const mockViewComponent = { is: 'div' };

    await renderer.init({
      components: {
        'view': mockViewComponent,
        'dycomponents::view': mockViewComponent,
      },
    });

    // 创建容器
    const container = document.createElement('div');

    // 创建简单Schema
    const schema: DySchema = {
      __id: 'root',
      __name: 'root',
      __type: 'dycomponents::view',
      __props: {
        __name: 'root',
        __style: {
          backgroundColor: '#ffffff',
        } as IStyleBasic,
      },
    };

    // 渲染Schema
    const instance = await renderer.render(schema, container);

    // 验证结果
    expect(instance).toBeDefined();
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should handle nested components', async () => {
    const renderer = new RendererCore();

    // 模拟组件
    const mockViewComponent = { is: 'div' };
    const mockTextComponent = { is: 'span' };

    await renderer.init({
      components: {
        'view': mockViewComponent,
        'text': mockTextComponent,
        'dycomponents::view': mockViewComponent,
        'dycomponents::text': mockTextComponent,
      },
    });

    // 创建容器
    const container = document.createElement('div');

    // 创建嵌套Schema
    const schema: DySchema = {
      __id: 'root',
      __name: 'root',
      __type: 'dycomponents::view',
      __props: {
        __name: 'root',
      },
      __children: [
        {
          __id: 'child1',
          __name: 'child1',
          __type: 'dycomponents::text',
          __props: {
            __name: 'child1',
            __text: 'Hello World',
          },
        },
      ],
    };

    // 渲染Schema
    const instance = await renderer.render(schema, container);

    // 验证结果
    expect(instance).toBeDefined();
    expect(container.children.length).toBeGreaterThan(0);

    // 验证子组件
    const rootElement = container.children[0];
    expect(rootElement.children.length).toBeGreaterThan(0);
  });

  it('should update rendered schema', async () => {
    const renderer = new RendererCore();

    // 模拟组件
    const mockViewComponent = { is: 'div' };

    await renderer.init({
      components: {
        'view': mockViewComponent,
        'dycomponents::view': mockViewComponent,
      },
    });

    // 创建容器
    const container = document.createElement('div');

    // 创建Schema
    const schema: DySchema = {
      __id: 'root',
      __name: 'root',
      __type: 'dycomponents::view',
      __props: {
        __name: 'root',
        __style: {
          backgroundColor: '#ffffff',
        } as IStyleBasic,
      },
    };

    // 渲染Schema
    const instance = await renderer.render(schema, container);

    // 更新Schema
    const updatedSchema: DySchema = {
      ...schema,
      __props: {
        ...schema.__props,
        __style: {
          ...schema.__props?.__style,
          backgroundColor: '#000000',
        } as IStyleBasic,
      },
    };

    // 更新渲染
    await instance.update(updatedSchema);

    // 验证更新
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should track performance if enabled', async () => {
    const renderer = new RendererCore({
      enablePerformanceMonitor: true,
    });

    // 模拟性能API
    global.performance = {
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn().mockReturnValue([{ duration: 100 }]),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
    } as any;

    // 模拟组件
    const mockViewComponent = { is: 'div' };

    await renderer.init({
      components: {
        'view': mockViewComponent,
        'dycomponents::view': mockViewComponent,
      },
    });

    // 创建容器
    const container = document.createElement('div');

    // 创建Schema
    const schema: DySchema = {
      __id: 'test-perf',
      __name: 'root',
      __type: 'dycomponents::view',
      __props: {
        __name: 'root',
      },
    };

    // 渲染Schema
    await renderer.render(schema, container);

    // 获取性能监控器
    const monitor = renderer.getPerformanceMonitor();

    // 验证性能监控
    expect(monitor).toBeDefined();
    expect(performance.mark).toHaveBeenCalled();
    expect(performance.measure).toHaveBeenCalled();

    // 清理
    delete (global as any).performance;
  });
});
