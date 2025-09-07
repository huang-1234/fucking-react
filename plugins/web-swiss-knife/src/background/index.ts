/// <reference types="chrome" />

/**
 * Web Swiss Knife 浏览器扩展 - 后台脚本
 * 负责插件管理和安全扫描
 */

// 导入依赖
import { MessageType, ModuleId } from '../types';
import { SecurityScanner } from './modules/security-scanner';
import { getStorage, setStorage } from '../utils/storage';

// 初始化模块
const securityScanner = new SecurityScanner();
// 以下模块暂未实现，先注释掉
// const cacheVisualizer = new CacheVisualizer();
// const performanceMonitor = new PerformanceMonitor();

// 默认配置
const defaultConfig = {
  enabledModules: ['security', 'cache', 'performance'],
  scanOptions: {
    automaticScan: true,
    notifyOnIssues: true,
    scanDelay: 1000
  }
};

// 当前配置
let config = { ...defaultConfig };

/**
 * 初始化
 */
async function init() {
  console.log('[Web Swiss Knife] 初始化中...');

  // 从存储中加载配置
  try {
    const storedConfig = await getStorage<{ webSwissKnifeConfig: typeof defaultConfig }>('webSwissKnifeConfig');
    if (storedConfig.webSwissKnifeConfig) {
      config = { ...defaultConfig, ...storedConfig.webSwissKnifeConfig };
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }

  console.log('[Web Swiss Knife] 初始化完成');
}

/**
 * 主消息监听器
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 收到消息:', message);

  const { type, payload, module } = message;

  // 路由消息到适当的模块
  switch (module) {
    case ModuleId.SECURITY:
      securityScanner.handleMessage(type, payload, sender, sendResponse);
      break;
    case ModuleId.CACHE:
      // cacheVisualizer.handleMessage(type, payload, sender, sendResponse);
      sendResponse({ status: 'error', message: '缓存模块尚未实现。' });
      break;
    case ModuleId.PERFORMANCE:
      // performanceMonitor.handleMessage(type, payload, sender, sendResponse);
      sendResponse({ status: 'error', message: '性能模块尚未实现。' });
      break;
    default:
      // 处理一般消息
      handleGeneralMessage(type, payload, sender, sendResponse);
      break;
  }

  // 返回true表示将异步发送响应
  return true;
});

/**
 * 处理一般消息
 */
async function handleGeneralMessage(type: MessageType, payload: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  switch (type) {
    case MessageType.GET_CONFIG:
      sendResponse({ status: 'success', config });
      break;

    case MessageType.SET_CONFIG:
      if (payload && payload.config) {
        config = { ...config, ...payload.config };
        await setStorage({ webSwissKnifeConfig: config });
        sendResponse({ status: 'success' });
      } else {
        sendResponse({ status: 'error', message: '无效的配置数据' });
      }
      break;

    default:
      console.warn('[Background] 未知的消息类型:', type);
      sendResponse({ status: 'error', message: '未知的消息类型' });
      break;
  }
}

/**
 * 监听标签页更新
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.id) {
    console.log(`[Background] 标签页更新: ${tab.url}`);
    // 如果启用了自动扫描，触发安全扫描
    if (config.scanOptions.automaticScan) {
      setTimeout(() => {
        securityScanner.scanPage(tab.id!, tab.url!);
      }, config.scanOptions.scanDelay);
    }
  }
});

console.log('[Background] Web Swiss Knife 后台脚本已加载。');

// 初始化扩展
init();