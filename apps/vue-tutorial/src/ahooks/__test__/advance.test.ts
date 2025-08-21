import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import {
  useRequest,
  usePrevious,
  useDebounce,
  useThrottle,
  useDebounceFn,
  useThrottleFn,
  useLatest,
  useCreation,
  useReactive,
  useMap,
  useSet,
  useLockFn,
  useSize,
  useScroll,
  useHover,
  useInViewport,
  useDrag,
  useDrop,
  useVirtualList,
  useInfiniteScroll,
  useWebSocket
} from '../advance';

// 创建一个测试组件
const createTestComponent = (setup) => ({
  setup,
  template: '<div></div>'
});

describe('useRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle successful request', async () => {
    const successData = { name: 'test' };
    const service = vi.fn().mockResolvedValue(successData);
    const onSuccess = vi.fn();
    const onFinally = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const { data, loading, error, run, runAsync, refresh, refreshAsync, mutate, cancel } = useRequest(service, {
        manual: true,
        onSuccess,
        onFinally
      });

      return {
        data,
        loading,
        error,
        run,
        runAsync,
        refresh,
        refreshAsync,
        mutate,
        cancel
      };
    }));

    expect(wrapper.vm.loading.value).toBe(false);
    expect(wrapper.vm.data.value).toBeUndefined();

    wrapper.vm.run('test-param');
    expect(wrapper.vm.loading.value).toBe(true);

    await vi.runAllTimersAsync();
    await nextTick();

    expect(service).toHaveBeenCalledWith('test-param');
    expect(wrapper.vm.loading.value).toBe(false);
    expect(wrapper.vm.data.value).toEqual(successData);
    expect(onSuccess).toHaveBeenCalledWith(successData, ['test-param']);
    expect(onFinally).toHaveBeenCalledWith(['test-param'], successData, undefined);
  });

  it('should handle request error', async () => {
    const error = new Error('Request failed');
    const service = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const onFinally = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const { data, loading, error, run, runAsync, refresh, refreshAsync, mutate, cancel } = useRequest(service, {
        manual: true,
        onError,
        onFinally
      });

      return {
        data,
        loading,
        error,
        run,
        runAsync,
        refresh,
        refreshAsync,
        mutate,
        cancel
      };
    }));

    wrapper.vm.run('test-param');

    await vi.runAllTimersAsync();
    await nextTick();

    expect(service).toHaveBeenCalledWith('test-param');
    expect(wrapper.vm.loading.value).toBe(false);
    expect(wrapper.vm.error.value).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error, ['test-param']);
    expect(onFinally).toHaveBeenCalledWith(['test-param'], undefined, error);
  });

  it('should auto run when manual is false', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'success' });

    mount(createTestComponent(() => {
      const { data, loading, error } = useRequest(service, {
        defaultParams: ['default-param']
      });

      return {
        data,
        loading,
        error
      };
    }));

    expect(service).toHaveBeenCalledWith('default-param');
  });

  it('should respect loading delay', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'success' });

    const wrapper = mount(createTestComponent(() => {
      const { data, loading, error, run } = useRequest(service, {
        manual: true,
        loadingDelay: 300
      });

      return {
        data,
        loading,
        error,
        run
      };
    }));

    wrapper.vm.run();

    // Loading should be false initially due to loadingDelay
    expect(wrapper.vm.loading.value).toBe(false);

    // Advance timers by loadingDelay
    vi.advanceTimersByTime(300);
    await nextTick();

    // Now loading should be true
    expect(wrapper.vm.loading.value).toBe(true);

    // Complete the request
    await vi.runAllTimersAsync();
    await nextTick();

    expect(wrapper.vm.loading.value).toBe(false);
  });

  it('should support refresh', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'success' });

    const wrapper = mount(createTestComponent(() => {
      const { data, loading, error, refresh } = useRequest(service, {
        defaultParams: ['default-param']
      });

      return {
        data,
        loading,
        error,
        refresh
      };
    }));

    await vi.runAllTimersAsync();
    await nextTick();

    service.mockClear();

    wrapper.vm.refresh();

    expect(service).toHaveBeenCalledWith('default-param');
  });

  it('should support mutate', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'initial' });

    const wrapper = mount(createTestComponent(() => {
      const { data, loading, error, mutate } = useRequest(service);

      return {
        data,
        loading,
        error,
        mutate
      };
    }));

    await vi.runAllTimersAsync();
    await nextTick();

    wrapper.vm.mutate({ data: 'mutated' });

    expect(wrapper.vm.data.value).toEqual({ data: 'mutated' });

    wrapper.vm.mutate(prev => ({ data: prev.data + '-updated' }));

    expect(wrapper.vm.data.value).toEqual({ data: 'mutated-updated' });
  });

  it('should support cancel', async () => {
    const service = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ data: 'success' }), 1000);
      });
    });

    const wrapper = mount(createTestComponent(() => {
      const { data, loading, error, run, cancel } = useRequest(service, {
        manual: true
      });

      return {
        data,
        loading,
        error,
        run,
        cancel
      };
    }));

    wrapper.vm.run();

    expect(wrapper.vm.loading.value).toBe(true);

    wrapper.vm.cancel();

    expect(wrapper.vm.loading.value).toBe(false);

    // Advance timers
    vi.advanceTimersByTime(1000);
    await nextTick();

    // Data should not be updated because request was cancelled
    expect(wrapper.vm.data.value).toBeUndefined();
  });
});

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const wrapper = mount(createTestComponent(() => {
      const state = ref(0);
      const prevState = usePrevious(state.value);

      return {
        state,
        prevState
      };
    }));

    expect(wrapper.vm.prevState.value).toBeUndefined();
  });

  it('should return previous state after update', async () => {
    const wrapper = mount(createTestComponent(() => {
      const state = ref(0);
      const prevState = usePrevious(state.value);

      return {
        state,
        prevState
      };
    }));

    wrapper.vm.state = 1;
    await nextTick();
    expect(wrapper.vm.prevState.value).toBe(0);

    wrapper.vm.state = 2;
    await nextTick();
    expect(wrapper.vm.prevState.value).toBe(1);
  });
});

describe('useLatest', () => {
  it('should return latest value', async () => {
    const wrapper = mount(createTestComponent(() => {
      const value = ref(0);
      const latestValue = useLatest(value.value);

      return {
        value,
        latestValue
      };
    }));

    expect(wrapper.vm.latestValue.value).toBe(0);

    wrapper.vm.value = 1;
    await nextTick();
    expect(wrapper.vm.latestValue.value).toBe(1);

    wrapper.vm.value = 2;
    await nextTick();
    expect(wrapper.vm.latestValue.value).toBe(2);
  });
});

describe('useCreation', () => {
  it('should create value only once', () => {
    const factory = vi.fn().mockReturnValue({ foo: 'bar' });

    const wrapper = mount(createTestComponent(() => {
      const dep = ref(0);
      const value = useCreation(factory, [dep.value]);

      return {
        dep,
        value
      };
    }));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.value).toEqual({ foo: 'bar' });
  });

  it('should recreate value when deps change', async () => {
    const factory = vi.fn().mockReturnValue({ foo: 'bar' });

    const wrapper = mount(createTestComponent(() => {
      const dep = ref(0);
      const value = useCreation(factory, [dep.value]);

      return {
        dep,
        value
      };
    }));

    expect(factory).toHaveBeenCalledTimes(1);

    wrapper.vm.dep = 1;
    await nextTick();

    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe('useReactive', () => {
  it('should create reactive object', async () => {
    const wrapper = mount(createTestComponent(() => {
      const state = useReactive({ count: 0, name: 'test' });

      return {
        state
      };
    }));

    expect(wrapper.vm.state.count).toBe(0);
    expect(wrapper.vm.state.name).toBe('test');

    wrapper.vm.state.count = 1;
    await nextTick();
    expect(wrapper.vm.state.count).toBe(1);

    wrapper.vm.state.name = 'updated';
    await nextTick();
    expect(wrapper.vm.state.name).toBe('updated');
  });
});

describe('useMap', () => {
  it('should initialize with default values', () => {
    const wrapper = mount(createTestComponent(() => {
      const { map, set, get, remove, reset, clear } = useMap([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);

      return {
        map,
        set,
        get,
        remove,
        reset,
        clear
      };
    }));

    expect(wrapper.vm.map.value.size).toBe(2);
    expect(wrapper.vm.get('key1')).toBe('value1');
    expect(wrapper.vm.get('key2')).toBe('value2');
  });

  it('should set new values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { map, set, get, remove, reset, clear } = useMap();

      return {
        map,
        set,
        get,
        remove,
        reset,
        clear
      };
    }));

    wrapper.vm.set('key1', 'value1');
    await nextTick();

    expect(wrapper.vm.get('key1')).toBe('value1');
    expect(wrapper.vm.map.value.size).toBe(1);

    wrapper.vm.set('key2', 'value2');
    await nextTick();

    expect(wrapper.vm.get('key2')).toBe('value2');
    expect(wrapper.vm.map.value.size).toBe(2);
  });

  it('should remove values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { map, set, get, remove, reset, clear } = useMap([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);

      return {
        map,
        set,
        get,
        remove,
        reset,
        clear
      };
    }));

    wrapper.vm.remove('key1');
    await nextTick();

    expect(wrapper.vm.get('key1')).toBeUndefined();
    expect(wrapper.vm.map.value.size).toBe(1);
    expect(wrapper.vm.get('key2')).toBe('value2');
  });

  it('should clear all values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { map, set, get, remove, reset, clear } = useMap([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);

      return {
        map,
        set,
        get,
        remove,
        reset,
        clear
      };
    }));

    wrapper.vm.clear();
    await nextTick();

    expect(wrapper.vm.map.value.size).toBe(0);
    expect(wrapper.vm.get('key1')).toBeUndefined();
    expect(wrapper.vm.get('key2')).toBeUndefined();
  });

  it('should reset to initial values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { map, set, get, remove, reset, clear } = useMap([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);

      return {
        map,
        set,
        get,
        remove,
        reset,
        clear
      };
    }));

    wrapper.vm.clear();
    await nextTick();

    expect(wrapper.vm.map.value.size).toBe(0);

    wrapper.vm.reset();
    await nextTick();

    expect(wrapper.vm.map.value.size).toBe(2);
    expect(wrapper.vm.get('key1')).toBe('value1');
    expect(wrapper.vm.get('key2')).toBe('value2');
  });
});

describe('useSet', () => {
  it('should initialize with default values', () => {
    const wrapper = mount(createTestComponent(() => {
      const { set, add, remove, reset, clear, has } = useSet([1, 2, 3]);

      return {
        set,
        add,
        remove,
        reset,
        clear,
        has
      };
    }));

    expect(wrapper.vm.set.value.size).toBe(3);
    expect(wrapper.vm.has(1)).toBe(true);
    expect(wrapper.vm.has(2)).toBe(true);
    expect(wrapper.vm.has(3)).toBe(true);
    expect(wrapper.vm.has(4)).toBe(false);
  });

  it('should add new values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { set, add, remove, reset, clear, has } = useSet([1, 2]);

      return {
        set,
        add,
        remove,
        reset,
        clear,
        has
      };
    }));

    wrapper.vm.add(3);
    await nextTick();

    expect(wrapper.vm.set.value.size).toBe(3);
    expect(wrapper.vm.has(3)).toBe(true);

    // Adding existing value should not increase size
    wrapper.vm.add(1);
    await nextTick();

    expect(wrapper.vm.set.value.size).toBe(3);
  });

  it('should remove values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { set, add, remove, reset, clear, has } = useSet([1, 2, 3]);

      return {
        set,
        add,
        remove,
        reset,
        clear,
        has
      };
    }));

    wrapper.vm.remove(2);
    await nextTick();

    expect(wrapper.vm.set.value.size).toBe(2);
    expect(wrapper.vm.has(2)).toBe(false);
    expect(wrapper.vm.has(1)).toBe(true);
    expect(wrapper.vm.has(3)).toBe(true);
  });

  it('should clear all values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { set, add, remove, reset, clear, has } = useSet([1, 2, 3]);

      return {
        set,
        add,
        remove,
        reset,
        clear,
        has
      };
    }));

    wrapper.vm.clear();
    await nextTick();

    expect(wrapper.vm.set.value.size).toBe(0);
    expect(wrapper.vm.has(1)).toBe(false);
    expect(wrapper.vm.has(2)).toBe(false);
    expect(wrapper.vm.has(3)).toBe(false);
  });

  it('should reset to initial values', async () => {
    const wrapper = mount(createTestComponent(() => {
      const { set, add, remove, reset, clear, has } = useSet([1, 2, 3]);

      return {
        set,
        add,
        remove,
        reset,
        clear,
        has
      };
    }));

    wrapper.vm.clear();
    await nextTick();

    expect(wrapper.vm.set.value.size).toBe(0);

    wrapper.vm.reset();
    await nextTick();

    expect(wrapper.vm.set.value.size).toBe(3);
    expect(wrapper.vm.has(1)).toBe(true);
    expect(wrapper.vm.has(2)).toBe(true);
    expect(wrapper.vm.has(3)).toBe(true);
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce value changes', async () => {
    const wrapper = mount(createTestComponent(() => {
      const value = ref(0);
      const debouncedValue = useDebounce(value.value, 200);

      return {
        value,
        debouncedValue
      };
    }));

    // Initial value should be set immediately
    expect(wrapper.vm.debouncedValue.value).toBe(0);

    // Update value
    wrapper.vm.value = 1;
    await nextTick();

    // Value should not change yet
    expect(wrapper.vm.debouncedValue.value).toBe(0);

    // Advance time by less than delay
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.vm.debouncedValue.value).toBe(0);

    // Update value again before timeout completes
    wrapper.vm.value = 2;
    await nextTick();

    // Advance time to complete first timeout
    vi.advanceTimersByTime(100);
    await nextTick();

    // Value should still be initial because second update reset the timer
    expect(wrapper.vm.debouncedValue.value).toBe(0);

    // Advance time to complete second timeout
    vi.advanceTimersByTime(200);
    await nextTick();

    // Now value should be updated to latest
    expect(wrapper.vm.debouncedValue.value).toBe(2);
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle value changes', async () => {
    const wrapper = mount(createTestComponent(() => {
      const value = ref(0);
      const throttledValue = useThrottle(value.value, 200);

      return {
        value,
        throttledValue
      };
    }));

    // Initial value should be set immediately
    expect(wrapper.vm.throttledValue.value).toBe(0);

    // Update value
    wrapper.vm.value = 1;
    await nextTick();

    // Value should not change yet
    expect(wrapper.vm.throttledValue.value).toBe(0);

    // Advance time to complete throttle period
    vi.advanceTimersByTime(200);
    await nextTick();

    // Now value should be updated
    expect(wrapper.vm.throttledValue.value).toBe(1);

    // Update value multiple times within throttle period
    wrapper.vm.value = 2;
    await nextTick();
    wrapper.vm.value = 3;
    await nextTick();
    wrapper.vm.value = 4;
    await nextTick();

    // Value should not change yet
    expect(wrapper.vm.throttledValue.value).toBe(1);

    // Advance time to complete throttle period
    vi.advanceTimersByTime(200);
    await nextTick();

    // Value should be updated to latest
    expect(wrapper.vm.throttledValue.value).toBe(4);
  });
});

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', async () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const [debouncedFn, cancel] = useDebounceFn(fn, 200);

      return {
        debouncedFn,
        cancel
      };
    }));

    // Call the debounced function
    wrapper.vm.debouncedFn('test1');

    // Function should not be called yet
    expect(fn).not.toHaveBeenCalled();

    // Call again before timeout completes
    wrapper.vm.debouncedFn('test2');

    // Advance time by less than delay
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    // Advance time to complete timeout
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test2');
  });

  it('should support cancel', async () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const [debouncedFn, cancel] = useDebounceFn(fn, 200);

      return {
        debouncedFn,
        cancel
      };
    }));

    // Call the debounced function
    wrapper.vm.debouncedFn('test');

    // Cancel before timeout completes
    wrapper.vm.cancel();

    // Advance time past delay
    vi.advanceTimersByTime(300);

    // Function should not be called
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('useThrottleFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle function calls', async () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const [throttledFn, cancel] = useThrottleFn(fn, 200);

      return {
        throttledFn,
        cancel
      };
    }));

    // Call the throttled function
    wrapper.vm.throttledFn('test1');

    // Function should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test1');

    fn.mockClear();

    // Call again before throttle period completes
    wrapper.vm.throttledFn('test2');

    // Function should not be called again yet
    expect(fn).not.toHaveBeenCalled();

    // Advance time to complete throttle period
    vi.advanceTimersByTime(200);

    // Function should not be called automatically after period
    expect(fn).not.toHaveBeenCalled();

    // Call again after throttle period
    wrapper.vm.throttledFn('test3');

    // Function should be called again
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test3');
  });

  it('should support cancel', async () => {
    const fn = vi.fn();

    const wrapper = mount(createTestComponent(() => {
      const [throttledFn, cancel] = useThrottleFn(fn, 200);

      return {
        throttledFn,
        cancel
      };
    }));

    // Call the throttled function
    wrapper.vm.throttledFn('test1');

    fn.mockClear();

    // Call again before throttle period completes
    wrapper.vm.throttledFn('test2');

    // Cancel pending call
    wrapper.vm.cancel();

    // Advance time past throttle period
    vi.advanceTimersByTime(300);

    // Function should not be called
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('useLockFn', () => {
  it('should prevent concurrent executions', async () => {
    vi.useFakeTimers();

    let count = 0;
    const fn = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      count++;
      return count;
    });

    const wrapper = mount(createTestComponent(() => {
      const lockedFn = useLockFn(fn);

      return {
        lockedFn
      };
    }));

    // Start first execution
    const promise1 = wrapper.vm.lockedFn();

    // Try to execute again while first is still running
    const promise2 = wrapper.vm.lockedFn();

    // Advance time to complete first execution
    await vi.advanceTimersByTimeAsync(50);

    const result1 = await promise1;
    const result2 = await promise2;

    // Function should only be called once
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result1).toBe(1);
    expect(result2).toBeUndefined();

    // After first execution completes, we can call again
    const promise3 = wrapper.vm.lockedFn();
    await vi.advanceTimersByTimeAsync(50);
    const result3 = await promise3;

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result3).toBe(2);

    vi.useRealTimers();
  });
});

// More tests can be added for other hooks as needed
