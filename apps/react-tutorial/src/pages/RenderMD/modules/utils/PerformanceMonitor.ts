/**
 * 性能监控器配置选项
 */
export interface PerformanceMonitorOptions {
  /** @description 是否启用性能监控 */
  enabled?: boolean;
  /** @description 是否输出到控制台 */
  logToConsole?: boolean;
  /** @description 采样率 */
  sampleRate?: number;
  /** @description 最大记录数 */
  maxEntries?: number;
}

/**
 * 性能记录条目
 */
export interface PerformanceEntry {
  /** @description 名称 */
  name: string;
  /** @description 开始时间 */
  startTime: number;
  endTime: number;
  /** @description 持续时间 */
  duration: number;
  /** @description 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 性能统计信息
 */
export interface PerformanceStats {
  /** @description 数量 */
  count: number;
  /** @description 总时间 */
  total: number;
  /** @description 平均时间 */
  average: number;
  /** @description 最小时间 */
  min: number;
  /** @description 最大时间 */
  max: number;
  /** @description 中位数 */
  median: number;
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** @description 时间戳 */
  timestamp: number;
  /** @description 整体统计信息 */
  overallStats: PerformanceStats;
  /** @description 操作统计信息 */
  operationStats: Record<string, PerformanceStats>;
}

/**
 * 性能监控器 - 用于监控Markdown渲染性能
 */
export class PerformanceMonitor {
  /** @description 配置选项 */
  private options: Required<PerformanceMonitorOptions>;
  /** @description 记录 */
  private entries: PerformanceEntry[] = [];
  /** @description 活动标记 */
  private activeMarks: Map<string, number> = new Map();
  /** @description 实例 */
  private static instance: PerformanceMonitor;

  constructor(options?: PerformanceMonitorOptions) {
    this.options = {
      enabled: options?.enabled !== false,
      logToConsole: options?.logToConsole || false,
      sampleRate: options?.sampleRate || 1.0, // 1.0 表示100%采样
      maxEntries: options?.maxEntries || 100
    };
  }

  /**
   * 获取性能监控器实例（单例模式）
   * @param options 配置选项
   * @returns 性能监控器实例
   */
  public static getInstance(options?: PerformanceMonitorOptions): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(options);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * @description 重置性能监控器配置
   * @param options 新的配置选项
   */
  public configure(options: PerformanceMonitorOptions): void {
    this.options = {
      ...this.options,
      ...options
    };
  }

  /**
   * @description 启用性能监控
   */
  public enable(): void {
    this.options.enabled = true;
  }

  /**
   * @description 禁用性能监控
   */
  public disable(): void {
    this.options.enabled = false;
  }

  /**
   * @description 清除所有性能记录
   */
  public clear(): void {
    this.entries = [];
    this.activeMarks.clear();
  }

  /**
   * @description 标记开始时间点
   * @param name 标记名称
   * @param metadata 相关元数据
   */
  public mark(name: string, metadata?: Record<string, any>): void {
    if (!this.options.enabled || Math.random() > this.options.sampleRate) {
      return;
    }

    const now = performance.now();
    this.activeMarks.set(name, now);

    if (this.options.logToConsole) {
      console.time(`[MD-Perf] ${name}`);
    }
  }

  /**
   * @description 测量从标记到当前的时间
   * @param name 标记名称
   * @param metadata 相关元数据
   * @returns 持续时间（毫秒）
   */
  public measure(name: string, metadata?: Record<string, any>): number | null {
    if (!this.options.enabled) {
      return null;
    }

    const startTime = this.activeMarks.get(name);
    if (startTime === undefined) {
      console.warn(`[MD-Perf] No mark found with name: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 记录性能条目
    this.addEntry({
      name,
      startTime,
      endTime,
      duration,
      metadata
    });

    // 移除活动标记
    this.activeMarks.delete(name);

    if (this.options.logToConsole) {
      console.timeEnd(`[MD-Perf] ${name}`);
      console.log(`[MD-Perf] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * @description 包装函数并测量其执行时间
   * @param name 测量名称
   * @param fn 要测量的函数
   * @param metadata 相关元数据
   * @returns 函数执行结果
   */
  public async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.mark(name, metadata);
    try {
      const result = await fn();
      this.measure(name, metadata);
      return result;
    } catch (error) {
      this.measure(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * @description 包装同步函数并测量其执行时间
   * @param name 测量名称
   * @param fn 要测量的函数
   * @param metadata 相关元数据
   * @returns 函数执行结果
   */
  public measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.mark(name, metadata);
    try {
      const result = fn();
      this.measure(name, metadata);
      return result;
    } catch (error) {
      this.measure(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * @description 添加性能记录条目
   * @param entry 性能记录条目
   */
  private addEntry(entry: PerformanceEntry): void {
    this.entries.push(entry);

    // @description 限制条目数量
    if (this.entries.length > this.options.maxEntries) {
      this.entries.shift();
    }
  }

  /**
   * @description 获取所有性能记录
   * @returns 性能记录数组
   */
  public getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  /**
   * @description 获取特定名称的性能记录
   * @param name 记录名称
   * @returns 性能记录数组
   */
  public getEntriesByName(name: string): PerformanceEntry[] {
    return this.entries.filter(entry => entry.name === name);
  }

  /**
   * @description 计算性能统计信息
   * @param name 可选的记录名称过滤
   * @returns 统计信息
   */
  public getStats(name?: string): PerformanceStats {
    const entries = name ? this.getEntriesByName(name) : this.entries;

    if (entries.length === 0) {
      return {
        count: 0,
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0
      };
    }

    const durations = entries.map(entry => entry.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, duration) => sum + duration, 0);

    return {
      count: entries.length,
      total,
      average: total / entries.length,
      min: durations[0],
      max: durations[durations.length - 1],
      median: durations[Math.floor(durations.length / 2)]
    };
  }

  /**
   * @description 生成性能报告
   * @returns 性能报告对象
   */
  public generateReport(): PerformanceReport {
    // @description 获取所有操作名称
    const operationNames = Array.from(new Set(this.entries.map(entry => entry.name)));

    // @description 为每个操作计算统计信息
    const operationStats: Record<string, PerformanceStats> = {};
    operationNames.forEach(name => {
      operationStats[name] = this.getStats(name);
    });

    return {
      timestamp: Date.now(),
      overallStats: this.getStats(),
      operationStats
    };
  }
}

export default PerformanceMonitor;