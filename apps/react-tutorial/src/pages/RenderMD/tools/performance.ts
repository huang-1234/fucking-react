/**
 * 性能监控工具
 * 用于测量和记录Markdown渲染过程中的性能数据
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  count: number;
}

interface PerformanceData {
  [key: string]: {
    total: number;
    count: number;
    average: number;
    min: number;
    max: number;
    lastDuration: number;
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private data: PerformanceData = {};
  private enabled: boolean = true;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 启用性能监控
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用性能监控
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * 开始计时
   * @param name 计时器名称
   */
  public start(name: string): void {
    if (!this.enabled) return;

    const now = performance.now();
    this.metrics.set(name, {
      name,
      startTime: now,
      duration: 0,
      count: 1
    });
  }

  /**
   * 结束计时
   * @param name 计时器名称
   * @returns 持续时间(毫秒)
   */
  public end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`[Performance] No metric found with name: ${name}`);
      return null;
    }

    const now = performance.now();
    const duration = now - metric.startTime;

    metric.endTime = now;
    metric.duration = duration;

    // 更新统计数据
    if (!this.data[name]) {
      this.data[name] = {
        total: duration,
        count: 1,
        average: duration,
        min: duration,
        max: duration,
        lastDuration: duration
      };
    } else {
      const data = this.data[name];
      data.total += duration;
      data.count += 1;
      data.average = data.total / data.count;
      data.min = Math.min(data.min, duration);
      data.max = Math.max(data.max, duration);
      data.lastDuration = duration;
    }

    this.metrics.delete(name);
    return duration;
  }

  /**
   * 获取所有性能指标
   * @returns 性能指标数据
   */
  public getMetrics(): PerformanceData {
    return this.data;
  }

  /**
   * 重置所有性能指标
   */
  public reset(): void {
    this.metrics.clear();
    this.data = {};
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();