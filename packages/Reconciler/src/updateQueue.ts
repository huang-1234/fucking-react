// packages/Reconciler/src/updateQueue.ts
import { FiberNode } from './fiber';

// 更新队列
export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

// 更新对象
export interface Update<State> {
  action: State | ((prevState: State) => State);
  next: Update<State> | null;
}

// 初始化更新队列
export function initializeUpdateQueue<State>(fiber: FiberNode) {
  const updateQueue: UpdateQueue<State> = {
    shared: {
      pending: null
    }
  };

  fiber.updateQueue = updateQueue;
}

// 创建更新对象
export function createUpdate<State>(action: State | ((prevState: State) => State)) {
  const update: Update<State> = {
    action,
    next: null
  };

  return update;
}

// 将更新加入队列
export function enqueueUpdate<State>(fiber: FiberNode, update: Update<State>) {
  const updateQueue = fiber.updateQueue as UpdateQueue<State>;

  if (updateQueue === null) {
    return;
  }

  const pending = updateQueue.shared.pending;

  if (pending === null) {
    // 如果队列为空，创建一个循环链表
    update.next = update;
  } else {
    // 将新的更新添加到循环链表
    update.next = pending.next;
    pending.next = update;
  }

  // pending指向最后一个更新
  updateQueue.shared.pending = update;
}

// 处理更新队列
export function processUpdateQueue<State>(workInProgress: FiberNode) {
  const updateQueue = workInProgress.updateQueue as UpdateQueue<State>;

  if (updateQueue === null) {
    return;
  }

  const pending = updateQueue.shared.pending;

  if (pending === null) {
    return;
  }

  // 清空队列
  updateQueue.shared.pending = null;

  // 获取第一个更新
  const firstUpdate = pending.next;
  let update = firstUpdate;

  // 应用所有更新
  let newState: State = workInProgress.memoizedState;

  do {
    const action = update.action;

    if (typeof action === 'function') {
      // 如果action是函数，调用函数获取新状态
      newState = action(newState);
    } else {
      // 否则直接使用action作为新状态
      newState = action;
    }

    update = update.next as Update<State>;
  } while (update !== firstUpdate);

  // 更新memoizedState
  workInProgress.memoizedState = newState;
}