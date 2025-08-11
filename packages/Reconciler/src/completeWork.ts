// packages/Reconciler/src/completeWork.ts
import { FiberNode } from './fiber';
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags';
import { NoFlags } from './fiberFlags';

// completeWork函数，处理当前Fiber节点的完成阶段
export function completeWork(current: FiberNode | null, workInProgress: FiberNode): FiberNode | null {
  // 根据不同的Fiber类型，执行不同的处理逻辑
  switch (workInProgress.tag) {
    case HostRoot:
      // 处理根节点
      bubbleProperties(workInProgress);
      return null;
    case FunctionComponent:
      // 处理函数组件
      bubbleProperties(workInProgress);
      return null;
    case HostComponent:
      // 处理DOM组件
      // 在实际实现中，这里会创建DOM元素
      bubbleProperties(workInProgress);
      return null;
    case HostText:
      // 处理文本节点
      // 在实际实现中，这里会创建文本节点
      bubbleProperties(workInProgress);
      return null;
    default:
      console.warn('未实现的Fiber类型', workInProgress.tag);
      return null;
  }
}

// 冒泡子节点的flags到父节点
function bubbleProperties(workInProgress: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = workInProgress.child;

  // 遍历所有子节点
  while (child !== null) {
    // 合并子节点的flags
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    // 移动到下一个兄弟节点
    child = child.sibling;
  }

  // 更新当前节点的subtreeFlags
  workInProgress.subtreeFlags = subtreeFlags;
}