/**
 * SecLinter 插件系统入口
 */

// 导出核心模块
export * from './core';

// 导出集成模块
export { SecLinterWebpackPlugin } from './integrations/webpack';
export { secLinterVitePlugin } from './integrations/vite';

// 导出示例插件
// 注意：示例插件需要单独安装
