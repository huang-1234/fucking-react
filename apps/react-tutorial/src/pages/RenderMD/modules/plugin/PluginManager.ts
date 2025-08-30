import { type ASTNode } from '../../common/md';
import type { MarkdownPlugin, PluginContext, PluginOptions, PluginType } from './PluginTypes';
import { PluginHook } from './PluginTypes';
/**
 * @description 插件管理器 - 负责插件的注册、初始化和执行
 */
export class PluginManager {
  /**
   * @description 插件映射
   */
  private plugins: Map<string, MarkdownPlugin>;
  private pluginIds: Set<string>;
  /**
   * @description 钩子映射
   */
  private hookMap: Map<PluginHook, Function[]>;
  /**
   * @description 上下文
   */
  private context: PluginContext;

  constructor() {
    this.plugins = new Map();
    this.pluginIds = new Set();
    this.hookMap = new Map();
    this.context = { options: {} };

    // 初始化钩子映射
    Object.values(PluginHook).forEach(hook => {
      this.hookMap.set(hook, []);
    });
  }

  /**
   * @description 注册插件
   * @param plugin 插件对象
   * @param options 插件选项
   * @returns 插件ID
   */
  register(plugin: MarkdownPlugin, options: PluginOptions = {}): string {
    const pluginId = options.id || plugin.name;
    this.pluginIds.add(pluginId);
    // 检查插件是否已注册
    if (this.plugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} already registered. Skipping.`);
      return pluginId;
    }

    // 存储插件
    this.plugins.set(pluginId, plugin);

    // 更新插件上下文
    const pluginContext: PluginContext = {
      ...this.context,
      options: { ...options }
    };

    // 初始化插件
    if (plugin.init) {
      try {
        plugin.init(pluginContext);
      } catch (error) {
        console.error(`Error initializing plugin ${pluginId}:`, error);
      }
    }

    // 注册钩子函数
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
        const hook = hookName as PluginHook;
        if (hookFn) {
          const hooks = this.hookMap.get(hook) || [];

          // 按优先级插入
          const priority = plugin.priority || 0;
          let inserted = false;

          for (let i = 0; i < hooks.length; i++) {
            const existingPriority = this.getPluginPriorityByFunction(hooks[i]);
            if (priority > existingPriority) {
              hooks.splice(i, 0, hookFn);
              inserted = true;
              break;
            }
          }

          if (!inserted) {
            hooks.push(hookFn);
          }

          this.hookMap.set(hook, hooks);
        }
      });
    }

    return pluginId;
  }

  /**
   * @description 卸载插件
   * @param pluginId 插件ID
   * @returns 是否成功卸载
   */
  unregister(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // 调用插件销毁方法
    if (plugin.destroy) {
      try {
        plugin.destroy();
      } catch (error) {
        console.error(`Error destroying plugin ${pluginId}:`, error);
      }
    }

    // 从钩子映射中移除
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
        const hook = hookName as PluginHook;
        if (hookFn) {
          const hooks = this.hookMap.get(hook) || [];
          const index = hooks.indexOf(hookFn);
          if (index !== -1) {
            hooks.splice(index, 1);
          }
          this.hookMap.set(hook, hooks);
        }
      });
    }

    // 从插件映射中移除
    return this.plugins.delete(pluginId);
  }
  unregisterAll(): void {
    this.pluginIds.forEach(pluginId => {
      this.unregister(pluginId);
    });
  }

  /**
   * @description 获取已注册的插件
   * @param pluginId 插件ID
   * @returns 插件对象
   */
  getPlugin(pluginId: string): MarkdownPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * @description 获取所有已注册的插件
   * @returns 插件映射
   */
  getAllPlugins(): Map<string, MarkdownPlugin> {
    return this.plugins;
  }

  /**
   * @description 获取特定类型的插件
   * @param type 插件类型
   * @returns 插件数组
   */
  getPluginsByType(type: PluginType): MarkdownPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.type === type);
  }

  /**
   * @description 执行钩子函数
   * @param hook 钩子类型
   * @param data 输入数据
   * @param context 上下文对象
   * @returns 处理后的数据
   */
  async executeHook<T>(hook: PluginHook, data: T, context: Partial<PluginContext> = {}): Promise<T> {
    const hooks = this.hookMap.get(hook) || [];
    let result = data;

    // 合并上下文
    const hookContext: PluginContext = {
      ...this.context,
      ...context
    };

    // 按顺序执行钩子函数
    for (const hookFn of hooks) {
      try {
        const hookResult = await hookFn(result, hookContext);
        // 只有当钩子函数返回非undefined值时才更新结果
        if (hookResult !== undefined) {
          result = hookResult;
        }
      } catch (error) {
        console.error(`Error executing hook ${hook}:`, error);
      }
    }

    return result;
  }

  /**
   * @description 设置全局上下文
   * @param context 上下文对象
   */
  setContext(context: Partial<PluginContext>): void {
    this.context = {
      ...this.context,
      ...context
    };
  }

  /**
   * @description 清空所有插件
   */
  clear(): void {
    // 调用所有插件的销毁方法
    this.plugins.forEach((plugin, pluginId) => {
      if (plugin.destroy) {
        try {
          plugin.destroy();
        } catch (error) {
          console.error(`Error destroying plugin ${pluginId}:`, error);
        }
      }
    });

    // 清空插件和钩子映射
    this.plugins.clear();
    Object.values(PluginHook).forEach(hook => {
      this.hookMap.set(hook, []);
    });
  }

  /**
   * @description 通过函数引用获取插件优先级
   * @param fn 函数引用
   * @returns 优先级
   */
  private getPluginPriorityByFunction(fn: Function): number {
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks) {
        for (const hookFn of Object.values(plugin.hooks)) {
          if (hookFn === fn) {
            return plugin.priority || 0;
          }
        }
      }
    }
    return 0;
  }
}

export default PluginManager;
