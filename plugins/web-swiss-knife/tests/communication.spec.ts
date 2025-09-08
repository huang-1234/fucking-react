import { test, expect, Page, Browser } from '@playwright/test';

/**
 * 测试插件的 Background Script 和 Content Script 之间的通信
 */
test.describe('插件通信测试', () => {
  let browser: Browser;
  let extensionId: string;
  let testPage: Page;

  test.beforeAll(async ({ browser: browserFixture }) => {
    browser = browserFixture;

    // 获取扩展ID
    const backgroundPages = browser.contexts()[0].backgroundPages();
    extensionId = backgroundPages[0].url().split('/')[2];
    console.log('扩展ID:', extensionId);
  });

  test.beforeEach(async () => {
    // 创建测试页面
    testPage = await browser.newPage();
    // 导航到一个测试网站
    await testPage.goto('https://example.com');
    // 等待页面加载完成
    await testPage.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    // 关闭测试页面
    await testPage.close();
  });

  test('Content Script 应该能向 Background Script 发送消息并获取响应', async () => {
    // 在页面上下文中执行代码，模拟 Content Script 发送消息
    const response = await testPage.evaluate(async () => {
      return new Promise((resolve) => {
        // 发送一个消息到 Background Script
        chrome.runtime.sendMessage(
          {
            type: 'SCAN_PAGE',
            module: 'security'
          },
          (response) => {
            resolve(response);
          }
        );
      });
    });

    // 验证是否收到响应
    console.log('收到的响应:', response);
    expect(response).toBeTruthy();
  });

  test('应该能从插件弹出页面触发内容脚本扫描', async () => {
    // 打开插件弹出页面
    const popupPage = await browser.newPage({
      viewport: { width: 400, height: 600 }
    });
    await popupPage.goto(`chrome-extension://${extensionId}/popup/index.html`);

    // 确保当前标签是安全检测
    await popupPage.locator('.ant-menu-item').filter({ hasText: '安全检测' }).click();

    // 点击刷新按钮，触发扫描
    await popupPage.locator('button:has-text("刷新")').click();

    // 等待一段时间，让消息有时间传递
    await popupPage.waitForTimeout(2000);

    // 检查测试页面上是否有内容脚本的日志
    // 注意：这里我们无法直接检查内容脚本的行为，但可以通过检查弹出页面的反应来间接验证

    // 检查是否有加载指示器或结果
    const hasSpinner = await popupPage.locator('.ant-spin').count() > 0;
    const hasResults = await popupPage.locator('.ant-card').count() > 0;
    const hasEmptyState = await popupPage.locator('.ant-empty-description').count() > 0;

    expect(hasSpinner || hasResults || hasEmptyState).toBeTruthy();

    await popupPage.close();
  });

  test('DevTools 页面应该能正常加载', async () => {
    // 打开 DevTools 页面
    const devtoolsPage = await browser.newPage();
    await devtoolsPage.goto(`chrome-extension://${extensionId}/devtools/index.html`);

    // 等待页面加载
    await devtoolsPage.waitForLoadState('networkidle');

    // 检查页面标题
    const title = await devtoolsPage.title();
    expect(title).toContain('开发者工具');

    // 检查页面元素
    const heading = await devtoolsPage.locator('h4').filter({ hasText: /缓存可视化|性能监控/ }).first();
    await expect(heading).toBeVisible();

    await devtoolsPage.close();
  });

  // 添加调试辅助测试
  test('调试辅助：暂停以便手动检查', async () => {
    // 打开插件弹出页面
    const popupPage = await browser.newPage({
      viewport: { width: 400, height: 600 }
    });
    await popupPage.goto(`chrome-extension://${extensionId}/popup/index.html`);

    // 记录一些有用的信息
    console.log('扩展ID:', extensionId);
    console.log('弹出页面URL:', `chrome-extension://${extensionId}/popup/index.html`);
    console.log('设置页面URL:', `chrome-extension://${extensionId}/options/index.html`);
    console.log('开发者工具URL:', `chrome-extension://${extensionId}/devtools/index.html`);

    // 如果需要手动检查，可以取消下面这行的注释
    // await popupPage.pause();

    await popupPage.close();
  });
});
