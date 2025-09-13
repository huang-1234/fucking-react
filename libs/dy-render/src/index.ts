// 导出核心类
export { RendererCore } from './core/renderer-core';
export { ComponentMapper } from './core/component-mapper';
export { SchemaParser } from './core/schema-parser';
export { StyleApplier } from './core/style-applier';
export { RenderContext } from './context/render-context';
export { RenderPerformanceMonitor } from './utils/performance-monitor';

// 导出类型
export * from './types';

// 导出工具函数
import { createRenderer } from './utils/create-renderer';
export { createRenderer };

/**
 * 默认导出创建渲染器函数
 */
export default createRenderer;
