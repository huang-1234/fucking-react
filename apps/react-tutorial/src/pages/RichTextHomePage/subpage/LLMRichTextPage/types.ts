import { type ReactNode } from 'react';

// 流式渲染配置
export interface StreamingConfig {
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
  showCursor: boolean;
  cursorChar: string;
  delay: number;
}

// 渲染内容类型
export interface ContentChunk {
  id: string;
  type: 'text' | 'code' | 'math' | 'mermaid' | 'table' | 'image';
  content: string;
  metadata?: Record<string, any>;
}

// 渲染状态
export interface RenderState {
  isComplete: boolean;
  currentIndex: number;
  visibleContent: string;
  chunks: ContentChunk[];
}

// LLM富文本渲染器属性
export interface LLMRichTextRendererProps extends LLMCodeBlockProps {
  content: string | ContentChunk[];
  isStreaming?: boolean;
  streamingConfig?: Partial<StreamingConfig>;
  onRenderComplete?: () => void;
  onChunkComplete?: (chunkId: string) => void;
  className?: string;
  allowHtml?: boolean;
  enableMath?: boolean;
  enableMermaid?: boolean;
  enableGfm?: boolean;
  renderPlaceholder?: ReactNode;
}

// 代码块属性
export interface LLMCodeBlockProps {
  language: string;
  code: string;
  isStreaming?: boolean;
  streamingConfig?: Partial<StreamingConfig>;
  onComplete?: () => void;
  theme?: "light" | "dark" | "sepia";
}

// 流式文本渲染属性
export interface StreamingTextProps {
  text: string;
  speed?: 'slow' | 'normal' | 'fast';
  showCursor?: boolean;
  cursorChar?: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  isComplete?: boolean;
}
