/**
 * SecLinter 浏览器扩展 - 弹出窗口脚本
 */

// 获取当前标签页
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// 显示扫描结果
async function displayResults() {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  const tab = await getCurrentTab();
  if (!tab || !tab.id) {
    resultsContainer.innerHTML = '<div class="no-issues">Cannot access this page</div>';
    return;
  }

  // 获取存储的扫描结果
  const data = await chrome.storage.local.get(`secLinterResults_${tab.id}`);
  const results = data[`secLinterResults_${tab.id}`];

  if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<div class="no-issues">No security issues found</div>';
    return;
  }

  // 渲染结果
  let html = '';

  for (const pluginResult of results) {
    html += `
      <div class="plugin-result">
        <div class="plugin-name">${pluginResult.plugin}</div>
    `;

    for (const issue of pluginResult.results) {
      html += `
        <div class="issue ${issue.level}">
          <div class="issue-header">
            <div class="issue-message">${issue.message}</div>
            <div class="issue-level">${issue.level}</div>
          </div>
          ${issue.context ? `<div class="issue-context">${issue.context}</div>` : ''}
        </div>
      `;
    }

    html += '</div>';
  }

  resultsContainer.innerHTML = html;
}

// 执行扫描
async function runScan() {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = '<div class="loading">Scanning page for security issues...</div>';

  const tab = await getCurrentTab();
  if (!tab || !tab.id) {
    resultsContainer.innerHTML = '<div class="no-issues">Cannot access this page</div>';
    return;
  }

  // 发送扫描请求
  chrome.runtime.sendMessage({ action: 'runScan' }, (results) => {
    if (chrome.runtime.lastError) {
      resultsContainer.innerHTML = `<div class="no-issues">Error: ${chrome.runtime.lastError.message}</div>`;
      return;
    }

    displayResults();
  });
}

// 打开选项页
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 显示初始结果
  displayResults();

  // 绑定按钮事件
  const scanButton = document.getElementById('scanButton');
  if (scanButton) {
    scanButton.addEventListener('click', runScan);
  }

  const optionsButton = document.getElementById('optionsButton');
  if (optionsButton) {
    optionsButton.addEventListener('click', openOptions);
  }
});
