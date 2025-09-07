/**
 * Service Worker增强版缓存方案的类型定义
 */

// Service Worker注册选项
export interface ServiceWorkerRegisterOptions {
  /** Service Worker脚本路径 */
  swPath?: string;
  /** 是否在开发环境中启用 */
  enableInDev?: boolean;
  /** 注册范围 */
  scope?: string;
  /** 是否自动跳过等待阶段 */
  autoSkipWaiting?: boolean;
  /** 调试模式 */
  debug?: boolean;
  /** 更新回调 */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  /** 成功回调 */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

// 缓存策略配置
export interface CacheStrategyOptions {
  /** 缓存名称 */
  cacheName: string;
  /** 缓存过期时间(毫秒) */
  maxAgeMs?: number;
  /** 最大缓存条目数 */
  maxEntries?: number;
  /** 是否在后台更新缓存 */
  backgroundUpdate?: boolean;
  /** 自定义缓存匹配函数 */
  matchOptions?: CacheQueryOptions;
  /** 网络请求超时时间(毫秒) */
  networkTimeoutMs?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}

// 缓存策略函数类型
export type CacheStrategy = (
  request: Request,
  options?: CacheStrategyOptions
) => Promise<Response>;

// Service Worker状态
export enum ServiceWorkerStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  ACTIVATING = 'activating',
  ACTIVATED = 'activated',
  REDUNDANT = 'redundant',
  ERROR = 'error',
  UPDATE_AVAILABLE = 'update_available',
}

// Service Worker状态上下文
export interface IServiceWorkerContext {
  /** 当前状态 */
  status: ServiceWorkerStatus;
  /** Service Worker注册对象 */
  registration: ServiceWorkerRegistration | null;
  /** 是否有更新可用 */
  updateAvailable: boolean;
  /** 更新Service Worker */
  updateServiceWorker: () => void;
  /** 检查更新 */
  checkForUpdates: () => Promise<boolean>;
  /** 注销Service Worker */
  unregister: () => Promise<boolean>;
  /** 错误信息 */
  error: Error | null;
}

// 预缓存配置
export interface PrecacheEntry {
  /** 资源URL */
  url: string;
  /** 资源版本号(用于缓存更新) */
  revision?: string;
  /** 资源类型 */
  type?: 'static' | 'api' | 'html' | 'other';
}

// 预缓存清单
export interface PrecacheManifest {
  /** 预缓存条目列表 */
  entries: PrecacheEntry[];
  /** 缓存名称 */
  cacheName: string;
}

// 消息类型
export enum MessageType {
  SKIP_WAITING = 'SKIP_WAITING',
  CACHE_UPDATED = 'CACHE_UPDATED',
  CHECK_FOR_UPDATES = 'CHECK_FOR_UPDATES',
  UPDATE_FOUND = 'UPDATE_FOUND',
  CLIENTS_CLAIM = 'CLIENTS_CLAIM',
  CACHE_STATS = 'CACHE_STATS',
  LOG = 'LOG',
}

// 消息数据
export interface ServiceWorkerMessage {
  /** 消息类型 */
  type: MessageType;
  /** 消息负载 */
  payload?: any;
  /** 消息元数据 */
  meta?: {
    timestamp: number;
    source: 'client' | 'service-worker';
  };
}

// 路由匹配配置
export interface RouteMatchConfig {
  /** 匹配URL的正则表达式 */
  urlPattern: RegExp | string;
  /** 匹配请求方法 */
  method?: string;
  /** 匹配请求头 */
  headers?: Record<string, string | RegExp>;
}

// 路由配置
export interface RouteConfig extends RouteMatchConfig {
  /** 应用的缓存策略 */
  strategy: CacheStrategy;
  /** 缓存策略选项 */
  strategyOptions?: CacheStrategyOptions;
}
export interface Client {
  postMessage(message: any): void;
  matchAll(): Promise<Client[]>;
  claim(): Promise<void>;
}

export interface WorkerGlobalScope  extends Window, Global {
}


export interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  skipWaiting(): void;
  clients: Client;
}