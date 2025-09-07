/// <reference types="chrome" />

import { MessageType, ModuleId } from '../types';

console.log('[Content Script] Web Swiss Knife 内容脚本已加载');

// 初始化内容脚本
function initialize() {
  // 向后台脚本发送初始化消息
  chrome.runtime.sendMessage({
    type: MessageType.INIT,
    module: ModuleId.SECURITY,
    payload: {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now()
    }
  }, (response) => {
    if (response && response.status === 'success') {
      console.log('[Content Script] 初始化成功');
    } else {
      console.error('[Content Script] 初始化失败:', response?.message || '未知错误');
    }
  });

  // 自动触发页面安全扫描
  setTimeout(() => {
    requestScan();
  }, 1000);
}

// 请求安全扫描
function requestScan() {
  console.log('[Content Script] 请求安全扫描');
  chrome.runtime.sendMessage({
    type: MessageType.SCAN_PAGE,
    module: ModuleId.SECURITY,
    payload: {
      url: window.location.href,
      html: document.documentElement.outerHTML.substring(0, 10000), // 限制大小
      scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean),
      headers: {} // 实际场景中，可能需要通过background script获取headers
    }
  }, (response) => {
    if (response && response.status === 'success') {
      console.log('[Content Script] 安全扫描结果:', response.results);

      // 如果有严重问题，显示通知
      const criticalIssues = response.results.filter((issue: any) => issue.level === 'critical');
      if (criticalIssues.length > 0) {
        showSecurityNotification(criticalIssues);
      }
    } else {
      console.error('[Content Script] 安全扫描失败:', response?.message || '未知错误');
    }
  });
}

// 显示安全通知
function showSecurityNotification(issues: any[]) {
  // 创建通知元素
  const notificationDiv = document.createElement('div');
  notificationDiv.style.position = 'fixed';
  notificationDiv.style.top = '10px';
  notificationDiv.style.right = '10px';
  notificationDiv.style.backgroundColor = '#ff4d4f';
  notificationDiv.style.color = 'white';
  notificationDiv.style.padding = '10px 15px';
  notificationDiv.style.borderRadius = '4px';
  notificationDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  notificationDiv.style.zIndex = '9999';
  notificationDiv.style.maxWidth = '300px';
  notificationDiv.style.fontSize = '14px';

  notificationDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
      <strong>安全警告</strong>
      <span style="cursor: pointer;" id="web-swiss-knife-close">×</span>
    </div>
    <div>
      检测到 ${issues.length} 个严重安全问题。
      <a href="#" id="web-swiss-knife-details" style="color: white; text-decoration: underline;">查看详情</a>
    </div>
  `;

  document.body.appendChild(notificationDiv);

  // 添加关闭事件
  document.getElementById('web-swiss-knife-close')?.addEventListener('click', () => {
    notificationDiv.remove();
  });

  // 添加查看详情事件
  document.getElementById('web-swiss-knife-details')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({
      type: MessageType.GET_SECURITY_ISSUES,
      module: ModuleId.SECURITY
    });

    // 打开扩展的弹出窗口
    chrome.runtime.sendMessage({
      type: MessageType.OPEN_POPUP,
      module: ModuleId.SECURITY
    });
  });

  // 5秒后自动关闭
  setTimeout(() => {
    if (document.body.contains(notificationDiv)) {
      notificationDiv.remove();
    }
  }, 5000);
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Content Script] 收到消息:', message);

  if (message.module === ModuleId.SECURITY) {
    switch (message.type) {
      case MessageType.SCAN_PAGE:
        requestScan();
        sendResponse({ status: 'success' });
        break;

      default:
        sendResponse({ status: 'error', message: '未知消息类型' });
        break;
    }
  }

  // 返回true表示将异步发送响应
  return true;
});

// 导出一些函数供调试使用
(window as any).webSwissKnife = {
  requestScan,
  showSecurityNotification
};
