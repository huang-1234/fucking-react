import { type Theme, type ThemeVariables } from './ThemeDefinitions';

/**
 * 样式生成器配置选项
 */
export interface StyleGeneratorOptions {
  minify?: boolean;
  prefix: string;
  includeAnimation?: boolean;
  includeResponsive?: boolean;
  customSelectors?: Record<string, string>;
}

/**
 * 样式生成器 - 负责生成主题样式表
 */
export class StyleGenerator {
  private options: StyleGeneratorOptions;

  constructor(options?: StyleGeneratorOptions) {
    this.options = {
      minify: options?.minify || false,
      prefix: options?.prefix || '.markdown',
      includeAnimation: options?.includeAnimation !== false,
      includeResponsive: options?.includeResponsive !== false,
      customSelectors: options?.customSelectors || {}
    };
  }

  /**
   * @description 生成主题样式表
   * @param theme 主题对象
   * @returns CSS样式表字符串
   */
  generateStylesheet(theme: Theme): string {
    const { variables } = theme;
    const { prefix, minify, includeAnimation, includeResponsive, customSelectors } = this.options;

    // 生成CSS变量
    let css = this.generateCssVariables(variables);

    // 生成基础样式
    css += this.generateBaseStyles(prefix, variables);

    // 生成元素样式
    css += this.generateElementStyles(prefix, variables);

    // 生成自定义选择器样式
    if (customSelectors && Object.keys(customSelectors).length > 0) {
      css += this.generateCustomSelectorStyles(customSelectors, variables);
    }

    // 生成动画样式
    if (includeAnimation) {
      css += this.generateAnimationStyles(prefix);
    }

    // 生成响应式样式
    if (includeResponsive) {
      css += this.generateResponsiveStyles(prefix, variables);
    }

    // 添加主题自定义CSS
    if (theme.customCSS) {
      css += `\n/* 自定义样式 */\n${theme.customCSS}`;
    }

    // 压缩CSS
    if (minify) {
      css = this.minifyCSS(css);
    }

    return css;
  }

  /**
   * 生成CSS变量
   * @param variables 主题变量
   * @returns CSS变量定义字符串
   */
  generateCssVariables(variables: ThemeVariables): string {
    return `:root {
      --md-bg-color: ${variables.backgroundColor};
      --md-text-color: ${variables.textColor};
      --md-link-color: ${variables.linkColor};
      --md-heading-color: ${variables.headingColor};
      --md-border-color: ${variables.borderColor};
      --md-blockquote-color: ${variables.blockquoteColor};
      --md-code-bg-color: ${variables.codeBackgroundColor};
      --md-code-text-color: ${variables.codeTextColor};
      --md-table-header-bg: ${variables.tableHeaderBackgroundColor};
      --md-table-border-color: ${variables.tableBorderColor};
      --md-font-family: ${variables.fontFamily};
      --md-code-font-family: ${variables.codeFontFamily};
      --md-font-size: ${variables.fontSize};
      --md-line-height: ${variables.lineHeight};
      --md-spacing: ${variables.spacing};
      --md-border-radius: ${variables.borderRadius};
      --md-box-shadow: ${variables.boxShadow};
    }\n`;
  }

  /**
   * 生成基础样式
   * @param prefix CSS选择器前缀
   * @param variables 主题变量
   * @returns CSS样式字符串
   */
  generateBaseStyles(prefix: string, variables: ThemeVariables): string {
    return `
    ${prefix}-body {
      font-family: var(--md-font-family);
      font-size: var(--md-font-size);
      line-height: var(--md-line-height);
      color: var(--md-text-color);
      background-color: var(--md-bg-color);
      padding: var(--md-spacing);
      max-width: 100%;
      overflow-x: hidden;
      transition: all 0.3s ease;
    }

    ${prefix}-body * {
      box-sizing: border-box;
    }

    ${prefix}-body img {
      max-width: 100%;
      height: auto;
    }

    ${prefix}-body hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: var(--md-border-color);
      border: 0;
    }\n`;
  }

  /**
   * 生成元素样式
   * @param prefix CSS选择器前缀
   * @param variables 主题变量
   * @returns CSS样式字符串
   */
  generateElementStyles(prefix: string, variables: ThemeVariables): string {
    return `
    /* 标题样式 */
    ${prefix}-body h1,
    ${prefix}-body h2,
    ${prefix}-body h3,
    ${prefix}-body h4,
    ${prefix}-body h5,
    ${prefix}-body h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--md-heading-color);
    }

    ${prefix}-body h1 {
      font-size: 2em;
      border-bottom: 1px solid var(--md-border-color);
      padding-bottom: 0.3em;
    }

    ${prefix}-body h2 {
      font-size: 1.5em;
      border-bottom: 1px solid var(--md-border-color);
      padding-bottom: 0.3em;
    }

    ${prefix}-body h3 {
      font-size: 1.25em;
    }

    ${prefix}-body h4 {
      font-size: 1em;
    }

    /* 段落和文本 */
    ${prefix}-body p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    ${prefix}-body a {
      color: var(--md-link-color);
      text-decoration: none;
    }

    ${prefix}-body a:hover {
      text-decoration: underline;
    }

    ${prefix}-body strong {
      font-weight: 600;
    }

    ${prefix}-body em {
      font-style: italic;
    }

    ${prefix}-body del {
      text-decoration: line-through;
    }

    /* 列表 */
    ${prefix}-body ul,
    ${prefix}-body ol {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 16px;
    }

    ${prefix}-body ul {
      list-style-type: disc;
    }

    ${prefix}-body ol {
      list-style-type: decimal;
    }

    ${prefix}-body li {
      margin-bottom: 4px;
    }

    ${prefix}-body li > ul,
    ${prefix}-body li > ol {
      margin-top: 4px;
    }

    /* 任务列表 */
    ${prefix}-body ul.contains-task-list {
      list-style-type: none;
      padding-left: 0;
    }

    ${prefix}-body .task-list-item {
      padding-left: 1.5em;
      position: relative;
    }

    ${prefix}-body .task-list-item input[type="checkbox"] {
      position: absolute;
      left: 0;
      top: 0.25em;
      margin: 0;
    }

    /* 代码 */
    ${prefix}-body code {
      font-family: var(--md-code-font-family);
      font-size: 85%;
      padding: 0.2em 0.4em;
      margin: 0;
      background-color: var(--md-code-bg-color);
      border-radius: var(--md-border-radius);
      color: var(--md-code-text-color);
    }

    ${prefix}-body pre {
      margin-top: 0;
      margin-bottom: 16px;
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: var(--md-code-bg-color);
      border-radius: var(--md-border-radius);
    }

    ${prefix}-body pre code {
      padding: 0;
      margin: 0;
      background-color: transparent;
      border: 0;
      word-break: normal;
      white-space: pre;
      overflow-wrap: normal;
    }

    /* 引用块 */
    ${prefix}-body blockquote {
      margin: 0 0 16px;
      padding: 0 1em;
      color: var(--md-blockquote-color);
      border-left: 0.25em solid var(--md-border-color);
    }

    ${prefix}-body blockquote > :first-child {
      margin-top: 0;
    }

    ${prefix}-body blockquote > :last-child {
      margin-bottom: 0;
    }

    /* 表格 */
    ${prefix}-body table {
      display: block;
      width: 100%;
      overflow: auto;
      margin-top: 0;
      margin-bottom: 16px;
      border-spacing: 0;
      border-collapse: collapse;
    }

    ${prefix}-body table th {
      font-weight: 600;
      background-color: var(--md-table-header-bg);
    }

    ${prefix}-body table th,
    ${prefix}-body table td {
      padding: 6px 13px;
      border: 1px solid var(--md-table-border-color);
    }

    ${prefix}-body table tr {
      background-color: var(--md-bg-color);
      border-top: 1px solid var(--md-table-border-color);
    }

    ${prefix}-body table tr:nth-child(2n) {
      background-color: var(--md-code-bg-color);
    }\n`;
  }

  /**
   * 生成自定义选择器样式
   * @param customSelectors 自定义选择器映射
   * @param variables 主题变量
   * @returns CSS样式字符串
   */
  generateCustomSelectorStyles(customSelectors: Record<string, string>, variables: ThemeVariables): string {
    let css = '\n/* 自定义选择器样式 */\n';

    Object.entries(customSelectors).forEach(([selector, styles]) => {
      css += `${selector} {\n  ${styles}\n}\n`;
    });

    return css;
  }

  /**
   * 生成动画样式
   * @param prefix CSS选择器前缀
   * @returns CSS样式字符串
   */
  generateAnimationStyles(prefix: string): string {
    return `
    /* 动画样式 */
    ${prefix}-body a {
      transition: color 0.2s ease-in-out;
    }

    ${prefix}-body img {
      transition: transform 0.3s ease;
    }

    ${prefix}-body img:hover {
      transform: scale(1.01);
    }

    @keyframes highlight {
      0% { background-color: rgba(255, 255, 0, 0.3); }
      100% { background-color: transparent; }
    }

    ${prefix}-body .highlight {
      animation: highlight 2s ease;
    }\n`;
  }

  /**
   * 生成响应式样式
   * @param prefix CSS选择器前缀
   * @param variables 主题变量
   * @returns CSS样式字符串
   */
  generateResponsiveStyles(prefix: string, variables: ThemeVariables): string {
    return `
    /* 响应式样式 */
    @media (max-width: 768px) {
      ${prefix}-body {
        padding: calc(var(--md-spacing) / 2);
        font-size: calc(var(--md-font-size) * 0.95);
      }

      ${prefix}-body h1 {
        font-size: 1.8em;
      }

      ${prefix}-body h2 {
        font-size: 1.4em;
      }

      ${prefix}-body pre {
        padding: calc(var(--md-spacing) / 2);
      }

      ${prefix}-body table {
        display: block;
        overflow-x: auto;
      }
    }

    @media (max-width: 480px) {
      ${prefix}-body {
        padding: calc(var(--md-spacing) / 3);
        font-size: calc(var(--md-font-size) * 0.9);
      }

      ${prefix}-body h1 {
        font-size: 1.6em;
      }

      ${prefix}-body h2 {
        font-size: 1.3em;
      }
    }

    @media print {
      ${prefix}-body {
        background-color: #ffffff;
        color: #000000;
        font-size: 12pt;
      }

      ${prefix}-body a {
        color: #000000;
        text-decoration: underline;
      }

      ${prefix}-body pre,
      ${prefix}-body code {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
      }
    }\n`;
  }

  /**
   * 压缩CSS
   * @param css CSS字符串
   * @returns 压缩后的CSS字符串
   */
  minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ')             // 压缩空白
      .replace(/\s*([{}:;,])\s*/g, '$1') // 移除选择器周围的空白
      .replace(/;\}/g, '}')              // 移除最后的分号
      .trim();
  }
}

export default StyleGenerator;
