// packages/Reconciler/src/fiberReconciler.ts
import { Container } from './hostConfig';
import { FiberNode } from './fiber';
import { FiberRootNode } from './fiberRoot';
import { renderRoot } from './workLoop';

// 创建FiberRootNode
export function createContainer(container: Container) {
  const root = new FiberRootNode(container);
  return root;
}

// 更新容器
export function updateContainer(element: any, root: FiberRootNode) {
  const hostRootFiber = root.current;

  // 创建更新
  const update = createUpdate(element);

  // 将更新加入队列
  enqueueUpdate(hostRootFiber, update);

  // 调度更新
  scheduleUpdateOnFiber(hostRootFiber);

  return element;
}

// 创建更新对象
function createUpdate(element: any) {
  return {
    payload: {
      element
    }
  };
}

// 将更新加入队列
function enqueueUpdate(fiber: FiberNode, update: any) {
  // 简化实现，实际需要维护一个更新队列
  fiber.updateQueue = update;
}

// 调度更新
function scheduleUpdateOnFiber(fiber: FiberNode) {
  // 获取FiberRootNode
  const root = markUpdateLaneFromFiberToRoot(fiber);
  if (root === null) {
    return;
  }

  // 开始渲染
  renderRoot(root.current);
}

// 从当前Fiber向上查找到FiberRootNode
function markUpdateLaneFromFiberToRoot(fiber: FiberNode): FiberRootNode | null {
  let node = fiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  // 如果是HostRoot，返回FiberRootNode
  if (node.tag === 3) { // HostRoot
    return node.stateNode;
  }

  return null;
}