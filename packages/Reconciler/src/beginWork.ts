// packages/Reconciler/src/beginWork.ts
import { FiberNode } from './fiber';
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags';
import { processUpdateQueue } from './updateQueue';
import { ReactElement } from 'shared/ReactTypes';
import { reconcileChildFibers, mountChildFibers } from './childFibers';

// beginWork函数，处理当前Fiber节点，并返回子Fiber节点
export function beginWork(current: FiberNode | null, workInProgress: FiberNode): FiberNode | null {
  // 根据不同的Fiber类型，执行不同的处理逻辑
  switch (workInProgress.tag) {
    case HostRoot:
      // 处理根节点
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      // 处理DOM组件
      return updateHostComponent(current, workInProgress);
    case FunctionComponent:
      // 处理函数组件
      return updateFunctionComponent(current, workInProgress);
    case HostText:
      // 处理文本节点
      return null;
    default:
      console.warn('未实现的Fiber类型', workInProgress.tag);
      return null;
  }
}

// 处理根节点
function updateHostRoot(current: FiberNode | null, workInProgress: FiberNode): FiberNode | null {
  // 处理更新队列
  processUpdateQueue(workInProgress);

  // 获取子元素
  const nextChildren = workInProgress.memoizedState?.element;

  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

// 处理DOM组件
function updateHostComponent(current: FiberNode | null, workInProgress: FiberNode): FiberNode | null {
  // 获取子元素
  const nextProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;

  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

// 处理函数组件
function updateFunctionComponent(current: FiberNode | null, workInProgress: FiberNode): FiberNode | null {
  // 获取组件函数
  const Component = workInProgress.type;

  // 获取props
  const nextProps = workInProgress.pendingProps;

  // 执行函数组件
  const nextChildren = Component(nextProps);

  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

// 协调子节点
function reconcileChildren(current: FiberNode | null, workInProgress: FiberNode, children: ReactElement | null) {
  if (current === null) {
    // 挂载阶段
    workInProgress.child = mountChildFibers(workInProgress, null, children);
  } else {
    // 更新阶段
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, children);
  }
}