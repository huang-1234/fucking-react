// 类型导出
export * from './types/tracking';

// 核心模块导出
export { ExposureTracker } from './core/ExposureTracker';
export { ClickTracker } from './core/ClickTracker';
export { Reporter } from './core/Reporter';
export { Tracker, initTracker, getTracker } from './core/Tracker';

// React 集成导出
export {
  useExposureTracking,
  useClickTracking,
  useEventTracking,
  usePageViewTracking,
  useFormSubmitTracking
} from './react/hooks';

export {
  TrackingRoot,
  TrackExposure,
  TrackClick,
  withExposureTracking,
  withClickTracking
} from './react/components';

// Antd 集成导出
export { AntdTracker } from './antd/AntdTracker';
export { wrapAntdComponents, createTrackedAntdComponent } from './antd/index';
