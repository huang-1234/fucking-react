/**
 * Babel插件 - 将JSX转换为React.createElement调用
 * 用于编译时转换
 */

import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { type PluginObj, type PluginPass } from '@babel/core';
import { JSXAttribute, JSXSpreadAttribute } from '@babel/types';

interface BabelPluginOptions {
  [key: string]: any;
}

export default function transformJSX(): PluginObj<PluginPass> {
  return {
    name: "transform-jsx",
    visitor: {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const tagName = (openingElement.name as t.JSXIdentifier).name;
        const attributes = openingElement.attributes;

        // 转换JSX属性为对象属性
        const props = attributes.map((attr: any) => {
          if (t.isJSXAttribute(attr)) {
            const key = t.identifier(attr.name.name as string);
            let value: t.Expression;

            if (attr.value && t.isJSXExpressionContainer(attr.value)) {
              value = attr.value.expression as t.Expression;
            } else if (attr.value === null) {
              value = t.booleanLiteral(true);
            } else if (t.isStringLiteral(attr.value)) {
              value = attr.value;
            } else {
              // 默认情况，应该不会到达这里
              value = t.stringLiteral('');
            }

            return t.objectProperty(key, value);
          }
          return null;
        }).filter(Boolean) as t.ObjectProperty[];

        // 处理子元素
        const children = path.node.children.map(child => {
          if (t.isJSXText(child)) {
            const text = child.value.trim();
            return text ? t.stringLiteral(text) : null;
          } else if (t.isJSXExpressionContainer(child)) {
            return child.expression as t.Expression;
          } else if (t.isJSXElement(child)) {
            // 递归处理子JSX元素
            // 注意：这里的实现是简化的，实际需要更复杂的处理
            return t.callExpression(
              t.memberExpression(t.identifier("React"), t.identifier("createElement")),
              [
                t.stringLiteral((child.openingElement.name as t.JSXIdentifier).name),
                t.objectExpression([]),
                ...child.children
                  .filter(c => t.isJSXText(c) ? c.value.trim() !== '' : true)
                  .map(c => {
                    if (t.isJSXText(c)) {
                      return t.stringLiteral(c.value.trim());
                    } else if (t.isJSXExpressionContainer(c)) {
                      return c.expression as t.Expression;
                    }
                    return t.nullLiteral(); // 默认情况
                  })
              ]
            );
          }
          return null;
        }).filter(Boolean) as t.Expression[];

        // 创建React.createElement调用
        const createElement = t.callExpression(
          t.memberExpression(t.identifier("React"), t.identifier("createElement")),
          [
            t.stringLiteral(tagName),
            t.objectExpression(props),
            ...children
          ]
        );

        path.replaceWith(createElement as any);
      }
    }
  };
}