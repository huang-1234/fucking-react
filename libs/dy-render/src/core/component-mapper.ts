import { IComponentMeta } from '../types';
import { produce } from 'immer';

/**
 * 组件映射器
 * 负责管理组件的注册、获取和动态加载
 */
export class ComponentMapper {
  private componentMap = new Map<string, any>();
  private loadingComponents = new Map<string, Promise<any>>();
  private componentMetas = new Map<string, IComponentMeta>();

  /**
   * 注册组件
   * @param name 组件名称
   * @param component 组件实现
   * @param meta 组件元数据
   */
  registerComponent(name: string, component: any, meta?: Partial<IComponentMeta>): void {
    this.componentMap.set(name, component);

    if (meta) {
      this.componentMetas.set(name, {
        name,
        component,
        props: meta.props || {},
        ...meta
      });
    }
  }

  /**
   * 批量注册组件
   * @param components 组件映射表
   */
  registerComponents(components: Record<string, any>): void {
    Object.entries(components).forEach(([name, component]) => {
      this.registerComponent(name, component);
    });
  }

  /**
   * 获取组件
   * @param name 组件名称
   * @returns 组件实现
   */
  getComponent(name: string): any {
    return this.componentMap.get(name);
  }

  /**
   * 获取组件元数据
   * @param name 组件名称
   * @returns 组件元数据
   */
  getComponentMeta(name: string): IComponentMeta | undefined {
    return this.componentMetas.get(name);
  }

  /**
   * 动态加载组件
   * @param name 组件名称
   * @returns Promise<组件实现>
   */
  async loadComponent(name: string): Promise<any> {
    // 如果组件已加载，直接返回
    if (this.componentMap.has(name)) {
      return this.componentMap.get(name);
    }

    // 防止重复加载
    if (this.loadingComponents.has(name)) {
      return this.loadingComponents.get(name);
    }

    const loadPromise = this.loadComponentInternal(name);
    this.loadingComponents.set(name, loadPromise);

    try {
      const component = await loadPromise;
      this.componentMap.set(name, component);
      return component;
    } finally {
      this.loadingComponents.delete(name);
    }
  }

  /**
   * 内部组件加载实现
   * @param name 组件名称
   * @returns Promise<组件实现>
   */
  private async loadComponentInternal(name: string): Promise<any> {
    // 解析组件名称格式，例如 "dycomponents::view" -> "View"
    const componentName = this.parseComponentName(name);

    try {
      // 动态导入组件
      const module = await import(`../../components/${componentName}`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load component: ${name}`, error);
      throw new Error(`Component ${name} not found`);
    }
  }

  /**
   * 解析组件名称
   * @param fullName 完整组件名称（命名空间::组件名）
   * @returns 组件名称
   */
  private parseComponentName(fullName: string): string {
    // 处理 "namespace::componentName" 格式
    if (fullName.includes('::')) {
      const [namespace, componentName] = fullName.split('::');
      // 首字母大写
      return componentName.charAt(0).toUpperCase() + componentName.slice(1);
    }
    return fullName;
  }

  /**
   * 清空组件映射
   */
  clear(): void {
    this.componentMap.clear();
    this.loadingComponents.clear();
    this.componentMetas.clear();
  }
}
