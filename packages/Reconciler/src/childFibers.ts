// packages/Reconciler/src/childFibers.ts
import { FiberNode } from './fiber';
import { ReactElement } from 'shared/ReactTypes';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

// 创建子Fiber节点
function createChildFiber(
  returnFiber: FiberNode,
  element: ReactElement,
  shouldTrackSideEffects: boolean
): FiberNode {
  // 简化实现，实际需要根据element类型创建不同的Fiber节点
  const fiber = new FiberNode(
    element.type === 'TEXT_ELEMENT' ? HostText : element.type,
    element.props,
    element.key
  );

  fiber.type = element.type;
  fiber.return = returnFiber;

  if (shouldTrackSideEffects) {
    // 标记为插入操作
    fiber.flags |= Placement;
  }

  return fiber;
}

// 协调单个子节点
function reconcileSingleElement(
  returnFiber: FiberNode,
  currentFirstChild: FiberNode | null,
  element: ReactElement,
  shouldTrackSideEffects: boolean
): FiberNode {
  // 简化实现，直接创建新的Fiber节点
  return createChildFiber(returnFiber, element, shouldTrackSideEffects);
}

// 协调文本节点
function reconcileSingleTextNode(
  returnFiber: FiberNode,
  currentFirstChild: FiberNode | null,
  textContent: string,
  shouldTrackSideEffects: boolean
): FiberNode {
  // 创建文本元素
  const textElement = {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: textContent,
      children: []
    },
    key: null
  };

  // 创建文本Fiber节点
  return createChildFiber(returnFiber, textElement as any, shouldTrackSideEffects);
}

// 协调子Fiber节点
function reconcileChildFibersImpl(
  returnFiber: FiberNode,
  currentFirstChild: FiberNode | null,
  newChild: any,
  shouldTrackSideEffects: boolean
): FiberNode | null {
  // 处理单个子节点
  if (typeof newChild === 'object' && newChild !== null) {
    if (Array.isArray(newChild)) {
      // 处理多个子节点，这里简化实现，只处理第一个子节点
      return reconcileSingleElement(
        returnFiber,
        currentFirstChild,
        newChild[0],
        shouldTrackSideEffects
      );
    } else {
      // 处理单个React元素
      return reconcileSingleElement(
        returnFiber,
        currentFirstChild,
        newChild,
        shouldTrackSideEffects
      );
    }
  }

  // 处理文本节点
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return reconcileSingleTextNode(
      returnFiber,
      currentFirstChild,
      String(newChild),
      shouldTrackSideEffects
    );
  }

  // 其他情况返回null
  return null;
}

// 更新阶段的协调函数，需要跟踪副作用
export const reconcileChildFibers = (
  returnFiber: FiberNode,
  currentFirstChild: FiberNode | null,
  newChild: any
) => {
  return reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, true);
};

// 挂载阶段的协调函数，不需要跟踪副作用
export const mountChildFibers = (
  returnFiber: FiberNode,
  currentFirstChild: FiberNode | null,
  newChild: any
) => {
  return reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, false);
};