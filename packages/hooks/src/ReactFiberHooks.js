/**
 * React Fiber架构下的Hooks实现
 * 基于链表结构管理组件状态
 */

// 全局变量，用于跟踪当前正在渲染的组件和Hook
let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;
let isMount = true; // 标记是挂载阶段还是更新阶段

/**
 * Hook节点结构
 * @typedef {Object} Hook
 * @property {any} memoizedState - 当前状态值
 * @property {Update|null} baseQueue - 未处理的更新队列
 * @property {UpdateQueue} queue - 更新队列（含dispatch）
 * @property {Hook|null} next - 下一个Hook指针
 */

/**
 * 更新队列结构
 * @typedef {Object} UpdateQueue
 * @property {Update|null} pending - 待执行更新
 * @property {Function} dispatch - 更新触发器
 */

/**
 * 更新对象结构
 * @typedef {Object} Update
 * @property {any} action - 更新动作
 * @property {Update|null} next - 下一个更新
 */

/**
 * 初始化渲染
 * @param {Object} fiber - Fiber节点
 * @param {Function} Component - 函数组件
 * @param {Object} props - 组件属性
 */
function renderWithHooks(fiber, Component, props) {
  currentlyRenderingFiber = fiber;
  currentlyRenderingFiber.memoizedState = null; // 重置hooks链表
  workInProgressHook = null;

  // 区分挂载和更新阶段
  isMount = fiber.alternate === null;

  // 执行组件函数，触发hooks调用
  const result = Component(props);

  // 重置全局变量
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;

  return result;
}

/**
 * 创建Hook节点
 * @returns {Hook} 新的Hook节点
 */
function createHook() {
  return {
    memoizedState: null,
    baseQueue: null,
    queue: {
      pending: null,
      dispatch: null
    },
    next: null
  };
}

/**
 * 获取或创建当前工作中的Hook
 * @returns {Hook} 当前工作中的Hook
 */
function updateWorkInProgressHook() {
  let nextWorkInProgressHook;

  if (workInProgressHook === null) {
    // 这是当前Fiber的第一个Hook
    if (currentlyRenderingFiber.memoizedState === null) {
      // 挂载阶段的第一个Hook
      nextWorkInProgressHook = createHook();
      currentlyRenderingFiber.memoizedState = nextWorkInProgressHook;
    } else {
      // 更新阶段的第一个Hook
      nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
    }
  } else {
    // 这不是当前Fiber的第一个Hook
    if (workInProgressHook.next === null) {
      // 挂载阶段的后续Hook
      nextWorkInProgressHook = createHook();
      workInProgressHook.next = nextWorkInProgressHook;
    } else {
      // 更新阶段的后续Hook
      nextWorkInProgressHook = workInProgressHook.next;
    }
  }

  workInProgressHook = nextWorkInProgressHook;
  return workInProgressHook;
}

/**
 * useState Hook实现
 * @param {any} initialState - 初始状态值
 * @returns {Array} 状态值和更新函数
 */
function useState(initialState) {
  return useReducer(basicStateReducer, initialState);
}

/**
 * 基本状态reducer
 * @param {any} state - 当前状态
 * @param {any} action - 更新动作
 * @returns {any} 新状态
 */
function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}

/**
 * useReducer Hook实现
 * @param {Function} reducer - reducer函数
 * @param {any} initialArg - 初始参数
 * @param {Function} init - 初始化函数
 * @returns {Array} 状态值和dispatch函数
 */
function useReducer(reducer, initialArg, init) {
  const hook = updateWorkInProgressHook();

  if (isMount) {
    // 挂载阶段初始化状态
    hook.memoizedState = init !== undefined ? init(initialArg) : initialArg;

    // 创建dispatch函数
    const dispatch = (action) => {
      hook.queue.pending = createUpdate(action, hook.queue.pending);
      scheduleUpdateOnFiber(currentlyRenderingFiber);
    };

    hook.queue.dispatch = dispatch;
    return [hook.memoizedState, dispatch];
  } else {
    // 更新阶段处理队列中的更新
    if (hook.queue.pending !== null) {
      // 获取更新队列
      const firstUpdate = hook.queue.pending.next;
      let update = firstUpdate;
      let newState = hook.memoizedState;

      // 应用所有更新
      do {
        const action = update.action;
        newState = reducer(newState, action);
        update = update.next;
      } while (update !== firstUpdate);

      // 清空更新队列
      hook.queue.pending = null;
      hook.memoizedState = newState;
    }

    return [hook.memoizedState, hook.queue.dispatch];
  }
}

/**
 * 创建更新对象
 * @param {any} action - 更新动作
 * @param {Update|null} pending - 当前待处理更新
 * @returns {Update} 更新对象
 */
function createUpdate(action, pending) {
  const update = { action, next: null };

  if (pending === null) {
    // 创建循环链表
    update.next = update;
  } else {
    // 将更新添加到循环链表
    update.next = pending.next;
    pending.next = update;
  }

  return update;
}

/**
 * 调度Fiber更新
 * @param {Object} fiber - 需要更新的Fiber
 */
function scheduleUpdateOnFiber(fiber) {
  // 简化实现，实际需要连接到React的调度系统
  // 这里模拟异步调度
  setTimeout(() => {
    // 触发重新渲染
    console.log('触发重新渲染');
    // 实际实现中，这里会连接到React的reconciler
  }, 0);
}

/**
 * useEffect Hook实现
 * @param {Function} create - 副作用函数
 * @param {Array} deps - 依赖数组
 */
function useEffect(create, deps) {
  const hook = updateWorkInProgressHook();

  if (isMount || !depsEqual(hook.memoizedState?.deps, deps)) {
    // 保存依赖
    hook.memoizedState = {
      create,
      deps,
      cleanup: undefined
    };

    // 在渲染后执行副作用
    schedulePassiveEffect(hook, currentlyRenderingFiber);
  }
}

/**
 * 调度被动副作用
 * @param {Hook} hook - Hook节点
 * @param {Object} fiber - Fiber节点
 */
function schedulePassiveEffect(hook, fiber) {
  // 简化实现，实际需要连接到React的副作用系统
  setTimeout(() => {
    // 执行清理函数
    if (typeof hook.memoizedState.cleanup === 'function') {
      hook.memoizedState.cleanup();
    }

    // 执行副作用函数
    const cleanup = hook.memoizedState.create();
    hook.memoizedState.cleanup = cleanup;
  }, 0);
}

/**
 * 比较依赖数组
 * @param {Array} prevDeps - 前一个依赖数组
 * @param {Array} nextDeps - 下一个依赖数组
 * @returns {boolean} 依赖是否相等
 */
function depsEqual(prevDeps, nextDeps) {
  if (!prevDeps || !nextDeps || prevDeps.length !== nextDeps.length) {
    return false;
  }

  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(prevDeps[i], nextDeps[i]) === false) {
      return false;
    }
  }

  return true;
}

/**
 * useMemo Hook实现
 * @param {Function} create - 创建函数
 * @param {Array} deps - 依赖数组
 * @returns {any} 缓存值
 */
function useMemo(create, deps) {
  const hook = updateWorkInProgressHook();

  if (isMount || !depsEqual(hook.memoizedState?.deps, deps)) {
    const value = create();
    hook.memoizedState = { value, deps };
    return value;
  }

  return hook.memoizedState.value;
}

/**
 * useCallback Hook实现
 * @param {Function} callback - 回调函数
 * @param {Array} deps - 依赖数组
 * @returns {Function} 缓存的回调函数
 */
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

/**
 * useRef Hook实现
 * @param {any} initialValue - 初始值
 * @returns {Object} ref对象
 */
function useRef(initialValue) {
  const hook = updateWorkInProgressHook();

  if (isMount) {
    hook.memoizedState = { current: initialValue };
  }

  return hook.memoizedState;
}

/**
 * 检查Hook调用顺序
 * 确保每次渲染中Hooks的调用顺序一致
 */
const hookIndices = new WeakMap();

function checkHookOrder(component) {
  const prevIndices = hookIndices.get(component) || [];
  const currentIndices = [];

  let hook = currentlyRenderingFiber.memoizedState;
  let index = 0;

  while (hook) {
    currentIndices.push(index++);
    hook = hook.next;
  }

  if (prevIndices.length > 0 && prevIndices.join() !== currentIndices.join()) {
    throw new Error('Hooks调用顺序变更！违反了Hook规则。');
  }

  hookIndices.set(component, currentIndices);
}

// 批量更新系统
let updateQueue = [];
let isBatching = false;

/**
 * 批量处理更新
 * @param {Function} callback - 回调函数
 */
function batchedUpdates(callback) {
  const prevIsBatching = isBatching;
  isBatching = true;

  try {
    callback();
  } finally {
    isBatching = prevIsBatching;

    if (!isBatching) {
      flushUpdates();
    }
  }
}

/**
 * 调度更新
 * @param {Function} update - 更新函数
 */
function scheduleUpdate(update) {
  if (isBatching) {
    updateQueue.push(update);
  } else {
    update();
  }
}

/**
 * 执行所有待处理的更新
 */
function flushUpdates() {
  if (updateQueue.length > 0) {
    const queue = updateQueue;
    updateQueue = [];

    queue.forEach(update => update());
  }
}

module.exports = {
  // 核心API
  renderWithHooks,

  // Hooks
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,

  // 批处理API
  batchedUpdates,

  // 内部API（仅用于测试和调试）
  _internals: {
    createHook,
    updateWorkInProgressHook,
    checkHookOrder,
    scheduleUpdateOnFiber,
    flushUpdates
  }
};