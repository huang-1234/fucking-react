import { ASTNodeType } from '../../common/md';

/**
 * 样式映射器 - 负责将AST节点映射到CSS类名或样式对象
 */
export class StyleMapper {
  private styleMap: Record<string, string | Record<string, string>>;
  private theme: string;

  constructor(theme: string = 'light') {
    this.theme = theme;
    this.styleMap = this.getDefaultStyleMap(theme);
  }

  /**
   * 获取节点的样式类名
   * @param nodeType AST节点类型
   * @returns CSS类名
   */
  getClassName(nodeType: ASTNodeType): string {
    const style = this.styleMap[nodeType];
    if (typeof style === 'string') {
      return style;
    }
    return '';
  }

  /**
   * 获取节点的内联样式对象
   * @param nodeType AST节点类型
   * @returns 样式对象
   */
  getStyle(nodeType: ASTNodeType): Record<string, string> {
    const style = this.styleMap[nodeType];
    if (typeof style === 'object') {
      return style;
    }
    return {};
  }

  /**
   * 设置主题
   * @param theme 主题名称
   */
  setTheme(theme: string): void {
    this.theme = theme;
    this.styleMap = this.getDefaultStyleMap(theme);
  }

  /**
   * 自定义节点样式
   * @param nodeType AST节点类型
   * @param style CSS类名或样式对象
   */
  setStyle(nodeType: ASTNodeType, style: string | Record<string, string>): void {
    this.styleMap[nodeType] = style;
  }

  /**
   * 获取默认样式映射
   * @param theme 主题名称
   * @returns 样式映射对象
   */
  private getDefaultStyleMap(theme: string): Record<string, string | Record<string, string>> {
    // 基础样式映射
    const baseMap: Record<string, string | Record<string, string>> = {
      [ASTNodeType.DOCUMENT]: 'markdown-body',
      [ASTNodeType.HEADING]: 'markdown-heading',
      [ASTNodeType.PARAGRAPH]: 'markdown-paragraph',
      [ASTNodeType.BLOCKQUOTE]: 'markdown-blockquote',
      [ASTNodeType.LIST]: 'markdown-list',
      [ASTNodeType.LIST_ITEM]: 'markdown-list-item',
      [ASTNodeType.CODE_BLOCK]: 'markdown-code-block',
      [ASTNodeType.INLINE_CODE]: 'markdown-inline-code',
      [ASTNodeType.EMPH]: 'markdown-emphasis',
      [ASTNodeType.STRONG]: 'markdown-strong',
      [ASTNodeType.LINK]: 'markdown-link',
      [ASTNodeType.IMAGE]: 'markdown-image',
      [ASTNodeType.TEXT]: '',
      [ASTNodeType.CUSTOM_BLOCK]: 'markdown-custom-block'
    };

    // 根据主题应用不同的样式
    switch (theme) {
      case 'dark':
        return {
          ...baseMap,
          [ASTNodeType.DOCUMENT]: 'markdown-body dark',
          [ASTNodeType.LINK]: 'markdown-link dark',
          [ASTNodeType.CODE_BLOCK]: 'markdown-code-block dark',
          [ASTNodeType.INLINE_CODE]: 'markdown-inline-code dark',
          [ASTNodeType.BLOCKQUOTE]: 'markdown-blockquote dark'
        };

      case 'sepia':
        return {
          ...baseMap,
          [ASTNodeType.DOCUMENT]: 'markdown-body sepia',
          [ASTNodeType.LINK]: 'markdown-link sepia',
          [ASTNodeType.BLOCKQUOTE]: 'markdown-blockquote sepia'
        };

      default: // 'light'
        return baseMap;
    }
  }

  /**
   * 生成CSS变量
   * @returns CSS变量定义字符串
   */
  generateCssVariables(): string {
    const variables: Record<string, Record<string, string>> = {
      light: {
        '--md-bg-color': '#ffffff',
        '--md-text-color': '#24292e',
        '--md-link-color': '#0366d6',
        '--md-heading-color': '#24292e',
        '--md-border-color': '#e1e4e8',
        '--md-blockquote-color': '#6a737d',
        '--md-code-bg-color': '#f6f8fa',
        '--md-code-text-color': '#24292e'
      },
      dark: {
        '--md-bg-color': '#0d1117',
        '--md-text-color': '#c9d1d9',
        '--md-link-color': '#58a6ff',
        '--md-heading-color': '#e6edf3',
        '--md-border-color': '#30363d',
        '--md-blockquote-color': '#8b949e',
        '--md-code-bg-color': '#161b22',
        '--md-code-text-color': '#c9d1d9'
      },
      sepia: {
        '--md-bg-color': '#f8f2e3',
        '--md-text-color': '#5b4636',
        '--md-link-color': '#1e6bb8',
        '--md-heading-color': '#704214',
        '--md-border-color': '#e0d6c2',
        '--md-blockquote-color': '#8a7055',
        '--md-code-bg-color': '#f0e8d6',
        '--md-code-text-color': '#5b4636'
      }
    };

    const themeVars = variables[this.theme as keyof typeof variables] || variables.light;

    return Object.entries(themeVars)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  }

  /**
   * 生成CSS样式表
   * @returns CSS样式表字符串
   */
  generateStylesheet(): string {
    return `
      .markdown-body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: var(--md-text-color, #24292e);
        background-color: var(--md-bg-color, #ffffff);
        padding: 16px;
        max-width: 100%;
        overflow-x: hidden;
      }

      .markdown-heading {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--md-heading-color, #24292e);
      }

      .markdown-paragraph {
        margin-top: 0;
        margin-bottom: 16px;
      }

      .markdown-blockquote {
        margin: 0 0 16px;
        padding: 0 1em;
        color: var(--md-blockquote-color, #6a737d);
        border-left: 0.25em solid var(--md-border-color, #e1e4e8);
      }

      .markdown-list {
        padding-left: 2em;
        margin-top: 0;
        margin-bottom: 16px;
      }

      .markdown-list-item {
        margin-bottom: 4px;
      }

      .markdown-code-block {
        margin-top: 0;
        margin-bottom: 16px;
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--md-code-bg-color, #f6f8fa);
        border-radius: 3px;
      }

      .markdown-inline-code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 85%;
        padding: 0.2em 0.4em;
        margin: 0;
        background-color: var(--md-code-bg-color, #f6f8fa);
        border-radius: 3px;
        color: var(--md-code-text-color, #24292e);
      }

      .markdown-link {
        color: var(--md-link-color, #0366d6);
        text-decoration: none;
      }

      .markdown-link:hover {
        text-decoration: underline;
      }

      .markdown-image {
        max-width: 100%;
        box-sizing: border-box;
        background-color: var(--md-bg-color, #ffffff);
      }

      /* 深色主题特定样式 */
      .markdown-body.dark {
        --md-bg-color: #0d1117;
        --md-text-color: #c9d1d9;
        --md-link-color: #58a6ff;
        --md-heading-color: #e6edf3;
        --md-border-color: #30363d;
        --md-blockquote-color: #8b949e;
        --md-code-bg-color: #161b22;
        --md-code-text-color: #c9d1d9;
      }

      /* 护眼主题特定样式 */
      .markdown-body.sepia {
        --md-bg-color: #f8f2e3;
        --md-text-color: #5b4636;
        --md-link-color: #1e6bb8;
        --md-heading-color: #704214;
        --md-border-color: #e0d6c2;
        --md-blockquote-color: #8a7055;
        --md-code-bg-color: #f0e8d6;
        --md-code-text-color: #5b4636;
      }
    `;
  }
}

export default StyleMapper;
