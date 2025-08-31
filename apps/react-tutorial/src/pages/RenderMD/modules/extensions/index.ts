import SyntaxHighlighter, { type SyntaxHighlighterOptions } from './SyntaxHighlighter';
import MathRenderer, { type MathRendererOptions } from './MathRenderer';
import DiagramRenderer, { type DiagramRendererOptions } from './DiagramRenderer';
import { type MarkdownPlugin } from '../plugin';

/**
 * 扩展功能配置选项
 */
export interface ExtensionsOptions {
  syntaxHighlighter?: SyntaxHighlighterOptions & { enabled?: boolean };
  mathRenderer?: MathRendererOptions & { enabled?: boolean };
  diagramRenderer?: DiagramRendererOptions & { enabled?: boolean };
}

/**
 * 扩展功能模块
 * 提供代码高亮、数学公式、图表等增强功能
 */
export class ExtensionsModule {
  /** @description 语法高亮器 */
  private syntaxHighlighter: SyntaxHighlighter | null = null;
  /** @description 数学公式渲染器 */
  private mathRenderer: MathRenderer | null = null;
  /** @description 图表渲染器 */
  private diagramRenderer: DiagramRenderer | null = null;
  /** @description 配置选项 */
  private options: ExtensionsOptions;

  /**
   * @description 构造函数
   * @param options 配置选项
   */
  constructor(options?: ExtensionsOptions) {
    this.options = options || {};

    // 初始化启用的扩展功能
    if (this.options.syntaxHighlighter?.enabled !== false) {
      this.syntaxHighlighter = new SyntaxHighlighter(this.options.syntaxHighlighter);
    }

    if (this.options.mathRenderer?.enabled !== false) {
      this.mathRenderer = new MathRenderer(this.options.mathRenderer);
    }

    if (this.options.diagramRenderer?.enabled !== false) {
      this.diagramRenderer = new DiagramRenderer(this.options.diagramRenderer);
    }
  }

  /**
   * 获取所有扩展功能的插件
   * @returns 插件数组
   */
  getPlugins(): MarkdownPlugin[] {
    /** @description 插件数组 */
    const plugins: MarkdownPlugin[] = [];

    // 添加启用的插件
    if (this.syntaxHighlighter) {
      plugins.push(this.syntaxHighlighter.createPlugin());
    }

    if (this.mathRenderer) {
      plugins.push(this.mathRenderer.createPlugin());
    }

    if (this.diagramRenderer) {
      plugins.push(this.diagramRenderer.createPlugin());
    }

    return plugins;
  }

  /**
   * 获取语法高亮器
   * @returns 语法高亮器实例
   */
  getSyntaxHighlighter(): SyntaxHighlighter | null {
    return this.syntaxHighlighter;
  }

  /**
   * 获取数学公式渲染器
   * @returns 数学公式渲染器实例
   */
  getMathRenderer(): MathRenderer | null {
    return this.mathRenderer;
  }

  /**
   * 获取图表渲染器
   * @returns 图表渲染器实例
   */
  getDiagramRenderer(): DiagramRenderer | null {
    return this.diagramRenderer;
  }

  /**
   * 更新配置选项
   * @param options 新的配置选项
   */
  updateOptions(options: ExtensionsOptions): void {
    this.options = {
      ...this.options,
      ...options
    };

    // 重新初始化扩展功能
    if (options.syntaxHighlighter) {
      if (options.syntaxHighlighter.enabled === false) {
        this.syntaxHighlighter = null;
      } else {
        this.syntaxHighlighter = new SyntaxHighlighter(options.syntaxHighlighter);
      }
    }

    if (options.mathRenderer) {
      if (options.mathRenderer.enabled === false) {
        this.mathRenderer = null;
      } else {
        this.mathRenderer = new MathRenderer(options.mathRenderer);
      }
    }

    if (options.diagramRenderer) {
      if (options.diagramRenderer.enabled === false) {
        this.diagramRenderer = null;
      } else {
        this.diagramRenderer = new DiagramRenderer(options.diagramRenderer);
      }
    }
  }

  /**
   * 生成扩展功能的CSS样式
   * @returns CSS样式字符串
   */
  generateStyles(): string {
    return `
      /* 语法高亮样式 */
      .syntax-highlighter {
        background-color: #f6f8fa;
        border-radius: 3px;
        margin: 1em 0;
        padding: 1em;
        overflow: auto;
      }

      .syntax-highlighter code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 85%;
        background: none;
        padding: 0;
      }

      .syntax-highlighter.line-numbers {
        padding-left: 3.8em;
        counter-reset: line;
      }

      .line-numbers-rows {
        position: absolute;
        pointer-events: none;
        top: 1em;
        left: 0;
        width: 3em;
        letter-spacing: -1px;
        border-right: 1px solid #ddd;
        user-select: none;
      }

      .line-numbers-rows > span {
        display: block;
        counter-increment: line;
        pointer-events: none;
      }

      .line-numbers-rows > span:before {
        content: counter(line);
        color: #999;
        display: block;
        padding-right: 0.8em;
        text-align: right;
      }

      /* 语法高亮主题 */
      .hljs-keyword { color: #d73a49; }
      .hljs-string { color: #032f62; }
      .hljs-comment { color: #6a737d; }
      .hljs-function { color: #6f42c1; }
      .hljs-number { color: #005cc5; }
      .hljs-operator { color: #d73a49; }
      .hljs-class { color: #6f42c1; }
      .hljs-variable { color: #e36209; }

      /* 数学公式样式 */
      .math {
        font-family: 'KaTeX_Math', 'Times New Roman', serif;
      }

      .math-inline {
        display: inline-block;
        vertical-align: middle;
      }

      .math-block {
        display: block;
        margin: 1em 0;
        text-align: center;
      }

      .math-error {
        color: #f00;
        border: 1px solid #f00;
        padding: 0.2em;
      }

      /* 图表样式 */
      .diagram {
        margin: 1em 0;
        text-align: center;
      }

      .diagram-placeholder {
        background-color: #f8f9fa;
        border: 1px dashed #ccc;
        padding: 2em;
        text-align: center;
        color: #666;
      }

      .diagram-error {
        background-color: #fff0f0;
        border: 1px solid #ffcccc;
        padding: 1em;
        color: #cc0000;
      }

      /* 深色主题 */
      .dark .syntax-highlighter {
        background-color: #161b22;
      }

      .dark .line-numbers-rows {
        border-right-color: #30363d;
      }

      .dark .hljs-keyword { color: #ff7b72; }
      .dark .hljs-string { color: #a5d6ff; }
      .dark .hljs-comment { color: #8b949e; }
      .dark .hljs-function { color: #d2a8ff; }
      .dark .hljs-number { color: #79c0ff; }
      .dark .hljs-operator { color: #ff7b72; }
      .dark .hljs-class { color: #d2a8ff; }
      .dark .hljs-variable { color: #ffa657; }

      .dark .diagram-placeholder {
        background-color: #161b22;
        border-color: #30363d;
        color: #8b949e;
      }
    `;
  }
}

export { SyntaxHighlighter, MathRenderer, DiagramRenderer };
export type { SyntaxHighlighterOptions, MathRendererOptions, DiagramRendererOptions };
export default ExtensionsModule;
