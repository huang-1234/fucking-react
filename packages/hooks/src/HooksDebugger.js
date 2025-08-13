/**
 * Hooks调试工具
 * 用于可视化和分析Hooks链表
 */

/**
 * 可视化Fiber节点上的Hooks链表
 * @param {Object} fiber - Fiber节点
 * @returns {Array} Hooks信息数组
 */
function visualizeHooks(fiber) {
  if (!fiber || !fiber.memoizedState) {
    console.log('没有可视化的Hooks');
    return [];
  }

  const hooks = [];
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
 * @param {Object} hook - Hook对象
 * @returns {string} Hook类型
 */
function getHookType(hook) {
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
 * @param {any} state - Hook状态
 * @returns {string} 格式化后的状态
 */
function formatState(state) {
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

/**
 * JSON.stringify的替换函数，用于处理循环引用
 */
function replacer(key, value) {
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

// 用于检测循环引用
const seen = new WeakSet();

/**
 * 获取更新队列大小
 * @param {Object} queue - 更新队列
 * @returns {number} 队列大小
 */
function getQueueSize(queue) {
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
 * @param {Object} fiber - Fiber节点
 * @returns {string} Mermaid图表代码
 */
function generateHooksDiagram(fiber) {
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
 * 创建Hook调用堆栈追踪
 * @param {Function} Component - 组件函数
 * @returns {Function} 包装后的组件函数
 */
function traceHookCalls(Component) {
  const originalHooks = {
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
    React[hookName] = (...args) => {
      console.log(`${hookName} called with:`, args);
      const result = originalHooks[hookName](...args);
      console.log(`${hookName} returned:`, result);
      return result;
    };
  });

  // 包装组件
  return function TracedComponent(props) {
    console.group(`Rendering ${Component.name || 'Component'}`);
    const result = Component(props);
    console.groupEnd();
    return result;
  };
}

module.exports = {
  visualizeHooks,
  generateHooksDiagram,
  traceHookCalls
};