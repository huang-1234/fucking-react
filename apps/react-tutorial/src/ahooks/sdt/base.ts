import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ==================== State Hooks ====================

/**
 * useToggle - 用于在两个状态值间切换的 Hook
 */
export function useToggle<T = boolean>(
  defaultValue: T = false as T,
  reverseValue?: T
): [T, (value?: T) => void] {
  const [state, setState] = useState<T>(defaultValue);

  const toggle = useCallback((value?: T) => {
    if (value !== undefined) {
      setState(value);
    } else {
      setState(prev => {
        if (reverseValue !== undefined) {
          return prev === defaultValue ? reverseValue : defaultValue;
        }
        return !prev as T;
      });
    }
  }, [defaultValue, reverseValue]);

  return [state, toggle];
}

/**
 * useBoolean - 管理 boolean 状态的 Hook
 */
export function useBoolean(defaultValue = false): [
  boolean,
  {
    toggle: () => void;
    set: (value: boolean) => void;
    setTrue: () => void;
    setFalse: () => void;
  }
] {
  const [state, setState] = useState(defaultValue);

  const actions = useMemo(() => ({
    toggle: () => setState(prev => !prev),
    set: (value: boolean) => setState(value),
    setTrue: () => setState(true),
    setFalse: () => setState(false),
  }), []);

  return [state, actions];
}

/**
 * useSetState - 管理 object 类型 state 的 Hooks，用法与 class 组件的 this.setState 基本一致
 */
export function useSetState<T extends Record<string, any>>(
  initialState: T | (() => T)
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] {
  const [state, setState] = useState<T>(initialState);

  const setMergeState = useCallback((patch: Partial<T> | ((prevState: T) => Partial<T>)) => {
    setState(prevState => {
      const newPatch = typeof patch === 'function' ? patch(prevState) : patch;
      return { ...prevState, ...newPatch };
    });
  }, []);

  return [state, setMergeState];
}

/**
 * useGetState - 获取当前最新值的 Hook
 */
export function useGetState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void, () => T] {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);

  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  return [state, setState, getState];
}

// ==================== Effect Hooks ====================

/**
 * useUpdateEffect - 忽略首次执行，只在依赖更新时执行的 useEffect Hook
 */
export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
}

/**
 * useMount - 只在组件初始化时执行的 Hook
 */
export function useMount(fn: () => void) {
  useEffect(() => {
    fn();
  }, []);
}

/**
 * useUnmount - 在组件卸载时执行的 Hook
 */
export function useUnmount(fn: () => void) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
}

/**
 * useUnmountedRef - 获取当前组件是否已经卸载的 Hook
 */
export function useUnmountedRef() {
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  return unmountedRef;
}

// ==================== Dom Hooks ====================

/**
 * useEventListener - 优雅的使用 addEventListener 的 Hook
 */
export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element?: Element | null | React.RefObject<Element>
) {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  useEffect(() => {
    const targetElement = element?.hasOwnProperty('current')
      ? (element as React.RefObject<Element>).current
      : element as Element;

    if (!targetElement?.addEventListener) return;

    const eventListener = (event: Event) => savedHandler.current(event as HTMLElementEventMap[K]);
    targetElement.addEventListener(eventName, eventListener);

    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

/**
 * useClickAway - 监听目标元素外的点击事件
 */
export function useClickAway(
  onClickAway: (event: MouseEvent | TouchEvent) => void,
  target: React.RefObject<Element> | Element | (() => Element)
) {
  const onClickAwayRef = useRef(onClickAway);
  onClickAwayRef.current = onClickAway;

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const targetElement = typeof target === 'function'
        ? target()
        : target?.hasOwnProperty('current')
          ? (target as React.RefObject<Element>).current
          : target as Element;

      if (!targetElement || targetElement.contains(event.target as Node)) {
        return;
      }

      onClickAwayRef.current(event);
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [target]);
}

// ==================== Advanced State ====================

/**
 * usePrevious - 保存上一次状态的 Hook
 */
export function usePrevious<T>(state: T): T | undefined {
  const prevRef = useRef<T>(state);
  const curRef = useRef<T>(state);

  if (curRef.current !== state) {
    prevRef.current = curRef.current;
    curRef.current = state;
  }

  return prevRef.current;
}

/**
 * useRafState - 只在 requestAnimationFrame callback 时更新 state，一般用于性能优化
 */
export function useRafState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState(initialState);
  const rafIdRef = useRef<number>(0);

  const setRafState = useCallback((value: T | ((prev: T) => T)) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);

  useUnmount(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  });

  return [state, setRafState];
}

/**
 * useSafeState - 用法与 React.useState 完全一样，但是在组件卸载后异步回调内的 setState 不再执行
 */
export function useSafeState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
  const unmountedRef = useUnmountedRef();
  const [state, setState] = useState(initialState);

  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (unmountedRef.current) return;
    setState(value);
  }, [unmountedRef]);

  return [state, setSafeState];
}

// ==================== Lifecycle ====================

/**
 * useCreation - 强制子组件重新渲染的 Hook
 */
export function useCreation<T>(factory: () => T, deps: React.DependencyList): T {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  });

  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps;
    current.obj = factory();
    current.initialized = true;
  }

  return current.obj as T;
}

function depsAreSame(oldDeps: React.DependencyList, deps: React.DependencyList): boolean {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }
  return true;
}

/**
 * useLatest - 返回当前最新值的 Hook，可以避免闭包问题
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// ==================== Utility Hooks ====================

/**
 * useCounter - 管理计数器的 Hook
 */
export function useCounter(initialValue = 0): [
  number,
  {
    inc: (delta?: number) => void;
    dec: (delta?: number) => void;
    set: (value: number | ((c: number) => number)) => void;
    reset: () => void;
  }
] {
  const [current, setCurrent] = useState(initialValue);

  const actions = useMemo(() => ({
    inc: (delta = 1) => setCurrent(prev => prev + delta),
    dec: (delta = 1) => setCurrent(prev => prev - delta),
    set: (value: number | ((c: number) => number)) => setCurrent(value),
    reset: () => setCurrent(initialValue),
  }), [initialValue]);

  return [current, actions];
}

/**
 * useLocalStorageState - 将状态存储在 localStorage 中的 Hook
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue?: T | (() => T)
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void] {
  const [state, setState] = useState<T | undefined>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  });

  const setValue = useCallback((value: T | ((prev: T | undefined) => T)) => {
    try {
      const valueToStore = typeof value === 'function' ? (value as (prev: T | undefined) => T)(state) : value;
      setState(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setValue];
}

/**
 * useSessionStorageState - 将状态存储在 sessionStorage 中的 Hook
 */
export function useSessionStorageState<T>(
  key: string,
  defaultValue?: T | (() => T)
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void] {
  const [state, setState] = useState<T | undefined>(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  });

  const setValue = useCallback((value: T | ((prev: T | undefined) => T)) => {
    try {
      const valueToStore = typeof value === 'function' ? (value as (prev: T | undefined) => T)(state) : value;
      setState(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setValue];
}

/**
 * useCookieState - 将状态存储在 Cookie 中的 Hook
 */
export function useCookieState(
  cookieKey: string,
  options: {
    defaultValue?: string;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): [string | undefined, (value: string | ((prev: string | undefined) => string)) => void] {
  const [state, setState] = useState<string | undefined>(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${cookieKey}=`))
      ?.split('=')[1];
    return cookieValue || options.defaultValue;
  });

  const updateCookie = useCallback((value: string | ((prev: string | undefined) => string)) => {
    const newValue = typeof value === 'function' ? value(state) : value;
    setState(newValue);

    let cookieString = `${cookieKey}=${newValue}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    if (options.secure) {
      cookieString += '; secure';
    }
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }, [cookieKey, state, options]);

  return [state, updateCookie];
}

// ==================== Sensor Hooks ====================

/**
 * useSize - 监听 DOM 节点尺寸变化的 Hook
 */
export function useSize(target: React.RefObject<Element>): { width?: number; height?: number } {
  const [state, setState] = useState<{ width?: number; height?: number }>({});

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { clientWidth, clientHeight } = entry.target;
        setState({ width: clientWidth, height: clientHeight });
      });
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [target]);

  return state;
}

/**
 * useHover - 监听 DOM 元素是否有鼠标悬停
 */
export function useHover(target: React.RefObject<Element>): boolean {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [target]);

  return isHovering;
}

/**
 * useMouse - 监听鼠标位置
 */
export function useMouse(): {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
} {
  const [state, setState] = useState({
    screenX: NaN,
    screenY: NaN,
    clientX: NaN,
    clientY: NaN,
    pageX: NaN,
    pageY: NaN,
  });

  useEffect(() => {
    const moveHandler = (event: MouseEvent) => {
      const { screenX, screenY, clientX, clientY, pageX, pageY } = event;
      setState({ screenX, screenY, clientX, clientY, pageX, pageY });
    };

    document.addEventListener('mousemove', moveHandler);
    return () => document.removeEventListener('mousemove', moveHandler);
  }, []);

  return state;
}

/**
 * useScroll - 监听元素的滚动位置
 */
export function useScroll(target?: React.RefObject<Element>): {
  left: number;
  top: number;
} {
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const element = target?.current || document;
    if (!element) return;

    const updatePosition = () => {
      let left: number, top: number;
      if (element === document) {
        left = document.documentElement.scrollLeft || document.body.scrollLeft;
        top = document.documentElement.scrollTop || document.body.scrollTop;
      } else {
        left = (element as Element).scrollLeft;
        top = (element as Element).scrollTop;
      }
      setPosition({ left, top });
    };

    updatePosition();
    element.addEventListener('scroll', updatePosition);
    return () => element.removeEventListener('scroll', updatePosition);
  }, [target]);

  return position;
}

/**
 * useKeyPress - 监听键盘按键
 */
export function useKeyPress(
  keyFilter: string | string[] | ((event: KeyboardEvent) => boolean),
  eventHandler?: (event: KeyboardEvent) => void,
  options: {
    events?: ('keydown' | 'keyup')[];
    target?: React.RefObject<Element> | Element | Document | Window;
  } = {}
): boolean {
  const { events = ['keydown'], target } = options;
  const [keyPressed, setKeyPressed] = useState(false);
  const eventHandlerRef = useLatest(eventHandler);

  useEffect(() => {
    let targetElement: Element | Document | Window;
    
    if (target && 'current' in target) {
      targetElement = target.current || document;
    } else {
      targetElement = (target as Element | Document | Window) || document;
    }

    if (!targetElement) return;

    const handler = (event: KeyboardEvent) => {
      const isKeyMatch = typeof keyFilter === 'function' 
        ? keyFilter(event)
        : Array.isArray(keyFilter)
          ? keyFilter.includes(event.key)
          : keyFilter === event.key;

      if (isKeyMatch) {
        if (event.type === 'keydown') {
          setKeyPressed(true);
        } else if (event.type === 'keyup') {
          setKeyPressed(false);
        }
        eventHandlerRef.current?.(event);
      }
    };

    events.forEach(event => {
      targetElement.addEventListener(event, handler as EventListener);
    });

    return () => {
      events.forEach(event => {
        targetElement.removeEventListener(event, handler as EventListener);
      });
    };
  }, [keyFilter, events, target, eventHandlerRef]);

  return keyPressed;
}

/**
 * useFocusWithin - 监听当前焦点是否在某个区域之内
 */
export function useFocusWithin(target: React.RefObject<Element>): boolean {
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (element.contains(event.target as Node)) {
        setIsFocusWithin(true);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node)) {
        setIsFocusWithin(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [target]);

  return isFocusWithin;
}

// ==================== Timer Hooks ====================

/**
 * useTimeout - 一个可以处理 setTimeout 计时器函数的 Hook
 */
export function useTimeout(fn: () => void, delay?: number): void {
  const fnRef = useLatest(fn);

  useEffect(() => {
    if (delay === undefined || delay === null) return;

    const timer = setTimeout(() => fnRef.current(), delay);
    return () => clearTimeout(timer);
  }, [delay, fnRef]);
}

/**
 * useInterval - 一个可以处理 setInterval 的 Hook
 */
export function useInterval(fn: () => void, delay?: number, options: { immediate?: boolean } = {}): void {
  const { immediate = false } = options;
  const fnRef = useLatest(fn);

  useEffect(() => {
    if (delay === undefined || delay === null) return;

    if (immediate) {
      fnRef.current();
    }

    const timer = setInterval(() => fnRef.current(), delay);
    return () => clearInterval(timer);
  }, [delay, immediate, fnRef]);
}

/**
 * useCountDown - 一个用于管理倒计时的 Hook
 */
export function useCountDown(options: {
  targetDate?: Date | number | string;
  interval?: number;
  onEnd?: () => void;
} = {}): [number, { start: (target?: Date | number | string) => void; stop: () => void }] {
  const { targetDate, interval = 1000, onEnd } = options;
  const [timeLeft, setTimeLeft] = useState(0);
  const [target, setTarget] = useState<Date | number | string | undefined>(targetDate);
  const onEndRef = useLatest(onEnd);

  useEffect(() => {
    if (!target) {
      setTimeLeft(0);
      return;
    }

    const targetTime = new Date(target).getTime();

    const updateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
        onEndRef.current?.();
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, interval);

    return () => clearInterval(timer);
  }, [target, interval, onEndRef]);

  const start = useCallback((newTarget?: Date | number | string) => {
    setTarget(newTarget || targetDate);
  }, [targetDate]);

  const stop = useCallback(() => {
    setTarget(undefined);
  }, []);

  return [timeLeft, { start, stop }];
}
