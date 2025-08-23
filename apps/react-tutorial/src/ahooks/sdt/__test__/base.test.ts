import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useToggle,
  useBoolean,
  useSetState,
  useGetState,
  useUpdateEffect,
  useMount,
  useUnmount,
  useUnmountedRef,
  usePrevious,
  useLatest,
  useCounter,
  useLocalStorageState,
  useSessionStorageState,
  // useEventListener,
  // useClickAway,
  // useRafState,
  // useSafeState,
  // useCreation,
  // useCookieState,
  // useSize,
  // useHover,
  // useMouse,
  // useScroll,
  // useKeyPress,
  // useFocusWithin,
  // useTimeout,
  // useInterval,
  // useCountDown
} from '../base';

const fakeGlobal = globalThis || {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  requestAnimationFrame: vi.fn(),
  cancelAnimationFrame: vi.fn(),
  requestIdleCallback: vi.fn(),
  cancelIdleCallback: vi.fn(),
  setTimeout: vi.fn(),
  clearTimeout: vi.fn(),
  setInterval: vi.fn(),
  clearInterval: vi.fn(),
  setImmediate: vi.fn(),
  clearImmediate: vi.fn(),
  Promise: vi.fn(),
  Symbol: vi.fn(),
  Object: vi.fn(),
  Function: vi.fn(),
  Array: vi.fn(),
  String: vi.fn(),
  Number: vi.fn(),
  Boolean: vi.fn(),
  Date: vi.fn(),
  Error: vi.fn(),
  RegExp: vi.fn(),
  Map: vi.fn(),
  Set: vi.fn(),
  WeakMap: vi.fn(),
  WeakSet: vi.fn(),
};

describe('useToggle', () => {
  it('should toggle between default values', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);
  });

  it('should toggle between custom values', () => {
    const { result } = renderHook(() => useToggle('hello', 'world'));
    expect(result.current[0]).toBe('hello');

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe('world');

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe('hello');
  });

  it('should set specific value', () => {
    const { result } = renderHook(() => useToggle(false, true));
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);
  });
});

describe('useBoolean', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current[0]).toBe(false);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current[0]).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current[1].toggle();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1].toggle();
    });
    expect(result.current[0]).toBe(false);
  });

  it('should set to true', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current[1].setTrue();
    });
    expect(result.current[0]).toBe(true);
  });

  it('should set to false', () => {
    const { result } = renderHook(() => useBoolean(true));

    act(() => {
      result.current[1].setFalse();
    });
    expect(result.current[0]).toBe(false);
  });

  it('should set to specific value', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current[1].set(true);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1].set(false);
    });
    expect(result.current[0]).toBe(false);
  });
});

describe('useSetState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSetState({ name: 'test', age: 18 }));
    expect(result.current[0]).toEqual({ name: 'test', age: 18 });
  });

  it('should update state partially', () => {
    const { result } = renderHook(() => useSetState({ name: 'test', age: 18 }));

    act(() => {
      result.current[1]({ age: 20 });
    });
    expect(result.current[0]).toEqual({ name: 'test', age: 20 });
  });

  it('should update state with function', () => {
    const { result } = renderHook(() => useSetState({ name: 'test', age: 18 }));

    act(() => {
      result.current[1]((prevState) => ({ age: prevState.age + 1 }));
    });
    expect(result.current[0]).toEqual({ name: 'test', age: 19 });
  });
});

describe('useGetState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGetState(10));
    expect(result.current[0]).toBe(10);
  });

  it('should update state', () => {
    const { result } = renderHook(() => useGetState(10));

    act(() => {
      result.current[1](20);
    });
    expect(result.current[0]).toBe(20);
  });

  it('should get latest state', () => {
    const { result } = renderHook(() => useGetState(10));

    act(() => {
      result.current[1](20);
    });

    expect(result.current[2]()).toBe(20);
  });
});

describe('useUpdateEffect', () => {
  it('should not run on mount', () => {
    const fn = vi.fn();
    renderHook(() => useUpdateEffect(fn));
    expect(fn).not.toHaveBeenCalled();
  });

  it('should run on update', () => {
    const fn = vi.fn();
    const { rerender } = renderHook(({ deps }) => useUpdateEffect(fn, [deps]), {
      initialProps: { deps: 0 }
    });

    expect(fn).not.toHaveBeenCalled();

    rerender({ deps: 1 });
    expect(fn).toHaveBeenCalledTimes(1);

    rerender({ deps: 2 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should run cleanup function', () => {
    const cleanup = vi.fn();
    const effect = vi.fn().mockReturnValue(cleanup);

    const { rerender, unmount } = renderHook(({ deps }) => useUpdateEffect(effect, [deps]), {
      initialProps: { deps: 0 }
    });

    expect(cleanup).not.toHaveBeenCalled();

    rerender({ deps: 1 });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: 2 });
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(2);

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});

describe('useMount', () => {
  it('should run on mount', () => {
    const fn = vi.fn();
    renderHook(() => useMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('useUnmount', () => {
  it('should run on unmount', () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useUnmount(fn));

    expect(fn).not.toHaveBeenCalled();

    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('useUnmountedRef', () => {
  it('should return false when mounted', () => {
    const { result } = renderHook(() => useUnmountedRef());
    expect(result.current.current).toBe(false);
  });

  it('should return true when unmounted', () => {
    const { result, unmount } = renderHook(() => useUnmountedRef());

    unmount();
    expect(result.current.current).toBe(true);
  });
});

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(({ state }) => usePrevious(state), {
      initialProps: { state: 0 }
    });

    expect(result.current).toBeUndefined();
  });

  it('should return previous state after update', () => {
    const { result, rerender } = renderHook(({ state }) => usePrevious(state), {
      initialProps: { state: 0 }
    });

    rerender({ state: 1 });
    expect(result.current).toBe(0);

    rerender({ state: 2 });
    expect(result.current).toBe(1);
  });
});

describe('useLatest', () => {
  it('should return latest value', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 0 }
    });

    expect(result.current.current).toBe(0);

    rerender({ value: 1 });
    expect(result.current.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current.current).toBe(2);
  });
});

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current[0]).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current[0]).toBe(10);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current[1].inc();
    });
    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1].inc(5);
    });
    expect(result.current[0]).toBe(6);
  });

  it('should decrement counter', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current[1].dec();
    });
    expect(result.current[0]).toBe(9);

    act(() => {
      result.current[1].dec(5);
    });
    expect(result.current[0]).toBe(4);
  });

  it('should set counter to specific value', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current[1].set(100);
    });
    expect(result.current[0]).toBe(100);

    act(() => {
      result.current[1].set(prev => prev + 50);
    });
    expect(result.current[0]).toBe(150);
  });

  it('should reset counter to initial value', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current[1].inc(10);
    });
    expect(result.current[0]).toBe(15);

    act(() => {
      result.current[1].reset();
    });
    expect(result.current[0]).toBe(5);
  });
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

describe('useLocalStorageState', () => {
  beforeEach(() => {
    Object.defineProperty(fakeGlobal, 'localStorage', { value: mockLocalStorage });
    mockLocalStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default-value'));
    expect(result.current[0]).toBe('default-value');
  });

  it('should update value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default-value'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should update value with function', () => {
    const { result } = renderHook(() => useLocalStorageState<number>('test-key', 0));

    act(() => {
      result.current[1]((prev: number | undefined) => (prev ?? 0) + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(1));
  });
});

describe('useSessionStorageState', () => {
  beforeEach(() => {
    Object.defineProperty(fakeGlobal, 'sessionStorage', { value: mockSessionStorage });
    mockSessionStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useSessionStorageState('test-key', 'default-value'));
    expect(result.current[0]).toBe('default-value');
  });

  it('should update value in sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorageState('test-key', 'default-value'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should update value with function', () => {
    const { result } = renderHook(() => useSessionStorageState<number>('test-key', 0));

    act(() => {
      result.current[1]((prev: number | undefined) => (prev ?? 0) + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(1));
  });
});

// More tests can be added for other hooks as needed
