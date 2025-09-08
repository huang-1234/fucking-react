// 消息类型
export enum MessageType {
  /** 扫描页面 */
  SCAN_PAGE = 'SCAN_PAGE',
  /** 获取安全问题 */
  GET_SECURITY_ISSUES = 'GET_SECURITY_ISSUES',
  /** 获取缓存信息 */
  GET_CACHE_INFO = 'GET_CACHE_INFO',
  /** 获取性能数据 */
  GET_PERFORMANCE_DATA = 'GET_PERFORMANCE_DATA',
  /** 开始性能监控 */
  START_PERFORMANCE_MONITOR = 'START_PERFORMANCE_MONITOR',
  /** 停止性能监控 */
  STOP_PERFORMANCE_MONITOR = 'STOP_PERFORMANCE_MONITOR',
  /** 重置性能监控 */
  RESET_PERFORMANCE_MONITOR = 'RESET_PERFORMANCE_MONITOR',
  /** 清除数据 */
  CLEAR_DATA = 'CLEAR_DATA',
  /** 初始化 */
  INIT = 'INIT',
  /** 打开弹出窗口 */
  OPEN_POPUP = 'OPEN_POPUP',
  /** 获取配置 */
  GET_CONFIG = 'GET_CONFIG',
  /** 设置配置 */
  SET_CONFIG = 'SET_CONFIG'
}

// 模块ID
export enum ModuleId {
  /** 安全 */
  SECURITY = 'security',
  /** 缓存 */
  CACHE = 'cache',
  /** 性能 */
  PERFORMANCE = 'performance'
}

// 安全扫描结果
export interface ScanResult {
  /** 规则ID */
  ruleId: string;
  /** 级别 */
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 消息 */
  message: string;
  /** 页面URL */
  url: string;
  /** 时间戳 */
  timestamp: number;
  /** 建议 */
  suggestion?: string;
  /** 详情 */
  details?: any;
}

// 缓存条目
export interface CacheEntry {
  url: string;
  /** 大小 */
  size: number;
  /** 类型 */
  type: string;
  /** 方法 */
  method: string;
  /** 状态 */
  status: number;
  /** 年龄 */
  age: number;
  /** 过期时间 */
  expires?: string;
  /** 最后修改时间 */
  lastModified?: string;
  /** 缓存控制 */
  cacheControl?: string;
}

// 性能数据
export interface PerformanceData {
  url: string;
  /** 时间戳 */
  timestamp: number;
  /** FCP */
  fcp?: number;
  /** LCP */
  lcp?: number;
  /** FID */
  fid?: number;
  /** CLS */
  cls?: number;
  /** TTFB */
  ttfb?: number;
}

// 消息接口
export interface Message {
  type: MessageType;
  /** 模块 */
  module: ModuleId;
  /** 负载 */
  payload?: any;
}

// 扩展消息接口
export interface ExtensionMessage extends Message {
  /** 来源 */
  source?: string;
  /** 目标 */
  target?: string;
  /** 标签页ID */
  tabId?: number;
}

// 响应接口
export interface Response {
  status: 'success' | 'error';
  /** 消息 */
  message?: string;
  /** 数据 */
  data?: any;
  /** 问题 */
  issues?: ScanResult[];
  /** 摘要 */
  summary?: {
    /** 总数 */
    total: number;
    /** 严重 */
    critical: number;
    /** 高危 */
    high: number;
    /** 中危 */
    medium: number;
    /** 低危 */
    low: number;
    /** 信息 */
    info: number;
  };
}