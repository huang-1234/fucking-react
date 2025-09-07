// 移除无效的 chrome 类型声明
import { getStorageFromStorage, setStorageToStorage } from '../utils/storage';

// 默认设置
const DEFAULT_SETTINGS = {
  security: {
    autoScan: true,
    levels: {
      critical: true,
      high: true,
      medium: true,
      low: false,
      info: false
    },
    notifications: {
      popup: true,
      badge: true
    }
  },
  cache: {
    enabled: true,
    refreshInterval: 30 // 秒
  },
  performance: {
    enabled: true,
    metrics: {
      fcp: true,
      lcp: true,
      cls: true,
      fid: true,
      ttfb: true
    }
  }
};

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Options] 选项页面已加载');

  // 加载保存的设置
  await loadSettings();

  // 设置表单提交事件
  document.getElementById('settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
  });

  // 设置重置按钮事件
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    resetSettings();
  });
});

// 加载设置
async function loadSettings() {
  try {
    const settings = await getStorage<{ settings: typeof DEFAULT_SETTINGS }>('settings');
    const currentSettings = settings?.settings || DEFAULT_SETTINGS;

    // 安全设置
    setCheckboxValue('security-auto-scan', currentSettings.security.autoScan);
    setCheckboxValue('security-level-critical', currentSettings.security.levels.critical);
    setCheckboxValue('security-level-high', currentSettings.security.levels.high);
    setCheckboxValue('security-level-medium', currentSettings.security.levels.medium);
    setCheckboxValue('security-level-low', currentSettings.security.levels.low);
    setCheckboxValue('security-level-info', currentSettings.security.levels.info);
    setCheckboxValue('security-notification-popup', currentSettings.security.notifications.popup);
    setCheckboxValue('security-notification-badge', currentSettings.security.notifications.badge);

    // 缓存设置
    setCheckboxValue('cache-enabled', currentSettings.cache.enabled);
    setInputValue('cache-refresh-interval', currentSettings.cache.refreshInterval.toString());

    // 性能设置
    setCheckboxValue('performance-enabled', currentSettings.performance.enabled);
    setCheckboxValue('performance-metric-fcp', currentSettings.performance.metrics.fcp);
    setCheckboxValue('performance-metric-lcp', currentSettings.performance.metrics.lcp);
    setCheckboxValue('performance-metric-cls', currentSettings.performance.metrics.cls);
    setCheckboxValue('performance-metric-fid', currentSettings.performance.metrics.fid);
    setCheckboxValue('performance-metric-ttfb', currentSettings.performance.metrics.ttfb);

    console.log('[Options] 设置已加载', currentSettings);
  } catch (error) {
    console.error('[Options] 加载设置失败', error);
    showAlert('加载设置失败，已使用默认设置', 'error');
  }
}

// 保存设置
async function saveSettings() {
  try {
    const settings = {
      security: {
        autoScan: getCheckboxValue('security-auto-scan'),
        levels: {
          critical: getCheckboxValue('security-level-critical'),
          high: getCheckboxValue('security-level-high'),
          medium: getCheckboxValue('security-level-medium'),
          low: getCheckboxValue('security-level-low'),
          info: getCheckboxValue('security-level-info')
        },
        notifications: {
          popup: getCheckboxValue('security-notification-popup'),
          badge: getCheckboxValue('security-notification-badge')
        }
      },
      cache: {
        enabled: getCheckboxValue('cache-enabled'),
        refreshInterval: parseInt(getInputValue('cache-refresh-interval')) || 30
      },
      performance: {
        enabled: getCheckboxValue('performance-enabled'),
        metrics: {
          fcp: getCheckboxValue('performance-metric-fcp'),
          lcp: getCheckboxValue('performance-metric-lcp'),
          cls: getCheckboxValue('performance-metric-cls'),
          fid: getCheckboxValue('performance-metric-fid'),
          ttfb: getCheckboxValue('performance-metric-ttfb')
        }
      }
    };

    await setStorage({ settings });
    console.log('[Options] 设置已保存', settings);
    showAlert('设置已保存', 'success');

    // 通知后台脚本设置已更新
    chrome.runtime.sendMessage({
      type: 'SETTINGS_UPDATED',
      payload: { settings }
    });
  } catch (error) {
    console.error('[Options] 保存设置失败', error);
    showAlert('保存设置失败', 'error');
  }
}

// 重置设置
function resetSettings() {
  try {
    // 安全设置
    setCheckboxValue('security-auto-scan', DEFAULT_SETTINGS.security.autoScan);
    setCheckboxValue('security-level-critical', DEFAULT_SETTINGS.security.levels.critical);
    setCheckboxValue('security-level-high', DEFAULT_SETTINGS.security.levels.high);
    setCheckboxValue('security-level-medium', DEFAULT_SETTINGS.security.levels.medium);
    setCheckboxValue('security-level-low', DEFAULT_SETTINGS.security.levels.low);
    setCheckboxValue('security-level-info', DEFAULT_SETTINGS.security.levels.info);
    setCheckboxValue('security-notification-popup', DEFAULT_SETTINGS.security.notifications.popup);
    setCheckboxValue('security-notification-badge', DEFAULT_SETTINGS.security.notifications.badge);

    // 缓存设置
    setCheckboxValue('cache-enabled', DEFAULT_SETTINGS.cache.enabled);
    setInputValue('cache-refresh-interval', DEFAULT_SETTINGS.cache.refreshInterval.toString());

    // 性能设置
    setCheckboxValue('performance-enabled', DEFAULT_SETTINGS.performance.enabled);
    setCheckboxValue('performance-metric-fcp', DEFAULT_SETTINGS.performance.metrics.fcp);
    setCheckboxValue('performance-metric-lcp', DEFAULT_SETTINGS.performance.metrics.lcp);
    setCheckboxValue('performance-metric-cls', DEFAULT_SETTINGS.performance.metrics.cls);
    setCheckboxValue('performance-metric-fid', DEFAULT_SETTINGS.performance.metrics.fid);
    setCheckboxValue('performance-metric-ttfb', DEFAULT_SETTINGS.performance.metrics.ttfb);

    console.log('[Options] 设置已重置为默认值');
    showAlert('设置已重置为默认值', 'success');
  } catch (error) {
    console.error('[Options] 重置设置失败', error);
    showAlert('重置设置失败', 'error');
  }
}

// 辅助函数：获取复选框值
function getCheckboxValue(id: string): boolean {
  return (document.getElementById(id) as HTMLInputElement)?.checked || false;
}

// 辅助函数：设置复选框值
function setCheckboxValue(id: string, value: boolean): void {
  const checkbox = document.getElementById(id) as HTMLInputElement;
  if (checkbox) {
    checkbox.checked = value;
  }
}

// 辅助函数：获取输入框值
function getInputValue(id: string): string {
  return (document.getElementById(id) as HTMLInputElement)?.value || '';
}

// 辅助函数：设置输入框值
function setInputValue(id: string, value: string): void {
  const input = document.getElementById(id) as HTMLInputElement;
  if (input) {
    input.value = value;
  }
}

// 辅助函数：显示提示消息
function showAlert(message: string, type: 'success' | 'error'): void {
  const alertElement = document.getElementById('alert');
  if (!alertElement) return;

  alertElement.textContent = message;
  alertElement.className = `alert alert-${type}`;
  alertElement.style.display = 'block';

  setTimeout(() => {
    alertElement.style.display = 'none';
  }, 3000);
}
