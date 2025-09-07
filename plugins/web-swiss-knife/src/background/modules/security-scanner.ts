/// <reference types="chrome" />

import { MessageType, ExtensionMessage, ModuleId, ScanResult } from '../../types';
import { getStorage, setStorage } from '../../utils/storage';

// 模拟 @seclinter/plugins 库的接口
interface PluginManager {
  init(): Promise<void>;
  getPlugins(): Array<{ meta: { name: string } }>;
  scan(options: PluginScanOptions): Promise<{ results: Array<any> }>;
}

interface PluginScanOptions {
  projectPath: string;
  targetFiles: string[];
  [key: string]: any;
}

// 由于我们没有实际的 @seclinter/plugins 库，创建一个模拟实现
function createPluginManager(config: any): PluginManager {
  return {
    async init() {
      console.log('[SecurityScanner] 初始化插件管理器', config);
      // 模拟初始化延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    getPlugins() {
      return [
        { meta: { name: 'xss-detector' } },
        { meta: { name: 'csp-validator' } },
        { meta: { name: 'cookie-security' } },
        { meta: { name: 'cors-validator' } }
      ];
    },
    async scan(options: PluginScanOptions) {
      console.log('[SecurityScanner] 扫描页面', options);
      // 模拟扫描过程
      await new Promise(resolve => setTimeout(resolve, 300));

      // 根据URL生成一些模拟的安全问题
      const url = options.targetFiles[0];
      const mockResults = [];

      if (url.includes('login') || url.includes('auth')) {
        mockResults.push({
          ruleId: 'secure-cookies',
          level: 'high',
          message: '检测到Cookie未设置Secure标志',
          suggestion: '为所有敏感Cookie添加Secure标志',
          file: url
        });
      }

      if (!url.includes('https')) {
        mockResults.push({
          ruleId: 'insecure-connection',
          level: 'critical',
          message: '检测到非HTTPS连接',
          suggestion: '将所有HTTP连接升级到HTTPS',
          file: url
        });
      }

      // 随机添加一些通用安全问题
      if (Math.random() > 0.5) {
        mockResults.push({
          ruleId: 'csp-missing',
          level: 'medium',
          message: '未检测到内容安全策略(CSP)',
          suggestion: '添加适当的内容安全策略头',
          file: url
        });
      }

      if (Math.random() > 0.7) {
        mockResults.push({
          ruleId: 'xss-vulnerability',
          level: 'high',
          message: '可能存在XSS漏洞',
          suggestion: '对所有用户输入进行适当的转义',
          file: url
        });
      }

      return { results: mockResults };
    }
  };
}

const PLUGIN_MANAGER_CONFIG = {
  autoDiscover: true,
  pluginsDir: 'node_modules',
  enableSandbox: true,
  defaultPermissions: ['fs:read', 'net:outbound'],
};

export class SecurityScanner {
  private pluginManager: PluginManager;
  private issues: { [tabId: number]: ScanResult[] } = {};

  constructor() {
    this.pluginManager = createPluginManager(PLUGIN_MANAGER_CONFIG);
    this.init();
  }

  private async init() {
    await this.pluginManager.init();
    console.log('[SecurityScanner] 插件管理器初始化完成，已加载插件:', this.pluginManager.getPlugins().map(p => p.meta.name));
    // 从存储中加载现有问题
    const storedIssues = await getStorage<{ issues: { [tabId: number]: ScanResult[] } }>('securityIssues');
    if (storedIssues?.issues) {
      this.issues = storedIssues.issues;
    }
  }

  async handleMessage(type: MessageType, payload: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    switch (type) {
      case MessageType.SCAN_PAGE:
        if (sender.tab?.id && sender.tab.url) {
          console.log(`[SecurityScanner] 扫描页面: ${sender.tab.url}`);
          const results = await this.scanPage(sender.tab.id, sender.tab.url);
          sendResponse({ status: 'success', results });
        } else {
          sendResponse({ status: 'error', message: '无效的标签页或URL进行扫描。' });
        }
        break;
      case MessageType.GET_SECURITY_ISSUES:
        const tabId = payload?.tabId || (sender.tab?.id || -1);
        sendResponse({
          status: 'success',
          issues: this.issues[tabId] || [],
          summary: this.generateSummary(tabId)
        });
        break;
      default:
        sendResponse({ status: 'error', message: `安全模块未知消息类型: ${type}` });
        break;
    }
  }

  async scanPage(tabId: number, url: string): Promise<ScanResult[]> {
    const projectPath = new URL(url).origin; // 简化的项目路径
    const scanOptions: PluginScanOptions = {
      projectPath: projectPath,
      targetFiles: [url], // 将当前URL作为"文件"目标
      // 根据需要添加其他选项
    };

    try {
      const report = await this.pluginManager.scan(scanOptions);
      const formattedResults: ScanResult[] = report.results.map(issue => ({
        ruleId: issue.ruleId,
        level: issue.level as 'info' | 'low' | 'medium' | 'high' | 'critical',
        message: issue.message,
        suggestion: issue.suggestion,
        url: issue.file || url,
        timestamp: Date.now(),
      }));

      this.issues[tabId] = formattedResults;
      await setStorage({ securityIssues: this.issues }); // 持久化问题
      this.updateBadge(tabId);
      return formattedResults;
    } catch (error) {
      console.error(`[SecurityScanner] 扫描页面失败 ${url}:`, error);
      return [];
    }
  }

  private updateBadge(tabId: number) {
    const issuesForTab = this.issues[tabId] || [];
    const criticalCount = issuesForTab.filter(i => i.level === 'critical').length;
    const highCount = issuesForTab.filter(i => i.level === 'high').length;

    if (criticalCount > 0) {
      chrome.action.setBadgeText({ text: String(criticalCount), tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId });
    } else if (highCount > 0) {
      chrome.action.setBadgeText({ text: String(highCount), tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#FFA500', tabId });
    } else if (issuesForTab.length > 0) {
      chrome.action.setBadgeText({ text: String(issuesForTab.length), tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#FFFF00', tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }

  private generateSummary(tabId: number): { total: number, critical: number, high: number, medium: number, low: number, info: number } {
    const issues = this.issues[tabId] || [];
    return {
      total: issues.length,
      critical: issues.filter(i => i.level === 'critical').length,
      high: issues.filter(i => i.level === 'high').length,
      medium: issues.filter(i => i.level === 'medium').length,
      low: issues.filter(i => i.level === 'low').length,
      info: issues.filter(i => i.level === 'info').length,
    };
  }
}