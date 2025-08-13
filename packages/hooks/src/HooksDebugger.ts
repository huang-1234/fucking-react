/**
 * Hooks调试工具
 * 用于可视化和分析Hooks链表
 */

import { FiberNode } from './ReactFiber';

/**
 * Hook信息接口
 */
interface HookInfo {
  index: number;
  type: string;
  state: string;
  queueSize: number | string;
  hasNext: boolean;
}

/**
 * 可视化Fiber节点上的Hooks链表
 * @param fiber - Fiber节点
 * @returns Hooks信息数组
 */
export function visualizeHooks(fiber: FiberNode | null): HookInfo[] {
  if (!fiber || !fiber.memoizedState) {
    console.log('没有可视化的Hooks');
    return [];
  }

  const hooks: HookInfo[] = [];
  let hook = fiber.memoizedState;
  let index = 0;

  while (hook) {
    // 分析Hook类型
    const hookType = getHookType(hook);

    // 收集Hook信息
    hooks.push({
      index,
      type: hookType,
      state: formatState(hook.memoizedState),
      queueSize: getQueueSize(hook.queue),
      hasNext: !!hook.next
    });

    // 移动到下一个Hook
    hook = hook.next;
    index++;
  }

  // 打印表格
  console.table(hooks);

  return hooks;
}

/**
 * 尝试确定Hook类型
 * @param hook - Hook对象
 * @returns Hook类型
 */
function getHookType(hook: any): string {
  if (!hook) return 'Unknown';

  // 尝试根据memoizedState的结构推断类型
  const state = hook.memoizedState;

  if (state === null || state === undefined) {
    return 'useState/useReducer';
  }

  if (typeof state === 'object') {
    if ('current' in state) {
      return 'useRef';
    }

    if ('value' in state && 'deps' in state) {
      return 'useMemo/useCallback';
    }

    if ('create' in state && 'deps' in state) {
      return 'useEffect/useLayoutEffect';
    }
  }

  return 'Unknown';
}

/**
 * 格式化状态以便于显示
 * @param state - Hook状态
 * @returns 格式化后的状态
 */
function formatState(state: any): string {
  if (state === null || state === undefined) {
    return String(state);
  }

  if (typeof state === 'object') {
    try {
      // 尝试简化对象表示
      return JSON.stringify(state, replacer);
    } catch (e) {
      return '[Complex Object]';
    }
  }

  return String(state);
}

// 用于检测循环引用
const seen = new WeakSet();

/**
 * JSON.stringify的替换函数，用于处理循环引用
 */
function replacer(key: string, value: any): any {
  if (key && typeof value === 'object' && value !== null) {
    // 避免循环引用
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
  }

  // 对函数进行特殊处理
  if (typeof value === 'function') {
    return '[Function]';
  }

  return value;
}

/**
 * 获取更新队列大小
 * @param queue - 更新队列
 * @returns 队列大小
 */
function getQueueSize(queue: any): number | string {
  if (!queue || !queue.pending) {
    return 0;
  }

  // 计算循环链表大小
  let size = 1;
  let update = queue.pending.next;
  const first = update;

  while (update !== first) {
    size++;
    update = update.next;

    // 安全检查，避免无限循环
    if (size > 1000) {
      return '1000+';
    }
  }

  return size;
}

/**
 * 生成Hooks链表的Mermaid图表代码
 * @param fiber - Fiber节点
 * @returns Mermaid图表代码
 */
export function generateHooksDiagram(fiber: FiberNode | null): string {
  if (!fiber || !fiber.memoizedState) {
    return 'graph LR\n  A[No Hooks] --> B[Empty]';
  }

  let code = 'graph LR\n';
  code += '  FiberNode --> memoizedState\n';

  let hook = fiber.memoizedState;
  let index = 0;

  while (hook) {
    const hookType = getHookType(hook);
    const nextIndex = index + 1;

    code += `  Hook${index}["Hook ${index} (${hookType})"] `;

    if (hook.next) {
      code += `--> |next| Hook${nextIndex}\n`;
    } else {
      code += `--> |next| null\n`;
    }

    hook = hook.next;
    index++;
  }

  code += '\n  classDef hook fill:#e6f7ff,stroke:#91d5ff;\n';
  code += '  class ';

  for (let i = 0; i < index; i++) {
    code += `Hook${i}`;
    if (i < index - 1) {
      code += ',';
    }
  }

  code += ' hook;';

  return code;
}

/**
 * React全局接口
 */
interface ReactGlobal {
  useState: Function;
  useEffect: Function;
  useContext: Function;
  useReducer: Function;
  useCallback: Function;
  useMemo: Function;
  useRef: Function;
  useLayoutEffect: Function;
  [key: string]: Function;
}

/**
 * 创建Hook调用堆栈追踪
 * @param Component - 组件函数
 * @returns 包装后的组件函数
 */
export function traceHookCalls<P, R>(Component: (props: P) => R): (props: P) => R {
  // 确保React是全局可用的
  if (typeof React === 'undefined') {
    console.warn('React未定义，无法追踪Hook调用');
    return Component;
  }

  const React = globalThis.React as ReactGlobal;
  const originalHooks: Record<string, Function> = {
    useState: React.useState,
    useEffect: React.useEffect,
    useContext: React.useContext,
    useReducer: React.useReducer,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useRef: React.useRef,
    useLayoutEffect: React.useLayoutEffect
  };

  // 替换所有Hook
  Object.keys(originalHooks).forEach(hookName => {
    React[hookName] = (...args: any[]) => {
      console.log(`${hookName} called with:`, args);
      const result = originalHooks[hookName](...args);
      console.log(`${hookName} returned:`, result);
      return result;
    };
  });

  // 包装组件
  return function TracedComponent(props: P): R {
    console.group(`Rendering ${Component.name || 'Component'}`);
    const result = Component(props);
    console.groupEnd();
    return result;
  };
}