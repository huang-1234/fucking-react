/**
 * 通用开发平台 VSCode 插件入口文件
 * 微内核架构 - 核心插件
 */
import * as vscode from 'vscode';
import { ExtensionManager } from './core/extensionManager';
import { EventBus } from './core/eventBus';
import { AIManager } from './core/aiManager';
import { IDEAdapter } from './core/ideAdapter';

// 导出激活函数
export async function activate(context: vscode.ExtensionContext): Promise<any> {
  try {
    // 初始化IDE适配器（支持VSCode和Cursor）
    const ideAdapter = new IDEAdapter(context);

    // 初始化事件总线（插件间通信核心）
    const eventBus = new EventBus();

    // 初始化AI管理器
    const aiManager = new AIManager(context, eventBus);

    // 初始化扩展管理器（负责加载和管理功能扩展）
    const extensionManager = new ExtensionManager(context, eventBus, aiManager, ideAdapter);

    // 注册核心命令
    registerCommands(context, extensionManager, eventBus);

    // 加载所有扩展
    await extensionManager.loadExtensions();

    // 输出激活信息
    vscode.window.showInformationMessage('通用开发平台已激活');

    // 返回API以供其他扩展使用
    return {
      // 提供给其他扩展的API
      getEventBus: () => eventBus,
      getAIManager: () => aiManager,
      registerExtension: (extension: any) => extensionManager.registerExtension(extension),
      getIdeAdapter: () => ideAdapter
    };
  } catch (error) {
    vscode.window.showErrorMessage(`插件激活失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// 注册核心命令
function registerCommands(
  context: vscode.ExtensionContext,
  extensionManager: ExtensionManager,
  eventBus: EventBus
): void {
  // 注册显示主面板命令
  context.subscriptions.push(
    vscode.commands.registerCommand('universal-dev-platform.showPanel', () => {
      extensionManager.showMainPanel();
    })
  );

  // 注册重新加载扩展命令
  context.subscriptions.push(
    vscode.commands.registerCommand('universal-dev-platform.reloadExtensions', async () => {
      await extensionManager.reloadExtensions();
      vscode.window.showInformationMessage('已重新加载所有扩展');
    })
  );

  // 注册打开设置命令
  context.subscriptions.push(
    vscode.commands.registerCommand('universal-dev-platform.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:universal-dev-platform');
    })
  );
}

// 导出停用函数
export function deactivate(): void {
  // 清理资源
}
