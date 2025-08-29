import { sanitizeSchema } from '../utils/sanitizeSchema';
import type { MarkdownConfig } from '../types/markdown';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const markdownThemes = {
  light: {
    name: 'light',
    codeTheme: oneLight,
    backgroundColor: '#ffffff',
    textColor: '#24292e',
    linkColor: '#0366d6',
    headingColor: '#24292e',
    borderColor: '#e1e4e8',
    blockquoteColor: '#6a737d',
    codeBackgroundColor: '#f6f8fa'
  },
  dark: {
    name: 'dark',
    codeTheme: oneDark,
    backgroundColor: '#0d1117',
    textColor: '#c9d1d9',
    linkColor: '#58a6ff',
    headingColor: '#e6edf3',
    borderColor: '#30363d',
    blockquoteColor: '#8b949e',
    codeBackgroundColor: '#161b22'
  },
  sepia: {
    name: 'sepia',
    codeTheme: oneLight,
    backgroundColor: '#f8f2e3',
    textColor: '#5b4636',
    linkColor: '#1e6bb8',
    headingColor: '#704214',
    borderColor: '#e0d6c2',
    blockquoteColor: '#8a7055',
    codeBackgroundColor: '#f0e8d6'
  }
};

export const defaultMarkdownConfig: MarkdownConfig = {
  theme: 'light',
  enableCache: true,
  enableVirtualScroll: false,
  enableToc: true,
  enableMath: false,
  enableGfm: true,
  enableSanitize: true,
  linkTarget: '_blank'
};

export const markdownConfig = {
  skipHtml: false,
  allowedElements: sanitizeSchema.tagNames,
  linkTarget: '_blank' as const,
  transformLinkUri: (uri: string) => {
    // 验证 URL 安全性
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', '#'];
    try {
      if (uri.startsWith('#')) return uri;
      const url = new URL(uri, window.location.origin);
      return allowedProtocols.includes(url.protocol) ? uri : '';
    } catch {
      return uri; // 如果无法解析为URL，可能是相对路径，保留原样
    }
  }
};
