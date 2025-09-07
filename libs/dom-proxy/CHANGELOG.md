# 更新日志

## 1.0.0 (2023-09-03)

### 功能

- **核心模块**：
  - 实现基于 Proxy 代理的事件拦截机制
  - 实现基于 Intersection Observer API 的元素曝光检测
  - 实现批量上报队列管理和失败重试机制
  - 支持 Navigator.sendBeacon 和 Fetch API 的多种上报方式

- **React 集成**：
  - 提供 TrackingRoot、TrackExposure、TrackClick 等组件
  - 提供 useExposureTracking、useClickTracking 等 Hooks
  - 提供高阶组件 withExposureTracking、withClickTracking

- **Antd 组件增强**：
  - 支持 Button、Modal、Form、Select、Tabs 等组件的埋点增强
  - 提供 wrapAntdComponents 和 createTrackedAntdComponent 工具函数

### 其他

- 完善的 TypeScript 类型定义
- 详细的文档和使用示例
- 支持 ES Module 和 UMD 格式
