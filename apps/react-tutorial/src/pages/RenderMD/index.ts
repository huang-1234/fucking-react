import MarkdownLearningPage from './index.tsx';

export default MarkdownLearningPage;

// 导出组件
export { default as MarkdownRenderer } from './components/MarkdownRenderer';
export { default as CodeBlock } from './components/CodeBlock';
export { default as TableOfContents } from './components/TableOfContents';
export { default as ControlPanel } from './components/ControlPanel';
export { default as VirtualizedMarkdown } from './components/VirtualizedMarkdown';

// 导出工具和钩子
export { default as useTheme } from './hooks/useTheme';
export { default as markdownCache } from './utils/cache';
export { sanitizeSchema } from './utils/sanitizeSchema';
export { markdownConfig, markdownThemes, defaultMarkdownConfig } from './config/markdownConfig';

// 导出类型
export type {
  MarkdownRendererProps,
  CodeBlockProps,
  CustomComponents,
  Heading,
  MarkdownTheme,
  MarkdownConfig
} from './types/markdown';
