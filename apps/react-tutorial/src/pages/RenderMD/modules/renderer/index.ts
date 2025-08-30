import HtmlRenderer from './HtmlRenderer';
import CustomRenderer from './CustomRenderer';
import StyleMapper from './StyleMapper';
import { type ASTNode } from '../../common/md';

/**
 * 输出格式枚举
 */
export enum OutputFormat {
  HTML = 'html',
  REACT = 'react',
  TEXT = 'text'
}

/**
 * 渲染选项接口
 */
export interface RenderOptions {
  /** @description 输出格式 */
  format?: OutputFormat;
  /** @description 主题 */
  theme?: string;
  /** @description 是否进行安全过滤 */
  sanitize?: boolean;
  /** @description 链接目标 */
  linkTarget?: string;
  /** @description 组件 */
  components?: Record<string, React.ComponentType<any>>;
}

/**
 * 渲染处理模块
 * 将AST转换为目标输出格式
 */
export class RenderProcessor {
  /**
   * @description HTML渲染器
   * @type {HtmlRenderer}
   */
  private htmlRenderer: HtmlRenderer;
  /** @description 自定义渲染器 */
  /** @type {CustomRenderer} */
  private customRenderer: CustomRenderer;
  /** @description 样式映射器 */
  private styleMapper: StyleMapper;
  /** @type {RenderOptions} */
  /** @description 渲染选项 */
  private options: RenderOptions;

  constructor(options?: RenderOptions) {
    this.options = {
      format: options?.format || OutputFormat.HTML,
      theme: options?.theme || 'light',
      sanitize: options?.sanitize ?? true,
      linkTarget: options?.linkTarget || '_blank',
      components: options?.components || {}
    };

    this.htmlRenderer = new HtmlRenderer({
      sanitize: this.options.sanitize,
      linkTarget: this.options.linkTarget
    });

    this.customRenderer = new CustomRenderer({
      components: this.options.components,
      sanitize: this.options.sanitize,
      linkTarget: this.options.linkTarget
    });

    this.styleMapper = new StyleMapper(this.options.theme);
  }

  /**
   * @description 渲染AST
   * @param ast 抽象语法树
   * @returns 渲染结果
   */
  render(ast: ASTNode): any {
    switch (this.options.format) {
      case OutputFormat.HTML:
        return this.htmlRenderer.render(ast);

      case OutputFormat.REACT:
        return this.customRenderer.render(ast);

      case OutputFormat.TEXT:
        return this.renderToText(ast);

      default:
        return this.htmlRenderer.render(ast);
    }
  }

  /**
   * @description 渲染AST为纯文本
   * @param ast 抽象语法树
   * @returns 纯文本内容
   */
  private renderToText(ast: ASTNode): string {
    // 简单实现：提取所有文本内容
    const extractText = (node: ASTNode): string => {
      if (node.content) {
        return node.content;
      }

      if (node.children && node.children.length > 0) {
        return node.children.map(extractText).join(' ');
      }

      return '';
    };

    return extractText(ast);
  }

  /**
   * @description 更新渲染选项
   * @param options 新的渲染选项
   */
  updateOptions(options: Partial<RenderOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };

    // 更新渲染器选项
    this.htmlRenderer = new HtmlRenderer({
      sanitize: this.options.sanitize,
      linkTarget: this.options.linkTarget
    });

    this.customRenderer = new CustomRenderer({
      components: this.options.components,
      sanitize: this.options.sanitize,
      linkTarget: this.options.linkTarget
    });

    // 更新样式映射器主题
    if (options.theme) {
      this.styleMapper.setTheme(options.theme);
    }
  }

  /**
   * @description 获取样式映射器
   * @returns 样式映射器实例
   */
  getStyleMapper(): StyleMapper {
    return this.styleMapper;
  }

  /**
   * @description 获取CSS变量
   * @returns CSS变量定义字符串
   */
  getCssVariables(): string {
    return this.styleMapper.generateCssVariables();
  }

  /**
   * @description 获取CSS样式表
   * @returns CSS样式表字符串
   */
  getStylesheet(): string {
    return this.styleMapper.generateStylesheet();
  }
}

export { HtmlRenderer, CustomRenderer, StyleMapper };
export default RenderProcessor;
