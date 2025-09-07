/**
 * Web Swiss Knife 类型定义
 */

/**
 * 消息类型
 */
export enum MessageType {
  // 通用消息
  RUN_SCAN = 'RUN_SCAN',
  /** 获取配置 */
  GET_CONFIG = 'GET_CONFIG',
  /** 更新配置 */
  UPDATE_CONFIG = 'UPDATE_CONFIG',
  /** 获取结果 */
  GET_RESULTS = 'GET_RESULTS',
  /** 清除数据 */
  CLEAR_DATA = 'CLEAR_DATA',
  /** 安全扫描 */
  SECURITY_SCAN = 'SECURITY_SCAN',
  /** 获取安全问题 */
  GET_SECURITY_ISSUES = 'GET_SECURITY_ISSUES',
  /** 缓存分析 */
  CACHE_ANALYZE = 'CACHE_ANALYZE',
  /** 获取缓存信息 */
  GET_CACHE_INFO = 'GET_CACHE_INFO',
  /** 清除缓存 */
  CLEAR_CACHE = 'CLEAR_CACHE',
  /** 性能收集 */
  PERFORMANCE_COLLECT = 'PERFORMANCE_COLLECT',
  /** 获取性能指标 */
  GET_PERFORMANCE_METRICS = 'GET_PERFORMANCE_METRICS',
  /** 初始化 */
  INIT = 'INIT',
  /** 扫描页面 */
  SCAN_PAGE = 'SCAN_PAGE',
}

/**
 * 扩展配置
 */
export interface ExtensionConfig {
  /** 启用模块 */
  enabledModules: string[];
  /** 扫描选项 */
  scanOptions: {
    /** 自动扫描 */
    automaticScan: boolean;
    /** 通知有安全问题 */
    notifyOnIssues: boolean;
    /** 扫描延迟 */
    scanDelay: number;
  };
}

/**
 * 安全问题
 */
export interface SecurityIssue {
  /** 唯一标识 */
  id: string;
  /** 类型 */
  type: string;
  /** 严重程度 */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 消息 */
  message: string;
  /** 描述 */
  description?: string;
  /** 位置 */
  location?: string;
  /** 推荐 */
  recommendation?: string;
  /** 代码 */
  code?: string;
  /** 参考 */
  references?: string[];
}

/**
 * 安全扫描结果
 */
export interface SecurityScanResult {
  /** 地址 */
  url: string;
  /** 时间戳 */
  timestamp: number;
  /** 安全问题 */
  issues: SecurityIssue[];
  /** 总结 */
  summary: {
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
    /** 总计 */
    total: number;
  };
}

/**
 * 缓存条目
 */
export interface CacheEntry {
  /** 唯一标识 */
  id: string;
  /** 地址 */
  url: string;
  /** 大小 */
  size: number;
  /** 类型 */
  type: string;
  /** 过期时间 */
  expires?: number;
  /** 最后访问时间 */
  lastAccessed?: number;
  /** 创建时间 */
  createdAt: number;
}

/**
 * 缓存分析结果
 */
export interface CacheAnalysisResult {
  /** 地址 */
  url: string;
  /** 时间戳 */
  timestamp: number;
  /** 是否存在Service Worker */
  hasSW: boolean;
  /** 状态 */
  swStatus?: string;
  caches: {
    /** 名称 */
    name: string;
    /** 大小 */
    size: number;
    /** 条目 */
    entries: CacheEntry[];
  }[];
  summary: {
    /** 总缓存 */
    totalCaches: number;
    /** 总条目 */
    totalEntries: number;
    /** 总大小 */
    totalSize: number;
    /** 平均条目大小 */
    avgEntrySize: number;
  };
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 地址 */
  url: string;
  /** 时间戳 */
  timestamp: number;
  /** 导航时间 */
  navigationTiming: {
    /** 请求开始 */
    fetchStart: number;
    /** 域名解析开始 */
    domainLookupStart: number;
    /** 域名解析结束 */
    domainLookupEnd: number;
    /** 连接开始 */
    connectStart: number;
    /** 连接结束 */
    connectEnd: number;
    /** 请求开始 */
    requestStart: number;
    /** 响应开始 */
    responseStart: number;
    /** 响应结束 */
    responseEnd: number;
    /** DOM交互开始 */
    domInteractive: number;
    /** DOM交互结束 */
    domContentLoadedEventStart: number;
    /** DOM交互结束 */
    domContentLoadedEventEnd: number;
    /** DOM交互结束 */
    domComplete: number;
    /** 加载事件开始 */
    loadEventStart: number;
    /** 加载事件结束 */
    loadEventEnd: number;
  };
  /** 性能指标 */
  webVitals: {
    /** 首次内容绘制 */
    FCP?: number; // First Contentful Paint
    /** 最大内容绘制 */
    LCP?: number; // Largest Contentful Paint
    /** 首次输入延迟 */
    FID?: number; // First Input Delay
    /** 累计布局偏移 */
    CLS?: number; // Cumulative Layout Shift
    /** 交互时间 */
    TTI?: number; // Time to Interactive
    /** 总阻塞时间 */
    TBT?: number; // Total Blocking Time
  };
  /** 资源 */
  resources: {
    /** 地址 */
    url: string;
    /** 类型 */
    type: string;
    /** 大小 */
    size: number;
    /** 持续时间 */
    duration: number;
    /** 开始时间 */
    startTime: number;
  }[];
  /** 卡顿 */
  jank?: {
    /** 卡顿次数 */
    count: number;
    /** 总持续时间 */
    totalDuration: number;
    /** 最大持续时间 */
    maxDuration: number;
  };
}

/**
 * 扫描结果
 */
export interface ScanResults {
  /** 安全 */
  security: SecurityScanResult | null;
  /** 缓存 */
  cache: CacheAnalysisResult | null;
  /** 性能 */
  performance: PerformanceMetrics | null;
}
/** 模块ID */
export enum ModuleId {
  /** 安全 */
  SECURITY = 'security',
  /** 缓存 */
  CACHE = 'cache',
  /** 性能 */
  PERFORMANCE = 'performance'
}

export enum eLevel {
  'critical' = 'critical',
  high = 'high',
  medium = 'medium',
  low = 'low',
  info = 'info'
}
const levelMap = {
  [eLevel.critical]: '严重',
  [eLevel.high]: '高危',
  [eLevel.medium]: '中危',
  [eLevel.low]: '低危',
  [eLevel.info]: '信息'
}
/**
 *
  'critical': '严重',
  'high': '高危',
  'medium': '中危',
  'low': '低危',
  'info': '信息'
  'level': 'critical' | 'high' | 'medium' | 'low' | 'info'
 */
export interface ScanResult {
  /** 严重程度 */
  level: eLevel | 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 消息 */
  message: string;
  /** 修复建议 */
  suggestion?: string;
  /** 修复代码 */
  fix?: string;
  /** 相关链接 */
  links?: string[];
  /** 自定义数据 */
  metadata?: Record<string, any>;
  /** 时间戳 */
  timestamp: number;
  /** 地址 */
  url: string;
  /** 规则唯一标识 */
  ruleId: string;
  /** 插件名称 */
  plugin: string;
  /** 问题所在文件 */
  file?: string;
  /** 问题行号 */
  line?: number;
  /** 问题列号 */
  column?: number;
}