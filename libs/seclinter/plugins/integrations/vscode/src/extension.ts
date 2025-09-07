/**
 * SecLinter VS Code 扩展
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createPluginManager } from '../../../core/pluginManager';
import { IntegrationType } from '../../../core/types';

// 诊断集合
const diagnosticCollection = vscode.languages.createDiagnosticCollection('seclinter');

// 插件管理器
let pluginManager: any;

// 安全问题数据
interface SecurityIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  ruleId: string;
  plugin: string;
  suggestion?: string;
  fix?: string;
}

// 安全问题存储
const securityIssues: SecurityIssue[] = [];

// 激活扩展
export async function activate(context: vscode.ExtensionContext) {
  console.log('SecLinter extension is now active');

  // 初始化插件管理器
  await initPluginManager(context);

  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand('seclinter.scanWorkspace', scanWorkspace),
    vscode.commands.registerCommand('seclinter.scanFile', scanCurrentFile),
    vscode.commands.registerCommand('seclinter.fixIssue', fixIssue),
    vscode.commands.registerCommand('seclinter.ignoreIssue', ignoreIssue),
    vscode.commands.registerCommand('seclinter.showDocumentation', showDocumentation)
  );

  // 创建安全问题视图
  const issuesProvider = new SecurityIssuesProvider();
  vscode.window.registerTreeDataProvider('seclinterIssues', issuesProvider);

  // 创建插件视图
  const pluginsProvider = new PluginsProvider();
  vscode.window.registerTreeDataProvider('seclinterPlugins', pluginsProvider);

  // 监听文件保存事件
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(document => {
      const config = vscode.workspace.getConfiguration('seclinter');
      if (config.get<boolean>('enableAutoScan', true)) {
        scanDocument(document);
      }
    })
  );

  // 监听文件打开事件
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      const config = vscode.workspace.getConfiguration('seclinter');
      if (config.get<boolean>('enableAutoScan', true)) {
        scanDocument(document);
      }
    })
  );

  // 显示欢迎信息
  vscode.window.showInformationMessage('SecLinter is now active. Scan your workspace for security issues!');
}

// 初始化插件管理器
async function initPluginManager(context: vscode.ExtensionContext) {
  try {
    const config = vscode.workspace.getConfiguration('seclinter');

    // 获取插件目录
    const pluginsDir = config.get<string>('pluginsDirectory', 'node_modules');
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('SecLinter: No workspace folder found');
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const pluginsPath = path.join(workspacePath, pluginsDir);

    // 创建插件管理器
    pluginManager = createPluginManager({
      type: IntegrationType.VSCODE,
      autoDiscover: true,
      pluginsDir: pluginsPath,
      plugins: {}
    });

    await pluginManager.init();

    // 获取启用的插件
    const enabledPlugins = config.get<string[]>('enabledPlugins', []);

    // 如果未指定启用的插件，则启用所有插件
    if (enabledPlugins.length === 0) {
      const plugins = pluginManager.getPlugins();
      for (const plugin of plugins) {
        plugin.config.enabled = true;
      }
    } else {
      // 只启用指定的插件
      const plugins = pluginManager.getPlugins();
      for (const plugin of plugins) {
        plugin.config.enabled = enabledPlugins.includes(plugin.meta.name);
      }
    }

    console.log(`SecLinter: Initialized with ${pluginManager.getPlugins().length} plugins`);
  } catch (error) {
    vscode.window.showErrorMessage(`SecLinter: Failed to initialize plugin manager: ${(error as Error).message}`);
    console.error(error);
  }
}

// 扫描工作区
async function scanWorkspace() {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('SecLinter: No workspace folder found');
      return;
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'SecLinter: Scanning workspace for security issues...',
      cancellable: true
    }, async (progress, token) => {
      try {
        // 清除之前的诊断信息
        diagnosticCollection.clear();
        securityIssues.length = 0;

        // 扫描工作区
        const workspacePath = workspaceFolders[0].uri.fsPath;

        const report = await pluginManager.scan({
          projectPath: workspacePath,
          parallel: true
        });

        // 处理扫描结果
        processResults(report.results);

        // 显示扫描结果
        const issueCount = report.stats.issuesFound;
        vscode.window.showInformationMessage(
          `SecLinter: Found ${issueCount} security ${issueCount === 1 ? 'issue' : 'issues'}`
        );

        // 刷新视图
        vscode.commands.executeCommand('seclinterIssues.refresh');

        return report;
      } catch (error) {
        vscode.window.showErrorMessage(`SecLinter: Scan failed: ${(error as Error).message}`);
        throw error;
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`SecLinter: ${(error as Error).message}`);
  }
}

// 扫描当前文件
async function scanCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('SecLinter: No active editor');
    return;
  }

  await scanDocument(editor.document);
}

// 扫描文档
async function scanDocument(document: vscode.TextDocument) {
  try {
    // 只扫描支持的文件类型
    const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'html', 'css'];
    if (!supportedLanguages.includes(document.languageId)) {
      return;
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `SecLinter: Scanning ${path.basename(document.fileName)}...`,
      cancellable: true
    }, async (progress, token) => {
      try {
        // 清除当前文件的诊断信息
        diagnosticCollection.delete(document.uri);

        // 从安全问题列表中移除当前文件的问题
        const fileIssues = securityIssues.filter(issue => issue.file === document.fileName);
        for (const issue of fileIssues) {
          const index = securityIssues.indexOf(issue);
          if (index !== -1) {
            securityIssues.splice(index, 1);
          }
        }

        // 扫描文件
        const report = await pluginManager.scan({
          projectPath: path.dirname(document.fileName),
          targetFiles: [document.fileName]
        });

        // 处理扫描结果
        processResults(report.results);

        // 刷新视图
        vscode.commands.executeCommand('seclinterIssues.refresh');

        return report;
      } catch (error) {
        vscode.window.showErrorMessage(`SecLinter: Scan failed: ${(error as Error).message}`);
        throw error;
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`SecLinter: ${(error as Error).message}`);
  }
}

// 处理扫描结果
function processResults(results: any[]) {
  const config = vscode.workspace.getConfiguration('seclinter');
  const minSeverity = config.get<string>('severityLevel', 'medium');
  const severityLevels = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
  const minSeverityLevel = severityLevels[minSeverity as keyof typeof severityLevels];

  // 按文件分组诊断信息
  const diagnosticMap = new Map<string, vscode.Diagnostic[]>();

  for (const result of results) {
    // 跳过低于最低严重程度的问题
    const resultSeverityLevel = severityLevels[result.level as keyof typeof severityLevels];
    if (resultSeverityLevel < minSeverityLevel) {
      continue;
    }

    // 如果没有文件信息，跳过
    if (!result.file) {
      continue;
    }

    // 创建诊断信息
    const line = Math.max(0, (result.line || 1) - 1);
    const column = result.column || 0;
    const range = new vscode.Range(line, column, line, column + 1);

    // 设置诊断严重程度
    let diagnosticSeverity: vscode.DiagnosticSeverity;
    switch (result.level) {
      case 'critical':
        diagnosticSeverity = vscode.DiagnosticSeverity.Error;
        break;
      case 'high':
        diagnosticSeverity = vscode.DiagnosticSeverity.Error;
        break;
      case 'medium':
        diagnosticSeverity = vscode.DiagnosticSeverity.Warning;
        break;
      case 'low':
        diagnosticSeverity = vscode.DiagnosticSeverity.Information;
        break;
      default:
        diagnosticSeverity = vscode.DiagnosticSeverity.Hint;
    }

    const diagnostic = new vscode.Diagnostic(
      range,
      `${result.message} (${result.plugin})`,
      diagnosticSeverity
    );

    diagnostic.code = result.ruleId;
    diagnostic.source = 'SecLinter';

    // 添加到诊断映射
    const filePath = result.file;
    if (!diagnosticMap.has(filePath)) {
      diagnosticMap.set(filePath, []);
    }
    diagnosticMap.get(filePath)!.push(diagnostic);

    // 添加到安全问题列表
    securityIssues.push({
      file: filePath,
      line: line + 1,
      column,
      message: result.message,
      severity: result.level,
      ruleId: result.ruleId,
      plugin: result.plugin,
      suggestion: result.suggestion,
      fix: result.fix
    });
  }

  // 设置诊断信息
  for (const [filePath, diagnostics] of diagnosticMap.entries()) {
    const uri = vscode.Uri.file(filePath);
    diagnosticCollection.set(uri, diagnostics);
  }
}

// 修复安全问题
async function fixIssue(issue: SecurityIssue) {
  if (!issue.fix) {
    vscode.window.showWarningMessage('SecLinter: No fix available for this issue');
    return;
  }

  try {
    // 打开文件
    const document = await vscode.workspace.openTextDocument(issue.file);
    const editor = await vscode.window.showTextDocument(document);

    // 获取问题所在行
    const line = issue.line - 1;
    const lineText = document.lineAt(line).text;

    // 创建编辑
    const edit = new vscode.WorkspaceEdit();
    const range = new vscode.Range(
      line, 0,
      line, lineText.length
    );

    edit.replace(document.uri, range, issue.fix);

    // 应用编辑
    await vscode.workspace.applyEdit(edit);

    // 重新扫描文件
    await scanDocument(document);

    vscode.window.showInformationMessage('SecLinter: Issue fixed');
  } catch (error) {
    vscode.window.showErrorMessage(`SecLinter: Failed to fix issue: ${(error as Error).message}`);
  }
}

// 忽略安全问题
async function ignoreIssue(issue: SecurityIssue) {
  try {
    // 打开文件
    const document = await vscode.workspace.openTextDocument(issue.file);
    const editor = await vscode.window.showTextDocument(document);

    // 获取问题所在行
    const line = issue.line - 1;
    const lineText = document.lineAt(line).text;

    // 创建编辑
    const edit = new vscode.WorkspaceEdit();
    const range = new vscode.Range(
      line, 0,
      line, 0
    );

    // 添加忽略注释
    const indentation = lineText.match(/^\s*/)?.[0] || '';
    const comment = `${indentation}// seclinter-disable-next-line ${issue.ruleId}\n`;

    edit.insert(document.uri, range, comment);

    // 应用编辑
    await vscode.workspace.applyEdit(edit);

    // 重新扫描文件
    await scanDocument(document);

    vscode.window.showInformationMessage('SecLinter: Issue ignored');
  } catch (error) {
    vscode.window.showErrorMessage(`SecLinter: Failed to ignore issue: ${(error as Error).message}`);
  }
}

// 显示安全文档
function showDocumentation(issue: SecurityIssue) {
  // 创建 Markdown 文档
  const content = new vscode.MarkdownString();
  content.appendMarkdown(`# ${issue.ruleId}\n\n`);
  content.appendMarkdown(`**Severity:** ${issue.severity}\n\n`);
  content.appendMarkdown(`**Plugin:** ${issue.plugin}\n\n`);
  content.appendMarkdown(`**Issue:** ${issue.message}\n\n`);

  if (issue.suggestion) {
    content.appendMarkdown(`**Suggestion:** ${issue.suggestion}\n\n`);
  }

  // 显示文档面板
  const panel = vscode.window.createWebviewPanel(
    'seclinterDoc',
    `SecLinter: ${issue.ruleId}`,
    vscode.ViewColumn.Beside,
    {}
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SecLinter Documentation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          padding: 20px;
          line-height: 1.5;
        }
        h1 {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .severity {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-weight: bold;
          color: white;
        }
        .critical { background-color: #d93025; }
        .high { background-color: #f29900; }
        .medium { background-color: #4285f4; }
        .low { background-color: #137333; }
        .info { background-color: #5f6368; }
        pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 3px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>${issue.ruleId}</h1>
      <p><strong>Severity:</strong> <span class="severity ${issue.severity}">${issue.severity}</span></p>
      <p><strong>Plugin:</strong> ${issue.plugin}</p>
      <p><strong>Issue:</strong> ${issue.message}</p>
      ${issue.suggestion ? `<p><strong>Suggestion:</strong> ${issue.suggestion}</p>` : ''}
      ${issue.fix ? `<p><strong>Fix:</strong></p><pre>${issue.fix}</pre>` : ''}
    </body>
    </html>
  `;
}

// 安全问题树视图项
class SecurityIssueItem extends vscode.TreeItem {
  constructor(
    public readonly issue: SecurityIssue,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(issue.message, collapsibleState);

    this.tooltip = `${issue.message} (${issue.ruleId})`;
    this.description = `${path.basename(issue.file)}:${issue.line}`;

    // 设置图标
    switch (issue.severity) {
      case 'critical':
      case 'high':
        this.iconPath = new vscode.ThemeIcon('error');
        break;
      case 'medium':
        this.iconPath = new vscode.ThemeIcon('warning');
        break;
      case 'low':
      case 'info':
        this.iconPath = new vscode.ThemeIcon('info');
        break;
    }

    // 设置命令
    this.command = {
      command: 'vscode.open',
      arguments: [
        vscode.Uri.file(issue.file),
        {
          selection: new vscode.Range(
            issue.line - 1, issue.column,
            issue.line - 1, issue.column + 1
          )
        }
      ],
      title: 'Open File'
    };

    // 设置上下文菜单
    this.contextValue = issue.fix ? 'issueWithFix' : 'issue';
  }
}

// 安全问题树视图提供者
class SecurityIssuesProvider implements vscode.TreeDataProvider<SecurityIssueItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SecurityIssueItem | undefined | null | void> = new vscode.EventEmitter<SecurityIssueItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SecurityIssueItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SecurityIssueItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SecurityIssueItem): Thenable<SecurityIssueItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    // 按严重程度排序
    const sortedIssues = [...securityIssues].sort((a, b) => {
      const severityLevels = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
      return severityLevels[b.severity] - severityLevels[a.severity];
    });

    return Promise.resolve(
      sortedIssues.map(issue => new SecurityIssueItem(issue, vscode.TreeItemCollapsibleState.None))
    );
  }
}

// 插件树视图项
class PluginItem extends vscode.TreeItem {
  constructor(
    public readonly plugin: any,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(plugin.meta.name, collapsibleState);

    this.tooltip = plugin.meta.description;
    this.description = `v${plugin.meta.version}`;
    this.iconPath = new vscode.ThemeIcon('package');

    // 设置上下文菜单
    this.contextValue = plugin.config.enabled ? 'enabledPlugin' : 'disabledPlugin';
  }
}

// 插件树视图提供者
class PluginsProvider implements vscode.TreeDataProvider<PluginItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<PluginItem | undefined | null | void> = new vscode.EventEmitter<PluginItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<PluginItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PluginItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: PluginItem): Thenable<PluginItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    if (!pluginManager) {
      return Promise.resolve([]);
    }

    const plugins = pluginManager.getPlugins();

    return Promise.resolve(
      plugins.map((plugin: any) => new PluginItem(plugin, vscode.TreeItemCollapsibleState.None))
    );
  }
}

// 停用扩展
export function deactivate() {
  // 清除诊断信息
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
}
