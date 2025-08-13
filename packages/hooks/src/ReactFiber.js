/**
 * 简化的React Fiber节点结构
 * 用于支持Hooks系统
 */

/**
 * 创建Fiber节点
 * @param {number} tag - Fiber标签类型
 * @param {Object} pendingProps - 待处理的props
 * @param {string} key - 唯一标识
 * @returns {Object} Fiber节点
 */
function createFiber(tag, pendingProps, key) {
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
 * @param {Object} current - 当前Fiber节点
 * @param {Object} pendingProps - 待处理的props
 * @returns {Object} 工作中的Fiber节点
 */
function createWorkInProgress(current, pendingProps) {
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
 * @param {Function} Component - 函数组件
 * @param {Object} props - 组件属性
 * @returns {Object} 函数组件Fiber节点
 */
function createFunctionComponentFiber(Component, props) {
  const fiber = createFiber(0, props, null); // 0表示函数组件
  fiber.type = Component;
  return fiber;
}

module.exports = {
  createFiber,
  createWorkInProgress,
  createFunctionComponentFiber
};