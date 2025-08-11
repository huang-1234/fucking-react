/**
 * 简化的React Fiber节点结构
 * 用于支持Hooks系统
 */

/**
 * Fiber节点接口
 */
export interface FiberNode {
  // 实例相关
  tag: number;
  key: string | null;
  elementType: any;
  type: any;
  stateNode: any;

  // Fiber关系
  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  index: number;

  // 引用
  ref: any;

  // 工作相关
  pendingProps: any;
  memoizedProps: any | null;
  updateQueue: any;
  memoizedState: any;
  dependencies: any;

  // 副作用
  flags: number;
  subtreeFlags: number;
  deletions: any;

  // 调度相关
  lanes: number;
  childLanes: number;

  // 替身（双缓冲）
  alternate: FiberNode | null;
}

/**
 * 创建Fiber节点
 * @param tag - Fiber标签类型
 * @param pendingProps - 待处理的props
 * @param key - 唯一标识
 * @returns Fiber节点
 */
export function createFiber(tag: number, pendingProps: any, key: string | null): FiberNode {
  return {
    // 实例相关
    tag,
    key,
    elementType: null,
    type: null,
    stateNode: null,

    // Fiber关系
    return: null,
    child: null,
    sibling: null,
    index: 0,

    // 引用
    ref: null,

    // 工作相关
    pendingProps,
    memoizedProps: null,
    updateQueue: null,
    memoizedState: null,
    dependencies: null,

    // 副作用
    flags: 0,
    subtreeFlags: 0,
    deletions: null,

    // 调度相关
    lanes: 0,
    childLanes: 0,

    // 替身（双缓冲）
    alternate: null
  };
}

/**
 * 创建工作中的Fiber节点
 * @param current - 当前Fiber节点
 * @param pendingProps - 待处理的props
 * @returns 工作中的Fiber节点
 */
export function createWorkInProgress(current: FiberNode, pendingProps: any): FiberNode {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // 创建新的Fiber节点
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key
    );

    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用现有Fiber节点
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = 0;
    workInProgress.subtreeFlags = 0;
    workInProgress.deletions = null;
  }

  // 复制字段
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

/**
 * 创建函数组件Fiber
 * @param Component - 函数组件
 * @param props - 组件属性
 * @returns 函数组件Fiber节点
 */
export function createFunctionComponentFiber(Component: Function, props: any): FiberNode {
  const fiber = createFiber(0, props, null); // 0表示函数组件
  fiber.type = Component;
  return fiber;
}