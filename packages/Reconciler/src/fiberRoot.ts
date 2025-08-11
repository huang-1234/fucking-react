// packages/Reconciler/src/fiberRoot.ts
import { Container } from './hostConfig';
import { FiberNode, createHostRootFiber } from './fiber';

// FiberRootNode是整个应用的根节点
export class FiberRootNode {
  container: Container;
  current: FiberNode;
  finishedWork: FiberNode | null;

  constructor(container: Container) {
    this.container = container;
    this.current = createHostRootFiber();
    this.finishedWork = null;

    // 将FiberRootNode与hostRootFiber关联
    this.current.stateNode = this;
  }
}