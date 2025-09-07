/**
 * IDE适配器 - 提供对VSCode和Cursor的统一接口
 * 使插件能够在不同的IDE中运行
 */
import * as vscode from 'vscode';

// IDE类型枚举
export enum IDEType {
  VSCode = 'vscode',
  Cursor = 'cursor',
  Unknown = 'unknown'
}

export class IDEAdapter {
  private ideType: IDEType;

  constructor(private context: vscode.ExtensionContext) {
    this.ideType = this.detectIDEType();
    console.log(`检测到IDE类型: ${this.ideType}`);
  }

  /**
   * 检测当前运行的IDE类型
   */
  private detectIDEType(): IDEType {
    // 检查是否为Cursor
    // Cursor通常会在环境变量或某些特定API中标识自己
    const isCursor = vscode.env.appName.toLowerCase().includes('cursor');

    if (isCursor) {
      return IDEType.Cursor;
    }

    // 检查是否为VSCode
    const isVSCode = vscode.env.appName.toLowerCase().includes('visual studio code') ||
                     vscode.env.appName.toLowerCase().includes('vscode');

    if (isVSCode) {
      return IDEType.VSCode;
    }

    // 默认返回未知
    return IDEType.Unknown;
  }

  /**
   * 获取当前IDE类型
   */
  public getIDEType(): IDEType {
    return this.ideType;
  }

  /**
   * 检查是否为特定IDE
   */
  public isIDE(type: IDEType): boolean {
    return this.ideType === type;
  }

  /**
   * 获取IDE特定的配置
   */
  public getIDESpecificConfig<T>(key: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration('universal-dev-platform');
    const ideSpecificKey = `${this.ideType}.${key}`;

    // 先尝试获取IDE特定的配置
    if (config.has(ideSpecificKey)) {
      return config.get<T>(ideSpecificKey, defaultValue);
    }

    // 如果没有IDE特定的配置，则返回通用配置
    return config.get<T>(key, defaultValue);
  }

  /**
   * 创建适合当前IDE的Webview面板
   */
  public createWebviewPanel(
    viewType: string,
    title: string,
    showOptions: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean },
    options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ): vscode.WebviewPanel {
    // 根据不同IDE调整选项
    let adjustedOptions = { ...options };

    if (this.ideType === IDEType.Cursor) {
      // Cursor可能需要特定的Webview选项
      adjustedOptions = {
        ...adjustedOptions,
        // 添加Cursor特定的选项
      };
    }

    return vscode.window.createWebviewPanel(viewType, title, showOptions, adjustedOptions);
  }

  /**
   * 获取IDE特定的资源路径
   */
  public getResourcePath(relativePath: string): vscode.Uri {
    return vscode.Uri.file(
      vscode.Uri.joinPath(this.context.extensionUri, relativePath).fsPath
    );
  }

  /**
   * 获取IDE特定的Webview资源路径
   */
  public getWebviewResourceUri(webview: vscode.Webview, relativePath: string): vscode.Uri {
    const diskPath = vscode.Uri.joinPath(this.context.extensionUri, relativePath);
    return webview.asWebviewUri(diskPath);
  }

  /**
   * 显示IDE特定的通知
   */
  public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    switch (type) {
      case 'info':
        vscode.window.showInformationMessage(message);
        break;
      case 'warning':
        vscode.window.showWarningMessage(message);
        break;
      case 'error':
        vscode.window.showErrorMessage(message);
        break;
    }
  }

  /**
   * 执行IDE特定的命令
   */
  public async executeIDECommand(command: string, ...args: any[]): Promise<any> {
    // 某些命令在不同IDE中可能有不同的ID
    let ideSpecificCommand = command;

    // 映射命令ID
    if (this.ideType === IDEType.Cursor) {
      // 例如，如果VSCode和Cursor对于某些功能有不同的命令ID
      const commandMap: Record<string, string> = {
        'workbench.action.openSettings': 'cursor.action.openSettings',
        // 添加其他命令映射
      };

      if (commandMap[command]) {
        ideSpecificCommand = commandMap[command];
      }
    }

    return vscode.commands.executeCommand(ideSpecificCommand, ...args);
  }
}
