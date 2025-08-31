import MarkdownUtils from './MarkdownUtils';
import PerformanceMonitor from './PerformanceMonitor';
import StateManager from './StateManager';

/**
 * 工具模块 - 提供各种辅助工具
 */
export class UtilityModule {
  private static instance: UtilityModule;
  private markdownUtils: MarkdownUtils;
  private performanceMonitor: PerformanceMonitor;

  private constructor() {
    this.markdownUtils = new MarkdownUtils();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  /**
   * 获取工具模块实例（单例模式）
   * @returns 工具模块实例
   */
  public static getInstance(): UtilityModule {
    if (!UtilityModule.instance) {
      UtilityModule.instance = new UtilityModule();
    }
    return UtilityModule.instance;
  }

  /**
   * 创建状态管理器
   * @param initialState 初始状态
   * @param options 配置选项
   * @returns 状态管理器实例
   */
  public createStateManager<T extends object>(initialState: T, options?: any): StateManager<T> {
    return new StateManager<T>(initialState, options);
  }

  /**
   * 获取性能监控器
   * @returns 性能监控器实例
   */
  public getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  /**
   * 获取Markdown工具类
   * @returns Markdown工具类
   */
  public getMarkdownUtils(): MarkdownUtils {
    return this.markdownUtils;
  }
}

// 导出工具类
export { MarkdownUtils, PerformanceMonitor, StateManager };
export default UtilityModule;
