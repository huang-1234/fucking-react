import PluginManager from './PluginManager';
import { type MarkdownPlugin, type PluginContext, type PluginOptions } from './PluginTypes';
import { PluginHook, PluginType } from './PluginTypes';
import { TablePlugin, TaskListPlugin, TableOfContentsPlugin, FootnotePlugin } from './BuiltinPlugins';
import { SyntaxHighlighter } from "../extensions/SyntaxHighlighter";
import { MathRenderer } from "../extensions/MathRenderer";
import { DiagramRenderer } from "../extensions/DiagramRenderer";
/**
 * 插件系统模块
 * 负责管理插件的注册、初始化和执行
 */
export class PluginSystem {
  private manager: PluginManager;

  constructor() {
    this.manager = new PluginManager();
  }

  /**
   * 注册插件
   * @param plugin 插件对象
   * @param options 插件选项
   * @returns 插件ID
   */
  registerPlugin(plugin: MarkdownPlugin, options: PluginOptions = {}): string {
    return this.manager.register(plugin, options);
  }

  /**
   * 注册多个插件
   * @param plugins 插件对象数组
   * @param options 插件选项
   * @returns 插件ID数组
   */
  registerPlugins(plugins: MarkdownPlugin[], options: PluginOptions = {}): string[] {
    return plugins.map(plugin => this.registerPlugin(plugin, options));
  }

  /**
   * 卸载插件
   * @param pluginId 插件ID
   * @returns 是否成功卸载
   */
  unregisterPlugin(pluginId: string): boolean {
    return this.manager.unregister(pluginId);
  }

  /**
   * 获取已注册的插件
   * @param pluginId 插件ID
   * @returns 插件对象
   */
  getPlugin(pluginId: string): MarkdownPlugin | undefined {
    return this.manager.getPlugin(pluginId);
  }

  /**
   * 获取所有已注册的插件
   * @returns 插件映射
   */
  getAllPlugins(): Map<string, MarkdownPlugin> {
    return this.manager.getAllPlugins();
  }

  /**
   * 获取特定类型的插件
   * @param type 插件类型
   * @returns 插件数组
   */
  getPluginsByType(type: PluginType): MarkdownPlugin[] {
    return this.manager.getPluginsByType(type);
  }

  /**
   * 执行钩子函数
   * @param hook 钩子类型
   * @param data 输入数据
   * @param context 上下文对象
   * @returns 处理后的数据
   */
  async executeHook<T>(hook: PluginHook, data: T, context: Partial<PluginContext> = {}): Promise<T> {
    return this.manager.executeHook(hook, data, context);
  }

  /**
   * 设置全局上下文
   * @param context 上下文对象
   */
  setContext(context: Partial<PluginContext>): void {
    this.manager.setContext(context);
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.manager.clear();
  }

  /**
   * 注册所有内置插件
   * @param options 插件选项
   */
  registerBuiltinPlugins(options: PluginOptions = {}, supportClass = true): void {
    [TablePlugin, TaskListPlugin].forEach(plugin => {
      this.manager.register(plugin, options);
    });
    if (supportClass) {
      [SyntaxHighlighter, MathRenderer, DiagramRenderer].forEach(Plugin => {
        this.manager.register(new Plugin().createPlugin(), options);
      });
    }
  }

  /**
   * 获取插件管理器实例
   * @returns 插件管理器
   */
  getPluginManager(): PluginManager {
    return this.manager;
  }
}

export { PluginManager, PluginHook, PluginType };
export type { MarkdownPlugin, PluginContext, PluginOptions };
export { TablePlugin, TaskListPlugin, TableOfContentsPlugin, FootnotePlugin };
export default PluginSystem;