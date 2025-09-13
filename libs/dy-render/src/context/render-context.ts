import { produce } from 'immer';
import { IDataSourceConfig, IUtilsDeclaration } from '../types';

/**
 * 渲染上下文
 * 负责管理渲染过程中的状态和环境
 */
export class RenderContext {
  // 数据模型
  private dataModel: Record<string, any> = {};

  // 数据源配置
  private dataSources: Map<string, IDataSourceConfig> = new Map();

  // 工具函数
  private utils: Map<string, Function> = new Map();

  // 事件处理器
  private eventHandlers: Map<string, Function> = new Map();

  // 组件实例映射
  private componentInstances: Map<string, any> = new Map();

  /**
   * 构造函数
   * @param initialData 初始数据
   * @param customUtils 自定义工具函数
   */
  constructor(
    initialData: Record<string, any> = {},
    customUtils: Record<string, Function> = {}
  ) {
    this.dataModel = { ...initialData };

    // 注册自定义工具函数
    Object.entries(customUtils).forEach(([name, fn]) => {
      this.registerUtil(name, fn);
    });

    // 注册内置工具函数
    this.registerBuiltinUtils();
  }

  /**
   * 获取数据
   * @param path 数据路径
   * @param defaultValue 默认值
   * @returns 数据值
   */
  getData(path: string, defaultValue?: any): any {
    const value = this.getNestedValue(this.dataModel, path);
    return value === undefined ? defaultValue : value;
  }

  /**
   * 设置数据
   * @param path 数据路径
   * @param value 数据值
   */
  setData(path: string, value: any): void {
    this.dataModel = produce(this.dataModel, (draft) => {
      this.setNestedValue(draft, path, value);
    });
  }

  /**
   * 批量更新数据
   * @param updates 数据更新
   */
  batchUpdate(updates: Record<string, any>): void {
    this.dataModel = produce(this.dataModel, (draft) => {
      Object.entries(updates).forEach(([path, value]) => {
        this.setNestedValue(draft, path, value);
      });
    });
  }

  /**
   * 注册数据源
   * @param config 数据源配置
   */
  registerDataSource(config: IDataSourceConfig): void {
    this.dataSources.set(config.id, config);
  }

  /**
   * 加载数据源
   * @param id 数据源ID
   * @returns 数据源数据
   */
  async loadDataSource(id: string): Promise<any> {
    const dataSource = this.dataSources.get(id);
    if (!dataSource) {
      throw new Error(`Data source not found: ${id}`);
    }

    if (dataSource.type === 'static') {
      return dataSource.config.data;
    } else if (dataSource.type === 'api') {
      return this.fetchApiData(dataSource.config);
    }

    throw new Error(`Unsupported data source type: ${dataSource.type}`);
  }

  /**
   * 注册工具函数
   * @param name 函数名
   * @param fn 函数实现
   */
  registerUtil(name: string, fn: Function): void {
    this.utils.set(name, fn);
  }

  /**
   * 注册工具函数声明
   * @param declaration 函数声明
   */
  registerUtilDeclaration(declaration: IUtilsDeclaration): void {
    try {
      // 使用Function构造函数创建函数
      const fn = new Function(`return ${declaration.body}`)();
      this.registerUtil(declaration.name, fn);
    } catch (error) {
      console.error(`Failed to register util: ${declaration.name}`, error);
    }
  }

  /**
   * 执行工具函数
   * @param name 函数名
   * @param args 函数参数
   * @returns 函数返回值
   */
  executeUtil(name: string, ...args: any[]): any {
    const fn = this.utils.get(name);
    if (!fn) {
      throw new Error(`Util not found: ${name}`);
    }
    return fn(...args);
  }

  /**
   * 注册事件处理器
   * @param eventName 事件名
   * @param handler 处理函数
   */
  registerEventHandler(eventName: string, handler: Function): void {
    this.eventHandlers.set(eventName, handler);
  }

  /**
   * 触发事件
   * @param eventName 事件名
   * @param args 事件参数
   * @returns 处理结果
   */
  triggerEvent(eventName: string, ...args: any[]): any {
    const handler = this.eventHandlers.get(eventName);
    if (!handler) {
      console.warn(`Event handler not found: ${eventName}`);
      return;
    }
    return handler(...args);
  }

  /**
   * 注册组件实例
   * @param id 组件ID
   * @param instance 组件实例
   */
  registerComponentInstance(id: string, instance: any): void {
    this.componentInstances.set(id, instance);
  }

  /**
   * 获取组件实例
   * @param id 组件ID
   * @returns 组件实例
   */
  getComponentInstance(id: string): any {
    return this.componentInstances.get(id);
  }

  /**
   * 清空上下文
   */
  clear(): void {
    this.dataModel = {};
    this.dataSources.clear();
    this.utils.clear();
    this.eventHandlers.clear();
    this.componentInstances.clear();
  }

  /**
   * 注册内置工具函数
   */
  private registerBuiltinUtils(): void {
    // 格式化日期
    this.registerUtil('formatDate', (date: Date, format: string = 'YYYY-MM-DD') => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day);
    });

    // 数组操作
    this.registerUtil('arraySum', (arr: number[]) => arr.reduce((sum, val) => sum + val, 0));
    this.registerUtil('arrayAvg', (arr: number[]) => this.executeUtil('arraySum', arr) / arr.length);

    // 字符串操作
    this.registerUtil('capitalize', (str: string) => str.charAt(0).toUpperCase() + str.slice(1));
  }

  /**
   * 获取嵌套值
   * @param obj 对象
   * @param path 路径
   * @returns 值
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    return keys.reduce((value, key) => {
      return value && value[key] !== undefined ? value[key] : undefined;
    }, obj);
  }

  /**
   * 设置嵌套值
   * @param obj 对象
   * @param path 路径
   * @param value 值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    const target = keys.reduce((acc, key) => {
      if (acc[key] === undefined) {
        acc[key] = {};
      }
      return acc[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * 获取API数据
   * @param config API配置
   * @returns API数据
   */
  private async fetchApiData(config: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: config.headers || {},
        body: config.body ? JSON.stringify(config.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch API data', error);
      throw error;
    }
  }
}
