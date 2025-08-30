/**
 * 主题定义模块
 * 定义各种主题的颜色、字体等样式变量
 */

/**
 * 主题名称枚举
 */
export enum ThemeName {
  LIGHT = 'light',
  DARK = 'dark',
  SEPIA = 'sepia',
  CUSTOM = 'custom'
}

/**
 * 主题变量接口
 */
export interface ThemeVariables {
  // 基础颜色
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  headingColor: string;
  borderColor: string;

  // 元素颜色
  blockquoteColor: string;
  codeBackgroundColor: string;
  codeTextColor: string;
  tableHeaderBackgroundColor: string;
  tableBorderColor: string;

  // 字体设置
  fontFamily: string;
  codeFontFamily: string;
  fontSize: string;
  lineHeight: string;

  // 间距设置
  spacing: string;

  // 其他设置
  borderRadius: string;
  boxShadow: string;
}

/**
 * 主题接口
 */
export interface Theme {
  name: ThemeName | string;
  variables: ThemeVariables;
  customCSS?: string;
}

/**
 * 浅色主题
 */
export const lightTheme: Theme = {
  name: ThemeName.LIGHT,
  variables: {
    // 基础颜色
    backgroundColor: '#ffffff',
    textColor: '#24292e',
    linkColor: '#0366d6',
    headingColor: '#24292e',
    borderColor: '#e1e4e8',

    // 元素颜色
    blockquoteColor: '#6a737d',
    codeBackgroundColor: '#f6f8fa',
    codeTextColor: '#24292e',
    tableHeaderBackgroundColor: '#f6f8fa',
    tableBorderColor: '#e1e4e8',

    // 字体设置
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    codeFontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '16px',
    lineHeight: '1.6',

    // 间距设置
    spacing: '16px',

    // 其他设置
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  }
};

/**
 * 深色主题
 */
export const darkTheme: Theme = {
  name: ThemeName.DARK,
  variables: {
    // 基础颜色
    backgroundColor: '#0d1117',
    textColor: '#c9d1d9',
    linkColor: '#58a6ff',
    headingColor: '#e6edf3',
    borderColor: '#30363d',

    // 元素颜色
    blockquoteColor: '#8b949e',
    codeBackgroundColor: '#161b22',
    codeTextColor: '#c9d1d9',
    tableHeaderBackgroundColor: '#161b22',
    tableBorderColor: '#30363d',

    // 字体设置
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    codeFontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '16px',
    lineHeight: '1.6',

    // 间距设置
    spacing: '16px',

    // 其他设置
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  }
};

/**
 * 护眼主题
 */
export const sepiaTheme: Theme = {
  name: ThemeName.SEPIA,
  variables: {
    // 基础颜色
    backgroundColor: '#f8f2e3',
    textColor: '#5b4636',
    linkColor: '#1e6bb8',
    headingColor: '#704214',
    borderColor: '#e0d6c2',

    // 元素颜色
    blockquoteColor: '#8a7055',
    codeBackgroundColor: '#f0e8d6',
    codeTextColor: '#5b4636',
    tableHeaderBackgroundColor: '#f0e8d6',
    tableBorderColor: '#e0d6c2',

    // 字体设置
    fontFamily: 'Georgia, serif',
    codeFontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '16px',
    lineHeight: '1.7',

    // 间距设置
    spacing: '16px',

    // 其他设置
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  }
};

/**
 * 获取默认主题
 * @returns 默认主题对象
 */
export function getDefaultTheme(): Theme {
  return lightTheme;
}

/**
 * 获取指定名称的主题
 * @param name 主题名称
 * @returns 主题对象
 */
export function getThemeByName(name: string): Theme {
  switch (name) {
    case ThemeName.DARK:
      return darkTheme;
    case ThemeName.SEPIA:
      return sepiaTheme;
    case ThemeName.LIGHT:
    default:
      return lightTheme;
  }
}

/**
 * 所有内置主题
 */
export const builtinThemes: Record<string, Theme> = {
  [ThemeName.LIGHT]: lightTheme,
  [ThemeName.DARK]: darkTheme,
  [ThemeName.SEPIA]: sepiaTheme
};
