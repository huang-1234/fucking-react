/**
 * 埋点事件基础接口
 */
export interface ITrackingEvent {
  /** 唯一标识，用于幂等处理 */
  eventId?: string;
  /** 事件类型，如 'click', 'exposure' */
  eventType: string;
  /** 事件分类，如 'button', 'banner' */
  eventCategory: string;
  /** 事件动作，如 'click', 'show' */
  eventAction: string;
  /** 事件标签，附加信息 */
  eventLabel?: string;
  /** 事件值，如订单金额 */
  eventValue?: number;
  /** 事件发生的时间戳 */
  timestamp: number;
  /** 页面URL */
  pageUrl: string;
  /** 页面标题 */
  pageTitle: string;
  /** 来源页 */
  referrer?: string;
  /** 元素路径（CSS选择器或XPath） */
  elementPath?: string;
  /** 元素类型，如 'button', 'img' */
  elementType?: string;
  /** 元素内容（文本或值） */
  elementContent?: string;
  /** 其他自定义维度 */
  [key: string]: unknown;
}

/**
 * 曝光事件特定属性
 */
export interface IExposureEvent extends ITrackingEvent {
  /** 曝光时长（ms） */
  exposureDuration?: number;
  /** 可见比例（0-1） */
  visibleRatio?: number;
}

/**
 * 点击事件特定属性
 */
export interface IClickEvent extends ITrackingEvent {
  /** 点击位置X坐标 */
  clickX?: number;
  /** 点击位置Y坐标 */
  clickY?: number;
}

/**
 * 长按事件特定属性
 */
export interface ILongPressEvent extends IClickEvent {
  /** 长按持续时间（ms） */
  pressDuration: number;
}

/**
 * SDK配置项
 */
export interface ITrackerConfig {
  /** 上报服务器地址 */
  serverUrl: string;
  /** 应用ID */
  appId: string;
  /** 应用版本 */
  version?: string;
  /** 批量上报大小，默认10 */
  batchSize?: number;
  /** 批量上报延迟(ms)，默认5000 */
  batchDelay?: number;
  /** 是否使用navigator.sendBeacon，默认true */
  useBeacon?: boolean;
  /** 元素黑名单选择器 */
  blackList?: string[];
  /** 元素白名单选择器 */
  whiteList?: string[];
  /** 采样率(0-1)，默认1 */
  samplingRate?: number;
  /** 是否启用错误追踪，默认false */
  enableErrorTracking?: boolean;
  /** 长按阈值（ms），默认500 */
  longPressThreshold?: number;
  /** 是否自动追踪点击事件，默认true */
  autoTrackClicks?: boolean;
  /** 是否自动追踪曝光事件，默认false */
  autoTrackExposures?: boolean;
  /** 曝光阈值，元素可见比例，默认0.5 */
  exposureThreshold?: number;
  /** 调试模式，默认false */
  debug?: boolean;
}

/**
 * 上报队列项
 */
export interface IQueueItem {
  /** 事件数据 */
  event: ITrackingEvent;
  /** 尝试次数，用于重试 */
  attempts?: number;
  /** 入队时间戳 */
  timestamp: number;
}

/**
 * 元素曝光配置
 */
export interface IExposureOptions {
  /** 元素选择器或元素引用 */
  element: HTMLElement | string;
  /** 曝光事件数据 */
  eventData: Partial<IExposureEvent>;
  /** 是否只触发一次，默认true */
  once?: boolean;
  /** 可见阈值，默认使用全局配置 */
  threshold?: number;
}

/**
 * 代理对象配置
 */
export interface IProxyOptions {
  /** 是否拦截点击事件 */
  interceptClick?: boolean;
  /** 是否拦截长按事件 */
  interceptLongPress?: boolean;
  /** 是否拦截曝光事件 */
  interceptExposure?: boolean;
  /** 自定义事件数据 */
  eventData?: Partial<ITrackingEvent>;
}
