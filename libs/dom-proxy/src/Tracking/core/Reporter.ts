import type { ITrackerConfig, ITrackingEvent, IQueueItem } from '../types/tracking';

/**
 * 数据上报管理器
 * 支持批量上报、失败重试和多种上报方式
 * @method addToQueue 添加到上报队列
 * @method processQueue 处理队列
 * @method sendBatch 发送批量数据
 * @method sendWithFetch 使用fetch发送数据
 * @method setUserId 设置用户ID
 * @method flush 立即发送队列中的所有事件
 * @method destroy 销毁清理
 * @method handleBeforeUnload 页面卸载前处理
 * @method generateSessionId 生成会话ID
 * @method generateEventId 生成事件ID
 * @method initBatchProcessing 初始化批量处理
 * @method initErrorTracking 初始化错误追踪
 * @method handleExposureEvent 处理曝光事件
 * @method handleClickEvent 处理点击事件
 * @method handleLongPressEvent 处理长按事件
 * @method handleErrorEvent 处理错误事件
 */
export class Reporter {
  /** 上报队列 */
  private queue: IQueueItem[] = [];

  /** 是否正在发送 */
  private isSending: boolean = false;

  /** 配置项 */
  private config: ITrackerConfig;

  /** 定时器ID */
  private timer: number | null = null;

  /** 用户ID */
  private userId: string | null = null;

  /** 会话ID */
  private sessionId: string;

  /**
   * 构造函数
   * @param config 配置项
   */
  constructor(config: ITrackerConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initBatchProcessing();
  }

  /**
   * 初始化批量处理
   */
  private initBatchProcessing(): void {
    // 定时处理队列
    this.timer = window.setInterval(() => {
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, this.config.batchDelay || 5000);

    // 页面卸载前发送剩余数据
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    if (this.config.debug) {
      console.log('[Reporter] 初始化成功, 批处理间隔:', this.config.batchDelay || 5000);
    }
  }

  /**
   * 生成会话ID
   * @returns 会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 添加到上报队列
   * @param event 事件数据
   */
  public addToQueue(event: ITrackingEvent): void {
    // 添加公共数据
    const enrichedEvent: ITrackingEvent = {
      ...event,
      eventId: event.eventId || this.generateEventId(),
      timestamp: event.timestamp || Date.now(),
      pageUrl: event.pageUrl || window.location.href,
      pageTitle: event.pageTitle || document.title,
      referrer: event.referrer || document.referrer,
    };

    // 添加用户ID和会话ID
    if (this.userId) {
      enrichedEvent.userId = this.userId;
    }

    enrichedEvent.sessionId = this.sessionId;

    // 添加到队列
    this.queue.push({
      event: enrichedEvent,
      attempts: 0,
      timestamp: Date.now()
    });

    if (this.config.debug) {
      console.log('[Reporter] 添加事件到队列:', enrichedEvent);
    }

    // 达到批量大小时立即处理
    if (this.queue.length >= (this.config.batchSize || 10)) {
      this.processQueue();
    }
  }

  /**
   * 生成事件ID
   * @returns 事件ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (this.isSending || this.queue.length === 0) return;

    this.isSending = true;
    const batchSize = this.config.batchSize || 10;
    const itemsToSend = this.queue.splice(0, batchSize);

    try {
      await this.sendBatch(itemsToSend.map(item => item.event));

      if (this.config.debug) {
        console.log(`[Reporter] 成功发送 ${itemsToSend.length} 个事件`);
      }
    } catch (error) {
      console.error('[Reporter] 发送批量数据失败:', error);

      // 发送失败，重新放回队列并增加尝试次数
      itemsToSend.forEach(item => {
        item.attempts = (item.attempts || 0) + 1;

        // 如果尝试次数过多，则丢弃
        if (item.attempts < 3) {
          this.queue.unshift(item);
        } else if (this.config.debug) {
          console.warn('[Reporter] 丢弃重试失败的事件:', item.event);
        }
      });
    } finally {
      this.isSending = false;
    }
  }

  /**
   * 发送批量数据
   * @param events 事件数据数组
   */
  private async sendBatch(events: ITrackingEvent[]): Promise<void> {
    if (!this.config.serverUrl) {
      console.error('[Reporter] 未配置上报服务器地址');
      return;
    }

    const batchData = {
      appId: this.config.appId,
      version: this.config.version || '1.0.0',
      sessionId: this.sessionId,
      userId: this.userId,
      events: events,
      timestamp: Date.now(),
      sdkVersion: '1.0.0'
    };

    // 使用sendBeacon或fetch
    if (this.config.useBeacon !== false && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(batchData)], { type: 'application/json' });
        const success = navigator.sendBeacon(this.config.serverUrl, blob);

        if (!success) {
          throw new Error('sendBeacon failed');
        }
      } catch (error) {
        // 如果sendBeacon失败，回退到fetch
        await this.sendWithFetch(batchData);
      }
    } else {
      await this.sendWithFetch(batchData);
    }
  }

  /**
   * 使用fetch发送数据
   * @param batchData 批量数据
   */
  private async sendWithFetch(batchData: any): Promise<void> {
    const response = await fetch(this.config.serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
      // 不需要凭证，避免CORS问题
      credentials: 'omit',
      // 超时控制
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * 设置用户ID
   * @param userId 用户ID
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;

    if (this.config.debug) {
      console.log('[Reporter] 设置用户ID:', userId);
    }
  }

  /**
   * 立即发送队列中的所有事件
   */
  public flush(): Promise<void> {
    return this.processQueue();
  }

  /**
   * 页面卸载前处理
   */
  private handleBeforeUnload(): void {
    // 页面卸载前尝试发送剩余数据
    if (this.queue.length > 0 && navigator.sendBeacon && this.config.serverUrl) {
      const batchData = {
        appId: this.config.appId,
        version: this.config.version || '1.0.0',
        sessionId: this.sessionId,
        userId: this.userId,
        events: this.queue.map(item => item.event),
        timestamp: Date.now(),
        sdkVersion: '1.0.0',
        isUnload: true
      };

      const blob = new Blob([JSON.stringify(batchData)], { type: 'application/json' });
      navigator.sendBeacon(this.config.serverUrl, blob);

      if (this.config.debug) {
        console.log(`[Reporter] 页面卸载前发送 ${this.queue.length} 个事件`);
      }

      this.queue = [];
    }
  }

  /**
   * 销毁清理
   */
  public async destroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // 发送剩余数据
    if (this.queue.length > 0) {
      await this.flush().catch(console.error);
    }

    if (this.config.debug) {
      console.log('[Reporter] 已销毁');
    }
  }
}
