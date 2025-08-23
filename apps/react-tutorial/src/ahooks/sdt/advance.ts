import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLatest, useUnmount } from './base';

// ==================== Async Hooks ====================

interface UseRequestOptions<T, P extends any[]> {
  manual?: boolean;
  defaultParams?: P;
  onBefore?: (params: P) => void;
  onSuccess?: (data: T, params: P) => void;
  onError?: (error: Error, params: P) => void;
  onFinally?: (params: P, data?: T, error?: Error) => void;
  refreshDeps?: React.DependencyList;
  refreshDepsAction?: () => void;
  loadingDelay?: number;
  pollingInterval?: number;
  pollingWhenHidden?: boolean;
  debounceWait?: number;
  throttleWait?: number;
  ready?: boolean;
}

interface UseRequestResult<T, P extends any[]> {
  data?: T;
  error?: Error;
  loading: boolean;
  run: (...params: P) => Promise<T | void | undefined>;
  runAsync: (...params: P) => Promise<T>;
  refresh: () => Promise<T>;
  refreshAsync: () => Promise<T>;
  mutate: (data?: T | ((oldData?: T) => T)) => void;
  cancel: () => void;
}

/**
 * useRequest - 强大的异步数据管理的 Hook
 */
export function useRequest<T, P extends any[] = any[]>(
  service: (...args: P) => Promise<T>,
  options: UseRequestOptions<T, P> = {}
): UseRequestResult<T, P> {
  const {
    manual = false,
    defaultParams = [] as unknown as P,
    refreshDeps = [],
    loadingDelay,
    pollingInterval,
    pollingWhenHidden = true,
    debounceWait,
    throttleWait,
    ready = true,
  } = options;

  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState<boolean>(!manual);

  const serviceRef = useLatest(service);
  const optionsRef = useLatest(options);
  const paramsRef = useRef<P>(defaultParams);
  const loadingDelayTimerRef = useRef<NodeJS.Timeout>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout>(null);
  const countRef = useRef(0);


  const runAsync = useCallback(async (...params: P): Promise<T> => {
    if (!ready) {
      throw new Error('useRequest is not ready');
    }

    const currentCount = ++countRef.current;

    // Clear loading delay timer
    if (loadingDelayTimerRef.current) {
      clearTimeout(loadingDelayTimerRef.current);
    }

    paramsRef.current = params;

    optionsRef.current.onBefore?.(params);

    if (loadingDelay) {
      loadingDelayTimerRef.current = setTimeout(() => {
        if (currentCount === countRef.current) {
          setLoading(true);
        }
      }, loadingDelay);
    } else {
      setLoading(true);
    }

    try {
      const result = await serviceRef.current(...params);

      if (currentCount === countRef.current) {
        setData(result);
        setError(undefined);
        optionsRef.current.onSuccess?.(result, params);
        optionsRef.current.onFinally?.(params, result, undefined);
      }

      return result;
    } catch (err) {
      const error = err as Error;

      if (currentCount === countRef.current) {
        setError(error);
        setData(undefined);
        optionsRef.current.onError?.(error, params);
        optionsRef.current.onFinally?.(params, undefined, error);
      }

      throw error;
    } finally {
      if (currentCount === countRef.current) {
        setLoading(false);
        if (loadingDelayTimerRef.current) {
          clearTimeout(loadingDelayTimerRef.current);
        }
      }
    }
  }, [ready, loadingDelay, serviceRef, optionsRef]);

  const run = useCallback((...params: P) => {
    runAsync(...params).catch(() => {});
  }, [runAsync]);

  const cancel = useCallback(() => {
    countRef.current += 1;
    setLoading(false);
    if (loadingDelayTimerRef.current) {
      clearTimeout(loadingDelayTimerRef.current);
    }
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
    }
  }, []);

  const refresh = useCallback(() => {
    return runAsync(...paramsRef.current);
  }, [runAsync]);

  const refreshAsync = useCallback(() => {
    return runAsync(...paramsRef.current);
  }, [runAsync]);

  const mutate = useCallback((data?: T | ((oldData?: T) => T)) => {
    if (typeof data === 'function') {
      setData(oldData => (data as (oldData?: T) => T)(oldData));
    } else {
      setData(data);
    }
  }, []);

  // Auto run
  useEffect(() => {
    if (!manual && ready) {
      run(...defaultParams);
    }
  }, [manual, ready]);

  // Refresh deps
  useEffect(() => {
    if (!manual && ready) {
      if (options.refreshDepsAction) {
        options.refreshDepsAction();
      } else {
        refresh();
      }
    }
  }, [...refreshDeps, ready]);

  // Polling
  useEffect(() => {
    if (pollingInterval && pollingInterval > 0) {
      const poll = () => {
        if (!pollingWhenHidden && document.hidden) {
          pollingTimerRef.current = setTimeout(poll, pollingInterval);
          return;
        }

        runAsync(...paramsRef.current)
          .then(() => {
            pollingTimerRef.current = setTimeout(poll, pollingInterval);
          })
          .catch(() => {
            pollingTimerRef.current = setTimeout(poll, pollingInterval);
          });
      };

      pollingTimerRef.current = setTimeout(poll, pollingInterval);
    }

    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }
    };
  }, [pollingInterval, pollingWhenHidden, runAsync]);

  useUnmount(() => {
    cancel();
  });
  const asyncRun = useCallback(async () => {
    if (!ready) {
      throw new Error('useRequest is not ready');
    }
    if (debounceWait) {
      debounce(run, debounceWait)
    } else if(throttleWait) {
      throttle(run, throttleWait)
    } else {
      return run
    }
  }, [ready, run]);


  return {
    data,
    error,
    loading,
    run: asyncRun as any,
    runAsync: debounceWait ? debounce(runAsync, debounceWait) : throttleWait ? throttle(runAsync, throttleWait) : runAsync,
    refresh,
    refreshAsync,
    mutate,
    cancel,
  };
}

// ==================== Form Hooks ====================

/**
 * useAntdTable - 封装了常用的 Ant Design Form 与 Table 联动逻辑
 */
export function useAntdTable<T>(
  service: (params: { current: number; pageSize: number; [key: string]: any }) => Promise<{ list: T[]; total: number }>,
  options: {
    defaultPageSize?: number;
    form?: any; // Ant Design Form instance
    manual?: boolean;
  } = {}
) {
  const { defaultPageSize = 10, form, manual = false } = options;

  const [params, setParams] = useState<Record<string, any>>({});

  const {
    data,
    loading,
    current,
    pageSize,
    total,
    changeCurrent,
    changePageSize,
    refresh,
  } = usePagination(
    async ({ current, pageSize }) => {
      const formData = form?.getFieldsValue() || {};
      return service({ current, pageSize, ...formData, ...params });
    },
    {
      defaultPageSize,
    }
  );

  const search = useCallback(() => {
    changeCurrent(1);
  }, [changeCurrent]);

  const reset = useCallback(() => {
    form?.resetFields();
    setParams({});
    changeCurrent(1);
  }, [form, changeCurrent]);

  const submit = useCallback((values: Record<string, any>) => {
    setParams(values);
    changeCurrent(1);
  }, [changeCurrent]);

  // Auto load
  useEffect(() => {
    if (!manual) {
      search();
    }
  }, [manual, search]);

  return {
    tableProps: {
      dataSource: data,
      loading,
      pagination: {
        current,
        pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        onChange: changeCurrent,
        onShowSizeChange: (_current: number, size: number) => {
          changePageSize(size);
        },
      },
    },
    search,
    reset,
    submit,
    refresh,
  };
}

// ==================== Network Hooks ====================

/**
 * useWebSocket - WebSocket Hook
 */
export function useWebSocket(
  socketUrl: string,
  options: {
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onMessage?: (message: MessageEvent) => void;
    onError?: (event: Event) => void;
    reconnectLimit?: number;
    reconnectInterval?: number;
    manual?: boolean;
    protocols?: string | string[];
  } = {}
) {
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectLimit = 3,
    reconnectInterval = 3000,
    manual = false,
    protocols,
  } = options;

  const [latestMessage, setLatestMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [webSocketInstance, setWebSocketInstance] = useState<WebSocket | null>(null);

  const reconnectTimesRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  const onOpenRef = useLatest(onOpen);
  const onCloseRef = useLatest(onClose);
  const onMessageRef = useLatest(onMessage);
  const onErrorRef = useLatest(onError);

  const connectWs = useCallback(() => {
    if (reconnectTimesRef.current >= reconnectLimit) {
      return;
    }

    try {
      const ws = new WebSocket(socketUrl, protocols);
      setReadyState(WebSocket.CONNECTING);

      ws.onopen = (event) => {
        setReadyState(WebSocket.OPEN);
        reconnectTimesRef.current = 0;
        onOpenRef.current?.(event);
      };

      ws.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onCloseRef.current?.(event);

        // Auto reconnect
        if (!manual && reconnectTimesRef.current < reconnectLimit) {
          reconnectTimesRef.current++;
          reconnectTimerRef.current = setTimeout(() => {
            connectWs();
          }, reconnectInterval);
        }
      };

      ws.onmessage = (message) => {
        setLatestMessage(message);
        onMessageRef.current?.(message);
      };

      ws.onerror = (event) => {
        setReadyState(WebSocket.CLOSED);
        onErrorRef.current?.(event);
      };

      websocketRef.current = ws;
      setWebSocketInstance(ws);
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [socketUrl, protocols, reconnectLimit, reconnectInterval, manual, onOpenRef, onCloseRef, onMessageRef, onErrorRef]);

  const sendMessage = useCallback((message: string | ArrayBuffer | Blob) => {
    if (readyState === WebSocket.OPEN && websocketRef.current) {
      websocketRef.current.send(message);
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [readyState]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    reconnectTimesRef.current = reconnectLimit;

    if (websocketRef.current) {
      websocketRef.current.close();
    }
  }, [reconnectLimit]);

  const connect = useCallback(() => {
    reconnectTimesRef.current = 0;
    connectWs();
  }, [connectWs]);

  useEffect(() => {
    if (!manual) {
      connectWs();
    }

    return () => {
      disconnect();
    };
  }, [manual, connectWs, disconnect]);

  return {
    latestMessage,
    sendMessage,
    disconnect,
    connect,
    readyState,
    webSocketInstance,
  };
}

// ==================== Advanced Scene Hooks ====================

/**
 * useDrop - 处理元素拖拽的 Hook
 */
export function useDrop<T>(
  onDrop: (data: T, event: DragEvent) => void,
  options: {
    onDragEnter?: (event: DragEvent) => void;
    onDragOver?: (event: DragEvent) => void;
    onDragLeave?: (event: DragEvent) => void;
  } = {}
) {
  const { onDragEnter, onDragOver, onDragLeave } = options;
  const [isHovering, setIsHovering] = useState(false);

  const onDropRef = useLatest(onDrop);
  const onDragEnterRef = useLatest(onDragEnter);
  const onDragOverRef = useLatest(onDragOver);
  const onDragLeaveRef = useLatest(onDragLeave);

  const dragProps = useMemo(() => ({
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setIsHovering(false);

      try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        onDropRef.current(data, event.nativeEvent);
      } catch (error) {
        console.error('Failed to parse drop data:', error);
      }
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      onDragOverRef.current?.(event.nativeEvent);
    },
    onDragEnter: (event: React.DragEvent) => {
      event.preventDefault();
      setIsHovering(true);
      onDragEnterRef.current?.(event.nativeEvent);
    },
    onDragLeave: (event: React.DragEvent) => {
      event.preventDefault();
      setIsHovering(false);
      onDragLeaveRef.current?.(event.nativeEvent);
    },
  }), [onDropRef, onDragEnterRef, onDragOverRef, onDragLeaveRef]);

  return [dragProps, { isHovering }] as const;
}

/**
 * useDrag - 处理元素拖拽的 Hook
 */
export function useDrag<T>(
  data: T,
  options: {
    onDragStart?: (event: DragEvent) => void;
    onDragEnd?: (event: DragEvent) => void;
  } = {}
) {
  const { onDragStart, onDragEnd } = options;
  const [isDragging, setIsDragging] = useState(false);

  const onDragStartRef = useLatest(onDragStart);
  const onDragEndRef = useLatest(onDragEnd);

  const dragProps = useMemo(() => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      setIsDragging(true);
      event.dataTransfer.setData('text/plain', JSON.stringify(data));
      onDragStartRef.current?.(event.nativeEvent);
    },
    onDragEnd: (event: React.DragEvent) => {
      setIsDragging(false);
      onDragEndRef.current?.(event.nativeEvent);
    },
  }), [data, onDragStartRef, onDragEndRef]);

  return [dragProps, { isDragging }] as const;
}

/**
 * useSelections - 常见联动 Checkbox 逻辑封装
 */
export function useSelections<T>(
  items: T[],
  defaultSelected: T[] = []
) {
  const [selected, setSelected] = useState<T[]>(defaultSelected);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const isSelected = useCallback((item: T) => selectedSet.has(item), [selectedSet]);

  const select = useCallback((item: T) => {
    setSelected(prev => [...prev, item]);
  }, []);

  const unSelect = useCallback((item: T) => {
    setSelected(prev => prev.filter(i => i !== item));
  }, []);

  const toggle = useCallback((item: T) => {
    if (isSelected(item)) {
      unSelect(item);
    } else {
      select(item);
    }
  }, [isSelected, select, unSelect]);

  const selectAll = useCallback(() => {
    setSelected([...items]);
  }, [items]);

  const unSelectAll = useCallback(() => {
    setSelected([]);
  }, []);

  const noneSelected = selected.length === 0;
  const allSelected = selected.length === items.length && items.length > 0;
  const partiallySelected = selected.length > 0 && selected.length < items.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      unSelectAll();
    } else {
      selectAll();
    }
  }, [allSelected, selectAll, unSelectAll]);

  return {
    selected,
    isSelected,
    select,
    unSelect,
    toggle,
    selectAll,
    unSelectAll,
    toggleAll,
    allSelected,
    noneSelected,
    partiallySelected,
  };
}

// ==================== Performance Hooks ====================

/**
 * useDebounce - 用来处理防抖值的 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle - 用来处理节流值的 Hook
 */
export function useThrottle<T>(value: T, wait: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() >= lastExecuted.current + wait) {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }
    }, wait - (Date.now() - lastExecuted.current));

    return () => clearTimeout(timer);
  }, [value, wait]);

  return throttledValue;
}

/**
 * useDebounceFn - 用来处理防抖函数的 Hook
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): {
  run: T;
  cancel: () => void;
  flush: () => void;
} {
  const fnRef = useLatest(fn);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const run = useCallback((...args: Parameters<T>) => {
    cancel();
    timerRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, wait);
  }, [wait, cancel, fnRef]) as T;

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useUnmount(cancel);

  return { run, cancel, flush };
}

/**
 * useThrottleFn - 用来处理节流函数的 Hook
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): {
  run: T;
  cancel: () => void;
  flush: () => void;
} {
  const fnRef = useLatest(fn);
  const timerRef = useRef<NodeJS.Timeout>(null);
  const lastCallTime = useRef<number>(0);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const run = useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime.current >= wait) {
      lastCallTime.current = now;
      fnRef.current(...args);
    } else {
      cancel();
      timerRef.current = setTimeout(() => {
        lastCallTime.current = Date.now();
        fnRef.current(...args);
      }, wait - (now - lastCallTime.current));
    }
  }, [wait, cancel, fnRef]) as T;

  const flush = useCallback(() => {
    cancel();
  }, [cancel]);

  useUnmount(cancel);

  return { run, cancel, flush };
}

// ==================== Utility Functions ====================

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let lastCallTime = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      return func(...args);
    }
  }) as T;
}

// ==================== Scene Hooks ====================

/**
 * useVirtualList - 提供虚拟化列表能力的 Hook，用于解决展示海量数据渲染时首屏渲染缓慢和滚动卡顿问题
 */
export function useVirtualList<T>(
  list: T[],
  options: {
    containerTarget: React.RefObject<Element>;
    wrapperTarget: React.RefObject<Element>;
    itemHeight: number | ((index: number, data: T) => number);
    overscan?: number;
  }
) {
  const { containerTarget, itemHeight, overscan = 5 } = options;

  const [targetList, setTargetList] = useState<{ data: T; index: number }[]>([]);
  const [wrapperStyle, setWrapperStyle] = useState<React.CSSProperties>({});

  const getItemHeight = useCallback((index: number, data: T) => {
    if (typeof itemHeight === 'number') return itemHeight;
    return itemHeight(index, data);
  }, [itemHeight]);

  const calculateRange = useCallback(() => {
    const container = containerTarget.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    let totalHeight = 0;
    let startIndex = 0;
    let endIndex = 0;

    // Find start index
    for (let i = 0; i < list.length; i++) {
      const height = getItemHeight(i, list[i]);
      if (totalHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      totalHeight += height;
    }

    // Find end index
    let visibleHeight = 0;
    for (let i = startIndex; i < list.length; i++) {
      const height = getItemHeight(i, list[i]);
      visibleHeight += height;
      if (visibleHeight > containerHeight + overscan * getItemHeight(i, list[i])) {
        endIndex = i;
        break;
      }
      endIndex = i;
    }

    // Calculate total height and offset
    let totalListHeight = 0;
    let offsetY = 0;

    for (let i = 0; i < list.length; i++) {
      const height = getItemHeight(i, list[i]);
      if (i < startIndex) {
        offsetY += height;
      }
      totalListHeight += height;
    }

    setWrapperStyle({
      height: totalListHeight,
      paddingTop: offsetY,
    });

    setTargetList(
      list.slice(startIndex, endIndex + 1).map((data, index) => ({
        data,
        index: startIndex + index,
      }))
    );
  }, [list, getItemHeight, containerTarget, overscan]);

  useEffect(() => {
    calculateRange();
  }, [calculateRange]);

  useEffect(() => {
    const container = containerTarget.current;
    if (!container) return;

    const handleScroll = () => calculateRange();
    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [calculateRange, containerTarget]);

  return [targetList, wrapperStyle] as const;
}

/**
 * useInfiniteScroll - 无限滚动 Hook
 */
export function useInfiniteScroll<T>(
  service: (currentData?: T) => Promise<{ list: any[]; nextId?: T }>,
  options: {
    target?: React.RefObject<Element>;
    isNoMore?: (data?: { list: any[]; nextId?: T }) => boolean;
    threshold?: number;
    manual?: boolean;
  } = {}
) {
  const { target, isNoMore, threshold = 100, manual = false } = options;

  const [data, setData] = useState<{ list: any[]; nextId?: T }>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noMore, setNoMore] = useState(false);

  const serviceRef = useLatest(service);

  const loadData = useCallback(async () => {
    if (loading || loadingMore) return;

    setLoading(true);
    try {
      const result = await serviceRef.current();
      setData(result);
      setNoMore(isNoMore?.(result) ?? false);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, loadingMore, serviceRef, isNoMore]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || noMore) return;

    setLoadingMore(true);
    try {
      const result = await serviceRef.current(data?.nextId);
      setData(prev => ({
        list: [...(prev?.list || []), ...result.list],
        nextId: result.nextId,
      }));
      setNoMore(isNoMore?.(result) ?? false);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, noMore, data?.nextId, serviceRef, isNoMore]);

  const reload = useCallback(() => {
    setData(undefined);
    setNoMore(false);
    loadData();
  }, [loadData]);

  // Auto load
  useEffect(() => {
    if (!manual) {
      loadData();
    }
  }, [manual, loadData]);

  // Scroll listener
  useEffect(() => {
    if (manual || !target?.current) return;

    const element = target.current;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMore();
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [manual, target, threshold, loadMore]);

  return {
    data: data?.list || [],
    loading,
    loadingMore,
    noMore,
    loadMore,
    reload,
  };
}

/**
 * usePagination - 分页 Hook
 */
export function usePagination<T>(
  service: (params: { current: number; pageSize: number; [key: string]: any }) => Promise<{ list: T[]; total: number }>,
  options: {
    defaultCurrent?: number;
    defaultPageSize?: number;
    defaultParams?: Record<string, any>;
  } = {}
) {
  const { defaultCurrent = 1, defaultPageSize = 10, defaultParams = {} } = options;

  const [current, setCurrent] = useState(defaultCurrent);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState(defaultParams);

  const {
    data = [],
    loading,
    refresh,
  } = useRequest(
    async () => {
      const result = await service({ current, pageSize, ...params });
      setTotal(result.total);
      return result.list;
    },
    {
      refreshDeps: [current, pageSize, params],
    }
  );

  const changeCurrent = useCallback((page: number) => {
    setCurrent(page);
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrent(1);
  }, []);

  const changeParams = useCallback((newParams: Record<string, any>) => {
    setParams(newParams);
    setCurrent(1);
  }, []);

  const totalPage = Math.ceil(total / pageSize);

  return {
    data,
    loading,
    current,
    pageSize,
    total,
    totalPage,
    changeCurrent,
    changePageSize,
    changeParams,
    refresh,
  };
}

