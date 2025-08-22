/**
 * Babel插件测试
 * 测试JSX转换为React.createElement的功能
 */

import { describe, it, expect } from 'vitest';
import { transformSync } from '@babel/core';
import babelPlugin from '../src/babelPlugin';

describe('Babel JSX Plugin', () => {
  // 辅助函数：转换JSX代码
  function transform(code) {
    return transformSync(code, {
      plugins: [
        '@babel/plugin-syntax-jsx',
        babelPlugin()
      ],
      configFile: false,
      babelrc: false,
    }).code;
  }

  // 移除空白字符以便比较
  function normalizeCode(code) {
    return code.replace(/\s+/g, ' ').trim();
  }

  it('应该将简单的JSX元素转换为React.createElement', () => {
    const jsx = '<div>Hello</div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", {}, "Hello")');
  });

  it('应该处理带属性的JSX元素', () => {
    const jsx = '<div className="container" id="main">Content</div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", { className: "container", id: "main" }, "Content")');
  });

  it('应该处理表达式属性', () => {
    const jsx = '<div className={dynamicClass}>Content</div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", { className: dynamicClass }, "Content")');
  });

  it('应该处理布尔属性', () => {
    const jsx = '<button disabled>Click me</button>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("button", { disabled: true }, "Click me")');
  });

  it('应该处理嵌套的JSX元素', () => {
    const jsx = '<div><h1>Title</h1><p>Paragraph</p></div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", {}, React.createElement("h1", {}, "Title"), React.createElement("p", {}, "Paragraph"))');
  });

  it('应该处理JSX中的JavaScript表达式', () => {
    const jsx = '<div>{count + 1}</div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", {}, count + 1)');
  });

  it('应该处理展开属性', () => {
    const jsx = '<div {...props}>Content</div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", { ...props }, "Content")');
  });

  it('应该区分HTML标签和组件（大小写）', () => {
    const jsx = '<div><Component /></div>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement("div", {}, React.createElement(Component, {}))');
  });

  it('应该处理JSX Fragment', () => {
    const jsx = '<><div>Item 1</div><div>Item 2</div></>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement(React.Fragment, {}, React.createElement("div", {}, "Item 1"), React.createElement("div", {}, "Item 2"))');
  });

  it('应该处理命名空间组件', () => {
    const jsx = '<Namespace.Component>Content</Namespace.Component>';
    const result = transform(jsx);
    expect(normalizeCode(result)).toContain('React.createElement(Namespace.Component, {}, "Content")');
  });
});
