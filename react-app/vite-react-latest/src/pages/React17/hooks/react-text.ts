// React 16事件委托代码示例
const react16EventCode = `// React 16中的事件委托
// React将所有事件处理器附加到document上

// 简化的内部实现示意
document.addEventListener('click', e => {
  // React的事件系统处理点击
  const reactEvent = createReactEvent(e);

  // 查找事件路径上的React组件
  const path = getEventPath(e);

  // 调用组件的事件处理器
  for (const element of path) {
    const clickHandler = findClickHandler(element);
    if (clickHandler) {
      clickHandler(reactEvent);
    }
  }
});

// 组件中的使用方式没有变化
<button onClick={handleClick}>点击我</button>`;

// React 17事件委托代码示例
const react17EventCode = `// React 17中的事件委托
// React将事件处理器附加到React渲染树的根DOM容器上

// 简化的内部实现示意
rootNode.addEventListener('click', e => {
  // React的事件系统处理点击
  const reactEvent = createReactEvent(e);

  // 查找事件路径上的React组件
  const path = getEventPath(e);

  // 调用组件的事件处理器
  for (const element of path) {
    const clickHandler = findClickHandler(element);
    if (clickHandler) {
      clickHandler(reactEvent);
    }
  }
});

// 组件中的使用方式没有变化
<button onClick={handleClick}>点击我</button>`;

// React 17之前的JSX代码示例
const oldJSXCode = `// React 17之前的JSX转换
import React from 'react';  // 必须导入React

function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Welcome to React</p>
    </div>
  );
}

// 转换后的代码:
import React from 'react';

function App() {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, 'Hello World'),
    React.createElement('p', null, 'Welcome to React')
  );
}`;

// React 17的新JSX代码示例
const newJSXCode = `// React 17的新JSX转换
// 不再需要导入React
function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Welcome to React</p>
    </div>
  );
}

// 转换后的代码:
// 自动导入特定的函数
import { jsx as _jsx } from 'react/jsx-runtime';
import { jsxs as _jsxs } from 'react/jsx-runtime';

function App() {
  return _jsxs(
    'div',
    {
      children: [
        _jsx('h1', { children: 'Hello World' }),
        _jsx('p', { children: 'Welcome to React' })
      ]
    }
  );
}`;

// 自动导入示例
const autoImportCode = `// 文件1: Button.js
// 不需要导入React
function Button() {
  return <button>Click me</button>;
}

// 文件2: App.js
// 只有当你需要使用React特定API时才需要导入React
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(count + 1)} />
    </div>
  );
}`;

export {
  react16EventCode,
  react17EventCode,
  oldJSXCode,
  newJSXCode,
  autoImportCode
}
