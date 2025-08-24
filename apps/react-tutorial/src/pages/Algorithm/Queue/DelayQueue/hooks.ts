import { useState, useCallback, useEffect, useRef } from 'react';
import { DelayQueue, type DelayedItem } from '../al/delay-queue/delay-queue_ts';
import { QueueOperationType } from '../components/OperationHistory';

/**
 * 延迟队列状态类型
 */
export interface DelayQueueState<T> {
  /**
   * 队列中的元素
   */
  items: DelayedItem<T>[];

  /**
   * 操作历史
   */
  operations: {
    type: QueueOperationType | string;
    value?: T;
    expiry?: number;
    timestamp: number;
  }[];

  /**
   * 下一个到期元素的剩余时间
   */
  nextExpiryDelay: number;
}

/**
 * 延迟队列Hook
 * @param initialItems 初始元素
 */
export function useDelayQueue<T>(initialItems: { item: T; delayMs: number }[] = []) {
  // 状态
  const [state, setState] = useState<DelayQueueState<T>>({
    items: [],
    operations: [],
    nextExpiryDelay: -1
  });

  // 引用延迟队列实例
  const queueRef = useRef(new DelayQueue<T>());

  // 更新状态的定时器
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化队列
  useEffect(() => {
    const queue = queueRef.current;

    // 清空队列
    queue.clear();

    // 添加初始元素
    initialItems.forEach(({ item, delayMs }) => {
      queue.add(item, delayMs);
    });

    // 更新状态
    setState({
      items: queue.getItems(),
      operations: [],
      nextExpiryDelay: queue.getDelayToNextExpiry()
    });

    // 添加队列变更监听器
    const handleQueueChange = () => {
      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        nextExpiryDelay: queue.getDelayToNextExpiry()
      }));
    };

    queue.addChangeListener(handleQueueChange);

    // 设置定期更新状态的定时器
    updateTimerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        items: queue.getItems(),
        nextExpiryDelay: queue.getDelayToNextExpiry()
      }));
    }, 100);

    // 清理定时器和监听器
    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
      queue.removeChangeListener(handleQueueChange);
    };
  }, []);

  // 记录操作
  const recordOperation = useCallback((
    type: QueueOperationType | string,
    value?: T,
    expiry?: number
  ) => {
    return {
      type,
      value,
      expiry,
      timestamp: Date.now()
    };
  }, []);

  // 添加元素
  const add = useCallback((item: T, delayMs: number) => {
    const queue = queueRef.current;
    const expiry = Date.now() + delayMs;

    queue.add(item, delayMs);

    setState(prev => ({
      ...prev,
      items: queue.getItems(),
      nextExpiryDelay: queue.getDelayToNextExpiry(),
      operations: [
        ...prev.operations,
        recordOperation('add', item, expiry)
      ]
    }));
  }, [recordOperation]);

  // 尝试获取已到期的元素
  const poll = useCallback(() => {
    const queue = queueRef.current;
    const item = queue.poll();

    setState(prev => ({
      ...prev,
      items: queue.getItems(),
      nextExpiryDelay: queue.getDelayToNextExpiry(),
      operations: [
        ...prev.operations,
        recordOperation('poll', item || undefined)
      ]
    }));

    return item;
  }, [recordOperation]);

  // 获取已到期的元素，如果没有到期元素则阻塞
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
        nextExpiryDelay: queue.getDelayToNextExpiry(),
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

  // 查看下一个将到期的元素
  const peek = useCallback(() => {
    const queue = queueRef.current;
    const next = queue.peek();

    setState(prev => ({
      ...prev,
      operations: [
        ...prev.operations,
        recordOperation('peek', next?.item, next?.expiry)
      ]
    }));

    return next;
  }, [recordOperation]);

  // 清空队列
  const clear = useCallback(() => {
    const queue = queueRef.current;
    queue.clear();

    setState(prev => ({
      ...prev,
      items: [],
      nextExpiryDelay: -1,
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

  // 获取队列大小
  const size = useCallback(() => {
    return queueRef.current.size();
  }, []);

  // 格式化剩余时间
  const formatRemainingTime = useCallback((ms: number) => {
    if (ms < 0) return '无到期元素';
    if (ms === 0) return '已到期';

    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;

    return `${seconds}.${milliseconds.toString().padStart(3, '0')}秒`;
  }, []);

  // 批量添加元素
  const addBatch = useCallback((count: number, baseDelayMs: number, randomize: boolean = false) => {
    for (let i = 0; i < count; i++) {
      const delayMs = randomize
        ? baseDelayMs + Math.floor(Math.random() * baseDelayMs)
        : baseDelayMs + (i * 1000);

      const item = `Item-${Date.now()}-${i}`;
      add(item as unknown as T, delayMs);
    }
  }, [add]);

  // 自动轮询到期元素
  const autoPoll = useCallback(async (interval: number, count: number) => {
    for (let i = 0; i < count; i++) {
      poll();
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }, [poll]);

  return {
    state,
    add,
    poll,
    take,
    peek,
    clear,
    isEmpty,
    size,
    formatRemainingTime,
    addBatch,
    autoPoll
  };
}
