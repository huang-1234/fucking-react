import { type Theme, ThemeName, type ThemeVariables, builtinThemes, getDefaultTheme, getThemeByName } from './ThemeDefinitions';

/**
 * 主题管理器 - 负责管理主题的加载、切换和应用
 */
export class ThemeManager {
  /**
   * @description 当前主题
   */
  private currentTheme: Theme;
  /**
   * @description 主题映射
   */
  private themes: Map<string, Theme>;
  /**
   * @description 监听器
   */
  private listeners: Array<(theme: Theme) => void>;
  /**
   * @description 样式元素
   */
  private styleElement: HTMLStyleElement | null = null;

  constructor(initialTheme?: string) {
    /**
     * @description 当前主题
     */
    this.currentTheme = initialTheme ? getThemeByName(initialTheme) : getDefaultTheme();
    /**
     * @description 主题映射
     */
    this.themes = new Map();
    /**
     * @description 监听器
     */
    this.listeners = [];

    // 注册内置主题
    Object.values(builtinThemes).forEach(theme => {
      this.registerTheme(theme);
    });

    // 设置初始主题
    const themeName = initialTheme || this.detectPreferredTheme();
    this.currentTheme = this.getTheme(themeName) || getDefaultTheme();
    this.applyTheme();
  }

  /**
   * 注册主题
   * @param theme 主题对象
   * @returns 是否成功注册
   */
  registerTheme(theme: Theme): boolean {
    if (!theme.name) {
      console.error('Theme must have a name');
      return false;
    }

    this.themes.set(theme.name.toString(), theme);
    return true;
  }

  /**
   * 获取主题
   * @param name 主题名称
   * @returns 主题对象
   */
  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * 获取当前主题
   * @returns 当前主题对象
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * 获取所有已注册的主题
   * @returns 主题映射
   */
  getAllThemes(): Map<string, Theme> {
    return this.themes;
  }

  /**
   * 切换主题
   * @param name 主题名称
   * @returns 是否成功切换
   */
  setTheme(name: string): boolean {
    const theme = this.getTheme(name);
    if (!theme) {
      console.error(`Theme "${name}" not found`);
      return false;
    }

    this.currentTheme = theme;
    this.applyTheme();
    this.savePreference(name);
    this.notifyListeners();

    return true;
  }

  /**
   * 创建自定义主题
   * @param name 主题名称
   * @param variables 主题变量
   * @param customCSS 自定义CSS
   * @returns 是否成功创建
   */
  createCustomTheme(name: string, variables: Partial<ThemeVariables>, customCSS?: string): boolean {
    // 基于默认主题创建
    const baseTheme = getDefaultTheme();

    const customTheme: Theme = {
      name,
      variables: {
        ...baseTheme.variables,
        ...variables
      },
      customCSS
    };

    return this.registerTheme(customTheme);
  }

  /**
   * 应用当前主题
   */
  applyTheme(): void {
    // 生成CSS变量
    const css = this.generateThemeCSS();

    // 创建或更新样式元素
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'markdown-theme-style';
      document.head.appendChild(this.styleElement);
    }

    this.styleElement.textContent = css;

    // 更新文档根元素的data-theme属性
    document.documentElement.setAttribute('data-theme', this.currentTheme.name.toString());
  }

  /**
   * 生成主题CSS
   * @returns CSS字符串
   */
  generateThemeCSS(): string {
    const { variables, customCSS } = this.currentTheme;

    // 生成CSS变量
    let css = `:root {
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
    }`;

    // 添加基础样式
    css += `
    .markdown-body {
      font-family: var(--md-font-family);
      font-size: var(--md-font-size);
      line-height: var(--md-line-height);
      color: var(--md-text-color);
      background-color: var(--md-bg-color);
      padding: var(--md-spacing);
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
      color: var(--md-heading-color);
      margin-top: calc(var(--md-spacing) * 1.5);
      margin-bottom: var(--md-spacing);
    }

    .markdown-body h1,
    .markdown-body h2 {
      border-bottom: 1px solid var(--md-border-color);
      padding-bottom: calc(var(--md-spacing) * 0.3);
    }

    .markdown-body a {
      color: var(--md-link-color);
      text-decoration: none;
    }

    .markdown-body a:hover {
      text-decoration: underline;
    }

    .markdown-body code {
      font-family: var(--md-code-font-family);
      background-color: var(--md-code-bg-color);
      color: var(--md-code-text-color);
      padding: 0.2em 0.4em;
      border-radius: var(--md-border-radius);
    }

    .markdown-body pre {
      background-color: var(--md-code-bg-color);
      border-radius: var(--md-border-radius);
      padding: var(--md-spacing);
      overflow: auto;
    }

    .markdown-body pre code {
      background-color: transparent;
      padding: 0;
    }

    .markdown-body blockquote {
      margin: var(--md-spacing) 0;
      padding: 0 1em;
      color: var(--md-blockquote-color);
      border-left: 0.25em solid var(--md-border-color);
    }

    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
      margin: var(--md-spacing) 0;
    }

    .markdown-body table th {
      background-color: var(--md-table-header-bg);
      font-weight: 600;
    }

    .markdown-body table th,
    .markdown-body table td {
      border: 1px solid var(--md-table-border-color);
      padding: 0.5em 1em;
    }
    `;

    // 添加自定义CSS
    if (customCSS) {
      css += `\n/* 自定义样式 */\n${customCSS}`;
    }

    return css;
  }

  /**
   * 添加主题变更监听器
   * @param listener 监听器函数
   */
  addListener(listener: (theme: Theme) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除主题变更监听器
   * @param listener 监听器函数
   */
  removeListener(listener: (theme: Theme) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * 检测用户首选主题
   * @returns 首选主题名称
   */
  private detectPreferredTheme(): string {
    // 首先检查本地存储
    const savedTheme = this.loadPreference();
    if (savedTheme) {
      return savedTheme;
    }

    // 然后检查系统首选项
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return ThemeName.DARK;
    }

    // 默认返回浅色主题
    return ThemeName.LIGHT;
  }

  /**
   * 保存主题首选项
   * @param themeName 主题名称
   */
  private savePreference(themeName: string): void {
    try {
      localStorage.setItem('markdown-theme', themeName);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * 加载主题首选项
   * @returns 保存的主题名称
   */
  private loadPreference(): string | null {
    try {
      return localStorage.getItem('markdown-theme');
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return null;
    }
  }
}

export default ThemeManager;
