/**
 * SecLinter 浏览器扩展 - 选项页脚本
 */

// 当前配置
let currentConfig = {
  enabledPlugins: [],
  scanOptions: {
    automaticScan: true,
    notifyOnIssues: true,
    scanDelay: 1000
  }
};

// 加载配置
async function loadConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
    if (response) {
      currentConfig = response;
      updateUI();
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
}

// 加载插件列表
async function loadPlugins() {
  try {
    const plugins = await chrome.runtime.sendMessage({ action: 'getPlugins' });
    renderPlugins(plugins);
  } catch (error) {
    console.error('Failed to load plugins:', error);
  }
}

// 渲染插件列表
function renderPlugins(plugins) {
  const pluginList = document.getElementById('pluginList');
  if (!pluginList) return;

  pluginList.innerHTML = '';

  for (const plugin of plugins) {
    const pluginItem = document.createElement('div');
    pluginItem.className = 'plugin-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `plugin-${plugin.id}`;
    checkbox.checked = currentConfig.enabledPlugins.includes(plugin.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!currentConfig.enabledPlugins.includes(plugin.id)) {
          currentConfig.enabledPlugins.push(plugin.id);
        }
      } else {
        currentConfig.enabledPlugins = currentConfig.enabledPlugins.filter(id => id !== plugin.id);
      }
    });

    const pluginInfo = document.createElement('div');
    pluginInfo.className = 'plugin-info';

    const pluginName = document.createElement('div');
    pluginName.className = 'plugin-name';
    pluginName.textContent = plugin.name;

    const pluginVersion = document.createElement('span');
    pluginVersion.className = 'plugin-version';
    pluginVersion.textContent = `v${plugin.version}`;
    pluginName.appendChild(pluginVersion);

    const pluginDescription = document.createElement('div');
    pluginDescription.className = 'plugin-description';
    pluginDescription.textContent = plugin.description;

    pluginInfo.appendChild(pluginName);
    pluginInfo.appendChild(pluginDescription);

    pluginItem.appendChild(checkbox);
    pluginItem.appendChild(pluginInfo);

    pluginList.appendChild(pluginItem);
  }
}

// 更新UI
function updateUI() {
  const automaticScan = document.getElementById('automaticScan');
  if (automaticScan) {
    automaticScan.checked = currentConfig.scanOptions.automaticScan;
  }

  const notifyOnIssues = document.getElementById('notifyOnIssues');
  if (notifyOnIssues) {
    notifyOnIssues.checked = currentConfig.scanOptions.notifyOnIssues;
  }

  const scanDelay = document.getElementById('scanDelay');
  if (scanDelay) {
    scanDelay.value = String(currentConfig.scanOptions.scanDelay);
  }
}

// 保存配置
async function saveConfig() {
  try {
    // 更新配置
    currentConfig.scanOptions.automaticScan = document.getElementById('automaticScan').checked;
    currentConfig.scanOptions.notifyOnIssues = document.getElementById('notifyOnIssues').checked;
    currentConfig.scanOptions.scanDelay = parseInt(document.getElementById('scanDelay').value, 10) || 1000;

    // 发送配置到后台脚本
    await chrome.runtime.sendMessage({
      action: 'updateConfig',
      config: currentConfig
    });

    // 显示成功消息
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save config:', error);
    showStatus('Failed to save settings: ' + error.message, 'error');
  }
}

// 重置为默认配置
async function resetConfig() {
  try {
    currentConfig = {
      enabledPlugins: ['xss-detector', 'csp-validator', 'cookie-inspector'],
      scanOptions: {
        automaticScan: true,
        notifyOnIssues: true,
        scanDelay: 1000
      }
    };

    // 发送配置到后台脚本
    await chrome.runtime.sendMessage({
      action: 'updateConfig',
      config: currentConfig
    });

    // 更新UI
    updateUI();

    // 重新加载插件列表
    await loadPlugins();

    // 显示成功消息
    showStatus('Settings reset to defaults!', 'success');
  } catch (error) {
    console.error('Failed to reset config:', error);
    showStatus('Failed to reset settings: ' + error.message, 'error');
  }
}

// 添加自定义插件
async function addCustomPlugin() {
  const name = document.getElementById('pluginName').value.trim();
  const description = document.getElementById('pluginDescription').value.trim();
  const code = document.getElementById('pluginCode').value.trim();

  if (!name || !description || !code) {
    showStatus('Please fill in all fields', 'error');
    return;
  }

  try {
    // 验证插件代码
    new Function('return ' + code)();

    // 生成插件ID
    const id = 'custom-' + Date.now();

    // 获取现有的自定义插件
    const customPluginsData = await chrome.storage.local.get('secLinterCustomPlugins');
    const customPlugins = customPluginsData.secLinterCustomPlugins || [];

    // 添加新插件
    customPlugins.push({
      id,
      name,
      description,
      version: '1.0.0',
      code
    });

    // 保存自定义插件
    await chrome.storage.local.set({ secLinterCustomPlugins: customPlugins });

    // 启用新插件
    currentConfig.enabledPlugins.push(id);
    await chrome.runtime.sendMessage({
      action: 'updateConfig',
      config: currentConfig
    });

    // 重新加载插件
    chrome.runtime.reload();

    // 显示成功消息
    showStatus('Plugin added successfully! Reloading extension...', 'success');

    // 清空表单
    document.getElementById('pluginName').value = '';
    document.getElementById('pluginDescription').value = '';
    document.getElementById('pluginCode').value = '';
  } catch (error) {
    console.error('Failed to add custom plugin:', error);
    showStatus('Invalid plugin code: ' + error.message, 'error');
  }
}

// 显示状态消息
function showStatus(message, type) {
  const statusElement = document.getElementById('pluginStatus');
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';

  // 3秒后隐藏
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 加载配置
  await loadConfig();

  // 加载插件列表
  await loadPlugins();

  // 绑定按钮事件
  document.getElementById('saveButton').addEventListener('click', saveConfig);
  document.getElementById('resetButton').addEventListener('click', resetConfig);
  document.getElementById('addPluginButton').addEventListener('click', addCustomPlugin);
});
