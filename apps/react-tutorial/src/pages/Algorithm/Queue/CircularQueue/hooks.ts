import { useState, useCallback, useEffect, useRef } from 'react';
import { CircularQueue, OverwritingCircularQueue } from '../al/circular-queue/circular-queue_ts';
import { QueueOperationType } from '../components/OperationHistory';

/**
 * 循环队列状态类型
 */
export interface CircularQueueState<T> {
  /**
   * 队列中的元素
   */
  items: (T | null)[];

  /**
   * 操作历史
   */
  operations: {
    type: QueueOperationType | string;
    value?: T;
    timestamp: number;
  }[];

  /**
   * 头指针位置
   */
  headIndex: number;

  /**
   * 尾指针位置
   */
  tailIndex: number;

  /**
   * 队列容量
   */
  capacity: number;
}

/**
 * 循环队列类型
 */
export enum CircularQueueType {
  STANDARD = 'standard',
  OVERWRITING = 'overwriting'
}

/**
 * 循环队列Hook
 * @param type 循环队列类型（标准或覆盖式）
 * @param capacity 队列容量
 * @param initialItems 初始元素
 */
export function useCircularQueue<T>(
  type: CircularQueueType = CircularQueueType.STANDARD,
  capacity: number = 8,
  initialItems: T[] = []
) {
  // 状态
  const [state, setState] = useState<CircularQueueState<T>>({
    items: [],
    operations: [],
    headIndex: 0,
    tailIndex: 0,
    capacity
  });

  // 引用循环队列实例
  const queueRef = useRef(
    type === CircularQueueType.STANDARD
      ? new CircularQueue<T>(capacity)
      : new OverwritingCircularQueue<T>(capacity)
  );

  // 初始化队列
  useEffect(() => {
    const queue = queueRef.current;

    // 清空队列
    queue.clear();

    // 添加初始元素
    initialItems.forEach(item => {
      queue.enqueue(item);
    });

    // 更新状态
    setState({
      items: queue.getItems(),
      operations: [],
      headIndex: queue.getHeadIndex(),
      tailIndex: queue.getTailIndex(),
      capacity: queue.capacity()
    });
  }, [capacity, type]);

  // 记录操作
  const recordOperation = useCallback((
    type: QueueOperationType | string,
    value?: T
  ) => {
    return {
      type,
      value,
      timestamp: Date.now()
    };
  }, []);

  // 入队操作
  const enqueue = useCallback((item: T) => {
    const queue = queueRef.current;
    const success = queue.enqueue(item);

    setState(prev => ({
      ...prev,
      items: queue.getItems(),
      headIndex: queue.getHeadIndex(),
      tailIndex: queue.getTailIndex(),
      operations: [
        ...prev.operations,
        recordOperation(success ? 'enqueue' : 'enqueueFailed', item)
      ]
    }));

    return success;
  }, [recordOperation]);

  // 出队操作
  const dequeue = useCallback(() => {
    const queue = queueRef.current;
    const item = queue.dequeue();

    setState(prev => ({
      ...prev,
      items: queue.getItems(),
      headIndex: queue.getHeadIndex(),
      tailIndex: queue.getTailIndex(),
      operations: [
        ...prev.operations,
        recordOperation('dequeue', item || undefined)
      ]
    }));

    return item;
  }, [recordOperation]);

  // 查看队首元素
  const front = useCallback(() => {
    const queue = queueRef.current;
    const item = queue.front();

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('front', item || undefined)
      ]
    }));

    return item;
  }, [recordOperation]);

  // 查看队尾元素
  const rear = useCallback(() => {
    const queue = queueRef.current;
    const item = queue.rear();

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('rear', item || undefined)
      ]
    }));

    return item;
  }, [recordOperation]);

  // 清空队列
  const clear = useCallback(() => {
    const queue = queueRef.current;
    queue.clear();

    setState(prev => ({
      ...prev,
      items: queue.getItems(),
      headIndex: queue.getHeadIndex(),
      tailIndex: queue.getTailIndex(),
      operations: [
        ...prev.operations,
        recordOperation('clear')
      ]
    }));
  }, [recordOperation]);

  // 检查队列是否为空
  const isEmpty = useCallback(() => {
    return queueRef.current.isEmpty();
  }, []);

  // 检查队列是否已满
  const isFull = useCallback(() => {
    return queueRef.current.isFull();
  }, []);

  // 获取队列大小
  const size = useCallback(() => {
    return queueRef.current.size();
  }, []);

  // 批量入队
  const enqueueBatch = useCallback((count: number) => {
    let successCount = 0;

    for (let i = 0; i < count; i++) {
      const item = `Item-${Date.now()}-${i}` as unknown as T;
      const success = enqueue(item);
      if (success) {
        successCount++;
      } else {
        break;
      }
    }

    return successCount;
  }, [enqueue]);

  // 批量出队
  const dequeueBatch = useCallback((count: number) => {
    const items: (T | null)[] = [];

    for (let i = 0; i < count; i++) {
      const item = dequeue();
      if (item !== null) {
        items.push(item);
      } else {
        break;
      }
    }

    return items;
  }, [dequeue]);

  // 模拟环形缓冲区
  const simulateRingBuffer = useCallback(async (
    produceCount: number,
    consumeCount: number,
    produceDelay: number,
    consumeDelay: number
  ) => {
    // 生产者函数
    const producer = async () => {
      for (let i = 0; i < produceCount; i++) {
        const item = `Item-${Date.now()}` as unknown as T;
        enqueue(item);
        await new Promise(resolve => setTimeout(resolve, produceDelay));
      }
    };

    // 消费者函数
    const consumer = async () => {
      for (let i = 0; i < consumeCount; i++) {
        dequeue();
        await new Promise(resolve => setTimeout(resolve, consumeDelay));
      }
    };

    // 并行执行生产者和消费者
    await Promise.all([producer(), consumer()]);
  }, [enqueue, dequeue]);

  return {
    state,
    queueType: type,
    enqueue,
    dequeue,
    front,
    rear,
    clear,
    isEmpty,
    isFull,
    size,
    enqueueBatch,
    dequeueBatch,
    simulateRingBuffer
  };
}
