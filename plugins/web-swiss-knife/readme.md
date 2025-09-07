# Web Swiss Knife

A plugin for the browser to help you with your daily tasks.

web-swiss-knife is a plugin for the browser to help you with your daily tasks.

## Features

- [ ] WebGuard Insight
- [ ] Service Worker Cache Visualizer
- [ ] Performance Metrics Visualizer

## Architecture

Below is the core architecture diagram, showing how the components work together:
```mermaid
flowchart TD
    A[WebGuard Insight 浏览器插件] --> B1[安全检测模块]
    A --> B2[Service Worker缓存可视化模块]
    A --> B3[性能可视化模块]
    A --> B4[数据管理与通信中枢]

    B1 --> C1[SSL/TLS证书检查]
    B1 --> C2[安全头分析]
    B1 --> C3[内容安全策略CSP评估]
    B1 --> C4[漏洞指纹扫描]

    B2 --> D1[缓存状态监控]
    B2 --> D2[存储内容审查]
    B2 --> D3[缓存操作调试]

    B3 --> E1[核心性能指标采集]
    B3 --> E2[资源加载瀑布图]
    B3 --> E3[实时性能分析]

    B4 --> F1[背景脚本<br>Background Script]
    B4 --> F2[数据存储层<br>Chrome Storage API]
    B4 --> F3[消息通信机制]

    F1 --> G[弹出页面/Popup]
    F1 --> H[选项页面/Options]
    F1 --> I[内容脚本/Content Script]
```