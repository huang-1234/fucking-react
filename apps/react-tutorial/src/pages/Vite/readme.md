# Vite 在线学习网站

## 功能概述

Vite 学习中心提供了交互式的学习环境，帮助开发者理解 Vite 的优势和使用方法。主要功能包括：

1. **构建性能对比**：直观对比 Vite 与 Webpack 在不同场景下的性能差异
2. **插件实验室**：体验 Vite 强大的插件系统，自定义插件开发
3. **可视化数据**：通过图表展示性能数据和构建结果

## 技术实现

- 使用 React 函数组件和 Hooks 构建用户界面
- 采用 Antd 组件库提供统一的 UI 体验
- 集成 ECharts 实现数据可视化
- 使用 Monaco Editor 提供代码编辑能力
- 提供安全的插件测试环境

## 核心模块

### 构建性能对比 (BundleComparator)

对比 Webpack 和 Vite 在三个关键场景的性能：
- **冷启动**：首次启动开发服务器的时间
- **HMR 热更新**：修改代码后的更新响应时间
- **生产构建**：构建优化后的生产包的时间

提供详细的性能指标和可视化图表，帮助理解两者的本质差异。

### 插件实验室 (PluginLab)

交互式插件配置和开发环境：
- 预设常用插件配置
- 自定义插件选项
- 插件组合兼容性检查
- 自定义插件开发与测试

## 使用指南

1. 在构建性能对比中运行各种场景的测试
2. 查看详细的性能数据和对比图表
3. 在插件实验室中配置和测试 Vite 插件
4. 尝试开发自定义插件并测试效果

## 学习资源

- [Vite 官方文档](https://vitejs.dev/guide/)
- [Vite 插件 API](https://vitejs.dev/guide/api-plugin.html)
- [为什么选择 Vite](https://vitejs.dev/guide/why.html)
- [Vite 与 Webpack 对比](https://vitejs.dev/guide/comparisons.html)