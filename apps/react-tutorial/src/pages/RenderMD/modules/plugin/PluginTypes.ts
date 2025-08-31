import { type ASTNode } from '../../common/md';
import type { InnerPluginId } from './common';

/**
 * @description 插件类型枚举
 */
export enum PluginType {
  SYNTAX = 'syntax',      // 语法扩展插件
  RENDERER = 'renderer',  // 渲染扩展插件
  TRANSFORM = 'transform', // AST转换插件
  EXTENSION = 'extension' // 扩展功能插件
}

/**
 * @description 插件钩子函数枚举
 */
export enum PluginHook {
  BEFORE_PARSE = 'before_parse',   // 解析前处理原始文本
  AFTER_PARSE = 'after_parse',     // 解析后处理AST
  BEFORE_RENDER = 'before_render', // 渲染前处理AST
  AFTER_RENDER = 'after_render',   // 渲染后处理输出
  RENDER_NODE = 'render_node'      // 渲染特定节点
}

/**
 * @description 插件上下文接口
 */
export interface PluginContext {
  options: Record<string, any>;
  [key: string]: any;
}

/**
 * @description 插件接口
 */
export interface MarkdownPlugin {
  /**
   * @description 插件ID
   */
  id: InnerPluginId | string;
  /**
   * @description 插件名称
   */
  name: InnerPluginId | string;
  /**
   * @description 插件类型
   */
  type: PluginType;
  /**
   * @description 插件优先级
   */
  priority?: number;
  /**
   * @description 插件钩子
   */
  hooks?: {
    [PluginHook.BEFORE_PARSE]?: (text: string, context: PluginContext) => string;
    [PluginHook.AFTER_PARSE]?: (ast: ASTNode, context: PluginContext) => ASTNode;
    [PluginHook.BEFORE_RENDER]?: (ast: ASTNode, context: PluginContext) => ASTNode;
    [PluginHook.AFTER_RENDER]?: (output: any, context: PluginContext) => any;
    [PluginHook.RENDER_NODE]?: (node: ASTNode, context: PluginContext) => any;
  };
  /**
   * @description 插件初始化
   */
  init?: (context: PluginContext) => void;
  /**
   * @description 插件销毁
   */
  destroy?: () => void;
}

/**
 * @description 插件注册选项
 */
export interface PluginOptions {
  [key: string]: any;
}