import { type ASTNode, ASTNodeType } from '../../common/md';
import { type MarkdownPlugin, type PluginContext } from '../plugin';
import { PluginHook, PluginType } from '../plugin';
import { InnerPluginId } from '../plugin/common';

/**
 * @description 语法高亮配置选项
 */
export interface SyntaxHighlighterOptions {
  theme?: string;
  showLineNumbers?: boolean;
  highlightLines?: boolean;
  tabSize?: number;
  languages?: string[];
  defaultLanguage?: string;
}
// define highlighter interface
export interface IHighlighter {
  highlight: (code: string, language: string) => string;
  getLanguage: (lang: string) => boolean | undefined;
}
/**
 * @description 语法高亮器 - 负责代码块的语法高亮
 */
export class SyntaxHighlighter {
  /**
   * @description 配置选项
   */
  private options: SyntaxHighlighterOptions;
  private highlighter?: IHighlighter | null; // 实际使用时应该是具体的高亮库类型

  constructor(options?: SyntaxHighlighterOptions) {
    this.options = {
      theme: options?.theme || 'github',
      showLineNumbers: options?.showLineNumbers !== false,
      highlightLines: options?.highlightLines !== false,
      tabSize: options?.tabSize || 2,
      languages: options?.languages || ['javascript', 'typescript', 'html', 'css', 'jsx', 'tsx', 'json', 'markdown'],
      defaultLanguage: options?.defaultLanguage || 'text'
    };

    /**
     * @description 高亮器
     */
    this.highlighter = null; // 延迟初始化
  }

  /**
   * @description 初始化语法高亮器
   */
  async initialize(): Promise<void> {
    // 模拟动态导入高亮库
    // 实际应用中，这里应该是真正导入highlight.js或Prism.js等库
    this.highlighter = {
      highlight: (code: string, language: string) => {
        // 简单模拟语法高亮
        return this.mockHighlight(code, language);
      },
      getLanguage: (lang: string) => {
        // 检查语言是否支持
        return this.options.languages?.includes(lang);
      }
    };
  }

  /**
   * @description 高亮代码
   * @param code 代码内容
   * @param language 编程语言
   * @returns 高亮后的HTML
   */
  async highlight(code: string, language: string): Promise<string> {
    // 确保高亮器已初始化
    if (!this.highlighter) {
      await this.initialize();
    }

    // 检查语言是否支持
    const lang = this.highlighter?.getLanguage(language) ? language : this.options.defaultLanguage;

    // 执行高亮
    try {
      const result = this.highlighter?.highlight(code, lang || '');
      return this.wrapWithLineNumbers(result || '', language);
    } catch (error) {
      console.error('Syntax highlighting error:', error);
      // 降级处理
      return this.escapeHtml(code);
    }
  }

  /**
   * @description 创建语法高亮插件
   * @returns Markdown插件
   */
  createPlugin(): MarkdownPlugin {
    return {
      id: InnerPluginId.syntaxHighlighter,
      name: InnerPluginId.syntaxHighlighter,
      type: PluginType.SYNTAX,
      priority: 10,
      hooks: {
        [PluginHook.RENDER_NODE]: async (node: ASTNode, _context: PluginContext) => {
          if (node.type === ASTNodeType.CODE_BLOCK) {
            const code = node.content || '';
            const lang = node.attrs?.language || this.options.defaultLanguage || 'text';

            try {
              const highlighted = await this.highlight(code, lang);
              return `<pre class="language-${lang}"><code>${highlighted}</code></pre>`;
            } catch (error) {
              console.error('Error highlighting code:', error);
              return `<pre><code>${this.escapeHtml(code)}</code></pre>`;
            }
          }

          // 处理行内代码
          if (node.type === ASTNodeType.INLINE_CODE) {
            const code = node.content || '';
            return `<code class="inline-code">${this.escapeHtml(code)}</code>`;
          }

          return undefined; // 返回undefined表示使用默认渲染
        }
      }
    };
  }

  /**
   * @description 添加行号包装
   * @param html 高亮后的HTML
   * @param language 编程语言
   * @returns 添加行号后的HTML
   */
  private wrapWithLineNumbers(html: string, _language: string): string {
    if (!this.options.showLineNumbers) {
      return html;
    }

    const lines = html.split('\n');
    let result = '<div class="code-container">';

    // 添加行号
    result += '<div class="line-numbers">';
    for (let i = 1; i <= lines.length; i++) {
      result += `<span class="line-number">${i}</span>`;
    }
    result += '</div>';

    // 添加代码内容
    result += '<div class="code-content">';
    for (const line of lines) {
      result += `<div class="code-line">${line || ' '}</div>`;
    }
    result += '</div></div>';

    return result;
  }

  /**
   * @description 模拟代码高亮（实际应用中会被真正的高亮库替代）
   * @param code 代码内容
   * @param language 编程语言
   * @returns 高亮后的HTML
   */
  private mockHighlight(code: string, _language: string): string {
    // 简单的语法高亮模拟
    // 实际应用中应该使用专业的高亮库
    return this.escapeHtml(code)
      .replace(/\/\/(.*)/g, '<span class="hljs-comment">//$1</span>')
      .replace(/\/\*([\s\S]*?)\*\//g, '<span class="hljs-comment">/*$1*/</span>')
      .replace(/(['"`])(.*?)\1/g, '<span class="hljs-string">$1$2$1</span>')
      .replace(/\b(function|return|if|for|while|else|var|let|const|import|export|class)\b/g,
               '<span class="hljs-keyword">$1</span>');
  }

  /**
   * @description 转义HTML特殊字符
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

export default SyntaxHighlighter;