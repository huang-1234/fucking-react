import { useCallback, useEffect, useRef, useState } from "react";

interface DataState<T> {
  data?: T | null;
  loading?: boolean;
  error?: Error | null;
}

interface UseRequestOptions<T> {
  manual?: boolean;
  onSuccess?: ({ data, loading, error }: DataState<T>) => void;
  onError?: ({ error, loading }: DataState<T>) => void;
  onFinally?: ({ loading }: DataState<T>) => void;
  onRetry?: () => void;
  retryCount?: number;
  onCancel?: () => void;
}

function useRequest<T>(requestApi: () => Promise<T>, options: UseRequestOptions<T>) {
  const { manual = false, onSuccess, onError, onFinally, onRetry, retryCount = 0, onCancel } = options;
  const [dataState, setDataState] = useState({
    data: null as T | null,
    loading: false,
    error: null as Error | null,
  })
  const fn = useRef(requestApi)
  const _onSuccess = useRef(onSuccess)
  const _onError = useRef(onError)
  const _onFinally = useRef(onFinally)

  const isAborted = useRef(false);

  // 请求标识符跟踪
  const lastRequestId = useRef(0);


  const run = useCallback(async () => {

    const requestId = ++lastRequestId.current;
    try {
      setDataState((s) => {
        const d = {
          ...s,
          loading: true,
        }
        return d;
      })
      const data = await fn.current();
      if (requestId !== lastRequestId.current) return;
      setDataState((s) => {
        const d = {
          ...s,
          data,
          loading: false,
          error: null,
        }
        return d;
      })
      onSuccess?.({ data, loading: false, error: null })
    } catch (error) {
      setDataState((s) => {
        const d = {
          ...s,
          data: null,
          loading: false,
          error: error as Error,
        }
        return d;
      })
      _onError.current?.({ error: error as Error, loading: false, data: null })
    } finally {
      _onFinally.current?.({ loading: false })
    }
  }, [requestApi, _onSuccess, _onError, _onFinally])

  // 新增状态管理重试逻辑
  const [retryState, setRetryState] = useState({
    count: 0,
    timer: null as NodeJS.Timeout | null
  });

  // 完善的重试函数
  const _onRetry = useCallback(() => {
    if (isAborted.current) return;

    // 清除已有定时器
    if (retryState.timer) clearTimeout(retryState.timer);

    // 检查重试次数限制
    if (retryState.count >= retryCount) {
      onRetry?.();
      return;
    }

    // 指数退避策略：2^count * 1000ms
    const delay = Math.min(2 ** retryState.count * 1000, 30000);
    const timer = setTimeout(() => {
      run();
      setRetryState(s => ({ ...s, count: s.count + 1 }));
    }, delay);

    setRetryState({ count: retryState.count + 1, timer });
  }, [run, retryCount, onRetry]);

  const _onCancel = useCallback(() => {
    if (typeof onCancel === 'function') {
      isAborted.current = true;
      onCancel();
    }
  }, []);

  useEffect(() => {
    if (!manual) {
      run();
    }
  }, [manual, run]);

  return {
    data: dataState.data,
    loading: dataState.loading,
    error: dataState.error,
    run,
    onRetry: _onRetry,
    onCancel: _onCancel,
  }
}

export {
  useRequest,
}