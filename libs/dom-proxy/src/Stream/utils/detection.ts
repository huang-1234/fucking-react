/**
 * 浏览器特性检测工具
 */

import type {
  FeatureSupport,
  BrowserInfo,
  EnvironmentInfo,
  FeatureDetector
} from '../types/compatibility';

/**
 * 特性检测器集合
 */
export const featureDetectors: Record<keyof FeatureSupport, FeatureDetector> = {
  // 基础Stream API检测
  streams: () => {
    return typeof globalThis.ReadableStream !== 'undefined' &&
           typeof globalThis.WritableStream !== 'undefined';
  },

  // ReadableStream检测
  readableStream: () => {
    return typeof globalThis.ReadableStream !== 'undefined' &&
           typeof globalThis.ReadableStream.prototype.getReader === 'function';
  },

  // WritableStream检测
  writableStream: () => {
    return typeof globalThis.WritableStream !== 'undefined' &&
           typeof globalThis.WritableStream.prototype.getWriter === 'function';
  },

  // TransformStream检测
  transformStream: () => {
    return typeof globalThis.TransformStream !== 'undefined' &&
           typeof globalThis.TransformStream.prototype.readable === 'object';
  },

  // 压缩流检测
  compressionStreams: () => {
    return typeof globalThis.CompressionStream !== 'undefined' &&
           typeof globalThis.DecompressionStream !== 'undefined';
  },

  // TextEncoder检测
  textEncoder: () => {
    return typeof globalThis.TextEncoder !== 'undefined' &&
           typeof globalThis.TextEncoder.prototype.encode === 'function';
  },

  // TextDecoder检测
  textDecoder: () => {
    return typeof globalThis.TextDecoder !== 'undefined' &&
           typeof globalThis.TextDecoder.prototype.decode === 'function';
  },

  // WebSocket二进制支持检测
  webSocketBinary: () => {
    if (typeof globalThis.WebSocket === 'undefined') {
      return false;
    }
    try {
      const ws = new WebSocket('ws://localhost');
      const hasBinaryType = 'binaryType' in ws;
      ws.close();
      return hasBinaryType;
    } catch {
      // 无法创建WebSocket连接，但可以检查原型
      return 'binaryType' in WebSocket.prototype;
    }
  },

  // ArrayBuffer.transfer检测
  arrayBufferTransfer: () => {
    return typeof ArrayBuffer !== 'undefined' &&
           typeof ArrayBuffer.prototype.transfer === 'function';
  },

  // 异步迭代器检测
  asyncIterator: () => {
    return typeof Symbol !== 'undefined' &&
           typeof Symbol.asyncIterator !== 'undefined' &&
           typeof globalThis.ReadableStream !== 'undefined' &&
           typeof globalThis.ReadableStream.prototype[Symbol.asyncIterator] === 'function';
  },

  // Blob构造函数检测
  blobConstructor: () => {
    return typeof globalThis.Blob !== 'undefined' &&
           typeof globalThis.Blob.prototype.constructor === 'function';
  },

  // File API检测
  fileAPI: () => {
    return typeof globalThis.File !== 'undefined' &&
           typeof globalThis.FileReader !== 'undefined' &&
           typeof globalThis.FileList !== 'undefined';
  },

  // 结构化克隆检测
  structuredClone: () => {
    return typeof globalThis.structuredClone === 'function';
  }
};

/**
 * 检测所有特性支持情况
 */
export function detectFeatures(): FeatureSupport {
  const features: FeatureSupport = {} as FeatureSupport;

  for (const [feature, detector] of Object.entries(featureDetectors)) {
    try {
      features[feature as keyof FeatureSupport] = detector();
    } catch (error) {
      // 检测失败时默认为不支持
      features[feature as keyof FeatureSupport] = false;
      console.warn(`[FeatureDetection] Failed to detect ${feature}:`, error);
    }
  }

  return features;
}

/**
 * 检测单个特性
 */
export function detectFeature(feature: keyof FeatureSupport): boolean {
  try {
    return featureDetectors[feature]();
  } catch (error) {
    console.warn(`[FeatureDetection] Failed to detect ${feature}:`, error);
    return false;
  }
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;

  // 简化的浏览器检测
  let name = 'Unknown';
  let version = 'Unknown';
  let engine = 'Unknown';
  let engineVersion = 'Unknown';

  // Chrome检测
  if (userAgent.includes('Chrome/')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  }
  // Firefox检测
  else if (userAgent.includes('Firefox/')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Gecko';
  }
  // Safari检测
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'WebKit';
  }
  // Edge检测
  else if (userAgent.includes('Edg/')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  }

  // 移动端检测
  const mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

  // 操作系统检测
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return {
    name,
    version,
    engine,
    engineVersion,
    mobile,
    os
  };
}

/**
 * 获取环境信息
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  const isNode = typeof process !== 'undefined' && process.versions?.node;
  const isWebWorker = typeof importScripts === 'function' && !isBrowser;
  const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';

  // ES模块支持检测
  const supportsESModules = (() => {
    try {
      // 使用间接方式检测ES模块支持
      new Function('return import("")');
      return true;
    } catch {
      return false;
    }
  })();

  // 动态导入支持检测
  const supportsDynamicImport = (() => {
    try {
      // 检查是否支持动态import语法
      new Function('return import("")');
      return true;
    } catch {
      return false;
    }
  })();

  return {
    isBrowser,
    isNode: !!isNode,
    isWebWorker,
    isServiceWorker,
    supportsESModules,
    supportsDynamicImport
  };
}

/**
 * 检查最小版本要求
 */
export function checkMinVersion(
  browserInfo: BrowserInfo,
  minVersions: Record<string, string>
): boolean {
  const minVersion = minVersions[browserInfo.name.toLowerCase()];
  if (!minVersion) {
    return true; // 没有版本要求
  }

  try {
    const currentVersion = parseFloat(browserInfo.version);
    const requiredVersion = parseFloat(minVersion);
    return currentVersion >= requiredVersion;
  } catch {
    return false; // 版本解析失败
  }
}

/**
 * 生成兼容性报告
 */
export function generateCompatibilityReport(): {
  features: FeatureSupport;
  browser: BrowserInfo;
  environment: EnvironmentInfo;
  summary: {
    supportedCount: number;
    totalCount: number;
    supportPercentage: number;
  };
} {
  const features = detectFeatures();
  const browser = getBrowserInfo();
  const environment = getEnvironmentInfo();

  const supportedCount = Object.values(features).filter(Boolean).length;
  const totalCount = Object.keys(features).length;
  const supportPercentage = Math.round((supportedCount / totalCount) * 100);

  return {
    features,
    browser,
    environment,
    summary: {
      supportedCount,
      totalCount,
      supportPercentage
    }
  };
}

/**
 * 缓存检测结果
 */
class FeatureCache {
  private cache = new Map<string, { value: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5分钟缓存

  set(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const featureCache = new FeatureCache();