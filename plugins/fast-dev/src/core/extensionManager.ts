/**
 * 扩展管理器 - 负责加载、管理和协调功能扩展
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EventBus } from './eventBus';
import { AIManager } from './aiManager';
import { IDEAdapter } from './ideAdapter';
import { IExtension } from '../types/extension';
import { ExtensionEvents } from '../types/events';

export class ExtensionManager {
  private extensions: Map<string, IExtension> = new Map();
  private mainPanel: vscode.WebviewPanel | undefined;

  constructor(
    private context: vscode.ExtensionContext,
    private eventBus: EventBus,
    private aiManager: AIManager,
    private ideAdapter: IDEAdapter
  ) {}

  /**
   * 加载所有扩展
   */
  public async loadExtensions(): Promise<void> {
    try {
      // 获取扩展目录
      const extensionsDir = path.join(this.context.extensionPath, 'extensions');

      // 检查扩展目录是否存在
      if (fs.existsSync(extensionsDir)) {
        // 读取扩展目录下的所有子目录
        const entries = fs.readdirSync(extensionsDir, { withFileTypes: true });
        const extensionDirs = entries.filter(entry => entry.isDirectory());

        // 加载每个扩展
        for (const dir of extensionDirs) {
          await this.loadExtension(path.join(extensionsDir, dir.name));
        }
      }

      // 发布扩展加载完成事件
      this.eventBus.emit(ExtensionEvents.EXTENSIONS_LOADED, {
        extensionCount: this.extensions.size
      });
    } catch (error) {
      console.error('加载扩展失败:', error);
      throw error;
    }
  }

  /**
   * 加载单个扩展
   */
  private async loadExtension(extensionPath: string): Promise<void> {
    try {
      // 检查扩展清单文件
      const manifestPath = path.join(extensionPath, 'extension.json');
      if (!fs.existsSync(manifestPath)) {
        console.warn(`扩展目录 ${extensionPath} 中未找到 extension.json 文件`);
        return;
      }

      // 读取扩展清单
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // 验证扩展清单
      if (!manifest.id || !manifest.main) {
        console.warn(`扩展 ${extensionPath} 的清单文件无效`);
        return;
      }

      // 加载扩展主模块
      const mainPath = path.join(extensionPath, manifest.main);
      if (!fs.existsSync(mainPath)) {
        console.warn(`扩展 ${manifest.id} 的主模块文件不存在: ${mainPath}`);
        return;
      }

      // 动态导入扩展模块
      const extensionModule = await import(mainPath);

      // 检查并激活扩展
      if (typeof extensionModule.activate !== 'function') {
        console.warn(`扩展 ${manifest.id} 没有导出 activate 函数`);
        return;
      }

      // 创建扩展上下文
      const extensionContext = {
        id: manifest.id,
        path: extensionPath,
        manifest,
        subscriptions: [],
        eventBus: this.eventBus,
        aiManager: this.aiManager,
        ideAdapter: this.ideAdapter
      };

      // 激活扩展
      const extension = await extensionModule.activate(extensionContext);

      // 注册扩展
      this.registerExtension({
        id: manifest.id,
        name: manifest.name || manifest.id,
        description: manifest.description || '',
        version: manifest.version || '1.0.0',
        api: extension || {},
        context: extensionContext
      });

      console.log(`已加载扩展: ${manifest.id}`);
    } catch (error) {
      console.error(`加载扩展失败: ${extensionPath}`, error);
    }
  }

  /**
   * 注册扩展
   */
  public registerExtension(extension: IExtension): void {
    if (this.extensions.has(extension.id)) {
      console.warn(`扩展 ${extension.id} 已存在，将被覆盖`);
    }

    this.extensions.set(extension.id, extension);

    // 发布扩展注册事件
    this.eventBus.emit(ExtensionEvents.EXTENSION_REGISTERED, {
      extensionId: extension.id,
      extensionName: extension.name
    });
  }

  /**
   * 获取已注册的扩展
   */
  public getExtension(id: string): IExtension | undefined {
    return this.extensions.get(id);
  }

  /**
   * 获取所有已注册的扩展
   */
  public getAllExtensions(): IExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * 重新加载所有扩展
   */
  public async reloadExtensions(): Promise<void> {
    // 清空扩展列表
    this.extensions.clear();

    // 重新加载所有扩展
    await this.loadExtensions();
  }

  /**
   * 显示主面板
   */
  public showMainPanel(): void {
    // 如果面板已存在，则显示它
    if (this.mainPanel) {
      this.mainPanel.reveal();
      return;
    }

    // 创建新的面板
    this.mainPanel = vscode.window.createWebviewPanel(
      'universalDevPlatform',
      '通用开发平台',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ]
      }
    );

    // 设置面板HTML内容
    this.mainPanel.webview.html = this.getWebviewContent();

    // 处理面板消息
    this.mainPanel.webview.onDidReceiveMessage(
      message => {
        // 处理来自Webview的消息
        this.handleWebviewMessage(message);
      },
      undefined,
      this.context.subscriptions
    );

    // 处理面板关闭事件
    this.mainPanel.onDidDispose(
      () => {
        this.mainPanel = undefined;
      },
      null,
      this.context.subscriptions
    );
  }

  /**
   * 获取Webview内容
   */
  private getWebviewContent(): string {
    // 返回基本的HTML内容
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>通用开发平台</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 0;
            margin: 0;
          }
          .container {
            padding: 20px;
          }
          .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .extension-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .extension-card {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 10px;
            width: 200px;
          }
          .extension-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .extension-description {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">通用开发平台</div>
          <div class="extension-list">
            ${this.renderExtensionList()}
          </div>
        </div>
        <script>
          // 与扩展通信的代码
          const vscode = acquireVsCodeApi();

          // 发送消息到扩展
          function sendMessage(message) {
            vscode.postMessage(message);
          }

          // 监听来自扩展的消息
          window.addEventListener('message', event => {
            const message = event.data;
            // 处理消息
          });
        </script>
      </body>
      </html>
    `;
  }

  /**
   * 渲染扩展列表
   */
  private renderExtensionList(): string {
    let html = '';

    this.extensions.forEach(extension => {
      html += `
        <div class="extension-card" data-id="${extension.id}">
          <div class="extension-name">${extension.name}</div>
          <div class="extension-description">${extension.description}</div>
        </div>
      `;
    });

    if (html === '') {
      html = '<div>暂无已加载的扩展</div>';
    }

    return html;
  }

  /**
   * 处理Webview消息
   */
  private handleWebviewMessage(message: any): void {
    switch (message.command) {
      case 'openExtension':
        // 处理打开扩展的请求
        if (message.extensionId && this.extensions.has(message.extensionId)) {
          const extension = this.extensions.get(message.extensionId);
          if (extension?.api?.openUI) {
            extension.api.openUI();
          }
        }
        break;

      default:
        // 转发消息到事件总线
        this.eventBus.emit('webview.message', message);
        break;
    }
  }
}
