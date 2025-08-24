import { useState, useCallback, useEffect, useRef } from 'react';
import { MinPriorityQueue, MaxPriorityQueue } from '../al/priority-queue/priority-queue_ts';
import { QueueOperationType } from '../components/OperationHistory';

/**
 * 优先队列状态类型
 */
export interface PriorityQueueState<T> {
  /**
   * 队列中的元素
   */
  items: { value: T; priority: number }[];

  /**
   * 操作历史
   */
  operations: {
    type: QueueOperationType | string;
    value?: T;
    priority?: number;
    timestamp: number;
  }[];
}

/**
 * 优先队列类型
 */
export enum PriorityQueueType {
  MIN = 'min',
  MAX = 'max'
}

/**
 * 优先队列Hook
 * @param type 优先队列类型（最小优先队列或最大优先队列）
 * @param initialItems 初始元素
 */
export function usePriorityQueue<T>(
  type: PriorityQueueType = PriorityQueueType.MIN,
  initialItems: { value: T; priority: number }[] = []
) {
  // 状态
  const [state, setState] = useState<PriorityQueueState<T>>({
    items: [],
    operations: []
  });

  // 引用优先队列实例
  const queueRef = useRef(
    type === PriorityQueueType.MIN
      ? new MinPriorityQueue<T>()
      : new MaxPriorityQueue<T>()
  );

  // 初始化队列
  useEffect(() => {
    const queue = queueRef.current;
    queue.clear();

    initialItems.forEach(item => {
      queue.enqueue(item.value, item.priority);
    });

    setState({
      items: queue.getItems(),
      operations: []
    });
  }, []);

  // 记录操作
  const recordOperation = useCallback((
    type: QueueOperationType | string,
    value?: T,
    priority?: number
  ) => {
    return {
      type,
      value,
      priority,
      timestamp: Date.now()
    };
  }, []);

  // 入队操作
  const enqueue = useCallback((value: T, priority: number) => {
    const queue = queueRef.current;
    queue.enqueue(value, priority);

    setState(prev => ({
      items: queue.getItems(),
      operations: [
        ...prev.operations,
        recordOperation(QueueOperationType.ENQUEUE, value, priority)
      ]
    }));
  }, [recordOperation]);

  // 出队操作
  const dequeue = useCallback(() => {
    const queue = queueRef.current;
    const value = queue.dequeue();

    setState(prev => ({
      items: queue.getItems(),
      operations: [
        ...prev.operations,
        recordOperation(QueueOperationType.DEQUEUE, value)
      ]
    }));

    return value;
  }, [recordOperation]);

  // 查看队首元素
  const peek = useCallback(() => {
    const queue = queueRef.current;
    const value = queue.peek();

    setState(prev => ({
      items: prev.items,
      operations: [
        ...prev.operations,
        recordOperation(QueueOperationType.PEEK, value)
      ]
    }));

    return value;
  }, [recordOperation]);

  // 清空队列
  const clear = useCallback(() => {
    const queue = queueRef.current;
    queue.clear();

    setState(prev => ({
      items: [],
      operations: [
        ...prev.operations,
        recordOperation(QueueOperationType.CLEAR)
      ]
    }));
  }, [recordOperation]);

  // 检查队列是否为空
  const isEmpty = useCallback(() => {
    return queueRef.current.isEmpty();
  }, []);

  // 获取队列大小
  const size = useCallback(() => {
    return queueRef.current.size();
  }, []);

  // 更新元素优先级（自定义操作）
  const updatePriority = useCallback((value: T, newPriority: number) => {
    const queue = queueRef.current;
    const items = queue.getItems();

    // 找到要更新的元素
    const itemToUpdate = items.find(item => item.value === value);
    if (!itemToUpdate) {
      return false;
    }

    // 移除旧元素并添加新元素
    queue.clear();
    items.forEach(item => {
      if (item.value === value) {
        queue.enqueue(value, newPriority);
      } else {
        queue.enqueue(item.value, item.priority);
      }
    });

    setState(prev => ({
      items: queue.getItems(),
      operations: [
        ...prev.operations,
        recordOperation(QueueOperationType.UPDATE_PRIORITY, value, newPriority)
      ]
    }));

    return true;
  }, [recordOperation]);

  // 将队列转换为树结构（用于可视化）
  const toTree = useCallback(() => {
    const items = state.items;
    if (items.length === 0) {
      return [];
    }

    // 构建树节点
    const buildTreeNode = (index: number): any => {
      if (index >= items.length) {
        return null;
      }

      const item = items[index];
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;

      const leftChild = leftChildIndex < items.length ? buildTreeNode(leftChildIndex) : null;
      const rightChild = rightChildIndex < items.length ? buildTreeNode(rightChildIndex) : null;

      const children = [];
      if (leftChild) children.push(leftChild);
      if (rightChild) children.push(rightChild);

      return {
        key: `node-${index}`,
        title: `${item.value} (${item.priority})`,
        value: item.value,
        priority: item.priority,
        children: children.length > 0 ? children : undefined,
        isHighlighted: index === 0, // 高亮根节点（队首）
      };
    };

    return [buildTreeNode(0)];
  }, [state.items]);

  return {
    items: state.items,
    operations: state.operations,
    enqueue,
    dequeue,
    peek,
    clear,
    isEmpty,
    size,
    updatePriority,
    toTree,
    queueType: type
  };
}
