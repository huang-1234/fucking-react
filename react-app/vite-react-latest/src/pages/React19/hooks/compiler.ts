
  // 未优化的代码示例
  const unoptimizedCode = `// 未经React Compiler优化的代码
function ParentComponent() {
  const [count, setCount] = useState(0);

  // 每次count变化，整个组件都会重新渲染
  return (
    <div>
      <h2>计数: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>

      {/* ChildComponent会在每次ParentComponent重渲染时也重渲染 */}
      <ChildComponent />
    </div>
  );
}

function ChildComponent() {
  // 这个组件不依赖于父组件的状态
  // 但在传统React中，它仍会在父组件重渲染时重渲染
  return (
    <div>
      <h3>子组件</h3>
      <p>这个组件不需要重渲染，但它会被重渲染</p>
    </div>
  );
}`;

  // React Compiler优化后的代码示例
  const optimizedCode = `// React Compiler自动优化后的代码
// 注意：这是React Compiler在构建时生成的代码，开发者不需要手动编写

// React Compiler自动添加记忆化
function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>计数: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>

      {/* React Compiler自动避免不必要的重渲染 */}
      <ChildComponent />
    </div>
  );
}

// React Compiler自动记忆化这个组件
// 相当于自动应用了React.memo()
function ChildComponent() {
  return (
    <div>
      <h3>子组件</h3>
      <p>这个组件不需要重渲染，所以不会被重渲染</p>
    </div>
  );
}`;

  // 手动优化的代码示例
  const manualOptimizationCode = `// 传统的手动优化方式
import React, { useState, memo } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>计数: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>

      {/* 使用memo包装的子组件 */}
      <MemoizedChildComponent />
    </div>
  );
}

// 手动使用memo优化
const MemoizedChildComponent = memo(function ChildComponent() {
  return (
    <div>
      <h3>子组件</h3>
      <p>使用memo避免不必要的重渲染</p>
    </div>
  );
});`;

export {
  unoptimizedCode,
  optimizedCode,
  manualOptimizationCode
};