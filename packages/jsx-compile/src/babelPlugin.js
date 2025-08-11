/**
 * Babel插件 - 将JSX转换为React.createElement调用
 * 用于编译时转换
 */

module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: "transform-jsx",
    visitor: {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const tagName = openingElement.name.name;
        const attributes = openingElement.attributes;

        // 转换JSX属性为对象属性
        const props = attributes.map(attr => {
          if (t.isJSXAttribute(attr)) {
            const key = t.identifier(attr.name.name);
            let value;

            if (t.isJSXExpressionContainer(attr.value)) {
              value = attr.value.expression;
            } else if (attr.value === null) {
              value = t.booleanLiteral(true);
            } else {
              value = attr.value;
            }

            return t.objectProperty(key, value);
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
            return path.traverse({
              JSXElement(childPath) {
                childPath.replaceWith(
                  t.callExpression(
                    t.memberExpression(t.identifier("React"), t.identifier("createElement")),
                    [
                      t.stringLiteral(childPath.node.openingElement.name.name),
                      t.objectExpression([]),
                      ...childPath.node.children
                    ]
                  )
                );
              }
            });
          }
          return null;
        }).filter(Boolean);

        // 创建React.createElement调用
        const createElement = t.callExpression(
          t.memberExpression(t.identifier("React"), t.identifier("createElement")),
          [
            t.stringLiteral(tagName),
            t.objectExpression(props),
            ...children
          ]
        );

        path.replaceWith(createElement);
      }
    }
  };
};