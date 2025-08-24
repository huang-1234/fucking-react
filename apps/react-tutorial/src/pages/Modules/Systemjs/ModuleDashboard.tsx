import { systemJSLoader } from "./base";

/**
 * 可视化模块加载仪表板
 * 用于监控和可视化SystemJS模块加载过程
 */
export class ModuleDashboard {
  private loader = systemJSLoader;
  private metrics: Array<{
    url: string;
    duration: number;
    size?: string | null;
    timestamp: number;
    moduleType?: string;
  }> = [];

  /**
   * 渲染模块依赖图
   * @param moduleId 模块ID
   */
  renderDependencyGraph(moduleId: string) {
    const deps = this.getModuleDependencies(moduleId);
    // 使用D3.js等库渲染可视化图表
    console.log(`渲染模块依赖图: ${moduleId}`, deps);
  }

  /**
   * 获取模块依赖树
   * @param moduleId 模块ID
   * @returns 依赖模块ID数组
   */
  private getModuleDependencies(moduleId: string): string[] {
    // 实际实现需解析模块代码中的导入声明
    console.log(`分析模块依赖: ${moduleId}`);
    return ['dep1', 'dep2', 'dep3']; // 示例数据
  }

  /**
   * 开始加载监控
   * 监控SystemJS模块加载性能
   */
  startLoadingMonitor() {
    // 获取SystemJS实例
    const system = this.loader.getSystemInstance();

    // 保存原始import方法
    const originalImport = system.import;

    // 劫持加载方法收集指标
    system.import = async (url: string) => {
      const start = performance.now();
      const module = await originalImport.call(system, url);
      const duration = performance.now() - start;

      this.emitLoadingMetric({
        url,
        duration,
        size: await this.getResourceSize(url),
        timestamp: Date.now()
      });

      return module;
    };
  }

  /**
   * 获取资源大小
   * @param url 资源URL
   * @returns 资源大小（字节）
   */
  private async getResourceSize(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.headers.get('content-length');
    } catch (e) {
      console.warn(`无法获取资源大小: ${url}`, e);
      return null;
    }
  }

  /**
   * 发送加载指标
   * @param metric 性能指标
   */
  private emitLoadingMetric(metric: {
    url: string;
    duration: number;
    size?: string | null;
    timestamp: number;
  }) {
    console.log('加载性能指标:', metric);
    this.metrics.push(metric);

    // 触发指标更新事件
    this.dispatchMetricEvent(metric);
  }

  /**
   * 触发指标更新事件
   * @param metric 性能指标
   */
  private dispatchMetricEvent(metric: any) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('systemjs-metric', {
        detail: metric
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 获取所有收集的指标
   * @returns 性能指标数组
   */
  getMetrics() {
    return [...this.metrics];
  }

  /**
   * 清除指标数据
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * 停止加载监控
   */
  stopLoadingMonitor() {
    // 获取SystemJS实例
    const system = this.loader.getSystemInstance();

    // 如果有备份的原始import方法，恢复它
    if (system._originalImport) {
      system.import = system._originalImport;
      delete system._originalImport;
    }
  }
}

// 导出单例实例
export const dashboard = new ModuleDashboard();