import type { Components } from 'react-markdown';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowHtml?: boolean;
  linkTarget?: '_blank' | '_self' | '_parent' | '_top';
  allowedElements?: string[];
  skipHtml?: boolean;
  onHeadingsChange?: (headings: Heading[]) => void;
}

export interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface CustomComponents extends Partial<Components> {
  code?: React.ComponentType<CodeBlockProps>;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface MarkdownTheme {
  name: string;
  codeTheme: any;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  headingColor: string;
  borderColor: string;
  blockquoteColor: string;
  codeBackgroundColor: string;
}

export interface MarkdownConfig {
  theme: string;
  enableCache: boolean;
  enableVirtualScroll: boolean;
  enableToc: boolean;
  enableMath: boolean;
  enableGfm: boolean;
  enableSanitize: boolean;
  linkTarget: '_blank' | '_self' | '_parent' | '_top';
}
