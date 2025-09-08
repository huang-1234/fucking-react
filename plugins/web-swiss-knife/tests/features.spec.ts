import { test, expect, Page } from '@playwright/test';

/**
 * 测试插件的具体功能
 */
test.describe('Web Swiss Knife 功能测试', () => {
  let extensionId: string;
  let popupPage: Page;

  test.beforeAll(async ({ browser }) => {
    // 获取扩展ID
    const backgroundPages = browser.contexts()[0].backgroundPages();
    extensionId = backgroundPages[0].url().split('/')[2];
    console.log('扩展ID:', extensionId);
  });

  test.beforeEach(async ({ browser }) => {
    // 打开插件弹出页面
    popupPage = await browser.newPage({
      viewport: { width: 400, height: 600 }
    });
    await popupPage.goto(`chrome-extension://${extensionId}/popup/index.html`);
    // 等待页面加载完成
    await popupPage.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    // 关闭弹出页面
    await popupPage.close();
  });

  test('安全检测功能测试', async () => {
    // 确保当前标签是安全检测
    await popupPage.locator('.ant-menu-item').filter({ hasText: '安全检测' }).click();

    // 点击刷新按钮
    await popupPage.locator('button:has-text("刷新")').click();

    // 等待加载完成
    await popupPage.waitForTimeout(1000);

    // 检查是否有安全检测结果或空状态提示
    const hasResults = await popupPage.locator('.ant-card').count() > 0;
    const hasEmptyState = await popupPage.locator('.ant-empty-description').count() > 0;

    expect(hasResults || hasEmptyState).toBeTruthy();

    // 如果有结果，检查结果内容
    if (hasResults) {
      const cardTitle = await popupPage.locator('.ant-card-head-title').first();
      await expect(cardTitle).toBeVisible();
    }
  });

  test('缓存可视化功能测试', async () => {
    // 切换到缓存可视化标签
    await popupPage.locator('.ant-menu-item').filter({ hasText: '缓存可视化' }).click();

    // 等待页面切换
    await popupPage.waitForTimeout(500);

    // 如果有空状态，点击扫描缓存按钮
    const emptyButton = popupPage.locator('button:has-text("扫描缓存")');
    if (await emptyButton.count() > 0) {
      await emptyButton.click();
      await popupPage.waitForTimeout(1000);
    }

    // 检查是否有缓存数据或空状态提示
    const hasStats = await popupPage.locator('.ant-statistic').count() > 0;
    const hasEmptyState = await popupPage.locator('.ant-empty-description').count() > 0;

    expect(hasStats || hasEmptyState).toBeTruthy();
  });

  test('性能监控功能测试', async () => {
    // 切换到性能监控标签
    await popupPage.locator('.ant-menu-item').filter({ hasText: '性能监控' }).click();

    // 等待页面切换
    await popupPage.waitForTimeout(500);

    // 如果有空状态，点击分析性能按钮
    const emptyButton = popupPage.locator('button:has-text("分析性能")');
    if (await emptyButton.count() > 0) {
      await emptyButton.click();
      await popupPage.waitForTimeout(1000);
    }

    // 检查是否有性能数据或空状态提示
    const hasStats = await popupPage.locator('.ant-statistic').count() > 0;
    const hasEmptyState = await popupPage.locator('.ant-empty-description').count() > 0;

    expect(hasStats || hasEmptyState).toBeTruthy();
  });

  test('设置功能测试', async () => {
    // 切换到设置标签
    await popupPage.locator('.ant-menu-item').filter({ hasText: '设置' }).click();

    // 等待页面切换
    await popupPage.waitForTimeout(500);

    // 检查设置项是否存在
    const securitySettings = await popupPage.locator('div:has-text("安全检测设置")').first();
    await expect(securitySettings).toBeVisible();

    // 测试切换开关
    const securitySwitch = await popupPage.locator('.ant-switch').first();
    const initialState = await securitySwitch.isChecked();

    // 切换开关
    await securitySwitch.click();
    await popupPage.waitForTimeout(300);

    // 验证开关状态已改变
    const newState = await securitySwitch.isChecked();
    expect(newState).not.toEqual(initialState);

    // 切换回原来的状态
    await securitySwitch.click();
    await popupPage.waitForTimeout(300);

    // 验证开关状态已恢复
    const finalState = await securitySwitch.isChecked();
    expect(finalState).toEqual(initialState);
  });
});
