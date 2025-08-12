/**
 * Babel插件 - 将JSX转换为React.createElement调用
 * 用于编译时转换
 */

module.exports = function() {
  return {
    name: "transform-jsx",
    visitor: {
      JSXElement(path) {
        const t = this.types || require('@babel/types');
        const openingElement = path.node.openingElement;
        const tagName = openingElement.name.name;
        const attributes = openingElement.attributes;

        // 转换JSX属性为对象属性
        const props = attributes.map(attr => {
          if (t.isJSXAttribute(attr)) {
            const key = t.identifier(attr.name.name);
            let value;

            if (attr.value && t.isJSXExpressionContainer(attr.value)) {
              value = attr.value.expression;
            } else if (attr.value === null) {
              value = t.booleanLiteral(true);
            } else if (t.isStringLiteral(attr.value)) {
              value = attr.value;
            } else {
              // 默认情况，应该不会到达这里
              value = t.stringLiteral('');
            }

            return t.objectProperty(key, value);
          } else if (t.isJSXSpreadAttribute(attr)) {
            // 处理扩展属性 {...props}
            return t.spreadElement(attr.argument);
          }
          return null;
        }).filter(Boolean);

        // 处理子元素
        const children = path.node.children.map(child => {
          if (t.isJSXText(child)) {
            const text = child.value.trim();
            return text ? t.stringLiteral(text) : null;
          } else if (t.isJSXExpressionContainer(child)) {
            return child.expression;
          } else if (t.isJSXElement(child)) {
            // 递归处理子JSX元素
            // 这里不直接处理，让Babel访问者模式自动递归处理
            return child;
          } else if (t.isJSXFragment(child)) {
            // 处理JSX Fragment
            return t.callExpression(
              t.memberExpression(t.identifier("React"), t.identifier("Fragment")),
              [
                t.objectExpression([]),
                ...child.children
                  .filter(c => t.isJSXText(c) ? c.value.trim() !== '' : true)
                  .map(c => {
                    if (t.isJSXText(c)) {
                      return t.stringLiteral(c.value.trim());
                    } else if (t.isJSXExpressionContainer(c)) {
                      return c.expression;
                    }
                    return c;
                  })
              ]
            );
          }
          return null;
        }).filter(Boolean);

        // 创建React.createElement调用
        let elementType;
        if (t.isJSXIdentifier(openingElement.name)) {
          // 普通标签名
          elementType = /^[a-z]/.test(tagName)
            ? t.stringLiteral(tagName) // 小写字母开头的是HTML标签
            : t.identifier(tagName);   // 大写字母开头的是组件
        } else if (t.isJSXMemberExpression(openingElement.name)) {
          // 处理命名空间组件，如 Namespace.Component
          let object = openingElement.name.object;
          let property = openingElement.name.property;

          elementType = t.memberExpression(
            t.identifier(object.name),
            t.identifier(property.name)
          );
        }

        const createElement = t.callExpression(
          t.memberExpression(t.identifier("React"), t.identifier("createElement")),
          [
            elementType,
            t.objectExpression(props),
            ...children
          ]
        );

        path.replaceWith(createElement);
      },

      // 处理JSX片段
      JSXFragment(path) {
        const t = this.types || require('@babel/types');
        const children = path.node.children
          .filter(child => {
            if (t.isJSXText(child)) {
              return child.value.trim() !== '';
            }
            return true;
          })
          .map(child => {
            if (t.isJSXText(child)) {
              return t.stringLiteral(child.value.trim());
            } else if (t.isJSXExpressionContainer(child)) {
              return child.expression;
            }
            return child;
          });

        const fragmentCall = t.callExpression(
          t.memberExpression(t.identifier("React"), t.identifier("createElement")),
          [
            t.memberExpression(t.identifier("React"), t.identifier("Fragment")),
            t.objectExpression([]),
            ...children
          ]
        );

        path.replaceWith(fragmentCall);
      }
    }
  };
};