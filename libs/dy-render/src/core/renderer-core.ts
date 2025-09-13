import { DySchema } from '../../types/schema';
import { IAssetsPackage, IRenderInstance, IRenderOptions, IRenderNode } from '../types';
import { ComponentMapper } from './component-mapper';
import { SchemaParser } from './schema-parser';
import { StyleApplier } from './style-applier';
import { RenderContext } from '../context/render-context';
import { RenderPerformanceMonitor } from '../utils/performance-monitor';

/**
 * 渲染引擎核心类
 * 负责协调组件映射、Schema解析和样式应用
 */
export class RendererCore {
  private componentMapper: ComponentMapper;
  private schemaParser: SchemaParser;
  private styleApplier: StyleApplier;
  private context: RenderContext;
  private performanceMonitor?: RenderPerformanceMonitor;

  // 渲染实例映射
  private renderInstances: Map<HTMLElement, IRenderInstance> = new Map();

  /**
   * 构造函数
   * @param options 渲染选项
   */
  constructor(private options: IRenderOptions = {}) {
    this.componentMapper = new ComponentMapper();
    this.schemaParser = new SchemaParser();
    this.styleApplier = new StyleApplier();
    this.context = new RenderContext({}, options.customUtils);

    if (options.enablePerformanceMonitor) {
      this.performanceMonitor = new RenderPerformanceMonitor();
    }

    // 注册自定义组件
    if (options.customComponentMap) {
      this.componentMapper.registerComponents(options.customComponentMap);
    }
  }

  /**
   * 初始化渲染引擎
   * @param assets 资源包
   */
  async init(assets: IAssetsPackage): Promise<void> {
    // 加载组件资源
    await this.loadAssets(assets);

    // 设置生命周期钩子
    this.setupLifecycleHooks();
  }

  /**
   * 渲染Schema
   * @param schema Schema协议
   * @param container 容器元素
   * @returns 渲染实例
   */
  async render(schema: DySchema, container: HTMLElement): Promise<IRenderInstance> {
    // 性能监控开始
    const schemaId = schema.__id || 'unknown';
    this.trackRenderStart(schemaId);

    try {
      // 解析Schema为渲染节点
      const renderTree = this.schemaParser.parse(schema);

      // 安全地清空容器
      try {
        // 检查容器是否在文档中
        const isInDocument = document.body.contains(container);

        if (isInDocument) {
          // 逐个移除子节点，而不是使用innerHTML
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }
      } catch (error) {
        console.error('Error cleaning container before render:', error);
      }

      // 渲染节点树
      const rootElement = await this.renderNode(renderTree, container);

      // 创建渲染实例
      const instance: IRenderInstance = {
        container,
        update: async (newSchema: DySchema) => {
          await this.updateRender(newSchema, container);
        },
        destroy: () => {
          this.destroyRender(container);
        }
      };

      // 保存渲染实例
      this.renderInstances.set(container, instance);

      return instance;
    } finally {
      // 性能监控结束
      this.trackRenderEnd(schemaId);
    }
  }

  /**
   * 更新渲染
   * @param schema Schema协议
   * @param container 容器元素
   */
  private async updateRender(schema: DySchema, container: HTMLElement): Promise<void> {
    // 重新渲染
    await this.render(schema, container);
  }

  /**
   * 销毁渲染
   * @param container 容器元素
   */
  private destroyRender(container: HTMLElement): void {
    try {
      // 检查容器是否仍在文档中
      const isInDocument = document.body.contains(container);

      // 只有当容器仍在文档中时才清空它
      if (isInDocument) {
        // 安全地清空容器
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    } catch (error) {
      console.error('Error cleaning container:', error);
    } finally {
      // 移除渲染实例（无论如何都要执行）
      this.renderInstances.delete(container);
    }
  }

  /**
   * 渲染节点
   * @param node 渲染节点
   * @param parent 父容器
   * @returns 渲染后的DOM元素
   */
  private async renderNode(node: IRenderNode, parent: HTMLElement): Promise<HTMLElement> {
    const { componentName, props, children } = node;

    // 获取组件
    const Component = await this.getComponent(componentName);
    if (!Component) {
      throw new Error(`Component ${componentName} not found`);
    }

    // 创建DOM元素
    const element = document.createElement(Component.is || 'div');

    // 应用样式
    if (props.style) {
      this.styleApplier.applyStyles(element, props.style);
    }

    // 应用属性
    this.applyProps(element, props);

    // 渲染子节点
    if (children && Array.isArray(children)) {
      for (const child of children) {
        try {
          const childElement = await this.renderNode(child, element);

          // 安全地添加子元素
          try {
            element.appendChild(childElement);
          } catch (error) {
            console.error('Error appending child element:', error);
          }
        } catch (error) {
          console.error('Error rendering child node:', error);
        }
      }
    } else if (children && typeof children === 'string') {
      // 文本内容
      try {
        element.textContent = children;
      } catch (error) {
        console.error('Error setting text content:', error);
      }
    }

    // 安全地挂载到父容器
    try {
      // 检查父容器是否在文档中
      const isInDocument = document.body.contains(parent);

      if (isInDocument) {
        parent.appendChild(element);
      }
    } catch (error) {
      console.error('Error appending child to parent:', error);
    }

    return element;
  }

  /**
   * 获取组件
   * @param name 组件名称
   * @returns 组件
   */
  private async getComponent(name: string): Promise<any> {
    // 从映射中获取组件
    let component = this.componentMapper.getComponent(name);

    // 如果组件不存在，尝试动态加载
    if (!component) {
      try {
        component = await this.componentMapper.loadComponent(name);
      } catch (error) {
        console.error(`Failed to load component: ${name}`, error);
        return null;
      }
    }

    return component;
  }

  /**
   * 应用属性
   * @param element DOM元素
   * @param props 属性
   */
  private applyProps(element: HTMLElement, props: Record<string, any>): void {
    // 排除特殊属性
    const specialProps = ['style', 'children'];

    Object.entries(props).forEach(([key, value]) => {
      if (specialProps.includes(key)) return;

      if (key === 'className') {
        // 处理类名
        element.className = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        // 处理事件
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else if (typeof value !== 'object' && typeof value !== 'function') {
        // 处理普通属性
        element.setAttribute(key, String(value));
      }
    });
  }

  /**
   * 加载资源
   * @param assets 资源包
   */
  private async loadAssets(assets: IAssetsPackage): Promise<void> {
    // 注册组件
    this.componentMapper.registerComponents(assets.components);

    // 注册工具函数
    if (assets.utils) {
      Object.entries(assets.utils).forEach(([name, fn]) => {
        this.context.registerUtil(name, fn);
      });
    }
  }

  /**
   * 设置生命周期钩子
   */
  private setupLifecycleHooks(): void {
    // 这里可以添加生命周期钩子的实现
    // 例如：组件挂载、更新、卸载等
  }

  /**
   * 跟踪渲染开始
   * @param schemaId Schema ID
   */
  private trackRenderStart(schemaId: string): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.trackRenderStart(schemaId);
    }
  }

  /**
   * 跟踪渲染结束
   * @param schemaId Schema ID
   */
  private trackRenderEnd(schemaId: string): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.trackRenderEnd(schemaId);
    }
  }

  /**
   * 获取渲染上下文
   * @returns 渲染上下文
   */
  getContext(): RenderContext {
    return this.context;
  }

  /**
   * 获取性能监控器
   * @returns 性能监控器
   */
  getPerformanceMonitor(): RenderPerformanceMonitor | undefined {
    return this.performanceMonitor;
  }
}
