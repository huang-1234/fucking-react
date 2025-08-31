/**
 * Markdown配置
 * 定义Markdown渲染器的默认配置
 */

export const markdownConfig = {
  // 默认主题
  defaultTheme: 'light',

  // 默认启用的功能
  features: {
    cache: true,
    virtualScroll: false,
    toc: true,
    math: true,
    gfm: true,
    sanitize: true,
    codeHighlight: true,
    mermaid: true,
    emoji: true
  },

  // 链接设置
  linkTarget: '_blank',

  // 代码高亮设置
  codeHighlight: {
    theme: {
      light: 'github',
      dark: 'dracula'
    },
    showLineNumbers: true,
    languages: [
      'javascript', 'typescript', 'jsx', 'tsx',
      'python', 'java', 'c', 'cpp', 'csharp',
      'go', 'rust', 'php', 'ruby', 'swift',
      'kotlin', 'scala', 'html', 'css', 'scss',
      'json', 'yaml', 'markdown', 'bash', 'shell',
      'sql', 'graphql', 'dockerfile', 'diff'
    ]
  },

  // Mermaid设置
  mermaid: {
    theme: {
      light: 'default',
      dark: 'dark'
    }
  },

  // 数学公式设置
  math: {
    inlineMathDelimiters: ['$', '$'],
    blockMathDelimiters: ['$$', '$$']
  },

  // URL转换函数
  transformLinkUri: (uri: string) => {
    // 默认不转换，直接返回原始URL
    // 可以在这里添加URL转换逻辑，如添加跟踪参数、转换相对路径等
    return uri;
  }
};

export default markdownConfig;


export const markdownThemes = {
  light: {
    name: 'light',
    label: '亮色',
    style: {
      backgroundColor: '#ffffff',
      color: '#000000'
    }
  }
};

export const defaultMarkdownConfig = {
  theme: 'light',
  enableCache: true,
  enableVirtualScroll: false,
  enableToc: true,
  enableMath: true,
  enableGfm: true,
  enableSanitize: true,
  linkTarget: '_blank'
};