import { DySchema } from '../../types/schema';
import { IRenderNode } from '../types';
import { produce } from 'immer';

/**
 * Schema解析器
 * 负责将Schema协议转换为渲染节点
 */
export class SchemaParser {
  /**
   * 解析Schema为渲染节点树
   * @param schema Schema协议
   * @returns 渲染节点树
   */
  parse(schema: DySchema): IRenderNode {
    return this.parseNode(schema);
  }

  /**
   * 解析单个Schema节点
   * @param schema Schema节点
   * @returns 渲染节点
   */
  private parseNode(schema: DySchema): IRenderNode {
    // 提取组件名称
    const componentName = this.extractComponentName(schema.__type || '');

    // 构建渲染节点
    const renderNode: IRenderNode = {
      componentName: componentName || schema.__name,
      props: this.parseProps(schema.__props || {}),
      children: this.parseChildren(schema.__children || [])
    };

    return renderNode;
  }

  /**
   * 提取组件名称
   * @param type 组件类型（格式：namespace::componentName）
   * @returns 组件名称
   */
  private extractComponentName(type: string): string {
    if (!type || !type.includes('::')) {
      return '';
    }

    const [namespace, componentName] = type.split('::');
    return componentName;
  }

  /**
   * 解析组件属性
   * @param props 组件属性
   * @returns 解析后的属性
   */
  private parseProps(props: Record<string, any>): Record<string, any> {
    // 使用immer确保不可变性
    return produce(props, (draft) => {
      // 处理特殊属性，如样式
      if (draft.__style) {
        draft.style = draft.__style;
      }

      // 处理文本内容
      if (draft.__text) {
        draft.children = draft.__text;
      }

      // 移除内部属性（以双下划线开头的属性）
      Object.keys(draft).forEach(key => {
        if (key.startsWith('__')) {
          delete draft[key];
        }
      });
    });
  }

  /**
   * 解析子节点
   * @param children 子节点数组
   * @returns 解析后的子节点数组
   */
  private parseChildren(children: DySchema[]): IRenderNode[] {
    return children.map(child => this.parseNode(child));
  }
}
