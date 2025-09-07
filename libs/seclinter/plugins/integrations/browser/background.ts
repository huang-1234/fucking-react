/**
 * SecLinter 浏览器扩展 - 后台脚本
 * 负责插件管理和安全扫描
 */

/// <reference types="chrome" />

// 插件系统的简化版本，适用于浏览器环境
interface BrowserPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  run: (data: any) => Promise<any>;
}

// 存储已注册的插件
const plugins: Map<string, BrowserPlugin> = new Map();

// 默认配置
const defaultConfig = {
  enabledPlugins: ['xss-detector', 'csp-validator', 'cookie-inspector'],
  scanOptions: {
    automaticScan: true,
    notifyOnIssues: true,
    scanDelay: 1000
  }
};

// 当前配置
let config = { ...defaultConfig };

// 初始化
async function init() {
  // 从存储中加载配置
  try {
    const storedConfig = await chrome.storage.sync.get('secLinterConfig');
    if (storedConfig.secLinterConfig) {
      config = { ...defaultConfig, ...storedConfig.secLinterConfig };
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }

  // 注册内置插件
  registerBuiltinPlugins();

  // 加载自定义插件
  await loadCustomPlugins();

  console.log('[SecLinter] Initialized with', plugins.size, 'plugins');
}

// 注册内置插件
function registerBuiltinPlugins() {
  // XSS 检测器
  registerPlugin({
    id: 'xss-detector',
    name: 'XSS Detector',
    description: 'Detects potential XSS vulnerabilities in web pages',
    version: '1.0.0',
    enabled: config.enabledPlugins.includes('xss-detector'),
    run: async (data) => {
      const { document } = data;
      const results = [];

      // 检查 innerHTML 使用
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        if (script.textContent?.includes('innerHTML') || script.textContent?.includes('outerHTML')) {
          results.push({
            level: 'high',
            message: 'Potential DOM-based XSS: innerHTML/outerHTML usage detected',
            context: script.textContent?.substring(0, 100)
          });
        }
      }

      // 检查 eval 使用
      for (const script of scripts) {
        if (script.textContent?.includes('eval(') || script.textContent?.includes('new Function(')) {
          results.push({
            level: 'high',
            message: 'Potential DOM-based XSS: eval() or new Function() usage detected',
            context: script.textContent?.substring(0, 100)
          });
        }
      }

      return results;
    }
  });

  // CSP 验证器
  registerPlugin({
    id: 'csp-validator',
    name: 'CSP Validator',
    description: 'Validates Content Security Policy headers',
    version: '1.0.0',
    enabled: config.enabledPlugins.includes('csp-validator'),
    run: async (data) => {
      const { headers } = data;
      const results = [];

      // 检查是否存在 CSP 头
      const cspHeader = headers?.find(h =>
        h.name.toLowerCase() === 'content-security-policy'
      );

      if (!cspHeader) {
        results.push({
          level: 'medium',
          message: 'Content Security Policy header is missing'
        });
      } else {
        // 检查 CSP 配置是否安全
        const cspValue = cspHeader.value;

        if (cspValue.includes("'unsafe-inline'")) {
          results.push({
            level: 'medium',
            message: "CSP allows 'unsafe-inline' which reduces XSS protection"
          });
        }

        if (cspValue.includes("'unsafe-eval'")) {
          results.push({
            level: 'medium',
            message: "CSP allows 'unsafe-eval' which reduces XSS protection"
          });
        }
      }

      return results;
    }
  });

  // Cookie 检查器
  registerPlugin({
    id: 'cookie-inspector',
    name: 'Cookie Inspector',
    description: 'Inspects cookies for security issues',
    version: '1.0.0',
    enabled: config.enabledPlugins.includes('cookie-inspector'),
    run: async (data) => {
      const { cookies } = data;
      const results = [];

      if (cookies && cookies.length > 0) {
        for (const cookie of cookies) {
          // 检查 Secure 标志
          if (!cookie.secure && cookie.domain) {
            results.push({
              level: 'medium',
              message: `Cookie "${cookie.name}" is not using the Secure flag`,
              context: `Domain: ${cookie.domain}`
            });
          }

          // 检查 HttpOnly 标志
          if (!cookie.httpOnly && cookie.domain) {
            results.push({
              level: 'medium',
              message: `Cookie "${cookie.name}" is not using the HttpOnly flag`,
              context: `Domain: ${cookie.domain}`
            });
          }

          // 检查 SameSite 属性
          if (!cookie.sameSite || cookie.sameSite === 'None') {
            results.push({
              level: 'low',
              message: `Cookie "${cookie.name}" has SameSite=${cookie.sameSite || 'unspecified'}`,
              context: `Domain: ${cookie.domain}`
            });
          }
        }
      }

      return results;
    }
  });
}

// 加载自定义插件
async function loadCustomPlugins() {
  try {
    const customPlugins = await chrome.storage.local.get('secLinterCustomPlugins');
    if (customPlugins.secLinterCustomPlugins) {
      for (const plugin of customPlugins.secLinterCustomPlugins) {
        try {
          // 安全地加载插件代码
          const pluginFunction = new Function('return ' + plugin.code)();

          registerPlugin({
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            version: plugin.version,
            enabled: config.enabledPlugins.includes(plugin.id),
            run: pluginFunction
          });
        } catch (error) {
          console.error(`Failed to load custom plugin ${plugin.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load custom plugins:', error);
  }
}

// 注册插件
function registerPlugin(plugin: BrowserPlugin) {
  plugins.set(plugin.id, plugin);
}

// 执行安全扫描
async function runScan(tabId: number) {
  try {
    // 获取页面信息
    const pageInfo = await getPageInfo(tabId);

    // 收集扫描结果
    const results = [];

    // 执行启用的插件
    for (const plugin of plugins.values()) {
      if (plugin.enabled) {
        try {
          const pluginResults = await plugin.run(pageInfo);
          if (pluginResults && pluginResults.length > 0) {
            results.push({
              plugin: plugin.name,
              results: pluginResults
            });
          }
        } catch (error) {
          console.error(`Plugin ${plugin.name} failed:`, error);
        }
      }
    }

    // 处理扫描结果
    handleScanResults(tabId, results);

    return results;
  } catch (error) {
    console.error('Scan failed:', error);
    return [];
  }
}

// 获取页面信息
async function getPageInfo(tabId: number) {
  // 获取页面内容
  const [{ result: document }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.documentElement.outerHTML
  });

  // 获取 HTTP 头信息
  const headers = await getResponseHeaders(tabId);

  // 获取 Cookie
  const cookies = await chrome.cookies.getAll({ url: await getCurrentUrl(tabId) });

  return { document, headers, cookies };
}

// 获取响应头
async function getResponseHeaders(tabId: number): Promise<{ name: string; value: string }[]> {
  // 由于浏览器扩展API限制，这里只是一个模拟实现
  // 实际实现需要使用 webRequest API 在页面加载时捕获响应头
  return [];
}

// 获取当前 URL
async function getCurrentUrl(tabId: number): Promise<string> {
  const tab = await chrome.tabs.get(tabId);
  return tab.url || '';
}

// 处理扫描结果
function handleScanResults(tabId: number, results: any[]) {
  // 统计问题数量
  const issueCount = results.reduce((count, plugin) => count + plugin.results.length, 0);

  // 更新扩展图标
  if (issueCount > 0) {
    chrome.action.setBadgeText({ text: String(issueCount), tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#f44336', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }

  // 存储结果以便弹出窗口使用
  chrome.storage.local.set({ [`secLinterResults_${tabId}`]: results });

  // 如果配置了通知，则发送通知
  if (config.scanOptions.notifyOnIssues && issueCount > 0) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'SecLinter Security Alert',
      message: `Found ${issueCount} security issues on this page`
    });
  }
}

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && config.scanOptions.automaticScan) {
    // 延迟扫描，等待页面完全加载
    setTimeout(() => runScan(tabId), config.scanOptions.scanDelay);
  }
});

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runScan' && sender.tab) {
    runScan(sender.tab.id).then(sendResponse);
    return true; // 异步响应
  } else if (message.action === 'getPlugins') {
    sendResponse(Array.from(plugins.values()));
    return true;
  } else if (message.action === 'updateConfig') {
    config = { ...config, ...message.config };
    chrome.storage.sync.set({ secLinterConfig: config });
    sendResponse({ success: true });
    return true;
  } else if (message.action === 'getConfig') {
    sendResponse(config);
    return true;
  }
});

// 初始化扩展
init();
