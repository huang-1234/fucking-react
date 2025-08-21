import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  unref,
  type Ref,
  type ComputedRef
} from 'vue'

// ==================== Request Hooks ====================

interface UseRequestOptions<T, P extends any[]> {
  manual?: boolean
  defaultParams?: P
  onBefore?: (params: P) => void
  onSuccess?: (data: T, params: P) => void
  onError?: (error: Error, params: P) => void
  onFinally?: (params: P, data?: T, error?: Error) => void
  refreshDeps?: any[]
  refreshDepsAction?: () => void
  loadingDelay?: number
  pollingInterval?: number
  pollingWhenHidden?: boolean
  debounceWait?: number
  throttleWait?: number
  ready?: boolean | Ref<boolean>
  cacheKey?: string
  cacheTime?: number
  staleTime?: number
  retryCount?: number
  retryInterval?: number
}

interface UseRequestResult<T, P extends any[]> {
  data: Ref<T | undefined>
  loading: Ref<boolean>
  error: Ref<Error | undefined>
  run: (...params: P) => Promise<T>
  runAsync: (...params: P) => Promise<T>
  refresh: () => Promise<T>
  refreshAsync: () => Promise<T>
  mutate: (data?: T | ((oldData?: T) => T)) => void
  cancel: () => void
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
    onBefore,
    onSuccess,
    onError,
    onFinally,
    loadingDelay = 0,
    pollingInterval,
    pollingWhenHidden = true,
    debounceWait,
    throttleWait,
    ready = true,
    retryCount = 0,
    retryInterval = 1000
  } = options

  const data = ref<T>()
  const loading = ref(false)
  const error = ref<Error>()
  const params = ref<P>(defaultParams)

  let pollingTimer: number | null = null
  let loadingDelayTimer: number | null = null
  let retryTimer: number | null = null
  let currentRetryCount = 0

  const setLoading = (value: boolean) => {
    if (loadingDelay > 0 && value) {
      loadingDelayTimer = setTimeout(() => {
        loading.value = true
      }, loadingDelay)
    } else {
      loading.value = value
    }
  }

  const clearLoadingDelayTimer = () => {
    if (loadingDelayTimer) {
      clearTimeout(loadingDelayTimer)
      loadingDelayTimer = null
    }
  }

  const clearPollingTimer = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer)
      pollingTimer = null
    }
  }

  const clearRetryTimer = () => {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  }

  const startPolling = () => {
    if (pollingInterval && pollingInterval > 0) {
      pollingTimer = setTimeout(() => {
        if (pollingWhenHidden || !document.hidden) {
          runAsync(...params.value).finally(() => {
            startPolling()
          })
        } else {
          startPolling()
        }
      }, pollingInterval)
    }
  }

  const runAsync = async (...args: P): Promise<T> => {
    const currentParams = args.length > 0 ? args : params.value
    params.value = currentParams

    if (!unref(ready)) {
      throw new Error('Request is not ready')
    }

    clearLoadingDelayTimer()
    clearPollingTimer()
    clearRetryTimer()

    setLoading(true)
    error.value = undefined

    try {
      onBefore?.(currentParams)
      const result = await service(...currentParams)
      data.value = result
      onSuccess?.(result, currentParams)
      currentRetryCount = 0
      startPolling()
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      onError?.(errorObj, currentParams)

      // 重试逻辑
      if (currentRetryCount < retryCount) {
        currentRetryCount++
        retryTimer = setTimeout(() => {
          runAsync(...currentParams)
        }, retryInterval)
      }

      throw errorObj
    } finally {
      clearLoadingDelayTimer()
      loading.value = false
      onFinally?.(currentParams, data.value, error.value)
    }
  }

  const run = (...args: P) => {
    runAsync(...args).catch(() => {})
  }

  const refresh = () => runAsync(...params.value)
  const refreshAsync = () => runAsync(...params.value)

  const mutate = (newData?: T | ((oldData?: T) => T)) => {
    if (typeof newData === 'function') {
      data.value = (newData as (oldData?: T) => T)(data.value)
    } else {
      data.value = newData
    }
  }

  const cancel = () => {
    clearLoadingDelayTimer()
    clearPollingTimer()
    clearRetryTimer()
    loading.value = false
  }

  // 防抖处理
  let debounceTimer: number | null = null
  const debouncedRun = debounceWait
    ? (...args: P) => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => run(...args), debounceWait)
      }
    : run

  // 节流处理
  let throttleTimer: number | null = null
  let lastThrottleTime = 0
  const throttledRun = throttleWait
    ? (...args: P) => {
        const now = Date.now()
        if (now - lastThrottleTime >= throttleWait) {
          lastThrottleTime = now
          run(...args)
        } else if (!throttleTimer) {
          throttleTimer = setTimeout(() => {
            lastThrottleTime = Date.now()
            run(...args)
            throttleTimer = null
          }, throttleWait - (now - lastThrottleTime))
        }
      }
    : debouncedRun

  const finalRun = throttledRun

  // 自动执行
  onMounted(() => {
    if (!manual) {
      finalRun(...defaultParams)
    }
  })

  onUnmounted(() => {
    cancel()
  })

  return {
    data,
    loading,
    error,
    run: finalRun,
    runAsync,
    refresh,
    refreshAsync,
    mutate,
    cancel
  }
}

// ==================== Advanced State Hooks ====================

/**
 * usePrevious - 保存上一次状态的 Hook
 */
export function usePrevious<T>(state: T): Ref<T | undefined> {
  const prevRef = ref<T>()
  const curRef = ref<T>()

  watch(
    () => state,
    (newValue) => {
      prevRef.value = curRef.value
      curRef.value = newValue
    },
    { immediate: true }
  )

  return prevRef
}

/**
 * useLatest - 返回当前最新值的 Hook，避免闭包问题
 */
export function useLatest<T>(value: T): Ref<T> {
  const refIns = ref(value) as Ref<T>

  watch(
    () => value,
    (newValue) => {
      refIns.value = newValue
    }
  )

  return refIns
}

/**
 * useCreation - 强制创建对象的 Hook，避免重复创建
 */
export function useCreation<T>(factory: () => T, deps: any[]): T {
  const initialized = ref(false)
  const obj = ref<T>()
  const depsRef = ref(deps)

  if (!initialized.value || !depsAreSame(deps, depsRef.value)) {
    obj.value = factory()
    depsRef.value = deps
    initialized.value = true
  }

  return obj.value!
}

function depsAreSame(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false
  for (let i = 0; i < oldDeps.length; i++) {
    if (oldDeps[i] !== newDeps[i]) return false
  }
  return true
}

/**
 * useReactive - 返回一个响应式对象
 */
export function useReactive<T extends Record<string, any>>(initialState: T): T {
  return reactive(initialState)
}

/**
 * useMap - 管理 Map 类型状态的 Hook
 */
export function useMap<K, V>(initialValue?: Iterable<readonly [K, V]>) {
  const map = ref(new Map(initialValue))

  const set = (key: K, value: V) => {
    map.value.set(key, value)
    map.value = new Map(map.value)
  }

  const get = (key: K) => {
    return map.value.get(key)
  }

  const remove = (key: K) => {
    map.value.delete(key)
    map.value = new Map(map.value)
  }

  const reset = () => {
    map.value = new Map(initialValue)
  }

  const clear = () => {
    map.value.clear()
    map.value = new Map(map.value)
  }

  return {
    map: computed(() => map.value),
    set,
    get,
    remove,
    reset,
    clear
  }
}

/**
 * useSet - 管理 Set 类型状态的 Hook
 */
export function useSet<T>(initialValue?: Iterable<T>) {
  const set = ref(new Set(initialValue))

  const add = (value: T) => {
    set.value.add(value)
    set.value = new Set(set.value)
  }

  const remove = (value: T) => {
    set.value.delete(value)
    set.value = new Set(set.value)
  }

  const reset = () => {
    set.value = new Set(initialValue)
  }

  const clear = () => {
    set.value.clear()
    set.value = new Set(set.value)
  }

  const has = (value: T) => {
    return set.value.has(value)
  }

  return {
    set: computed(() => set.value),
    add,
    remove,
    reset,
    clear,
    has
  }
}

// ==================== Advanced Effect Hooks ====================

/**
 * useDebounce - 用来处理防抖值的 Hook
 */
export function useDebounce<T>(value: T, delay: number): Ref<T> {
  const debouncedValue = ref(value) as Ref<T>

  watch(
    () => value,
    (newValue) => {
      const timer = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)

      return () => clearTimeout(timer)
    }
  )

  return debouncedValue
}

/**
 * useThrottle - 用来处理节流值的 Hook
 */
export function useThrottle<T>(value: T, wait: number): Ref<T> {
  const throttledValue = ref(value) as Ref<T>
  const lastExecuted = ref(0)

  watch(
    () => value,
    (newValue) => {
      const now = Date.now()
      if (now - lastExecuted.value >= wait) {
        throttledValue.value = newValue
        lastExecuted.value = now
      } else {
        const timer = setTimeout(() => {
          throttledValue.value = newValue
          lastExecuted.value = Date.now()
        }, wait - (now - lastExecuted.value))

        return () => clearTimeout(timer)
      }
    }
  )

  return throttledValue
}

/**
 * useDebounceFn - 用来处理防抖函数的 Hook
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): [T, () => void] {
  let timer: number | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }) as T

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return [debouncedFn, cancel]
}

/**
 * useThrottleFn - 用来处理节流函数的 Hook
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): [T, () => void] {
  let timer: number | null = null
  let lastExecuted = 0

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastExecuted >= wait) {
      fn(...args)
      lastExecuted = now
    } else if (!timer) {
      timer = setTimeout(() => {
        fn(...args)
        lastExecuted = Date.now()
        timer = null
      }, wait - (now - lastExecuted))
    }
  }) as T

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return [throttledFn, cancel]
}

/**
 * useLockFn - 用于给一个异步函数增加竞态锁，防止并发执行
 */
export function useLockFn<P extends any[] = any[], V = any>(
  fn: (...args: P) => Promise<V>
) {
  const lockRef = ref(false)

  return async (...args: P): Promise<V | undefined> => {
    if (lockRef.value) return
    lockRef.value = true
    try {
      const ret = await fn(...args)
      return ret
    } finally {
      lockRef.value = false
    }
  }
}

// ==================== Advanced DOM Hooks ====================

/**
 * useSize - 监听 DOM 节点尺寸变化的 Hook
 */
export function useSize(target: Ref<HTMLElement | null>) {
  const size = reactive({
    width: 0,
    height: 0
  })

  let resizeObserver: ResizeObserver | null = null

  const updateSize = () => {
    const el = unref(target)
    if (el) {
      size.width = el.offsetWidth
      size.height = el.offsetHeight
    }
  }

  watch(
    target,
    (el) => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (el) {
        updateSize()
        resizeObserver = new ResizeObserver(updateSize)
        resizeObserver.observe(el)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })

  return size
}

/**
 * useScroll - 监听元素滚动位置的 Hook
 */
export function useScroll(target?: Ref<HTMLElement | null>) {
  const position = reactive({
    left: 0,
    top: 0
  })

  const updatePosition = () => {
    const el = target ? unref(target) : document.documentElement
    if (el) {
      position.left = el.scrollLeft
      position.top = el.scrollTop
    }
  }

  const targetElement = target ? target : ref(document.documentElement)

  useEventListener('scroll', updatePosition, targetElement.value)

  onMounted(() => {
    updatePosition()
  })

  return position
}

/**
 * useHover - 监听 DOM 元素是否有鼠标悬停的 Hook
 */
export function useHover(target: Ref<HTMLElement | null>) {
  const isHovering = ref(false)

  const onMouseEnter = () => {
    isHovering.value = true
  }

  const onMouseLeave = () => {
    isHovering.value = false
  }

  watch(
    target,
    (el) => {
      if (el) {
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    const el = unref(target)
    if (el) {
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  })

  return isHovering
}

/**
 * useInViewport - 监听元素是否在可视区域内的 Hook
 */
export function useInViewport(target: Ref<HTMLElement | null>) {
  const inViewport = ref(false)
  const ratio = ref(0)

  let observer: IntersectionObserver | null = null

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  watch(
    target,
    (el) => {
      cleanup()

      if (el) {
        observer = new IntersectionObserver(
          ([entry]) => {
            inViewport.value = entry.isIntersecting
            ratio.value = entry.intersectionRatio
          },
          { threshold: [0, 0.25, 0.5, 0.75, 1] }
        )
        observer.observe(el)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    cleanup()
  })

  return {
    inViewport,
    ratio
  }
}

/**
 * useDrag - 拖拽功能的 Hook
 */
export function useDrag<T = any>(
  target: Ref<HTMLElement | null>,
  options?: {
    onDragStart?: (event: DragEvent) => void
    onDragEnd?: (event: DragEvent) => void
    dragData?: T
  }
) {
  const isDragging = ref(false)

  const handleDragStart = (event: DragEvent) => {
    isDragging.value = true
    if (options?.dragData) {
      event.dataTransfer?.setData('text/plain', JSON.stringify(options.dragData))
    }
    options?.onDragStart?.(event)
  }

  const handleDragEnd = (event: DragEvent) => {
    isDragging.value = false
    options?.onDragEnd?.(event)
  }

  watch(
    target,
    (el) => {
      if (el) {
        el.draggable = true
        el.addEventListener('dragstart', handleDragStart)
        el.addEventListener('dragend', handleDragEnd)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    const el = unref(target)
    if (el) {
      el.removeEventListener('dragstart', handleDragStart)
      el.removeEventListener('dragend', handleDragEnd)
    }
  })

  return {
    isDragging
  }
}

/**
 * useDrop - 拖放功能的 Hook
 */
export function useDrop<T = any>(
  target: Ref<HTMLElement | null>,
  options?: {
    onDrop?: (data: T, event: DragEvent) => void
    onDragOver?: (event: DragEvent) => void
    onDragEnter?: (event: DragEvent) => void
    onDragLeave?: (event: DragEvent) => void
  }
) {
  const isHovering = ref(false)

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    options?.onDragOver?.(event)
  }

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    isHovering.value = true
    options?.onDragEnter?.(event)
  }

  const handleDragLeave = (event: DragEvent) => {
    isHovering.value = false
    options?.onDragLeave?.(event)
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isHovering.value = false

    try {
      const dataString = event.dataTransfer?.getData('text/plain')
      if (dataString) {
        const data = JSON.parse(dataString) as T
        options?.onDrop?.(data, event)
      }
    } catch (error) {
      console.warn('Failed to parse drop data:', error)
    }
  }

  watch(
    target,
    (el) => {
      if (el) {
        el.addEventListener('dragover', handleDragOver)
        el.addEventListener('dragenter', handleDragEnter)
        el.addEventListener('dragleave', handleDragLeave)
        el.addEventListener('drop', handleDrop)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    const el = unref(target)
    if (el) {
      el.removeEventListener('dragover', handleDragOver)
      el.removeEventListener('dragenter', handleDragEnter)
      el.removeEventListener('dragleave', handleDragLeave)
      el.removeEventListener('drop', handleDrop)
    }
  })

  return {
    isHovering
  }
}

// ==================== Advanced Utility Hooks ====================

/**
 * useVirtualList - 虚拟列表的 Hook
 */
export function useVirtualList<T>(
  list: Ref<T[]>,
  options: {
    containerHeight: number
    itemHeight: number | ((index: number, item: T) => number)
    overscan?: number
  }
) {
  const { containerHeight, itemHeight, overscan = 5 } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()

  const getItemHeight = (index: number, item: T): number => {
    return typeof itemHeight === 'function' ? itemHeight(index, item) : itemHeight
  }

  const totalHeight = computed(() => {
    return list.value.reduce((acc, item, index) => {
      return acc + getItemHeight(index, item)
    }, 0)
  })

  const visibleRange = computed(() => {
    const items = list.value
    let startIndex = 0
    let endIndex = 0
    let accumulatedHeight = 0

    // 找到开始索引
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i, items[i])
      if (accumulatedHeight + height > scrollTop.value) {
        startIndex = Math.max(0, i - overscan)
        break
      }
      accumulatedHeight += height
    }

    // 找到结束索引
    accumulatedHeight = 0
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i, items[i])
      accumulatedHeight += height
      if (accumulatedHeight > scrollTop.value + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan)
        break
      }
    }

    return { startIndex, endIndex }
  })

  const visibleItems = computed(() => {
    const { startIndex, endIndex } = visibleRange.value
    return list.value.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  })

  const offsetY = computed(() => {
    const { startIndex } = visibleRange.value
    let offset = 0
    for (let i = 0; i < startIndex; i++) {
      offset += getItemHeight(i, list.value[i])
    }
    return offset
  })

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  watch(
    containerRef,
    (el) => {
      if (el) {
        el.addEventListener('scroll', handleScroll)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    const el = unref(containerRef)
    if (el) {
      el.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    scrollTo: (index: number) => {
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i, list.value[i])
      }
      if (containerRef.value) {
        containerRef.value.scrollTop = offset
      }
    }
  }
}

/**
 * useInfiniteScroll - 无限滚动的 Hook
 */
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  options?: {
    threshold?: number
    isNoMore?: Ref<boolean>
    target?: Ref<HTMLElement | null>
  }
) {
  const { threshold = 100, isNoMore, target } = options || {}

  const loading = ref(false)
  const list = ref<T[]>([])

  const loadMore = async () => {
    if (loading.value || (isNoMore && unref(isNoMore))) {
      return
    }

    loading.value = true
    try {
      const newItems = await fetchMore()
      list.value.push(...newItems)
    } catch (error) {
      console.error('Failed to load more items:', error)
    } finally {
      loading.value = false
    }
  }

  const handleScroll = () => {
    const element = target ? unref(target) : document.documentElement
    if (!element) return

    const { scrollTop, scrollHeight, clientHeight } = element
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore()
    }
  }

  const targetElement = target || ref(document.documentElement)
  useEventListener('scroll', handleScroll, targetElement.value)

  return {
    list,
    loading,
    loadMore
  }
}

/**
 * useWebSocket - WebSocket 连接的 Hook
 */
export function useWebSocket(
  url: string,
  options?: {
    onOpen?: (event: Event) => void
    onMessage?: (message: MessageEvent) => void
    onClose?: (event: CloseEvent) => void
    onError?: (event: Event) => void
    reconnectLimit?: number
    reconnectInterval?: number
    protocols?: string | string[]
  }
) {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectLimit = 3,
    reconnectInterval = 3000,
    protocols
  } = options || {}

  const ws = ref<WebSocket>()
  const readyState = ref<number>(WebSocket.CONNECTING)
  const latestMessage = ref<MessageEvent>()

  let reconnectCount = 0
  let reconnectTimer: number | null = null

  const connect = () => {
    try {
      ws.value = new WebSocket(url, protocols)

      ws.value.onopen = (event) => {
        readyState.value = WebSocket.OPEN
        reconnectCount = 0
        onOpen?.(event)
      }

      ws.value.onmessage = (event) => {
        latestMessage.value = event
        onMessage?.(event)
      }

      ws.value.onclose = (event) => {
        readyState.value = WebSocket.CLOSED
        onClose?.(event)

        // 自动重连
        if (reconnectCount < reconnectLimit) {
          reconnectCount++
          reconnectTimer = setTimeout(connect, reconnectInterval)
        }
      }

      ws.value.onerror = (event) => {
        readyState.value = WebSocket.CLOSED
        onError?.(event)
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (ws.value) {
      ws.value.close()
    }
  }

  const sendMessage = (message: string | ArrayBuffer | Blob) => {
    if (ws.value && readyState.value === WebSocket.OPEN) {
      ws.value.send(message)
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    readyState,
    latestMessage,
    connect,
    disconnect,
    sendMessage
  }
}
