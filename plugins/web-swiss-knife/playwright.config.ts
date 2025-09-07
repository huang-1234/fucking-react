import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * 获取插件的绝对路径
 */
const getExtensionPath = () => {
  return path.join(__dirname, 'dist/extension');
};

/**
 * Playwright 配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // 插件测试最好串行执行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 限制为单个worker以避免并发问题
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    headless: false, // 设置为 false 以便观察浏览器行为
    launchOptions: {
      slowMo: 100, // 减慢操作速度，便于观察
      args: [
        `--disable-extensions-except=${getExtensionPath()}`,
        `--load-extension=${getExtensionPath()}`
      ]
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // 本地开发服务器配置
  webServer: {
    command: 'yarn dev',
    port: 3001,
    reuseExistingServer: true,
  },
});
