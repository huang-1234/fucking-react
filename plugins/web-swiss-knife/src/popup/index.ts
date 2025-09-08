/// <reference types="chrome" />

import { MessageType, ModuleId, ScanResult } from '../types';

// 初始化弹出窗口
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] 弹出窗口已加载');

  // 设置标签页切换
  setupTabs();

  // 设置刷新按钮
  setupRefreshButton();

  // 加载当前标签页的安全问题
  loadSecurityIssues();

  // 设置扫描按钮
  document.getElementById('scan-btn')?.addEventListener('click', () => {
    requestScan();
  });
});

// 设置标签页切换
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');

      // 移除所有活动标签
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // 设置当前活动标签
      tab.classList.add('active');
      document.getElementById(tabId!)?.classList.add('active');

      // 加载对应标签的数据
      switch (tabId) {
        case 'security':
          loadSecurityIssues();
          break;
        case 'cache':
          // TODO: 加载缓存数据
          break;
        case 'performance':
          // TODO: 加载性能数据
          break;
      }
    });
  });
}

// 设置刷新按钮
function setupRefreshButton() {
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab.active');
    const tabId = activeTab?.getAttribute('data-tab');

    switch (tabId) {
      case 'security':
        loadSecurityIssues(true);
        break;
      case 'cache':
        // TODO: 刷新缓存数据
        break;
      case 'performance':
        // TODO: 刷新性能数据
        break;
    }
  });
}

// 加载安全问题
function loadSecurityIssues(forceRefresh = false) {
  const securityLoading = document.getElementById('security-loading');
  const securityContent = document.getElementById('security-content');
  const securityEmpty = document.getElementById('security-empty');

  securityLoading!.style.display = 'block';
  securityContent!.style.display = 'none';
  securityEmpty!.style.display = 'none';

  // 获取当前标签页
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      showError('无法获取当前标签页');
      return;
    }

    const currentTab = tabs[0];
    const tabId = currentTab.id;

    // 如果强制刷新，先请求扫描
    if (forceRefresh) {
      requestScan(tabId);
      return;
    }

    // 获取安全问题
    chrome.runtime.sendMessage({
      type: MessageType.GET_SECURITY_ISSUES,
      module: ModuleId.SECURITY,
      payload: { tabId }
    }, (response) => {
      securityLoading!.style.display = 'none';

      if (response && response.status === 'success') {
        const issues = response.issues || [];
        const summary = response.summary || { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };

        if (issues.length > 0) {
          renderSecuritySummary(summary);
          renderSecurityIssues(issues);
          securityContent!.style.display = 'block';
        } else {
          securityEmpty!.style.display = 'block';
        }
      } else {
        showError('获取安全问题失败: ' + (response?.message || '未知错误'));
      }
    });
  });
}

// 渲染安全问题摘要
function renderSecuritySummary(summary: { total: number, critical: number, high: number, medium: number, low: number, info: number }) {
  const summaryElement = document.getElementById('security-summary');

  if (!summaryElement) return;

  summaryElement.innerHTML = `
    <div class="summary-item">
      <div class="summary-value">${summary.total}</div>
      <div class="summary-label">总计</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #ff4d4f">${summary.critical}</div>
      <div class="summary-label">严重</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #fa8c16">${summary.high}</div>
      <div class="summary-label">高危</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #faad14">${summary.medium}</div>
      <div class="summary-label">中危</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #52c41a">${summary.low + summary.info}</div>
      <div class="summary-label">低危/信息</div>
    </div>
  `;
}

// 渲染安全问题列表
function renderSecurityIssues(issues: ScanResult[]) {
  const issuesElement = document.getElementById('security-issues');

  if (!issuesElement) return;

  // 按严重程度排序
  const sortedIssues = [...issues].sort((a, b) => {
    const levelOrder = {
      'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4,
      level: 5
    };
    return levelOrder[a.level] - levelOrder[b.level];
  });

  issuesElement.innerHTML = sortedIssues.map(issue => {
    const levelText = {
      'critical': '严重',
      'high': '高危',
      'medium': '中危',
      'low': '低危',
      'info': '信息'
    }[issue.level] || issue.level;

    const timestamp = new Date(issue.timestamp).toLocaleString();

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${issue.ruleId}</div>
          <span class="badge ${issue.level}">${levelText}</span>
        </div>
        <div class="card-content">${issue.message}</div>
        ${issue.suggestion ? `<div class="suggestion">建议: ${issue.suggestion}</div>` : ''}
        <div class="card-footer">
          <div>${new URL(issue.url).pathname}</div>
          <div>检测时间: ${timestamp}</div>
        </div>
      </div>
    `;
  }).join('');
}

// 请求扫描
function requestScan(tabId?: number) {
  const securityLoading = document.getElementById('security-loading');
  const securityContent = document.getElementById('security-content');
  const securityEmpty = document.getElementById('security-empty');

  securityLoading!.style.display = 'block';
  securityContent!.style.display = 'none';
  securityEmpty!.style.display = 'none';

  const scanTab = (id: number) => {
    chrome.tabs.sendMessage(id, {
      type: MessageType.SCAN_PAGE,
      module: ModuleId.SECURITY
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Popup] 发送消息失败:', chrome.runtime.lastError);

        // 如果内容脚本未响应，尝试直接通过后台脚本扫描
        chrome.runtime.sendMessage({
          type: MessageType.SCAN_PAGE,
          module: ModuleId.SECURITY,
          payload: { tabId: id }
        }, (bgResponse) => {
          // 扫描完成后重新加载问题列表
          setTimeout(() => loadSecurityIssues(), 500);
        });
      } else {
        // 扫描完成后重新加载问题列表
        setTimeout(() => loadSecurityIssues(), 500);
      }
    });
  };

  if (tabId) {
    scanTab(tabId);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        showError('无法获取当前标签页');
        return;
      }

      scanTab(tabs[0].id!);
    });
  }
}

// 显示错误信息
function showError(message: string) {
  const securityLoading = document.getElementById('security-loading');
  const securityContent = document.getElementById('security-content');
  const securityEmpty = document.getElementById('security-empty');

  securityLoading!.style.display = 'none';
  securityContent!.style.display = 'none';

  const emptyElement = document.getElementById('security-empty');
  if (emptyElement) {
    emptyElement.innerHTML = `
      <p style="color: #ff4d4f">${message}</p>
      <button id="scan-btn" class="action-btn" style="margin-top: 16px;">重试</button>
    `;
    emptyElement.style.display = 'block';

    document.getElementById('scan-btn')?.addEventListener('click', () => {
      requestScan();
    });
  }
}
