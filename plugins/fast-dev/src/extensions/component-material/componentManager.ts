/**
 * 组件管理器 - 负责组件的创建、管理和预览
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { IExtensionContext } from '../../types/extension';

// 组件模板接口
interface IComponentTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  content: string;
}

// 组件接口
interface IComponent {
  id: string;
  name: string;
  description?: string;
  filePath?: string;
  language: string;
  framework: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export class ComponentManager {
  private components: Map<string, IComponent> = new Map();
  private templates: Map<string, IComponentTemplate> = new Map();
  private previewPanel: vscode.WebviewPanel | undefined;

  constructor(private context: IExtensionContext) {
    // 加载内置模板
    this.loadBuiltinTemplates();

    // 扫描工作区中的组件
    this.scanComponents();
  }

  /**
   * 加载内置模板
   */
  private loadBuiltinTemplates(): void {
    // React组件模板
    this.templates.set('react-functional', {
      id: 'react-functional',
      name: 'React函数组件',
      description: '基本的React函数组件',
      language: 'typescript',
      framework: 'react',
      content: `import React from 'react';

interface {{ComponentName}}Props {
  // 在此定义组件Props
}

/**
 * {{ComponentName}} 组件
 */
export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = (props) => {
  return (
    <div className="{{component-name}}">
      {/* 组件内容 */}
    </div>
  );
};

export default {{ComponentName}};
`
    });

    // Vue组件模板
    this.templates.set('vue-sfc', {
      id: 'vue-sfc',
      name: 'Vue单文件组件',
      description: '基本的Vue单文件组件',
      language: 'vue',
      framework: 'vue',
      content: `<template>
  <div class="{{component-name}}">
    <!-- 组件内容 -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: '{{ComponentName}}',
  props: {
    // 在此定义组件Props
  },
  setup(props) {
    // 组件逻辑
    return {
      // 返回模板中使用的数据和方法
    };
  }
});
</script>

<style scoped>
.{{component-name}} {
  /* 组件样式 */
}
</style>
`
    });

    // Svelte组件模板
    this.templates.set('svelte', {
      id: 'svelte',
      name: 'Svelte组件',
      description: '基本的Svelte组件',
      language: 'svelte',
      framework: 'svelte',
      content: `<script lang="ts">
  // 组件Props
  export let propName: string = '';

  // 组件逻辑
</script>

<div class="{{component-name}}">
  <!-- 组件内容 -->
</div>

<style>
  .{{component-name}} {
    /* 组件样式 */
  }
</style>
`
    });
  }

  /**
   * 扫描工作区中的组件
   */
  public async scanComponents(): Promise<void> {
    // 清空组件列表
    this.components.clear();

    // 获取工作区文件夹
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    // 遍历工作区文件夹
    for (const folder of workspaceFolders) {
      // 查找组件文件
      const componentFiles = await vscode.workspace.findFiles(
        '{**/*.tsx,**/*.jsx,**/*.vue,**/*.svelte}',
        '**/node_modules/**'
      );

      // 解析组件文件
      for (const file of componentFiles) {
        try {
          // 读取文件内容
          const content = fs.readFileSync(file.fsPath, 'utf8');

          // 尝试解析组件信息
          const componentInfo = this.parseComponentInfo(file.fsPath, content);
          if (componentInfo) {
            this.components.set(componentInfo.id, componentInfo);
          }
        } catch (error) {
          console.error(`解析组件文件失败: ${file.fsPath}`, error);
        }
      }
    }
  }

  /**
   * 解析组件信息
   */
  private parseComponentInfo(filePath: string, content: string): IComponent | null {
    // 获取文件名和扩展名
    const fileName = path.basename(filePath);
    const extname = path.extname(filePath);
    const baseName = path.basename(fileName, extname);

    // 根据文件扩展名判断组件类型
    let language = '';
    let framework = '';

    if (extname === '.tsx' || extname === '.jsx') {
      language = extname.substring(1);
      framework = 'react';
    } else if (extname === '.vue') {
      language = 'vue';
      framework = 'vue';
    } else if (extname === '.svelte') {
      language = 'svelte';
      framework = 'svelte';
    } else {
      return null;
    }

    // 尝试从文件内容中提取组件描述
    let description = '';
    const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatch) {
      description = commentMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/^\*\s*/, ''))
        .filter(line => line)
        .join(' ');
    }

    // 创建组件信息
    return {
      id: `${framework}-${baseName}`,
      name: baseName,
      description,
      filePath,
      language,
      framework
    };
  }

  /**
   * 获取组件列表
   */
  public getComponentList(): IComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * 获取组件
   */
  public getComponent(id: string): IComponent | undefined {
    return this.components.get(id);
  }

  /**
   * 获取模板列表
   */
  public getTemplateList(): IComponentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 获取模板
   */
  public getTemplate(id: string): IComponentTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 创建组件
   */
  public async createComponent(name: string, templateId: string): Promise<IComponent> {
    // 获取模板
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`未找到模板: ${templateId}`);
    }

    // 获取工作区文件夹
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error('没有打开的工作区');
    }

    // 获取组件输出路径
    const config = vscode.workspace.getConfiguration('component-material');
    let outputPath = config.get<string>('outputPath');

    if (!outputPath) {
      // 如果没有配置输出路径，则使用默认路径
      outputPath = 'src/components';
    }

    // 组装完整的输出路径
    const fullOutputPath = path.join(workspaceFolders[0].uri.fsPath, outputPath);

    // 确保输出目录存在
    if (!fs.existsSync(fullOutputPath)) {
      fs.mkdirSync(fullOutputPath, { recursive: true });
    }

    // 生成文件名
    const fileName = `${name}${this.getFileExtension(template.language, template.framework)}`;
    const filePath = path.join(fullOutputPath, fileName);

    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      throw new Error(`组件文件已存在: ${filePath}`);
    }

    // 处理模板内容
    const content = this.processTemplate(template.content, name);

    // 写入文件
    fs.writeFileSync(filePath, content, 'utf8');

    // 创建组件信息
    const component: IComponent = {
      id: `${template.framework}-${name}`,
      name,
      description: `基于${template.name}模板创建的组件`,
      filePath,
      language: template.language,
      framework: template.framework
    };

    // 添加到组件列表
    this.components.set(component.id, component);

    return component;
  }

  /**
   * 处理模板内容
   */
  private processTemplate(content: string, componentName: string): string {
    // 替换组件名称
    const kebabCaseName = this.toKebabCase(componentName);

    return content
      .replace(/{{ComponentName}}/g, componentName)
      .replace(/{{component-name}}/g, kebabCaseName);
  }

  /**
   * 转换为kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(language: string, framework: string): string {
    if (framework === 'react') {
      return language === 'typescript' ? '.tsx' : '.jsx';
    } else if (framework === 'vue') {
      return '.vue';
    } else if (framework === 'svelte') {
      return '.svelte';
    }
    return '.js';
  }

  /**
   * 预览组件
   */
  public async previewComponent(componentId: string): Promise<void> {
    // 获取组件
    const component = this.components.get(componentId);
    if (!component || !component.filePath) {
      throw new Error(`未找到组件: ${componentId}`);
    }

    // 读取组件文件内容
    const content = fs.readFileSync(component.filePath, 'utf8');

    // 如果预览面板已存在，则显示它
    if (this.previewPanel) {
      this.previewPanel.reveal();
      this.updatePreviewContent(component, content);
      return;
    }

    // 创建预览面板
    this.previewPanel = vscode.window.createWebviewPanel(
      'componentPreview',
      `预览: ${component.name}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.path, 'media'))
        ]
      }
    );

    // 更新预览内容
    this.updatePreviewContent(component, content);

    // 处理面板关闭事件
    this.previewPanel.onDidDispose(() => {
      this.previewPanel = undefined;
    });
  }

  /**
   * 更新预览内容
   */
  private updatePreviewContent(component: IComponent, content: string): void {
    if (!this.previewPanel) {
      return;
    }

    // 设置预览面板HTML内容
    this.previewPanel.webview.html = this.getPreviewHtml(component, content);
  }

  /**
   * 获取预览HTML
   */
  private getPreviewHtml(component: IComponent, content: string): string {
    // 根据组件类型生成预览HTML
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>预览: ${component.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }
          .preview-header {
            margin-bottom: 20px;
          }
          .preview-title {
            font-size: 18px;
            font-weight: bold;
          }
          .preview-description {
            color: #666;
            margin-top: 5px;
          }
          .preview-content {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
            margin-top: 20px;
          }
          .preview-code {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            margin-top: 20px;
            overflow: auto;
            font-family: 'Courier New', Courier, monospace;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="preview-header">
          <div class="preview-title">${component.name}</div>
          <div class="preview-description">${component.description || ''}</div>
        </div>

        <div class="preview-code">${this.escapeHtml(content)}</div>

        <div class="preview-content">
          <p>组件预览区域</p>
          <p>注意: 实际预览功能需要在实现中集成组件渲染引擎</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 转义HTML
   */
  private escapeHtml(html: string): string {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 生成组件代码
   */
  public generateComponentCode(componentId: string): { importCode: string; usageCode: string } {
    // 获取组件
    const component = this.components.get(componentId);
    if (!component) {
      throw new Error(`未找到组件: ${componentId}`);
    }

    // 根据组件类型生成代码
    if (component.framework === 'react') {
      // 计算导入路径
      const importPath = component.filePath
        ? this.calculateRelativeImportPath(component.filePath)
        : `./${component.name}`;

      return {
        importCode: `import { ${component.name} } from '${importPath}';`,
        usageCode: `<${component.name} />`
      };
    } else if (component.framework === 'vue') {
      // 计算导入路径
      const importPath = component.filePath
        ? this.calculateRelativeImportPath(component.filePath)
        : `./${component.name}.vue`;

      return {
        importCode: `import ${component.name} from '${importPath}';`,
        usageCode: `<${this.toKebabCase(component.name)} />`
      };
    } else if (component.framework === 'svelte') {
      // 计算导入路径
      const importPath = component.filePath
        ? this.calculateRelativeImportPath(component.filePath)
        : `./${component.name}.svelte`;

      return {
        importCode: `import ${component.name} from '${importPath}';`,
        usageCode: `<${component.name} />`
      };
    }

    // 默认返回空代码
    return {
      importCode: '',
      usageCode: ''
    };
  }

  /**
   * 计算相对导入路径
   */
  private calculateRelativeImportPath(filePath: string): string {
    // 获取活动编辑器
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      // 如果没有活动编辑器，则返回组件名称
      return `./${path.basename(filePath, path.extname(filePath))}`;
    }

    // 获取活动文件路径
    const activeFilePath = editor.document.uri.fsPath;
    const activeDir = path.dirname(activeFilePath);

    // 计算相对路径
    let relativePath = path.relative(activeDir, filePath);

    // 确保路径以 ./ 或 ../ 开头
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }

    // 移除扩展名
    return relativePath.replace(/\.[^/.]+$/, '');
  }
}
