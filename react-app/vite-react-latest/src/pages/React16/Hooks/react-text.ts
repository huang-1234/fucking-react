// 错误边界代码示例
const errorBoundaryCode = `// React 16+ 中的错误边界
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下次渲染时显示降级UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    console.log('错误信息:', error);
    console.log('错误组件栈:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // 自定义降级UI
      return this.props.fallback || (
        <div className="error-ui">
          <h2>组件出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用方式
function App() {
  return (
    <ErrorBoundary fallback={<p>出错了，请稍后再试</p>}>
      <MyComponent />
    </ErrorBoundary>
  );
}`;

// useState代码示例
const useStateCode = `// React 16.8+ 中的useState Hook
import React, { useState } from 'react';

function Counter() {
  // 声明一个叫 "count" 的 state 变量，初始值为0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`;

// useEffect代码示例
const useEffectCode = `// React 16.8+ 中的useEffect Hook
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 更新文档标题
    document.title = \`You clicked \${count} times\`;

    // 返回的函数相当于 componentWillUnmount
    return () => {
      document.title = 'React App';
    };
  }, [count]); // 仅在count更改时重新运行

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`;

// 类组件等效代码
const classComponentCode = `// React 15/16 中的类组件等效实现
import React, { Component } from 'react';

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    document.title = \`You clicked \${this.state.count} times\`;
  }

  componentDidUpdate() {
    document.title = \`You clicked \${this.state.count} times\`;
  }

  componentWillUnmount() {
    document.title = 'React App';
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}`;

export {
  errorBoundaryCode,
  useStateCode,
  useEffectCode,
  classComponentCode
}