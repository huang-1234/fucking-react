import React from 'react';

// Markdown配置
export interface MarkdownConfig {
  theme: string;
  enableCache: boolean;
  enableVirtualScroll: boolean;
  enableToc: boolean;
  enableMath: boolean;
  enableGfm: boolean;
  enableSanitize: boolean;
  linkTarget: string;
}

// 标题结构
export interface Heading {
  id: string;
  text: string;
  level: number;
}

// 代码块属性
export interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Markdown渲染器属性
export interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowHtml?: boolean;
  linkTarget?: string;
  allowedElements?: string[];
  skipHtml?: boolean;
  onHeadingsChange?: (headings: Heading[]) => void;
}

// 自定义组件类型
export interface CustomComponents {
  [key: string]: React.ComponentType<any>;
}

// 性能指标类型
export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime?: number;
  endTime?: number;
}

// 插件类型
export enum PluginType {
  PARSER = 'parser',
  RENDERER = 'renderer',
  EXTENSION = 'extension'
}

// 插件钩子类型
export enum PluginHook {
  BEFORE_PARSE = 'before_parse',
  AFTER_PARSE = 'after_parse',
  BEFORE_RENDER = 'before_render',
  AFTER_RENDER = 'after_render'
}

// 插件上下文
export interface PluginContext {
  config: MarkdownConfig;
}

// 插件定义
export interface MarkdownPlugin {
  id: string;
  name: string;
  type: PluginType;
  hooks: {
    [key in PluginHook]?: (content: any, context: PluginContext) => any;
  };
  enabled?: boolean;
  priority?: number;
}

export interface MarkdownTheme {
  name: string;
  label: string;
  style: {
    backgroundColor: string;
    color: string;
  };
}
