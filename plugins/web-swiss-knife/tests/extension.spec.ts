import { test, expect, Page } from '@playwright/test';

/**
 * 测试插件是否成功加载并能正常工作
 */
test.describe('Web Swiss Knife 插件测试', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // 创建新页面
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    // 关闭页面
    await page.close();
  });

  test('应该能够加载插件', async ({ browser }) => {
    // 获取扩展背景页
    const backgroundPages = browser.contexts()[0].backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);

    // 打印扩展ID，用于调试
    const extensionId = backgroundPages[0].url().split('/')[2];
    console.log('扩展ID:', extensionId);

    // 验证扩展已加载
    expect(extensionId).toBeTruthy();
  });

  test('应该能打开插件弹出页面', async ({ browser }) => {
    // 获取扩展ID
    const backgroundPages = browser.contexts()[0].backgroundPages();
    const extensionId = backgroundPages[0].url().split('/')[2];

    // 打开插件弹出页面
    const popupPage = await browser.newPage({
      viewport: { width: 400, height: 600 }
    });
    await popupPage.goto(`chrome-extension://${extensionId}/popup/index.html`);

    // 验证弹出页面已加载
    const title = await popupPage.title();
    console.log('弹出页面标题:', title);

    // 检查页面元素
    const titleElement = await popupPage.locator('h5:has-text("Web Swiss Knife")').first();
    await expect(titleElement).toBeVisible();

    await popupPage.close();
  });

  test('应该能打开设置页面', async ({ browser }) => {
    // 获取扩展ID
    const backgroundPages = browser.contexts()[0].backgroundPages();
    const extensionId = backgroundPages[0].url().split('/')[2];

    // 打开设置页面
    const optionsPage = await browser.newPage();
    await optionsPage.goto(`chrome-extension://${extensionId}/options/index.html`);

    // 验证设置页面已加载
    const title = await optionsPage.title();
    console.log('设置页面标题:', title);

    // 检查页面元素
    const settingsTitle = await optionsPage.locator('h4:has-text("设置")').first();
    await expect(settingsTitle).toBeVisible();

    await optionsPage.close();
  });
});
