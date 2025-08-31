import { type ASTNode, ASTNodeType } from '../../common/md';
import { type MarkdownPlugin, type PluginContext } from '../plugin';
import { PluginHook, PluginType } from '../plugin';
import { InnerPluginId } from '../plugin/common';

/**
 * 图表渲染器配置选项
 */
export interface DiagramRendererOptions {
  theme?: string;
  maxWidth?: string;
  responsiveWidth?: boolean;
  supportedTypes?: string[];
  defaultType?: string;
}

/**
 * 图表渲染器 - 负责渲染各种图表（如Mermaid、PlantUML等）
 */
export class DiagramRenderer {
  private options: DiagramRendererOptions;
  private renderers: Map<string, any>;

  constructor(options?: DiagramRendererOptions) {
    this.options = {
      theme: options?.theme || 'default',
      maxWidth: options?.maxWidth || '100%',
      responsiveWidth: options?.responsiveWidth !== false,
      supportedTypes: options?.supportedTypes || ['mermaid', 'plantuml', 'vega', 'echarts'],
      defaultType: options?.defaultType || 'mermaid'
    };

    this.renderers = new Map();
  }

  /**
   * 初始化图表渲染器
   */
  async initialize(): Promise<void> {
    // 模拟动态导入渲染库
    // 实际应用中，这里应该是真正导入Mermaid.js等库

    // 初始化Mermaid渲染器
    this.renderers.set('mermaid', {
      render: (code: string) => this.mockMermaidRender(code)
    });

    // 初始化PlantUML渲染器
    this.renderers.set('plantuml', {
      render: (code: string) => this.mockPlantUMLRender(code)
    });

    // 可以添加更多图表类型的渲染器
  }

  /**
   * 渲染图表
   * @param code 图表代码
   * @param type 图表类型
   * @returns 渲染后的HTML
   */
  async render(code: string, type: string = this.options.defaultType || 'mermaid'): Promise<string> {
    // 确保渲染器已初始化
    if (this.renderers.size === 0) {
      await this.initialize();
    }

    // 获取对应类型的渲染器
    const renderer = this.renderers.get(type);
    if (!renderer) {
      console.warn(`Unsupported diagram type: ${type}`);
      return `<pre class="diagram-error">${this.escapeHtml(code)}</pre>`;
    }

    // 执行渲染
    try {
      return renderer.render(code);
    } catch (error) {
      console.error(`Error rendering ${type} diagram:`, error);
      return `<pre class="diagram-error">${this.escapeHtml(code)}</pre>`;
    }
  }

  /**
   * 创建图表渲染插件
   * @returns Markdown插件
   */
  createPlugin(): MarkdownPlugin {
    return {
      id: InnerPluginId.diagramRenderer,
      name: InnerPluginId.diagramRenderer,
      type: PluginType.SYNTAX,
      priority: 9,
      hooks: {
        [PluginHook.RENDER_NODE]: async (node: ASTNode, _context: PluginContext) => {
          if (node.type === ASTNodeType.CODE_BLOCK) {
            const code = node.content || '';
            const lang = node.attrs?.language || '';

            // 检查是否是支持的图表类型
            if (this.options.supportedTypes?.includes(lang)) {
              try {
                const rendered = await this.render(code, lang);
                return `<div class="diagram diagram-${lang}" style="max-width:${this.options.maxWidth}">${rendered}</div>`;
              } catch (error) {
                console.error(`Error rendering ${lang} diagram:`, error);
                return `<pre class="diagram-error"><code>${this.escapeHtml(code)}</code></pre>`;
              }
            }
          }

          return undefined; // 返回undefined表示使用默认渲染
        }
      }
    };
  }

  /**
   * 模拟Mermaid图表渲染（实际应用中会被真正的渲染库替代）
   * @param code 图表代码
   * @returns 渲染后的HTML
   */
  private mockMermaidRender(code: string): string {
    // 简单的Mermaid渲染模拟
    return `<div class="mermaid-diagram">
      <div class="diagram-container">
        <pre class="mermaid">${this.escapeHtml(code)}</pre>
      </div>
      <div class="diagram-info">Mermaid diagram (mock rendering)</div>
    </div>`;
  }

  /**
   * 模拟PlantUML图表渲染（实际应用中会被真正的渲染库替代）
   * @param code 图表代码
   * @returns 渲染后的HTML
   */
  private mockPlantUMLRender(code: string): string {
    // 简单的PlantUML渲染模拟
    return `<div class="plantuml-diagram">
      <div class="diagram-container">
        <pre class="plantuml">${this.escapeHtml(code)}</pre>
      </div>
      <div class="diagram-info">PlantUML diagram (mock rendering)</div>
    </div>`;
  }

  /**
   * 转义HTML特殊字符
   * @param text 需要转义的文本
   * @returns 转义后的文本
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

export default DiagramRenderer;