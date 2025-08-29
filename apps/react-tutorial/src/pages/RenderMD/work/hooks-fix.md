# Hooks 调用顺序问题修复报告

## 问题分析

根据错误信息 `Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement`，我们在代码中发现了两处违反 React Hooks 规则的情况：

### 1. MarkdownRenderer.tsx 组件中的问题

**问题位置**：在条件渲染后调用 hooks
```jsx
// 如果有缓存，直接使用缓存的HTML
if (cachedHtml) {
  return (
    <div
      className={`${styles.markdownContainer} ${className}`}
      dangerouslySetInnerHTML={{ __html: cachedHtml }}
    />
  );
}

// 开始渲染计时 - 这里不是 hook，但在下面使用了 hook
performanceMonitor.start('markdown_render');

// 渲染完成后结束计时 - 这个 hook 在条件返回后调用，违反了 hooks 规则
useEffect(() => {
  if (!cachedHtml && markdownRef.current) {
    performanceMonitor.end('markdown_render');
  }
}, [cachedHtml]);
```

### 2. VirtualizedMarkdown.tsx 组件中的问题

**问题位置**：在条件渲染后定义组件函数（包含 hooks 调用）
```jsx
// 如果内容很少，直接渲染完整内容
if (lines.length === 1) {
  return <MarkdownRenderer content={content} {...markdownProps} />;
}

// 行渲染器 - 这个组件函数在条件返回后定义，如果内部使用 hooks 会违反规则
const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  // ...组件内容
);
```

## 修复方案

### 1. MarkdownRenderer.tsx 组件的修复

将所有 hooks 移到条件判断之前，确保每次渲染都执行相同的 hooks 调用序列：

```jsx
// 渲染计时 - 将 hooks 移到条件判断之前
useEffect(() => {
  // 只有在非缓存模式下才需要计时
  if (!cachedHtml) {
    performanceMonitor.start('markdown_render');

    // 在组件渲染完成后结束计时
    if (markdownRef.current) {
      performanceMonitor.end('markdown_render');
    }
  }
}, [cachedHtml]);

// 如果有缓存，直接使用缓存的HTML
if (cachedHtml) {
  return (
    <div
      className={`${styles.markdownContainer} ${className}`}
      dangerouslySetInnerHTML={{ __html: cachedHtml }}
    />
  );
}
```

### 2. VirtualizedMarkdown.tsx 组件的修复

将组件函数定义移到条件判断之前，确保组件结构一致：

```jsx
// 创建行渲染器组件 - 移到条件判断之前
const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style} className={styles.virtualRow}>
    <MarkdownRenderer
      content={lines[index]}
      {...markdownProps}
      className={`${markdownProps.className || ''} ${styles.virtualLine}`}
    />
  </div>
);

// 如果内容很少，直接渲染完整内容
if (lines.length === 1) {
  return <MarkdownRenderer content={content} {...markdownProps} />;
}
```

## 修复原则

1. **所有 hooks 必须在组件顶层调用**
   - 不能在条件语句、循环或嵌套函数中调用 hooks
   - 确保每次渲染时 hooks 的调用顺序和数量一致

2. **组件函数定义也应遵循相同规则**
   - 如果组件函数内部使用了 hooks，则该组件函数的定义也必须在顶层
   - 不能在条件判断后定义可能包含 hooks 的组件函数

3. **条件逻辑应在 hooks 内部处理**
   - 将条件判断移到 hooks 内部，而不是将 hooks 放在条件判断中
   - 例如：`useEffect(() => { if (condition) { doSomething(); } }, [condition]);`

## 结论

通过将所有 hooks 调用和可能包含 hooks 的组件函数定义移到组件顶层，我们成功修复了违反 React Hooks 规则的问题。这确保了 React 能够正确地维护 hooks 的状态，避免了"Rendered fewer hooks than expected"错误。

这些修复符合 React 的设计原则，即 hooks 必须以可预测的顺序被调用，以便 React 能够正确地将内部状态与特定的 hook 调用关联起来。
