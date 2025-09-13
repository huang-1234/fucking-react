import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentMapper } from '../../src/core/component-mapper';

describe('ComponentMapper', () => {
  let mapper: ComponentMapper;

  beforeEach(() => {
    mapper = new ComponentMapper();
  });

  it('should register and get a component', () => {
    // 创建模拟组件
    const mockComponent = { render: vi.fn() };

    // 注册组件
    mapper.registerComponent('test', mockComponent);

    // 获取组件
    const component = mapper.getComponent('test');

    // 验证结果
    expect(component).toBe(mockComponent);
  });

  it('should register multiple components', () => {
    // 创建模拟组件
    const mockComponents = {
      'test1': { render: vi.fn() },
      'test2': { render: vi.fn() },
    };

    // 注册组件
    mapper.registerComponents(mockComponents);

    // 获取组件
    const component1 = mapper.getComponent('test1');
    const component2 = mapper.getComponent('test2');

    // 验证结果
    expect(component1).toBe(mockComponents.test1);
    expect(component2).toBe(mockComponents.test2);
  });

  it('should register component with metadata', () => {
    // 创建模拟组件
    const mockComponent = { render: vi.fn() };

    // 注册组件
    mapper.registerComponent('test', mockComponent, {
      props: {
        title: 'Test Component',
        description: 'A test component',
      },
    });

    // 获取组件元数据
    const meta = mapper.getComponentMeta('test');

    // 验证结果
    expect(meta).toBeDefined();
    expect(meta?.name).toBe('test');
    expect(meta?.component).toBe(mockComponent);
    expect(meta?.props).toEqual({
      title: 'Test Component',
      description: 'A test component',
    });
  });

  it('should clear all components', () => {
    // 创建模拟组件
    const mockComponent = { render: vi.fn() };

    // 注册组件
    mapper.registerComponent('test', mockComponent);

    // 清空组件
    mapper.clear();

    // 获取组件
    const component = mapper.getComponent('test');

    // 验证结果
    expect(component).toBeUndefined();
  });

  it('should load component dynamically', async () => {
    // 模拟动态导入
    vi.mock('../../components/View', () => ({
      default: { name: 'View' },
    }));

    // 加载组件
    const component = await mapper.loadComponent('dycomponents::view');

    // 验证结果
    expect(component).toBeDefined();
    expect(component.name).toBe('View');
  });

  it('should prevent duplicate loading of the same component', async () => {
    // 模拟动态导入
    const mockImport = vi.fn().mockResolvedValue({ default: { name: 'View' } });
    (mapper as any).loadComponentInternal = mockImport;

    // 并发加载同一个组件
    const [component1, component2] = await Promise.all([
      mapper.loadComponent('view'),
      mapper.loadComponent('view'),
    ]);

    // 验证结果
    expect(component1).toBe(component2);
    expect(mockImport).toHaveBeenCalledTimes(1);
  });
});
