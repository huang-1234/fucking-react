import { useState, useCallback, useEffect, useRef } from 'react';
import { BlockingQueue } from '../al/blocking-queue/blocking-queue_ts';
import { QueueOperationType } from '../components/OperationHistory';

/**
 * 阻塞队列状态类型
 */
export interface BlockingQueueState<T> {
  /**
   * 队列中的元素
   */
  items: T[];

  /**
   * 操作历史
   */
  operations: {
    type: QueueOperationType | string;
    value?: T;
    timestamp: number;
  }[];

  /**
   * 等待的生产者数量
   */
  waitingProducers: number;

  /**
   * 等待的消费者数量
   */
  waitingConsumers: number;

  /**
   * 队列容量
   */
  capacity: number;
}

/**
 * 阻塞队列Hook
 * @param capacity 队列容量
 * @param initialItems 初始元素
 */
export function useBlockingQueue<T>(
  capacity: number = 5,
  initialItems: T[] = []
) {
  // 状态
  const [state, setState] = useState<BlockingQueueState<T>>({
    items: [],
    operations: [],
    waitingProducers: 0,
    waitingConsumers: 0,
    capacity
  });

  // 引用阻塞队列实例
  const queueRef = useRef(new BlockingQueue<T>(capacity));

  // 更新状态的定时器
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化队列
  useEffect(() => {
    const queue = queueRef.current;

    // 清空队列
    queue.clear();

    // 添加初始元素
    initialItems.forEach(item => {
      queue.offer(item);
    });

    // 更新状态
    setState({
      items: queue.getItems(),
      operations: [],
      waitingProducers: queue.getWaitingProducers(),
      waitingConsumers: queue.getWaitingConsumers(),
      capacity: queue.capacity()
    });

    // 设置定期更新状态的定时器
    updateTimerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        waitingProducers: queue.getWaitingProducers(),
        waitingConsumers: queue.getWaitingConsumers()
      }));
    }, 500);

    // 清理定时器
    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [capacity]);

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

  // 入队操作（非阻塞）
  const offer = useCallback((item: T) => {
    const queue = queueRef.current;
    const success = queue.offer(item);

    if (success) {
      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        waitingProducers: queue.getWaitingProducers(),
        waitingConsumers: queue.getWaitingConsumers(),
        operations: [
          ...prev.operations,
          recordOperation('offer', item)
        ]
      }));
    }

    return success;
  }, [recordOperation]);

  // 入队操作（带超时）
  const offerWithTimeout = useCallback(async (item: T, timeout: number) => {
    const queue = queueRef.current;

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('offerWithTimeout', item)
      ]
    }));

    try {
      const success = await queue.offerWithTimeout(item, timeout);

      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        waitingProducers: queue.getWaitingProducers(),
        waitingConsumers: queue.getWaitingConsumers(),
        operations: [
          ...prev.operations,
          recordOperation(success ? 'offerSuccess' : 'offerTimeout', item)
        ]
      }));

      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        operations: [
          ...prev.operations,
          recordOperation('offerError', item)
        ]
      }));

      return false;
    }
  }, [recordOperation]);

  // 入队操作（阻塞）
  const put = useCallback(async (item: T, timeout?: number) => {
    const queue = queueRef.current;

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('put', item)
      ]
    }));

    try {
      await queue.put(item, timeout);

      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        waitingProducers: queue.getWaitingProducers(),
        waitingConsumers: queue.getWaitingConsumers(),
        operations: [
          ...prev.operations,
          recordOperation('putSuccess', item)
        ]
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        operations: [
          ...prev.operations,
          recordOperation('putTimeout', item)
        ]
      }));

      return false;
    }
  }, [recordOperation]);

  // 出队操作（非阻塞）
  const poll = useCallback(() => {
    const queue = queueRef.current;
    const item = queue.poll();

    setState(prev => ({
      ...prev,
      items: queue.getItems(),
      waitingProducers: queue.getWaitingProducers(),
      waitingConsumers: queue.getWaitingConsumers(),
      operations: [
        ...prev.operations,
        recordOperation('poll', item || undefined)
      ]
    }));

    return item;
  }, [recordOperation]);

  // 出队操作（带超时）
  const pollWithTimeout = useCallback(async (timeout: number) => {
    const queue = queueRef.current;

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('pollWithTimeout')
      ]
    }));

    try {
      const item = await queue.pollWithTimeout(timeout);

      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        waitingProducers: queue.getWaitingProducers(),
        waitingConsumers: queue.getWaitingConsumers(),
        operations: [
          ...prev.operations,
          recordOperation(item ? 'pollSuccess' : 'pollTimeout', item || undefined)
        ]
      }));

      return item;
    } catch (error) {
      setState(prev => ({
        ...prev,
        operations: [
          ...prev.operations,
          recordOperation('pollError')
        ]
      }));

      return null;
    }
  }, [recordOperation]);

  // 出队操作（阻塞）
  const take = useCallback(async (timeout?: number) => {
    const queue = queueRef.current;

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('take')
      ]
    }));

    try {
      const item = await queue.take(timeout);

      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        waitingProducers: queue.getWaitingProducers(),
        waitingConsumers: queue.getWaitingConsumers(),
        operations: [
          ...prev.operations,
          recordOperation('takeSuccess', item)
        ]
      }));

      return item;
    } catch (error) {
      setState(prev => ({
        ...prev,
        operations: [
          ...prev.operations,
          recordOperation('takeTimeout')
        ]
      }));

      return null;
    }
  }, [recordOperation]);

  // 查看队首元素
  const peek = useCallback(() => {
    const queue = queueRef.current;
    const item = queue.peek();

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('peek', item || undefined)
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
      items: [],
      waitingProducers: queue.getWaitingProducers(),
      waitingConsumers: queue.getWaitingConsumers(),
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

  // 模拟生产者线程
  const simulateProducer = useCallback(async (
    count: number,
    delay: number,
    timeout?: number
  ) => {
    for (let i = 0; i < count; i++) {
      const item = `Item-${Date.now()}`;
      await put(item, timeout);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }, [put]);

  // 模拟消费者线程
  const simulateConsumer = useCallback(async (
    count: number,
    delay: number,
    timeout?: number
  ) => {
    for (let i = 0; i < count; i++) {
      await take(timeout);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }, [take]);

  return {
    state,
    offer,
    offerWithTimeout,
    put,
    poll,
    pollWithTimeout,
    take,
    peek,
    clear,
    isEmpty,
    isFull,
    size,
    simulateProducer,
    simulateConsumer
  };
}
