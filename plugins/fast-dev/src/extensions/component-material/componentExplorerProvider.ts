/**
 * 组件浏览器视图提供者 - 用于在VSCode侧边栏中显示组件列表
 */
import * as vscode from 'vscode';
import { ComponentManager } from './componentManager';
import { IExtensionContext } from '../../types/extension';

// 组件树节点类型
enum ComponentNodeType {
  Category = 'category',
  Component = 'component'
}

// 组件树节点
class ComponentTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: ComponentNodeType,
    public readonly id?: string,
    public readonly description?: string,
    public readonly framework?: string
  ) {
    super(
      label,
      type === ComponentNodeType.Category
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );

    // 设置节点图标
    if (type === ComponentNodeType.Category) {
      this.iconPath = new vscode.ThemeIcon('folder');
    } else {
      // 根据框架类型设置不同的图标
      switch (framework) {
        case 'react':
          this.iconPath = new vscode.ThemeIcon('symbol-class');
          break;
        case 'vue':
          this.iconPath = new vscode.ThemeIcon('symbol-module');
          break;
        case 'svelte':
          this.iconPath = new vscode.ThemeIcon('symbol-interface');
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('symbol-misc');
          break;
      }
    }

    // 设置描述
    this.description = description;

    // 设置工具提示
    this.tooltip = description || label;

    // 设置上下文值（用于菜单显示条件）
    this.contextValue = type;

    // 为组件节点设置命令
    if (type === ComponentNodeType.Component && id) {
      this.command = {
        command: 'component-material.previewComponent',
        title: '预览组件',
        arguments: [id]
      };
    }
  }
}

export class ComponentExplorerProvider implements vscode.TreeDataProvider<ComponentTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ComponentTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private context: IExtensionContext,
    private componentManager: ComponentManager
  ) {}

  /**
   * 刷新视图
   */
  public refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * 获取树项
   */
  public getTreeItem(element: ComponentTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * 获取子项
   */
  public getChildren(element?: ComponentTreeItem): Thenable<ComponentTreeItem[]> {
    if (!element) {
      // 根节点，返回框架分类
      return Promise.resolve(this.getFrameworkCategories());
    } else if (element.type === ComponentNodeType.Category) {
      // 分类节点，返回该分类下的组件
      return Promise.resolve(this.getComponentsByFramework(element.label));
    } else {
      // 组件节点，没有子节点
      return Promise.resolve([]);
    }
  }

  /**
   * 获取框架分类
   */
  private getFrameworkCategories(): ComponentTreeItem[] {
    // 获取所有组件
    const components = this.componentManager.getComponentList();

    // 统计各框架的组件数量
    const frameworkCounts = new Map<string, number>();
    components.forEach(component => {
      const count = frameworkCounts.get(component.framework) || 0;
      frameworkCounts.set(component.framework, count + 1);
    });

    // 创建框架分类节点
    const categories: ComponentTreeItem[] = [];

    // 添加"所有组件"分类
    categories.push(
      new ComponentTreeItem(
        '所有组件',
        ComponentNodeType.Category,
        undefined,
        `${components.length}个组件`
      )
    );

    // 添加各框架分类
    frameworkCounts.forEach((count, framework) => {
      let frameworkName = framework;

      // 美化框架名称
      switch (framework) {
        case 'react':
          frameworkName = 'React';
          break;
        case 'vue':
          frameworkName = 'Vue';
          break;
        case 'svelte':
          frameworkName = 'Svelte';
          break;
      }

      categories.push(
        new ComponentTreeItem(
          frameworkName,
          ComponentNodeType.Category,
          undefined,
          `${count}个组件`
        )
      );
    });

    return categories;
  }

  /**
   * 获取指定框架的组件
   */
  private getComponentsByFramework(frameworkName: string): ComponentTreeItem[] {
    // 获取所有组件
    const components = this.componentManager.getComponentList();

    // 过滤组件
    const filteredComponents = components.filter(component => {
      if (frameworkName === '所有组件') {
        return true;
      }

      // 匹配框架名称
      switch (frameworkName) {
        case 'React':
          return component.framework === 'react';
        case 'Vue':
          return component.framework === 'vue';
        case 'Svelte':
          return component.framework === 'svelte';
        default:
          return component.framework === frameworkName.toLowerCase();
      }
    });

    // 创建组件节点
    return filteredComponents.map(component => {
      return new ComponentTreeItem(
        component.name,
        ComponentNodeType.Component,
        component.id,
        component.description,
        component.framework
      );
    });
  }

  /**
   * 获取父项
   */
  public getParent(element: ComponentTreeItem): vscode.ProviderResult<ComponentTreeItem> {
    // 组件节点的父节点是框架分类
    if (element.type === ComponentNodeType.Component && element.framework) {
      let frameworkName = element.framework;

      // 美化框架名称
      switch (element.framework) {
        case 'react':
          frameworkName = 'React';
          break;
        case 'vue':
          frameworkName = 'Vue';
          break;
        case 'svelte':
          frameworkName = 'Svelte';
          break;
      }

      return new ComponentTreeItem(
        frameworkName,
        ComponentNodeType.Category
      );
    }

    // 框架分类的父节点是根节点
    return null;
  }
}
