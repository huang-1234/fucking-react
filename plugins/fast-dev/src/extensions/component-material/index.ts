/**
 * 组件物料库扩展 - 入口文件
 */
import * as vscode from 'vscode';
import { ComponentManager } from './componentManager';
import { ComponentExplorerProvider } from './componentExplorerProvider';
import { IExtensionContext } from '../../types/extension';

// 导出激活函数
export async function activate(context: IExtensionContext): Promise<any> {
  // 创建组件管理器
  const componentManager = new ComponentManager(context);

  // 创建组件浏览器视图提供者
  const componentExplorerProvider = new ComponentExplorerProvider(context, componentManager);

  // 注册组件浏览器视图
  const treeView = vscode.window.createTreeView('component-material-explorer', {
    treeDataProvider: componentExplorerProvider,
    showCollapseAll: true
  });

  // 注册命令
  registerCommands(context, componentManager, componentExplorerProvider);

  // 注册事件监听器
  registerEventListeners(context, componentManager, componentExplorerProvider);

  // 返回API
  return {
    componentManager,
    createComponent: (name: string, template: string) => componentManager.createComponent(name, template),
    getComponentList: () => componentManager.getComponentList(),
    openUI: () => {
      vscode.commands.executeCommand('component-material-explorer.focus');
    }
  };
}

// 注册命令
function registerCommands(
  context: IExtensionContext,
  componentManager: ComponentManager,
  explorerProvider: ComponentExplorerProvider
): void {
  // 创建组件命令
  context.subscriptions.push(
    vscode.commands.registerCommand('component-material.createComponent', async () => {
      // 获取组件名称
      const componentName = await vscode.window.showInputBox({
        prompt: '请输入组件名称',
        placeHolder: 'MyComponent'
      });

      if (!componentName) {
        return;
      }

      // 选择组件模板
      const templates = componentManager.getTemplateList();
      const templateItems = templates.map(template => ({
        label: template.name,
        description: template.description,
        detail: template.language
      }));

      const selectedTemplate = await vscode.window.showQuickPick(templateItems, {
        placeHolder: '选择组件模板'
      });

      if (!selectedTemplate) {
        return;
      }

      // 创建组件
      try {
        const template = templates.find(t => t.name === selectedTemplate.label);
        if (!template) {
          throw new Error('未找到所选模板');
        }

        const component = await componentManager.createComponent(componentName, template.id);

        // 显示成功消息
        vscode.window.showInformationMessage(`组件 ${componentName} 创建成功`);

        // 刷新组件浏览器
        explorerProvider.refresh();

        // 打开组件文件
        if (component.filePath) {
          const document = await vscode.workspace.openTextDocument(component.filePath);
          await vscode.window.showTextDocument(document);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`创建组件失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // 预览组件命令
  context.subscriptions.push(
    vscode.commands.registerCommand('component-material.previewComponent', async (componentId: string) => {
      try {
        await componentManager.previewComponent(componentId);
      } catch (error) {
        vscode.window.showErrorMessage(`预览组件失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // 插入组件命令
  context.subscriptions.push(
    vscode.commands.registerCommand('component-material.insertComponent', async (componentId: string) => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          throw new Error('没有活动的编辑器');
        }

        const component = componentManager.getComponent(componentId);
        if (!component) {
          throw new Error('未找到组件');
        }

        // 获取组件导入代码和使用代码
        const { importCode, usageCode } = componentManager.generateComponentCode(componentId);

        // 插入代码
        await editor.edit(editBuilder => {
          // 在文件顶部插入导入代码
          editBuilder.insert(new vscode.Position(0, 0), importCode + '\n\n');

          // 在光标位置插入使用代码
          const position = editor.selection.active;
          editBuilder.insert(position, usageCode);
        });

        vscode.window.showInformationMessage(`组件 ${component.name} 已插入`);
      } catch (error) {
        vscode.window.showErrorMessage(`插入组件失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );
}

// 注册事件监听器
function registerEventListeners(
  context: IExtensionContext,
  componentManager: ComponentManager,
  explorerProvider: ComponentExplorerProvider
): void {
  // 监听AI事件，用于智能组件生成
  context.eventBus.on('ai.code.generation.completed', (data: any) => {
    if (data.type === 'component') {
      // 刷新组件浏览器
      explorerProvider.refresh();
    }
  });

  // 监听工作区变化事件
  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    // 重新扫描组件
    componentManager.scanComponents();
    explorerProvider.refresh();
  }, null, context.subscriptions);
}
