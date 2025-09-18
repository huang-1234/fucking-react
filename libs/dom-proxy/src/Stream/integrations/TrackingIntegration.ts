/**
 * 与Tracking模块的集成
 * 为数据传输添加埋点功能
 */

import type { ProgressInfo, TransferStats } from '../types/transfer';
import type { StreamEvent } from '../types';

/**
 * 数据传输埋点事件类型
 */
export interface DataTransferTrackingEvent {
  /** 事件类型 */
  type: 'transfer_start' | 'transfer_progress' | 'transfer_complete' | 'transfer_error';
  /** 传输ID */
  transferId: string;
  /** 传输方法 */
  method: 'paginated' | 'stream' | 'compressed' | 'resumable';
  /** URL */
  url: string;
  /** 数据大小 */
  dataSize: number;
  /** 进度信息 */
  progress?: ProgressInfo;
  /** 统计信息 */
  stats?: TransferStats;
  /** 错误信息 */
  error?: Error;
  /** 时间戳 */
  timestamp: number;
  /** 用户代理 */
  userAgent?: string;
  /** 会话ID */
  sessionId?: string;
}

/**
 * 数据传输跟踪器
 */
export class DataTransferTracker {
  private sessionId: string;
  private trackingEnabled: boolean;
  private eventQueue: DataTransferTrackingEvent[] = [];
  private flushInterval: number = 5000; // 5秒
  private maxQueueSize: number = 100;
  private flushTimer?: NodeJS.Timeout;

  constructor(options: {
    sessionId?: string;
    trackingEnabled?: boolean;
    flushInterval?: number;
    maxQueueSize?: number;
  } = {}) {
    this.sessionId = options.sessionId || this.generateSessionId();
    this.trackingEnabled = options.trackingEnabled ?? true;
    this.flushInterval = options.flushInterval || 5000;
    this.maxQueueSize = options.maxQueueSize || 100;

    if (this.trackingEnabled) {
      this.startFlushTimer();
    }
  }

  /**
   * 跟踪传输开始
   */
  trackTransferStart(
    transferId: string,
    method: DataTransferTrackingEvent['method'],
    url: string,
    dataSize: number
  ): void {
    if (!this.trackingEnabled) return;

    this.addEvent({
      type: 'transfer_start',
      transferId,
      method,
      url,
      dataSize,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    });
  }

  /**
   * 跟踪传输进度
   */
  trackTransferProgress(
    transferId: string,
    method: DataTransferTrackingEvent['method'],
    url: string,
    dataSize: number,
    progress: ProgressInfo
  ): void {
    if (!this.trackingEnabled) return;

    this.addEvent({
      type: 'transfer_progress',
      transferId,
      method,
      url,
      dataSize,
      progress,
      timestamp: Date.now(),
      sessionId: this.sessionId
    });
  }

  /**
   * 跟踪传输完成
   */
  trackTransferComplete(
    transferId: string,
    method: DataTransferTrackingEvent['method'],
    url: string,
    dataSize: number,
    stats: TransferStats
  ): void {
    if (!this.trackingEnabled) return;

    this.addEvent({
      type: 'transfer_complete',
      transferId,
      method,
      url,
      dataSize,
      stats,
      timestamp: Date.now(),
      sessionId: this.sessionId
    });
  }

  /**
   * 跟踪传输错误
   */
  trackTransferError(
    transferId: string,
    method: DataTransferTrackingEvent['method'],
    url: string,
    dataSize: number,
    error: Error,
    stats?: TransferStats
  ): void {
    if (!this.trackingEnabled) return;

    this.addEvent({
      type: 'transfer_error',
      transferId,
      method,
      url,
      dataSize,
      error,
      stats,
      timestamp: Date.now(),
      sessionId: this.sessionId
    });
  }

  /**
   * 添加事件到队列
   */
  private addEvent(event: DataTransferTrackingEvent): void {
    this.eventQueue.push(event);

    // 如果队列满了，立即刷新
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * 刷新事件队列
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      console.error('[DataTransferTracker] Failed to send tracking events:', error);
      
      // 如果发送失败，将事件重新加入队列（但限制重试次数）
      const retriableEvents = events.filter(event => 
        !event.hasOwnProperty('retryCount') || (event as any).retryCount < 3
      );
      
      retriableEvents.forEach(event => {
        (event as any).retryCount = ((event as any).retryCount || 0) + 1;
      });
      
      this.eventQueue.unshift(...retriableEvents);
    }
  }

  /**
   * 发送事件到服务器
   */
  private async sendEvents(events: DataTransferTrackingEvent[]): Promise<void> {
    // 这里可以集成现有的Tracking模块
    // 或者发送到专门的数据传输分析服务

    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      events: events.map(event => ({
        ...event,
        error: event.error ? {
          name: event.error.name,
          message: event.error.message,
          stack: event.error.stack
        } : undefined
      }))
    };

    // 使用fetch发送数据
    await fetch('/api/tracking/data-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * 启动定时刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 停止定时刷新
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `dt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 启用跟踪
   */
  enable(): void {
    this.trackingEnabled = true;
    this.startFlushTimer();
  }

  /**
   * 禁用跟踪
   */
  disable(): void {
    this.trackingEnabled = false;
    this.stopFlushTimer();
  }

  /**
   * 销毁跟踪器
   */
  destroy(): void {
    this.disable();
    this.flush(); // 最后一次刷新
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    sessionId: string;
    queueSize: number;
    trackingEnabled: boolean;
    flushInterval: number;
  } {
    return {
      sessionId: this.sessionId,
      queueSize: this.eventQueue.length,
      trackingEnabled: this.trackingEnabled,
      flushInterval: this.flushInterval
    };
  }
}

/**
 * 全局数据传输跟踪器实例
 */
let globalTracker: DataTransferTracker | null = null;

/**
 * 获取全局跟踪器
 */
export function getGlobalDataTransferTracker(): DataTransferTracker {
  if (!globalTracker) {
    globalTracker = new DataTransferTracker();
  }
  return globalTracker;
}

/**
 * 设置全局跟踪器
 */
export function setGlobalDataTransferTracker(tracker: DataTransferTracker): void {
  if (globalTracker) {
    globalTracker.destroy();
  }
  globalTracker = tracker;
}

/**
 * 创建传输ID
 */
export function createTransferId(): string {
  return `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 数据传输性能分析
 */
export class DataTransferAnalytics {
  private metrics: Map<string, TransferStats[]> = new Map();

  /**
   * 记录传输指标
   */
  recordTransfer(method: string, stats: TransferStats): void {
    if (!this.metrics.has(method)) {
      this.metrics.set(method, []);
    }
    this.metrics.get(method)!.push(stats);
  }

  /**
   * 获取方法的平均性能
   */
  getAveragePerformance(method: string): {
    averageDuration: number;
    averageSpeed: number;
    totalTransfers: number;
    successRate: number;
  } | null {
    const transfers = this.metrics.get(method);
    if (!transfers || transfers.length === 0) {
      return null;
    }

    const totalDuration = transfers.reduce((sum, stats) => sum + stats.duration, 0);
    const totalSpeed = transfers.reduce((sum, stats) => sum + stats.averageSpeed, 0);
    const successfulTransfers = transfers.filter(stats => stats.retryCount === 0).length;

    return {
      averageDuration: totalDuration / transfers.length,
      averageSpeed: totalSpeed / transfers.length,
      totalTransfers: transfers.length,
      successRate: successfulTransfers / transfers.length
    };
  }

  /**
   * 获取所有方法的性能报告
   */
  getPerformanceReport(): Record<string, ReturnType<DataTransferAnalytics['getAveragePerformance']>> {
    const report: Record<string, any> = {};
    
    for (const method of this.metrics.keys()) {
      report[method] = this.getAveragePerformance(method);
    }
    
    return report;
  }

  /**
   * 清理旧数据
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    
    for (const [method, transfers] of this.metrics) {
      const recentTransfers = transfers.filter(stats => stats.startTime > cutoff);
      this.metrics.set(method, recentTransfers);
    }
  }
}