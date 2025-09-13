import { IStyleBasic, IStyleFont, IStyleText } from '../../types/style';
import { IStyleProcessOptions } from '../types';

/**
 * 样式应用工具
 * 负责处理和应用组件样式
 */
export class StyleApplier {
  private defaultOptions: IStyleProcessOptions = {
    applyDefaultStyles: true,
    convertUnits: true,
    handlePrefixes: true
  };

  /**
   * 构造函数
   * @param options 样式处理选项
   */
  constructor(private options: IStyleProcessOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * 应用样式到DOM元素
   * @param element 目标DOM元素
   * @param style 样式对象
   */
  applyStyles(element: HTMLElement, style?: IStyleBasic): void {
    if (!style) return;

    // 应用基础样式
    this.applyBasicStyles(element, style);

    // 应用字体样式
    if (this.hasStyleFont(style)) {
      this.applyFontStyles(element, style);
    }

    // 应用文本样式
    if (this.hasStyleText(style)) {
      this.applyTextStyles(element, style);
    }
  }

  /**
   * 应用基础样式
   * @param element 目标DOM元素
   * @param style 样式对象
   */
  private applyBasicStyles(element: HTMLElement, style: IStyleBasic): void {
    const { style: elementStyle } = element;

    // 应用边距
    if (style.marginTop) elementStyle.marginTop = this.processUnit(style.marginTop);
    if (style.marginBottom) elementStyle.marginBottom = this.processUnit(style.marginBottom);
    if (style.marginLeft) elementStyle.marginLeft = this.processUnit(style.marginLeft);
    if (style.marginRight) elementStyle.marginRight = this.processUnit(style.marginRight);

    // 应用内边距
    if (style.paddingTop) elementStyle.paddingTop = this.processUnit(style.paddingTop);
    if (style.paddingBottom) elementStyle.paddingBottom = this.processUnit(style.paddingBottom);
    if (style.paddingLeft) elementStyle.paddingLeft = this.processUnit(style.paddingLeft);
    if (style.paddingRight) elementStyle.paddingRight = this.processUnit(style.paddingRight);

    // 应用边框
    if (style.borderTop) elementStyle.borderTop = style.borderTop;
    if (style.borderBottom) elementStyle.borderBottom = style.borderBottom;
    if (style.borderLeft) elementStyle.borderLeft = style.borderLeft;
    if (style.borderRight) elementStyle.borderRight = style.borderRight;

    // 应用圆角
    if (style.borderRadiusTopLeft) elementStyle.borderTopLeftRadius = this.processUnit(style.borderRadiusTopLeft);
    if (style.borderRadiusTopRight) elementStyle.borderTopRightRadius = this.processUnit(style.borderRadiusTopRight);
    if (style.borderRadiusBottomLeft) elementStyle.borderBottomLeftRadius = this.processUnit(style.borderRadiusBottomLeft);
    if (style.borderRadiusBottomRight) elementStyle.borderBottomRightRadius = this.processUnit(style.borderRadiusBottomRight);

    // 应用背景
    if (style.backgroundColor) elementStyle.backgroundColor = style.backgroundColor;
    if (style.backgroundImage) elementStyle.backgroundImage = style.backgroundImage;
    if (style.backgroundSize) elementStyle.backgroundSize = style.backgroundSize;
    if (style.backgroundPosition) elementStyle.backgroundPosition = style.backgroundPosition;
    if (style.backgroundRepeat) elementStyle.backgroundRepeat = style.backgroundRepeat;
  }

  /**
   * 应用字体样式
   * @param element 目标DOM元素
   * @param style 样式对象
   */
  private applyFontStyles(element: HTMLElement, style: IStyleFont): void {
    const { style: elementStyle } = element;

    if (style.color) elementStyle.color = style.color;
    if (style.fontSize) elementStyle.fontSize = this.processUnit(style.fontSize);
    if (style.fontWeight) elementStyle.fontWeight = style.fontWeight;
    if (style.fontStyle) elementStyle.fontStyle = style.fontStyle;
    if (style.fontFamily) elementStyle.fontFamily = style.fontFamily;
  }

  /**
   * 应用文本样式
   * @param element 目标DOM元素
   * @param style 样式对象
   */
  private applyTextStyles(element: HTMLElement, style: IStyleText): void {
    const { style: elementStyle } = element;

    if (style.textAlign) elementStyle.textAlign = style.textAlign;
    if (style.textDecoration) elementStyle.textDecoration = style.textDecoration;
    if (style.textTransform) elementStyle.textTransform = style.textTransform;
    if (style.lineHeight) elementStyle.lineHeight = style.lineHeight;
    if (style.letterSpacing) elementStyle.letterSpacing = this.processUnit(style.letterSpacing);
    if (style.wordSpacing) elementStyle.wordSpacing = this.processUnit(style.wordSpacing);
    if (style.textShadow) elementStyle.textShadow = style.textShadow;
  }

  /**
   * 检查是否包含字体样式
   * @param style 样式对象
   * @returns 是否包含字体样式
   */
  private hasStyleFont(style: any): style is IStyleFont {
    return style.color !== undefined ||
           style.fontSize !== undefined ||
           style.fontWeight !== undefined ||
           style.fontStyle !== undefined ||
           style.fontFamily !== undefined;
  }

  /**
   * 检查是否包含文本样式
   * @param style 样式对象
   * @returns 是否包含文本样式
   */
  private hasStyleText(style: any): style is IStyleText {
    return style.textAlign !== undefined ||
           style.textDecoration !== undefined ||
           style.textTransform !== undefined ||
           style.lineHeight !== undefined ||
           style.letterSpacing !== undefined ||
           style.wordSpacing !== undefined ||
           style.textShadow !== undefined;
  }

  /**
   * 处理样式单位
   * @param value 样式值
   * @returns 处理后的样式值
   */
  private processUnit(value: string): string {
    if (!this.options.convertUnits) return value;

    // 如果值是纯数字，添加px单位
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return `${value}px`;
    }

    return value;
  }
}
