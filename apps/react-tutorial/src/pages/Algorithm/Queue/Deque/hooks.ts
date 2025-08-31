import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Deque,
  MonotonicDecreasingDeque,
  MonotonicIncreasingDeque,
  slidingWindowMaximum,
  slidingWindowMinimum,
  longestSubarray,
  maxSubarraySumWithLengthConstraint
} from './al';

/**
 * 双端队列操作的状态类型
 */
export interface DequeState<T> {
  items: T[];
  operations: {
    type: 'addFront' | 'addBack' | 'removeFront' | 'removeBack' | 'clear';
    value?: T;
    timestamp: number;
  }[];
}

/**
 * 滑动窗口状态类型
 */
export interface SlidingWindowState {
  array: number[];
  windowSize: number;
  currentIndex: number;
  maxValues: number[];
  minValues: number[];
  maxDequeItems: { value: number; index: number }[];
  minDequeItems: { value: number; index: number }[];
  isComplete: boolean;
}

export enum OperationType {
  addFront = 'addFront',
  addBack = 'addBack',
  removeFront = 'removeFront',
  removeBack = 'removeBack',
  clear = 'clear'
}


function getOperationByType<T>(type: OperationType, item?: T, timestamp?: number) {
  return {
    type,
    value: item,
    timestamp: timestamp || Date.now()
  }
}

/**
 * 使用双端队列的Hook
 */
export function useDeque<T extends number | string>(_initialItems: T[] = []) {
  const initialItems = _initialItems.length > 0 ? _initialItems : [1, 2, 3, 4, 5] as T[];
  const [state, setState] = useState<DequeState<T>>({
    items: initialItems,
    operations: []
  });

  const dequeRef = useRef(new Deque<T>());

  // 初始化队列
  useEffect(() => {
    const deque = dequeRef.current;
    deque.clear();
    initialItems.forEach(item => deque.addBack(item));
    setState({
      items: deque.getItems(),
      operations: []
    });
  }, [initialItems]);

  // 添加到队列前端
  const addFront = useCallback((item: T) => {
    const deque = dequeRef.current;
    deque.addFront(item);
    setState(prev => ({
      items: deque.getItems(),
      operations: [...prev.operations, getOperationByType(OperationType.addFront, item)]
    }));
  }, []);

  // 添加到队列后端
  const addBack = useCallback((item: T) => {
    const deque = dequeRef.current;
    deque.addBack(item);
    setState(prev => ({
      items: deque.getItems(),
      operations: [...prev.operations, getOperationByType(OperationType.addBack, item)]
    }));
  }, []);

  // 从队列前端移除
  const removeFront = useCallback(() => {
    const deque = dequeRef.current;
    const item = deque.removeFront();
    setState(prev => ({
      items: deque.getItems(),
      operations: [...prev.operations, getOperationByType(OperationType.removeFront, item)]
    }));
    return item;
  }, []);

  // 从队列后端移除
  const removeBack = useCallback(() => {
    const deque = dequeRef.current;
    const item = deque.removeBack();
    setState(prev => ({
      items: deque.getItems(),
      operations: [...prev.operations, getOperationByType(OperationType.removeBack, item)]
    }));
    return item;
  }, []);

  // 查看队列前端元素
  const peekFront = useCallback(() => {
    return dequeRef.current.peekFront();
  }, []);

  // 查看队列后端元素
  const peekBack = useCallback(() => {
    return dequeRef.current.peekBack();
  }, []);

  // 清空队列
  const clear = useCallback(() => {
    const deque = dequeRef.current;
    deque.clear();
    setState(prev => ({
      items: [],
      operations: [...prev.operations, getOperationByType(OperationType.clear)]
    }));
  }, []);

  // 检查队列是否为空
  const isEmpty = useCallback(() => {
    return dequeRef.current.isEmpty();
  }, []);

  // 获取队列大小
  const size = useCallback(() => {
    return dequeRef.current.size();
  }, []);

  return {
    items: state.items,
    operations: state.operations,
    addFront,
    addBack,
    removeFront,
    removeBack,
    peekFront,
    peekBack,
    clear,
    isEmpty,
    size
  };
}

/**
 * 使用滑动窗口算法的Hook
 */
export function useSlidingWindow(initialArray: number[] = [], initialWindowSize: number = 3) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [windowSize, setWindowSize] = useState<number>(initialWindowSize);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500); // 动画速度（毫秒）
  const [state, setState] = useState<SlidingWindowState>({
    array: initialArray,
    windowSize: initialWindowSize,
    currentIndex: 0,
    maxValues: [],
    minValues: [],
    maxDequeItems: [],
    minDequeItems: [],
    isComplete: false
  });

  const maxDequeRef = useRef(new MonotonicDecreasingDeque<number>());
  const minDequeRef = useRef(new MonotonicIncreasingDeque<number>());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 重置滑动窗口状态
  const resetWindow = useCallback(() => {
    maxDequeRef.current = new MonotonicDecreasingDeque<number>();
    minDequeRef.current = new MonotonicIncreasingDeque<number>();

    setState({
      array,
      windowSize,
      currentIndex: 0,
      maxValues: [],
      minValues: [],
      maxDequeItems: [],
      minDequeItems: [],
      isComplete: false
    });

    setCurrentIndex(0);
  }, [array, windowSize]);

  // 更新数组
  const updateArray = useCallback((newArray: number[]) => {
    setArray(newArray);
    resetWindow();
  }, [resetWindow]);

  // 更新窗口大小
  const updateWindowSize = useCallback((newSize: number) => {
    setWindowSize(Math.min(Math.max(1, newSize), array.length));
    resetWindow();
  }, [array.length, resetWindow]);

  // 单步执行滑动窗口算法
  const stepForward = useCallback(() => {
    if (currentIndex >= array.length || state.isComplete) {
      return;
    }

    const maxDeque = maxDequeRef.current;
    const minDeque = minDequeRef.current;

    // 添加当前元素到队列
    maxDeque.push(array[currentIndex], currentIndex);
    minDeque.push(array[currentIndex], currentIndex);

    // 计算窗口起始位置
    const windowStart = Math.max(0, currentIndex - windowSize + 1);

    // 移除过期元素
    maxDeque.removeOutdated(windowStart);
    minDeque.removeOutdated(windowStart);

    // 如果窗口已满，记录最大值和最小值
    const newMaxValues = [...state.maxValues];
    const newMinValues = [...state.minValues];

    if (currentIndex >= windowSize - 1) {
      newMaxValues.push(maxDeque.getMax()!);
      newMinValues.push(minDeque.getMin()!);
    }

    // 更新状态
    setState(prev => ({
      ...prev,
      currentIndex: currentIndex + 1,
      maxValues: newMaxValues,
      minValues: newMinValues,
      maxDequeItems: maxDeque.getItems(),
      minDequeItems: minDeque.getItems(),
      isComplete: currentIndex + 1 >= array.length
    }));

    setCurrentIndex(currentIndex + 1);
  }, [array, currentIndex, state, windowSize]);

  // 自动播放
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // 更新速度
  const updateSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // 自动播放效果
  useEffect(() => {
    if (isPlaying && !state.isComplete) {
      timerRef.current = setTimeout(() => {
        stepForward();
      }, speed);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, state.isComplete, stepForward, speed]);

  // 立即完成算法
  const completeAlgorithm = useCallback(() => {
    const maxValues = slidingWindowMaximum(array, windowSize);
    const minValues = slidingWindowMinimum(array, windowSize);

    setState(prev => ({
      ...prev,
      currentIndex: array.length,
      maxValues,
      minValues,
      isComplete: true
    }));

    setCurrentIndex(array.length);
    setIsPlaying(false);
  }, [array, windowSize]);

  return {
    state,
    isPlaying,
    speed,
    updateArray,
    updateWindowSize,
    stepForward,
    togglePlay,
    updateSpeed,
    resetWindow,
    completeAlgorithm
  };
}