# Webpack 在线学习网站

## 功能概述

Webpack 学习中心提供了交互式的学习环境，帮助开发者理解和掌握 Webpack 的配置与使用。主要功能包括：

1. **配置生成器**：通过可视化界面生成 webpack.config.js 配置文件
2. **依赖关系图**：可视化展示模块之间的依赖关系
3. **实时预览**：配置修改后实时查看生成的配置代码

## 技术实现

- 使用 React 函数组件和 Hooks 构建用户界面
- 采用 Antd 组件库提供统一的 UI 体验
- 集成 Monaco Editor 实现代码编辑和高亮
- 使用 D3.js 绘制模块依赖关系图
- 提供沙盒环境安全执行构建过程

## 核心模块

### 配置生成器 (ConfigGenerator)

交互式配置界面，支持：
- 基本配置（mode、entry、output）
- 优化配置（代码分割、压缩）
- Loader 配置（处理各类文件）
- 插件配置（增强构建功能）

### 依赖关系图 (DependencyGraph)

可视化模块依赖，功能包括：
- 力导向图展示模块关系
- 模块大小与类型区分
- 交互式查看模块详情
- 缩放和拖拽操作

## 使用指南

1. 在配置生成器中调整 Webpack 配置
2. 实时查看生成的配置代码
3. 切换到依赖关系图查看模块依赖
4. 点击节点查看模块详情

## 学习资源

- [Webpack 官方文档](https://webpack.js.org/concepts/)
- [Webpack 配置指南](https://webpack.js.org/configuration/)
- [Webpack 插件列表](https://webpack.js.org/plugins/)
- [Webpack Loader 列表](https://webpack.js.org/loaders/)