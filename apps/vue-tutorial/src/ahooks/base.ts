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
  type ComputedRef,
  type WatchStopHandle
} from 'vue'

// ==================== State Hooks ====================

/**
 * useToggle - 用于在两个状态值间切换的 Hook
 */
export function useToggle<T = boolean>(
  defaultValue?: T,
  reverseValue?: T
): [Ref<T>, (value?: T) => void] {
  const state = ref(defaultValue) as Ref<T>

  const toggle = (value?: T) => {
    if (value !== undefined) {
      state.value = value
    } else {
      state.value = state.value === defaultValue ? reverseValue! : defaultValue!
    }
  }

  return [state, toggle]
}

/**
 * useBoolean - 管理 boolean 状态的 Hook
 */
export function useBoolean(defaultValue = false) {
  const [state, toggle] = useToggle(defaultValue)

  const setTrue = () => toggle(true)
  const setFalse = () => toggle(false)

  return {
    state,
    toggle,
    setTrue,
    setFalse
  }
}

/**
 * useCounter - 管理计数器的 Hook
 */
export function useCounter(initialValue = 0, options?: {
  min?: number
  max?: number
}) {
  const current = ref(initialValue)

  const inc = (delta = 1) => {
    const target = current.value + delta
    if (options?.max !== undefined && target > options.max) {
      current.value = options.max
    } else {
      current.value = target
    }
  }

  const dec = (delta = 1) => {
    const target = current.value - delta
    if (options?.min !== undefined && target < options.min) {
      current.value = options.min
    } else {
      current.value = target
    }
  }

  const set = (value: number) => {
    if (options?.max !== undefined && value > options.max) {
      current.value = options.max
    } else if (options?.min !== undefined && value < options.min) {
      current.value = options.min
    } else {
      current.value = value
    }
  }

  const reset = () => {
    current.value = initialValue
  }

  return {
    current,
    inc,
    dec,
    set,
    reset
  }
}

/**
 * useLocalStorageState - 将状态存储在 localStorage 中的 Hook
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue?: T | (() => T)
) {
  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) {
        return JSON.parse(item)
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }

    return typeof defaultValue === 'function'
      ? (defaultValue as () => T)()
      : defaultValue!
  }

  const state = ref<T>(getStoredValue())

  const setState = (value: T | ((prevState: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function'
        ? (value as (prevState: T) => T)(state.value)
        : value

      state.value = valueToStore
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [state, setState] as const
}

/**
 * useSessionStorageState - 将状态存储在 sessionStorage 中的 Hook
 */
export function useSessionStorageState<T>(
  key: string,
  defaultValue?: T | (() => T)
) {
  const getStoredValue = (): T => {
    try {
      const item = sessionStorage.getItem(key)
      if (item !== null) {
        return JSON.parse(item)
      }
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
    }

    return typeof defaultValue === 'function'
      ? (defaultValue as () => T)()
      : defaultValue!
  }

  const state = ref<T>(getStoredValue())

  const setState = (value: T | ((prevState: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function'
        ? (value as (prevState: T) => T)(state.value)
        : value

      state.value = valueToStore
      sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  }

  return [state, setState] as const
}

// ==================== Effect Hooks ====================

/**
 * useUpdateEffect - 忽略首次执行，只在依赖更新时执行的 useEffect Hook
 */
export function useUpdateEffect(
  effect: () => void | (() => void),
  deps?: any[]
) {
  const isMounted = ref(false)
  let cleanup: (() => void) | void

  watch(
    () => deps,
    () => {
      if (!isMounted.value) {
        isMounted.value = true
        return
      }

      if (cleanup) {
        cleanup()
      }
      cleanup = effect()
    },
    { deep: true }
  )

  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
}

/**
 * useMount - 只在组件初始化时执行的 Hook
 */
export function useMount(fn: () => void) {
  onMounted(fn)
}

/**
 * useUnmount - 在组件卸载时执行的 Hook
 */
export function useUnmount(fn: () => void) {
  onUnmounted(fn)
}

/**
 * useTimeout - 一段时间内，延迟执行函数的 Hook
 */
export function useTimeout(fn: () => void, delay?: number) {
  const timerRef = ref<number>()

  const clear = () => {
    if (timerRef.value) {
      clearTimeout(timerRef.value)
      timerRef.value = undefined
    }
  }

  const set = () => {
    clear()
    if (delay !== undefined && delay >= 0) {
      timerRef.value = setTimeout(fn, delay)
    }
  }

  onMounted(() => {
    set()
  })

  onUnmounted(() => {
    clear()
  })

  return { clear, set }
}

/**
 * useInterval - 一段时间内，循环执行函数的 Hook
 */
export function useInterval(
  fn: () => void,
  delay?: number,
  options?: { immediate?: boolean }
) {
  const timerRef = ref<number>()

  const clear = () => {
    if (timerRef.value) {
      clearInterval(timerRef.value)
      timerRef.value = undefined
    }
  }

  const set = () => {
    clear()
    if (delay !== undefined && delay >= 0) {
      if (options?.immediate) {
        fn()
      }
      timerRef.value = setInterval(fn, delay)
    }
  }

  onMounted(() => {
    set()
  })

  onUnmounted(() => {
    clear()
  })

  return { clear, set }
}

// ==================== DOM Hooks ====================

export interface ProWindowEventMap extends WindowEventMap {

}

/**
 * useEventListener - 优雅的使用 addEventListener 的 Hook
 */
export function useEventListener<K extends keyof ProWindowEventMap>(
  eventName: K,
  handler: ProWindowEventMap[K],
  target?: EventTarget | null,
  options?: boolean | AddEventListenerOptions
) {
  onMounted(() => {
    const targetElement = target || window
    if (targetElement && targetElement.addEventListener) {
      targetElement.addEventListener(eventName, handler as EventListener, options)
    }
  })

  onUnmounted(() => {
    const targetElement = target || window
    if (targetElement && targetElement.removeEventListener) {
      targetElement.removeEventListener(eventName, handler as EventListener, options)
    }
  })
}

/**
 * useClickAway - 监听目标元素外的点击事件
 */
export function useClickAway(
  target: Ref<HTMLElement | null>,
  onClickAway: (event: MouseEvent) => void
) {
  const handler = (event: MouseEvent) => {
    const el = unref(target)
    if (el && !el.contains(event.target as Node)) {
      onClickAway(event)
    }
  }

  useEventListener('click', handler, document)
}

/**
 * useKeyPress - 监听键盘按键的 Hook
 */
export function useKeyPress(
  keyFilter: string | string[] | ((event: KeyboardEvent) => boolean),
  eventHandler: (event: KeyboardEvent) => void,
  options?: {
    events?: ('keydown' | 'keyup')[]
    target?: EventTarget
  }
) {
  const { events = ['keydown'], target = window } = options || {}

  const handler = (event: KeyboardEvent) => {
    if (typeof keyFilter === 'function') {
      if (keyFilter(event)) {
        eventHandler(event)
      }
    } else if (typeof keyFilter === 'string') {
      if (event.key === keyFilter) {
        eventHandler(event)
      }
    } else if (Array.isArray(keyFilter)) {
      if (keyFilter.includes(event.key)) {
        eventHandler(event)
      }
    }
  }

  events.forEach(event => {
    useEventListener(event as any, handler, target)
  })
}

// ==================== Utility Hooks ====================

/**
 * useCopyToClipboard - 拷贝文本到剪贴板的 Hook
 */
export function useCopyToClipboard() {
  const copiedText = ref<string>()

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      copiedText.value = text
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      copiedText.value = undefined
      return false
    }
  }

  return {
    copiedText,
    copy
  }
}

/**
 * useTitle - 设置页面标题的 Hook
 */
export function useTitle(title: string | Ref<string>) {
  const titleRef = ref(title)

  watch(
    titleRef,
    (newTitle) => {
      if (typeof document !== 'undefined') {
        document.title = newTitle
      }
    },
    { immediate: true }
  )

  return titleRef
}

/**
 * useFavicon - 设置页面 favicon 的 Hook
 */
export function useFavicon(href: string | Ref<string>) {
  const hrefRef = ref(href)

  watch(
    hrefRef,
    (newHref) => {
      if (typeof document !== 'undefined') {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement ||
                    document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = newHref
        document.getElementsByTagName('head')[0].appendChild(link)
      }
    },
    { immediate: true }
  )

  return hrefRef
}

/**
 * useFullscreen - 全屏操作的 Hook
 */
export function useFullscreen(target?: Ref<HTMLElement | null>) {
  const isFullscreen = ref(false)

  const enterFullscreen = async () => {
    const element = target ? unref(target) : document.documentElement
    if (!element) return

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
      isFullscreen.value = true
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
      isFullscreen.value = false
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen.value) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  const handleFullscreenChange = () => {
    isFullscreen.value = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )
  }

  useEventListener('fullscreenchange', handleFullscreenChange, document)
  useEventListener('webkitfullscreenchange', handleFullscreenChange, document)
  useEventListener('msfullscreenchange', handleFullscreenChange, document)

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  }
}

/**
 * useNetwork - 监听网络状态的 Hook
 */
export function useNetwork() {
  const online = ref(navigator?.onLine ?? true)
  const offlineAt = ref<Date>()
  const onlineAt = ref<Date>()
  const downlink = ref<number>()
  const downlinkMax = ref<number>()
  const effectiveType = ref<string>()
  const rtt = ref<number>()
  const saveData = ref<boolean>()
  const type = ref<string>()

  const updateNetworkInformation = () => {
    const connection = (navigator as any)?.connection
    if (connection) {
      downlink.value = connection.downlink
      downlinkMax.value = connection.downlinkMax
      effectiveType.value = connection.effectiveType
      rtt.value = connection.rtt
      saveData.value = connection.saveData
      type.value = connection.type
    }
  }

  const handleOnline = () => {
    online.value = true
    onlineAt.value = new Date()
    updateNetworkInformation()
  }

  const handleOffline = () => {
    online.value = false
    offlineAt.value = new Date()
  }

  useEventListener('online', handleOnline, window)
  useEventListener('offline', handleOffline, window)

  onMounted(() => {
    updateNetworkInformation()
  })

  return {
    online,
    offlineAt,
    onlineAt,
    downlink,
    downlinkMax,
    effectiveType,
    rtt,
    saveData,
    type
  }
}

/**
 * useBattery - 获取电池状态的 Hook
 */
export function useBattery() {
  const charging = ref<boolean>()
  const chargingTime = ref<number>()
  const dischargingTime = ref<number>()
  const level = ref<number>()

  const updateBatteryInfo = (battery: any) => {
    charging.value = battery.charging
    chargingTime.value = battery.chargingTime
    dischargingTime.value = battery.dischargingTime
    level.value = battery.level
  }

  onMounted(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        updateBatteryInfo(battery)

        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery))
        battery.addEventListener('chargingtimechange', () => updateBatteryInfo(battery))
        battery.addEventListener('dischargingtimechange', () => updateBatteryInfo(battery))
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery))
      } catch (error) {
        console.warn('Battery API not supported:', error)
      }
    }
  })

  return {
    charging,
    chargingTime,
    dischargingTime,
    level
  }
}
