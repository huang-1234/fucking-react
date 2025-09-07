好的，这是一份基于 Playwright 技术栈的 Chrome 浏览器本地调试与测试技术文档，旨在为 Cursor 提供清晰的编码指导。

# Playwright for Chrome：本地调试与测试技术文档

## 1. 核心概念与环境设置

Playwright 是一个由 Microsoft 开发的现代化浏览器自动化与测试框架。它支持 Chromium（包括 Chrome）、Firefox 和 WebKit，提供跨平台、跨语言的稳定且快速的自动化能力。

### 1.1 环境安装
在 Node.js 项目中使用以下命令安装 Playwright：
```bash
# 初始化项目（如果尚未初始化）
npm init -y

# 安装 Playwright 测试库
npm install @playwright/test --save-dev

# 安装 Playwright 支持的浏览器二进制文件（包括 Chromium）
npx playwright install
```

若要**使用系统已安装的 Chrome 浏览器**而非 Playwright 自带的 Chromium，请在启动浏览器时指定可执行路径：
```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/path/to/your/chrome', // 例如 MacOS: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    headless: false // 显式运行浏览器，方便观察
  });
  // ... 后续操作
})();
```

### 1.2 项目结构建议
一个良好的项目结构有助于维护：
```
your-project/
├── tests/                 # 测试用例目录
│   ├── example.spec.js   # 测试文件
│   └── auth-setup.js     # 认证等 setup 逻辑
├── playwright.config.js   # Playwright 配置文件
└── package.json
```

## 2. 编写基本测试

Playwright 测试通常使用 `@playwright/test` 运行器，它提供了测试结构、断言和并行执行等能力。

### 2.1 第一个测试用例
创建一个测试文件 `tests/first-test.spec.js`：

```javascript
const { test, expect } = require('@playwright/test');

test('访问示例网站并验证标题', async ({ page }) => { // `page` fixture 提供隔离的页面环境
  // 导航到目标网址
  await page.goto('https://example.com');

  // 断言页面标题
  await expect(page).toHaveTitle('Example Domain');

  // 截图（可用于调试或验证UI）
  await page.screenshot({ path: 'example-homepage.png' });
});
```
使用 `npx playwright test tests/first-test.spec.js` 运行测试。

### 2.2 元素定位与交互
Playwright 提供多种精准定位元素的方法：
```javascript
test('模拟用户登录', async ({ page }) => {
  await page.goto('https://your-app.com/login');

  // 使用 CSS 选择器定位输入框并输入文本
  await page.locator('input#username').fill('testuser');
  await page.locator('input#password').fill('password123');

  // 使用文本定位器点击按钮
  await page.getByText('登录').click();

  // 等待导航完成并验证URL
  await expect(page).toHaveURL('https://your-app.com/dashboard');
  // 验证页面内容
  await expect(page.locator('.welcome-message')).toContainText('Welcome, testuser');
});
```

**定位策略优先级建议**：
1.  **语义化选择器**：优先使用 `page.getByRole()`, `page.getByText()`, `page.getByLabel()` 等，它们更贴近用户视角，不易因前端代码微小变动而失效。
2.  **CSS 选择器**：`page.locator('css')`，适用于复杂结构。
3.  **XPath**：`page.locator('xpath=...')`，应作为最后手段。

## 3. 高级调试技巧

### 3.1 有头模式与慢动作
在 `playwright.config.js` 中配置全局调试选项，或直接在 `launch`/`launchPersistentContext` 中设置：
```javascript
// 在 playwright.config.js 中配置
module.exports = {
  use: {
    headless: false, // 显示浏览器窗口
    slowMo: 1000, // 每个操作间隔1000毫秒，方便观察
  },
};
```
或在测试中动态设置：
```javascript
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: false, slowMo: 1000 });
```

### 3.2 使用 Playwright Inspector 进行逐步调试
**方法一：设置 `PWDEBUG` 环境变量**
```bash
# Bash
PWDEBUG=1 npx playwright test your-test.spec.js

# Windows (PowerShell)
$env:PWDEBUG=1; npx playwright test your-test.spec.js
```
此模式会：1) 以有头模式运行；2) 禁用超时；3) 打开 Inspector。

**方法二：在代码中插入 `page.pause()`**
```javascript
test('调试用例', async ({ page }) => {
  await page.goto('https://example.com');
  await page.pause(); // 执行到此会暂停，并打开 Inspector
  // ... 后续代码
});
```

**方法三：使用 `playwright codegen` 录制脚本**
```bash
# 启动录制器并打开指定网址
npx playwright codegen https://example.com
```
操作浏览器，工具会自动生成代码。非常适合快速生成基础脚本或学习 API。

### 3.3 Trace Viewer：记录执行追踪
在配置中启用追踪或在测试中手动启动，非常适合在 CI 中调试失败的测试：
```javascript
// playwright.config.js
module.exports = {
  // ... 其他配置
  use: {
    // ... 其他设置
    trace: 'on-first-retry', // 首次重试时记录 trace
  },
};

// 或在测试中手动控制
await context.tracing.start({ screenshots: true, snapshots: true });
// ... 执行测试操作 ...
await context.tracing.stop({ path: 'trace.zip' });
```
使用 `npx playwright show-trace trace.zip` 查看详细的执行过程，包括网络请求、DOM 快照和操作日志。

## 4. 模拟复杂场景

### 4.1 认证状态持久化
避免每个测试都重复登录：
```javascript
// auth-setup.js
const { test: setup } = require('@playwright/test');

setup('获取认证状态', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://your-app.com/login');
  await page.locator('#username').fill('user');
  await page.locator('#password').fill('pass');
  await page.locator('button[type="submit"]').click();

  // 等待登录成功，例如跳转到dashboard
  await page.waitForURL('**/dashboard');

  // 将认证状态保存到文件
  await context.storageState({ path: 'auth-state.json' });
  await context.close();
});

// 在测试中复用认证状态
test('使用已保存的认证状态', async ({ browser }) => {
  const context = await browser.newContext({ storageState: 'auth-state.json' });
  const page = await context.newPage();
  // 现在页面已处于登录状态
  await page.goto('https://your-app.com/dashboard');
  // ... 测试逻辑 ...
});
```

### 4.2 网络请求拦截与模拟 (Mocking)
模拟 API 响应，使测试不依赖后端：
```javascript
test('模拟API数据', async ({ page }) => {
  // 拦截特定API请求并返回模拟数据
  await page.route('**/api/user/profile', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'Mock User', email: 'mock@example.com' })
    });
  });

  await page.goto('https://your-app.com/profile');
  // 页面将显示模拟数据
  await expect(page.locator('.user-name')).toContainText('Mock User');
});
```

### 4.3 设备与视口模拟
测试响应式设计或移动端体验：
```javascript
const { devices } = require('@playwright/test');

test('移动端测试', async ({ browser }) => {
  // 模拟 iPhone 13
  const iPhone13 = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone13, // 继承设备的 userAgent, viewport, deviceScaleFactor 等
  });
  const page = await context.newPage();
  await page.goto('https://m.your-app.com');
  // ... 移动端测试逻辑 ...
});
```

## 5. 配置文件 (playwright.config.js) 详解

一个功能丰富的配置文件示例：
```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // 并行工作进程数，可设置为 '50%' 使用一半的CPU核心
  workers: process.env.CI ? 2 : undefined,
  // 重试策略，特别是在CI环境中
  retries: process.env.CI ? 1 : 0,
  // 全局超时设置
  timeout: 30000,
  // 每个测试用例的超时时间
  expect: { timeout: 10000 },

  // 全局使用选项
  use: {
    // 基础URL，page.goto('/') 会导航到 baseURL + '/'
    // baseURL: 'http://localhost:3000',
    headless: true, // 通常CI为true，本地调试可设为false
    trace: 'on-first-retry', // 追踪策略
    screenshot: 'only-on-failure', // 失败时截图
    video: 'retain-on-failure', // 失败时保留录像
    // ... 其他全局设置
  },

  // 项目配置，可为不同浏览器或配置创建多个项目
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // 可添加更多项目配置
  ],

  // 输出目录
  outputDir: 'test-results/',

  // 报告器
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
});
```

## 6. 实战示例：调试一个用户流程

假设需要测试一个购物流程。
```javascript
const { test, expect } = require('@playwright/test');

test('完整的用户购物流程', async ({ page }) => {
  // 1. 浏览商品
  await page.goto('https://demo-shop.com/products');
  await page.locator('.product:has-text("Laptop")').click();

  // 2. 添加到购物车
  await page.waitForURL('**/products/*');
  await page.locator('text=Add to Cart').click();

  // 等待购物车更新动画或确认消息
  await expect(page.locator('.cart-count')).toHaveText('1');

  // 3. 查看购物车
  await page.locator('a:has-text("View Cart")').click();
  await page.waitForURL('**/cart');

  // 断言购物车内有商品
  await expect(page.locator('.cart-item')).toHaveCount(1);

  // 4. 结账
  await page.locator('text=Proceed to Checkout').click();
  await page.waitForURL('**/checkout');

  // 填写配送信息
  await page.locator('[name="firstName"]').fill('John');
  await page.locator('[name="lastName"]').fill('Doe');
  // ... 填写其他字段 ...

  // 5. 提交订单
  // 拦截创建订单的API请求，避免实际创建
  await page.route('**/api/orders', route => route.fulfill({ status: 201, body: JSON.stringify({ success: true, orderId: 'MOCK123' }) }));
  await page.locator('button[type="submit"]').click();

  // 6. 验证订单成功
  await page.waitForURL('**/order-confirmation');
  await expect(page.locator('.confirmation-message')).toContainText('Thank you for your order');
  await expect(page.locator('.order-id')).toContainText('MOCK123');
});
```

## 7. 常见问题排查 (QA)

*   **浏览器无法启动**：检查 `executablePath` 是否正确，或直接使用 Playwright 自带的 Chromium (`chromium.launch()`)。
*   **元素找不到或超时**：
    *   使用 `page.waitForSelector(selector)` 或 `page.waitForTimeout(timeout)` (谨慎使用) 确保元素加载完成。
    *   检查选择器是否正确，优先使用 Playwright 推荐的定位策略。
    *   检查是否有 iframe，需要使用 `page.frameLocator()` 进入 iframe 上下文。
*   **测试在 CI 中失败，本地却通过**：启用追踪 (`trace: 'on'`) 和视频录制 (`video: 'on'`)，使用 `npx playwright show-trace` 分析 CI 上的失败原因。
*   **权限问题**：如果需要地理位置等权限，使用 `context.grantPermissions(['geolocation'])`。

Playwright 与 Chrome DevTools Protocol (CDP) 的深度集成是其强大功能的核心，这使得它能实现比传统自动化工具更精细、更高效的浏览器控制。CDP 是 Chrome 及其他基于 Chromium 的浏览器（如 Edge）内置的底层调试协议，允许工具通过程序化方式与浏览器内核交互。

为了让你快速理解 Playwright 如何利用 CDP，下面的表格对比了其与 Selenium 的关键差异，并概括了核心集成机制：

| 特性维度         | Playwright + CDP                                                                                              | Selenium + WebDriver                                                                                 |
| :--------------- | :------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **通信协议**     | 直接使用 **Chrome DevTools Protocol (CDP)**                                                | 使用 **WebDriver 协议** (W3C 标准)                                                           |
| **架构与中间层**   | **无独立中间层**，通过 WebSocket **直连**浏览器调试端口                                          | 需通过 **浏览器驱动** (如 ChromeDriver) 中转，HTTP 通信                                      |
| **功能覆盖与粒度** | **功能广泛且深入**，可访问几乎所有浏览器内部操作（DOM、网络、性能、内存、模拟传感器等）                 | 功能受限于 WebDriver 协议的标准化命令，**粒度较粗**                                          |
| **性能与延迟**   | **更低延迟**，WebSocket 双向实时通信，减少协议转换开销                                                  | **较高延迟**，HTTP 请求/响应模式带来额外开销                                               |
| **执行速度**     | **更快**                                                                                              | 相对较慢                                                                                   |
| **跨浏览器一致性** | 通过统一 API 层处理不同浏览器（Chromium/WebKit/Firefox）的差异，提供一致体验                                  | 依赖各浏览器驱动的实现，可能存在行为和功能上的差异                                                             |
| **典型应用场景**   | 需要**精细控制**、**高性能**、**深度调试**（如网络拦截、性能分析、内存监测）的复杂自动化测试和爬虫 | 传统的 Web 自动化测试，强调**跨浏览器兼容性**和 **W3C 标准**支持                                          |

Playwright 与 CDP 的深度集成主要体现在以下几个方面：

### 🔧 1. 直接通信架构

Playwright 的核心优势在于其**架构**。它通过 WebSocket **直接连接到浏览器的 CDP 端口**，与浏览器内核进行通信。这意味着它**绕过了 WebDriver 等中间代理**，减少了协议转换的开销，从而实现了更高的执行效率和更低的延迟。

当你启动 Playwright 时，它会启动浏览器进程并注入一个 Playwright 控制器，该控制器通过 WebSocket 或管道与你的测试脚本建立连接，实现双向通信。

### 📊 2. 全方位的监控与控制能力

通过与 CDP 的直接集成，Playwright 可以启用和接收 CDP 各个“域”（Domains）的事件和命令，从而实现精细化的控制。

*   **网络拦截与分析**：可以监听和修改任何网络请求（`Network.requestWillBeSent`, `Network.responseReceived`），模拟慢速网络，或直接返回模拟响应。
    ```python
    # 示例：监听网络请求
    cdp_session.on('Network.requestWillBeSent', lambda params: print(f"Request: {params['request']['url']}"))
    cdp_session.send('Network.enable')
    ```
*   **性能追踪**：可以获取详细的性能指标，如页面加载时间、脚本执行时间、布局计算时间等（`Performance.getMetrics`）。
*   **内存分析**：能够获取堆内存使用情况、DOM 节点计数等信息（`Memory.getHeapUsage`, `Memory.getDOMCounters`），辅助排查内存泄漏问题。
*   **精准的输入模拟**：不仅支持键盘鼠标，还能模拟触摸、手势等移动设备操作。

### 🚀 3. 实战应用示例

以下是一些展示 Playwright 与 CDP 集成的常见代码示例：

1.  **建立 CDP 会话并获取性能指标**
    ```python
    from playwright.sync_api import sync_playwright

    def performance_tracing_example():
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = context.new_page()

            # 建立CDP会话
            cdp_session = page.context.new_cdp_session(page)
            # 启用Performance域
            cdp_session.send('Performance.enable')

            page.goto('https://example.com')

            # 收集性能指标
            metrics = cdp_session.send('Performance.getMetrics')
            print("性能指标:", metrics)

            browser.close()
    ```

2.  **监控内存使用**
    ```python
    def memory_usage_monitoring():
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context()
            page = context.new_page()
            cdp_session = context.new_cdp_session(page)

            cdp_session.send('Memory.enable') # 启用Memory域
            page.goto('https://example.com')

            # 获取DOM内存统计
            dom_counters = cdp_session.send('Memory.getDOMCounters')
            print("DOM内存统计:", dom_counters)

            # 获取堆内存使用情况
            heap_usage = cdp_session.send('Memory.getHeapUsage')
            print("堆内存使用:", heap_usage)

            browser.close()
    ```

3.  **连接至已打开的浏览器进行调试**
    你可以让 Chrome 以调试模式启动，然后使用 Playwright 连接上去，这对于调试现有浏览器会话非常有用。
    ```bash
    # 首先，以调试模式启动Chrome（在命令行中执行）
    chrome --remote-debugging-port=9222 --user-data-dir="C:\playwright\user_data"
    ```
    ```python
    # 然后，在Playwright中连接
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        # 连接到已存在的浏览器实例
        browser = p.chromium.connect_over_cdp("http://localhost:9222")
        default_context = browser.contexts[0]
        page = default_context.pages[0]
        print(f'Page title: {page.title()}')
        # ... 后续操作
    ```

### 💡 核心优势总结

Playwright 通过与 CDP 的深度集成，带来了诸多优势：

*   **更精细的控制**：可直接调用丰富的 CDP 命令，实现网络拦截、性能分析、内存分析等高级功能。
*   **更高的性能**：WebSocket 直连减少了中间层和协议转换带来的开销，操作更高效。
*   **更丰富的功能**：支持设备模拟、网络条件模拟、精准输入模拟等。
*   **更好的调试能力**：内置强大的调试支持，如追踪录制、截图、视频录制等。

### ⚠️ 注意事项

虽然强大，但直接使用 CDP 时也需注意：

*   **浏览器兼容性**：CDP 主要针对 Chromium 系浏览器。Playwright 虽然为 Firefox 和 WebKit 提供了类似的私有协议实现，但最完整的功能仍在 Chromium 上。
*   **API 稳定性**：CDP 本身可能仍在发展和变化中，部分实验性 API 可能不稳定。
*   **概念复杂性**：直接操作 CDP 需要对其概念和结构有更深入的理解，比使用高级 API 更复杂。

希望这些信息能帮助你更好地理解 Playwright 与 Chrome DevTools Protocol 的深度集成。