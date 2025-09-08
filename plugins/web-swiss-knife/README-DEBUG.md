# Web Swiss Knife 浏览器插件调试指南

本文档介绍如何使用 Playwright 在本地开发和调试 Web Swiss Knife 浏览器插件。

## 前提条件

确保你已经安装了以下依赖：

- Node.js (v14+)
- Yarn 或 npm
- Chrome 浏览器

## 安装依赖

```bash
yarn install
```

## 开发流程

### 1. 构建插件

首先，构建插件以生成 `dist/extension` 目录：

```bash
yarn build
```

### 2. 本地开发服务器

启动本地开发服务器：

```bash
yarn dev
```

### 3. 调试插件

使用 Playwright 调试插件有几种方式：

#### 调试模式

启动 Playwright 调试模式，可以逐步执行测试并查看浏览器行为：

```bash
yarn debug
```

指定特定测试文件：

```bash
yarn debug tests/extension.spec.ts
```

#### UI 模式

启动 Playwright UI 模式，提供图形界面进行测试：

```bash
yarn debug:ui
```

#### 运行端到端测试

运行所有端到端测试：

```bash
yarn test:e2e
```

#### 查看测试报告

测试完成后查看报告：

```bash
yarn test:report
```

## 测试文件说明

- `tests/extension.spec.ts`: 基本的插件加载测试
- `tests/features.spec.ts`: 插件功能测试（安全检测、缓存可视化、性能监控、设置）
- `tests/communication.spec.ts`: 测试 Background Script 和 Content Script 之间的通信

## 调试技巧

### 在测试中暂停

在测试代码中添加 `page.pause()` 可以暂停执行并打开 Playwright Inspector：

```typescript
test('示例测试', async ({ page }) => {
  await page.goto('https://example.com');
  await page.pause(); // 在这里暂停
});
```

### 查看插件页面

在测试中，可以通过以下方式访问插件页面：

```typescript
// 获取扩展ID
const backgroundPages = browser.contexts()[0].backgroundPages();
const extensionId = backgroundPages[0].url().split('/')[2];

// 访问弹出页面
await page.goto(`chrome-extension://${extensionId}/popup/index.html`);

// 访问设置页面
await page.goto(`chrome-extension://${extensionId}/options/index.html`);

// 访问开发者工具页面
await page.goto(`chrome-extension://${extensionId}/devtools/index.html`);
```

### 调试 Background Script

在测试中，可以通过以下方式获取 Background Script 页面：

```typescript
const backgroundPage = browser.contexts()[0].backgroundPages()[0];
```

### 调试 Content Script

在测试页面上下文中执行代码，可以与 Content Script 交互：

```typescript
const result = await page.evaluate(() => {
  // 这里的代码在页面上下文中执行
  return document.title;
});
```

## 常见问题

### 插件未加载

确保已正确构建插件，并且 `dist/extension` 目录存在。

### 测试失败

- 检查 `extensionId` 是否正确获取
- 确保页面加载完成后再进行操作（使用 `await page.waitForLoadState('networkidle')`）
- 增加等待时间（使用 `await page.waitForTimeout(1000)`）

### 无法访问插件页面

确保使用正确的 URL 格式：`chrome-extension://${extensionId}/path/to/page.html`

## 参考资料

- [Playwright 文档](https://playwright.dev/docs/intro)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
