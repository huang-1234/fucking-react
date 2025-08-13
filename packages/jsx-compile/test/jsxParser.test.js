/**
 * JSX解析器测试
 */

const { parseJSX, tokenize, buildAST, generateCode } = require('../src/jsxParser');

describe('JSX解析器测试', () => {
  test('简单JSX解析', () => {
    const jsx = '<div className="header">Hello</div>';
    const result = parseJSX(jsx);
    expect(result).toContain('React.createElement');
    expect(result).toContain('"div"');
    expect(result).toContain('className: "header"');
    expect(result).toContain('"Hello"');
  });

  test('带表达式的JSX解析', () => {
    const jsx = '<div className="container">{title}</div>';
    const result = parseJSX(jsx);
    expect(result).toContain('React.createElement');
    expect(result).toContain('title');
  });

  test('词法分析', () => {
    const jsx = '<div className="header">Hello</div>';
    const tokens = tokenize(jsx);
    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe('ELEMENT');
    expect(tokens[0].tag).toBe('div');
    expect(tokens[0].attrs.className).toBe('header');
  });

  test('AST构建', () => {
    const tokens = [
      {
        type: 'ELEMENT',
        tag: 'div',
        attrs: { className: 'header' },
        children: [{ type: 'TEXT', value: 'Hello' }]
      }
    ];
    const ast = buildAST(tokens);
    expect(ast.type).toBe('ROOT');
    expect(ast.children.length).toBe(1);
    expect(ast.children[0].type).toBe('JSX_ELEMENT');
    expect(ast.children[0].openingElement.name).toBe('div');
  });

  test('代码生成', () => {
    const ast = {
      type: 'ROOT',
      children: [
        {
          type: 'JSX_ELEMENT',
          openingElement: { name: 'div', attributes: { className: 'header' } },
          children: [{ type: 'TEXT', value: 'Hello' }]
        }
      ]
    };
    const code = generateCode(ast);
    expect(code).toContain('React.createElement');
    expect(code).toContain('"div"');
    expect(code).toContain('className: "header"');
    expect(code).toContain('"Hello"');
  });
});