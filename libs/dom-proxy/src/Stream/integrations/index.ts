/**
 * Stream模块集成主入口
 */

import { getGlobalStreamLazyLoader, setGlobalStreamLazyLoader, StreamLazyLoader } from './LazyLoaderIntegration';
import { DataTransferTracker, setGlobalDataTransferTracker } from './TrackingIntegration';
import { StreamModuleFactory, StreamUniversalAdapter } from './UniversalModuleIntegration';

import { DataTransferAnalytics, createTransferId, getGlobalDataTransferTracker } from './TrackingIntegration';

// Tracking集成
export {
  DataTransferTracker,
  DataTransferAnalytics,
  getGlobalDataTransferTracker,
  setGlobalDataTransferTracker,
  createTransferId,
} from './TrackingIntegration';

export type {
  DataTransferTrackingEvent
} from './TrackingIntegration';

// UniversalModule集成
export {
  StreamUniversalAdapter,
  StreamModuleFactory,
  createStreamUniversalConfig,
  registerStreamModule,
  STREAM_LAZY_LOAD_CONFIG,
} from './UniversalModuleIntegration';

export type {
  StreamUniversalConfig
} from './UniversalModuleIntegration';

// LazyLoader集成
export {
  StreamLazyLoader,
  StreamResourceOptimizer,
  getGlobalStreamLazyLoader,
  setGlobalStreamLazyLoader,
  createStreamLazyLoaderConfig
} from './LazyLoaderIntegration';

export type {
  StreamLazyConfig
} from './LazyLoaderIntegration';

/**
 * 一键集成函数
 * 自动配置Stream模块与现有模块的集成
 */
export async function integrateStreamModule(options: {
  /** 是否启用Tracking集成 */
  enableTracking?: boolean;
  /** 是否启用UniversalModule集成 */
  enableUniversal?: boolean;
  /** 是否启用LazyLoader集成 */
  enableLazyLoader?: boolean;
  /** Tracking配置 */
  trackingConfig?: {
    sessionId?: string;
    trackingEnabled?: boolean;
    flushInterval?: number;
  };
  /** UniversalModule配置 */
  universalConfig?: {
    autoPolyfill?: boolean;
    loadStrategy?: 'eager' | 'lazy' | 'on-demand';
    compatibilityLevel?: 'strict' | 'loose' | 'permissive';
  };
  /** LazyLoader配置 */
  lazyLoaderConfig?: {
    preloadStrategy?: 'none' | 'critical' | 'all';
    enableCache?: boolean;
  };
  /** 调试模式 */
  debug?: boolean;
} = {}): Promise<{
  tracker?: DataTransferTracker;
  universalAdapter?: StreamUniversalAdapter;
  lazyLoader?: StreamLazyLoader;
}> {
  const result: any = {};

  try {
    // 初始化Tracking集成
    if (options.enableTracking !== false) {
      const tracker = new DataTransferTracker({
        trackingEnabled: true,
        ...options.trackingConfig
      });
      setGlobalDataTransferTracker(tracker);
      result.tracker = tracker;

      if (options.debug) {
        console.log('[StreamIntegration] Tracking integration enabled');
      }
    }

    // 初始化UniversalModule集成
    if (options.enableUniversal !== false) {
      const factory = StreamModuleFactory.getInstance();
      const adapter = await factory.createModule({
        debug: options.debug,
        ...options.universalConfig
      });
      result.universalAdapter = adapter;

      if (options.debug) {
        console.log('[StreamIntegration] UniversalModule integration enabled');
      }
    }

    // 初始化LazyLoader集成
    if (options.enableLazyLoader !== false) {
      const lazyLoader = new StreamLazyLoader({
        debug: options.debug,
        ...options.lazyLoaderConfig
      });
      await lazyLoader.initialize();
      setGlobalStreamLazyLoader(lazyLoader);
      result.lazyLoader = lazyLoader;

      if (options.debug) {
        console.log('[StreamIntegration] LazyLoader integration enabled');
      }
    }

    if (options.debug) {
      console.log('[StreamIntegration] All integrations completed successfully');
    }

    return result;

  } catch (error) {
    console.error('[StreamIntegration] Integration failed:', error);
    throw error;
  }
}

/**
 * 获取集成状态
 */
export function getIntegrationStatus(): {
  tracking: boolean;
  universal: boolean;
  lazyLoader: boolean;
  details: {
    trackingStats?: any;
    universalInfo?: any;
    lazyLoaderStats?: any;
  };
} {
  const status = {
    tracking: false,
    universal: false,
    lazyLoader: false,
    details: {} as any
  };

  try {
    // 检查Tracking集成
    const tracker = getGlobalDataTransferTracker();
    if (tracker) {
      status.tracking = true;
      status.details.trackingStats = tracker.getStats();
    }
  } catch {
    // Tracking未集成
  }

  try {
    // 检查UniversalModule集成
    const factory = StreamModuleFactory.getInstance();
    const adapter = factory.getAdapter();
    if (adapter) {
      status.universal = true;
      status.details.universalInfo = adapter.getModuleInfo();
    }
  } catch {
    // UniversalModule未集成
  }

  try {
    // 检查LazyLoader集成
    const lazyLoader = getGlobalStreamLazyLoader();
    if (lazyLoader) {
      status.lazyLoader = true;
      status.details.lazyLoaderStats = lazyLoader.getStats();
    }
  } catch {
    // LazyLoader未集成
  }

  return status;
}

/**
 * 重置所有集成
 */
export function resetAllIntegrations(): void {
  try {
    // 重置Tracking
    const tracker = getGlobalDataTransferTracker();
    if (tracker) {
      tracker.destroy();
    }
  } catch {
    // 忽略错误
  }

  try {
    // 重置UniversalModule
    const factory = StreamModuleFactory.getInstance();
    factory.reset();
  } catch {
    // 忽略错误
  }

  try {
    // 重置LazyLoader
    const lazyLoader = getGlobalStreamLazyLoader();
    if (lazyLoader) {
      lazyLoader.reset();
    }
  } catch {
    // 忽略错误
  }
}