import type {
  ITrackerConfig,
  ITrackingEvent,
  IExposureEvent,
  IClickEvent,
  ILongPressEvent,
  IExposureOptions,
  IProxyOptions
} from '../types/tracking';
import { ExposureTracker } from './ExposureTracker';
import { ClickTracker } from './ClickTracker';
import { Reporter } from './Reporter';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Partial<ITrackerConfig> = {
  batchSize: 10,
  batchDelay: 5000,
  useBeacon: true,
  samplingRate: 1,
  enableErrorTracking: false,
  longPressThreshold: 500,
  autoTrackClicks: true,
  autoTrackExposures: false,
  exposureThreshold: 0.5,
  debug: false
};

/**
 * 埋点追踪器
 * 整合所有功能，提供统一的埋点 SDK
 * @method initErrorTracking 初始化错误追踪
 * @method track 手动跟踪事件
 * @method trackExposure 跟踪曝光事件
 * @method trackExposures 批量跟踪曝光事件
 * @method handleExposureEvent 处理曝光事件
 * @method handleClickEvent 处理点击事件
 * @method handleLongPressEvent 处理长按事件
 * @method trackError 跟踪错误事件
 * @method createProxy 创建代理对象
 * @method setUserId 设置用户ID
 * @method getExposureTracker 获取曝光追踪器实例
 * @method getClickTracker 获取点击追踪器实例
 * @method getReporter 获取上报管理器实例
 * @method flush 立即发送队列中的所有事件
 * @method destroy 销毁清理
 */
export class Tracker {
  /** 配置项 */
  private config: ITrackerConfig;

  /** 曝光追踪器 */
  private exposureTracker: ExposureTracker;

  /** 点击追踪器 */
  private clickTracker: ClickTracker;

  /** 上报管理器 */
  private reporter: Reporter;

  /** 是否已初始化 */
  private isInitialized: boolean = false;

  /**
   * 构造函数
   * @param config 配置项
   */
  constructor(config: ITrackerConfig) {
    // 合并默认配置
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };

    // 初始化上报管理器
    this.reporter = new Reporter(this.config);

    // 初始化曝光追踪器
    this.exposureTracker = new ExposureTracker(
      this.config,
      this.handleExposureEvent.bind(this)
    );

    // 初始化点击追踪器
    this.clickTracker = new ClickTracker(
      this.config,
      this.handleClickEvent.bind(this),
      this.handleLongPressEvent.bind(this)
    );

    this.isInitialized = true;

    // 初始化错误追踪
    if (this.config.enableErrorTracking) {
      this.initErrorTracking();
    }

    if (this.config.debug) {
      console.log('[Tracker] 初始化成功:', this.config);
    }
  }

  /**
   * 初始化错误追踪
   */
  private initErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackError({
        eventCategory: 'error',
        eventAction: 'javascript_error',
        eventLabel: event.message,
        error: {
          message: event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        eventCategory: 'error',
        eventAction: 'promise_rejection',
        eventLabel: String(event.reason),
        error: {
          message: String(event.reason),
          stack: event.reason?.stack
        }
      });
    });
  }

  /**
   * 手动跟踪事件
   * @param event 事件数据
   */
  public track(event: Partial<ITrackingEvent>): void {
    if (!this.isInitialized) {
      console.error('[Tracker] 尚未初始化');
      return;
    }

    const fullEvent: ITrackingEvent = {
      eventType: event.eventType || 'custom',
      eventCategory: event.eventCategory || 'custom',
      eventAction: event.eventAction || 'custom',
      timestamp: Date.now(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      ...event
    } as ITrackingEvent;

    this.reporter.addToQueue(fullEvent);
  }

  /**
   * 跟踪曝光事件
   * @param options 曝光配置
   */
  public trackExposure(options: IExposureOptions): void {
    if (!this.isInitialized) {
      console.error('[Tracker] 尚未初始化');
      return;
    }

    this.exposureTracker.addElement(options);
  }

  /**
   * 批量跟踪曝光事件
   * @param selector CSS选择器
   * @param eventData 事件数据
   * @param options 配置项
   */
  public trackExposures(
    selector: string,
    eventData: Partial<IExposureEvent>,
    options: { once?: boolean } = {}
  ): void {
    if (!this.isInitialized) {
      console.error('[Tracker] 尚未初始化');
      return;
    }

    this.exposureTracker.addElements(selector, eventData, options);
  }

  /**
   * 处理曝光事件
   * @param event 曝光事件
   */
  private handleExposureEvent(event: IExposureEvent): void {
    this.reporter.addToQueue(event);
  }

  /**
   * 处理点击事件
   * @param event 点击事件
   */
  private handleClickEvent(event: IClickEvent): void {
    this.reporter.addToQueue(event);
  }

  /**
   * 处理长按事件
   * @param event 长按事件
   */
  private handleLongPressEvent(event: ILongPressEvent): void {
    this.reporter.addToQueue(event);
  }

  /**
   * 跟踪错误事件
   * @param data 错误数据
   */
  public trackError(data: Record<string, any>): void {
    this.track({
      eventType: 'error',
      eventCategory: data.eventCategory || 'error',
      eventAction: data.eventAction || 'error',
      eventLabel: data.eventLabel || 'Unknown Error',
      ...data
    });
  }

  /**
   * 创建代理对象
   * @param target 目标对象
   * @param options 代理选项
   * @returns 代理对象
   */
  public createProxy<T extends object>(target: T, options: IProxyOptions = {}): T {
    if (!this.isInitialized) {
      console.error('[Tracker] 尚未初始化');
      return target;
    }

    const self = this;

    return new Proxy(target, {
      get(obj, prop, receiver: unknown) {
        const value = Reflect.get(obj, prop, receiver);

        // 如果属性值是函数
        if (typeof value === 'function') {
          // 检查是否为事件处理函数
          const propStr = String(prop);

          if (options.interceptClick &&
              (propStr === 'onClick' || propStr === 'click' || propStr.match(/click/i))) {
            // 代理点击事件
            return self.clickTracker.createEventProxy(value, 'click', {
              ...options.eventData,
              eventType: 'click',
              eventAction: 'click'
            });
          }

          if (options.interceptLongPress &&
              (propStr === 'onLongPress' || propStr.match(/longpress/i))) {
            // 代理长按事件
            return self.clickTracker.createEventProxy(value, 'longpress', {
              ...options.eventData,
              eventType: 'longpress',
              eventAction: 'longpress'
            });
          }
        }

        return value;
      }
    });
  }

  /**
   * 设置用户ID
   * @param userId 用户ID
   */
  public setUserId(userId: string | null): void {
    this.reporter.setUserId(userId);
  }

  /**
   * 获取曝光追踪器实例
   * @returns 曝光追踪器
   */
  public getExposureTracker(): ExposureTracker {
    return this.exposureTracker;
  }

  /**
   * 获取点击追踪器实例
   * @returns 点击追踪器
   */
  public getClickTracker(): ClickTracker {
    return this.clickTracker;
  }

  /**
   * 获取上报管理器实例
   * @returns 上报管理器
   */
  public getReporter(): Reporter {
    return this.reporter;
  }

  /**
   * 立即发送队列中的所有事件
   */
  public flush(): Promise<void> {
    return this.reporter.flush();
  }

  /**
   * 销毁清理
   */
  public async destroy(): Promise<void> {
    if (!this.isInitialized) return;

    await this.reporter.destroy();
    this.exposureTracker.destroy();
    this.clickTracker.destroy();

    this.isInitialized = false;

    if (this.config.debug) {
      console.log('[Tracker] 已销毁');
    }
  }
}

/**
 * 全局单例
 */
let globalTracker: Tracker | null = null;

/**
 * 初始化追踪器
 * @param config 配置项
 * @returns 追踪器实例
 */
export const initTracker = (config: ITrackerConfig): Tracker => {
  if (!globalTracker) {
    globalTracker = new Tracker(config);
  } else {
    console.warn('[Tracker] 已经初始化，请勿重复初始化');
  }
  return globalTracker;
};

/**
 * 获取追踪器实例
 * @returns 追踪器实例
 */
export const getTracker = (): Tracker => {
  if (!globalTracker) {
    throw new Error('[Tracker] 尚未初始化，请先调用 initTracker');
  }
  return globalTracker;
};
