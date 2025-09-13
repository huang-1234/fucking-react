import { RendererCore } from '../core/renderer-core';
import { IRenderOptions, IAssetsPackage } from '../types';
import { DySchema } from '../../types/schema';

/**
 * 创建渲染器
 * @param options 渲染选项
 * @returns 渲染器实例
 */
export async function createRenderer(options: IRenderOptions = {}) {
  // 创建渲染引擎实例
  const renderer = new RendererCore(options);

  // 预加载内置组件
  await loadBuiltinComponents(renderer);

  return {
    /**
     * 渲染Schema
     * @param schema Schema协议
     * @param container 容器元素
     * @returns 渲染实例
     */
    render: async (schema: DySchema, container: HTMLElement) => {
      return renderer.render(schema, container);
    },

    /**
     * 加载资源
     * @param assets 资源包
     */
    loadAssets: async (assets: IAssetsPackage) => {
      await renderer.init(assets);
    },

    /**
     * 获取渲染上下文
     */
    getContext: () => renderer.getContext(),

    /**
     * 获取性能监控器
     */
    getPerformanceMonitor: () => renderer.getPerformanceMonitor(),

    /**
     * 可视化性能数据
     * @returns SVG字符串
     */
    visualizePerformance: () => {
      const monitor = renderer.getPerformanceMonitor();
      return monitor ? monitor.visualize() : '';
    }
  };
}

/**
 * 加载内置组件
 * @param renderer 渲染器实例
 */
async function loadBuiltinComponents(renderer: RendererCore): Promise<void> {
  try {
    // 动态导入内置组件
    const View = await import('../../components/View');
    const Text = await import('../../components/Text');
    const Image = await import('../../components/Image');
    const Tabs = await import('../../components/Tabs');
    const Flexbox = await import('../../components/Flexbox');

    // 初始化渲染器
    await renderer.init({
      components: {
        'view': View.default,
        'text': Text.default,
        'image': Image.default,
        'tabs': Tabs.Tabs,
        'flexbox': Flexbox.default,

        // 添加命名空间版本
        'dycomponents::view': View.default,
        'dycomponents::text': Text.default,
        'dycomponents::image': Image.default,
        'dycomponents::tabs': Tabs.Tabs,
        'dycomponents::flexbox': Flexbox.default,
      }
    });
  } catch (error) {
    console.error('Failed to load builtin components', error);
  }
}
