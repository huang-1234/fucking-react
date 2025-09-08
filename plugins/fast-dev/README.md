# 通用开发平台 (Universal Dev Platform)

一个集成了前后端逻辑开发、组件物料、页面搭建、D2C（Design to Code）和自动化测试等多种功能的VSCode插件，并通过一个通用的AI模块进行智能协同。

## 特性

- **微内核架构**：核心插件只负责最基本的插件管理、生命周期管理、通信总线和AI模块的调度
- **插件化设计**：所有具体功能以插件形式存在，通过核心插件注册和集成
- **AI增强**：通过AI模块智能化地增强各个功能模块
- **多平台支持**：同时支持VSCode和Cursor等IDE
- **高内聚低耦合**：各功能模块高度解耦，可独立开发、迭代和部署

## 功能模块

### 组件物料库

提供组件的创建、管理、预览和复用功能：

- 支持多种前端框架（React、Vue、Svelte等）
- 组件模板系统
- 组件预览
- 一键插入组件代码

### 页面搭建（待实现）

基于拖拽或配置生成页面代码：

- 可视化页面编辑器
- 组件拖拽布局
- 页面配置导出
- 代码生成

### D2C（Design to Code）（待实现）

解析设计稿并生成前端代码：

- 支持多种设计工具（Sketch、Figma等）
- 智能布局识别
- 样式提取
- 代码生成

### 自动化测试（待实现）

快速生成测试用例、运行测试、展示测试结果：

- 单元测试生成
- 集成测试支持
- 测试结果可视化
- AI辅助测试用例生成

### 前后端逻辑开发（待实现）

提供快速创建函数、API接口、数据模型的功能：

- API接口生成
- 数据模型定义
- 前后端代码协同
- 接口文档生成

## 安装

1. 在VSCode扩展市场中搜索"通用开发平台"
2. 点击安装
3. 重启VSCode

## 使用方法

1. 点击活动栏中的"通用开发平台"图标，打开侧边栏
2. 选择需要使用的功能模块
3. 按照提示进行操作

### 组件物料库

1. 在侧边栏中展开"组件物料"视图
2. 点击"+"按钮创建新组件，或浏览现有组件
3. 右键点击组件可以预览或插入组件

## 配置选项

通过VSCode设置页面配置插件：

- `universal-dev-platform.ai.defaultProvider`: 默认AI提供者
- `universal-dev-platform.ai.openai.apiKey`: OpenAI API密钥
- `universal-dev-platform.ai.openai.model`: OpenAI模型

## 扩展开发

### 创建新的功能扩展

1. 在`src/extensions`目录下创建新的扩展目录
2. 创建`extension.json`文件，定义扩展的元数据
3. 创建`index.ts`文件，实现扩展的激活函数
4. 在扩展中使用核心插件提供的API进行功能实现

### 扩展示例

```typescript
// src/extensions/my-extension/index.ts
import { IExtensionContext } from '../../types/extension';

export async function activate(context: IExtensionContext): Promise<any> {
  // 实现扩展功能

  // 返回API
  return {
    // 导出API供其他扩展使用
  };
}
```

## 许可证

MIT
