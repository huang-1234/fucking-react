import { type ASTNode, ASTNodeType } from '../../common/md';
import { type MarkdownPlugin, type PluginContext } from '../plugin';
import { PluginHook, PluginType } from '../plugin';
import { InnerPluginId } from '../plugin/common';

/**
 * 数学公式渲染器配置选项
 */
export interface MathRendererOptions {
  engine?: 'katex' | 'mathjax';
  delimiters?: {
    inline: [string, string];
    block: [string, string];
  };
  throwOnError?: boolean;
  output?: 'html' | 'mathml';
  displayMode?: boolean;
}

/**
 * 数学公式渲染器 - 负责渲染LaTeX数学公式
 */
export class MathRenderer {
  private options: MathRendererOptions;
  private renderer: any; // 实际使用时应该是具体的渲染库类型

  constructor(options?: MathRendererOptions) {
    this.options = {
      engine: options?.engine || 'katex',
      delimiters: options?.delimiters || {
        inline: ['$', '$'],
        block: ['$$', '$$']
      },
      throwOnError: options?.throwOnError || false,
      output: options?.output || 'html',
      displayMode: options?.displayMode !== false
    };

    this.renderer = null; // 延迟初始化
  }

  /**
   * 初始化渲染器
   */
  async initialize(): Promise<void> {
    // 模拟动态导入渲染库
    // 实际应用中，这里应该是真正导入KaTeX或MathJax等库
    this.renderer = {
      render: (formula: string, displayMode: boolean) => {
        // 简单模拟公式渲染
        return this.mockRender(formula, displayMode);
      }
    };
  }

  /**
   * 渲染数学公式
   * @param formula 公式内容
   * @param displayMode 是否为块级公式
   * @returns 渲染后的HTML
   */
  async render(formula: string, displayMode: boolean = false): Promise<string> {
    // 确保渲染器已初始化
    if (!this.renderer) {
      await this.initialize();
    }

    // 执行渲染
    try {
      return this.renderer.render(formula, displayMode);
    } catch (error) {
      console.error('Math rendering error:', error);
      if (this.options.throwOnError) {
        throw error;
      }
      // 降级处理
      return `<span class="math-error">${this.escapeHtml(formula)}</span>`;
    }
  }

  /**
   * 创建数学公式渲染插件
   * @returns Markdown插件
   */
  createPlugin(): MarkdownPlugin {
    return {
      id: InnerPluginId.mathRenderer,
      name: InnerPluginId.mathRenderer,
      type: PluginType.SYNTAX,
      priority: 8,
      hooks: {
        [PluginHook.BEFORE_PARSE]: (text: string, _context: PluginContext): string => {
          // 预处理数学公式，将它们转换为特殊标记
          // 这样可以防止解析器错误地解析公式内的Markdown语法

          // 处理块级公式
          const blockDelim = this.options.delimiters?.block || ['$$', '$$'];
          let blockRegex = new RegExp(`${this.escapeRegExp(blockDelim[0])}([\\s\\S]*?)${this.escapeRegExp(blockDelim[1])}`, 'g');
          text = text.replace(blockRegex, (formula) => {
            return `\n\n<math-block>${formula.slice(blockDelim[0].length, -blockDelim[1].length)}</math-block>\n\n`;
          });

          // 处理行内公式
          const inlineDelim = this.options.delimiters?.inline || ['$', '$'];
          let inlineRegex = new RegExp(`${this.escapeRegExp(inlineDelim[0])}([^$\\n]+?)${this.escapeRegExp(inlineDelim[1])}`, 'g');
          text = text.replace(inlineRegex, (formula) => {
            return `<math-inline>${formula.slice(inlineDelim[0].length, -inlineDelim[1].length)}</math-inline>`;
          });

          return text;
        },
        [PluginHook.AFTER_PARSE]: (ast: ASTNode, _context: PluginContext): ASTNode => {
          // 处理AST中的数学公式标记
          const processMathNodes = (node: ASTNode): void => {
            if (node.type === ASTNodeType.PARAGRAPH || node.type === ASTNodeType.TEXT) {
              const content = node.content || '';

              // 检查是否包含数学公式标记
              if (content.includes('<math-inline>') || content.includes('<math-block>')) {
                // 处理块级公式
                if (content.trim().startsWith('<math-block>') && content.trim().endsWith('</math-block>')) {
                  const formula = content.trim().replace(/<math-block>([\s\S]*?)<\/math-block>/g, '$1');
                  node.type = ASTNodeType.CUSTOM_BLOCK;
                  node.attrs = { type: 'math-block' };
                  node.content = formula;
                  return;
                }

                // 处理行内公式
                if (content.includes('<math-inline>')) {
                  // 拆分文本和公式
                  const regex = /<math-inline>([\s\S]*?)<\/math-inline>/g;
                  let lastIndex = 0;
                  const parts: ASTNode[] = [];
                  let result;

                  while ((result = regex.exec(content)) !== null) {
                    // 添加前面的文本
                    if (result.index > lastIndex) {
                      parts.push({
                        type: ASTNodeType.TEXT,
                        content: content.substring(lastIndex, result.index)
                      });
                    }

                    // 添加公式
                    const formula = result[1];
                    parts.push({
                      type: ASTNodeType.CUSTOM_INLINE,
                      attrs: { type: 'math-inline' },
                      content: formula
                    });

                    lastIndex = regex.lastIndex;
                  }

                  // 添加剩余文本
                  if (lastIndex < content.length) {
                    parts.push({
                      type: ASTNodeType.TEXT,
                      content: content.substring(lastIndex)
                    });
                  }

                  // 如果有拆分，替换当前节点的子节点
                  if (parts.length > 0) {
                    node.children = parts;
                    node.content = '';
                  }
                }
              }

              // 递归处理子节点
              if (node.children) {
                node.children.forEach(processMathNodes);
              }
            }
          };

          processMathNodes(ast);
          return ast;
        },
        [PluginHook.RENDER_NODE]: async (node: ASTNode, _context: PluginContext) => {
          // 渲染数学公式
          if (node.type === ASTNodeType.CUSTOM_BLOCK) {
            if (node.attrs?.type === 'math-block') {
              const formula = node.content || '';
              const rendered = await this.render(formula, true);
              return `<div class="math math-block">${rendered}</div>`;
            }

            if (node.attrs?.type === 'math-inline') {
              const formula = node.content || '';
              const rendered = await this.render(formula, false);
              return `<span class="math math-inline">${rendered}</span>`;
            }
          }

          return undefined; // 返回undefined表示使用默认渲染
        }
      }
    };
  }

  /**
   * 模拟数学公式渲染（实际应用中会被真正的渲染库替代）
   * @param formula 公式内容
   * @param displayMode 是否为块级公式
   * @returns 渲染后的HTML
   */
  private mockRender(formula: string, displayMode: boolean): string {
    const escapedFormula = this.escapeHtml(formula);
    const className = displayMode ? 'math-display' : 'math-inline';
    return `<span class="${className}">${escapedFormula}</span>`;
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

  /**
   * 转义正则表达式特殊字符
   * @param text 需要转义的文本
   * @returns 转义后的文本
   */
  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default MathRenderer;