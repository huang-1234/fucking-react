import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useRequest,
  useSelections,
  useDebounce,
  useThrottle,
  useDebounceFn,
  useThrottleFn,
  // useAntdTable,
  // useWebSocket,
  // useDrop,
  // useDrag,
  // useVirtualList,
  // useInfiniteScroll,
  // usePagination
} from '../advance';

// Mock global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

describe('useRequest', () => {
  it('should handle successful request', async () => {
    const successData = { name: 'test' };
    const service = vi.fn().mockResolvedValue(successData);
    const onSuccess = vi.fn();
    const onFinally = vi.fn();

    const { result } = renderHook(() => useRequest(service, {
      manual: true,
      onSuccess,
      onFinally
    }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.run('test-param');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(service).toHaveBeenCalledWith('test-param');
    expect(result.current.data).toEqual(successData);
    expect(onSuccess).toHaveBeenCalledWith(successData, ['test-param']);
    expect(onFinally).toHaveBeenCalledWith(['test-param'], successData, undefined);
  });

  it('should handle request error', async () => {
    const error = new Error('Request failed');
    const service = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const onFinally = vi.fn();

    const { result } = renderHook(() => useRequest(service, {
      manual: true,
      onError,
      onFinally
    }));

    act(() => {
      result.current.run('test-param');
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(service).toHaveBeenCalledWith('test-param');
    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error, ['test-param']);
    expect(onFinally).toHaveBeenCalledWith(['test-param'], undefined, error);
  });

  it('should auto run when manual is false', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'success' });

    renderHook(() => useRequest(service, {
      defaultParams: ['default-param']
    }));

    expect(service).toHaveBeenCalledWith('default-param');
  });

  it('should respect loading delay', async () => {
    vi.useFakeTimers();

    const service = vi.fn().mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => useRequest(service, {
      manual: true,
      loadingDelay: 300
    }));

    act(() => {
      result.current.run();
    });

    // Loading should be false initially due to loadingDelay
    expect(result.current.loading).toBe(false);

    // Advance timers by loadingDelay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now loading should be true
    expect(result.current.loading).toBe(true);

    // Complete the request
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);

    vi.useRealTimers();
  });

  it('should support refresh', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => useRequest(service, {
      defaultParams: ['default-param']
    }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    service.mockClear();

    act(() => {
      result.current.refresh();
    });

    expect(service).toHaveBeenCalledWith('default-param');
  });

  it('should support mutate', async () => {
    const service = vi.fn().mockResolvedValue({ data: 'initial' });

    const { result } = renderHook(() => useRequest(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.mutate({ data: 'mutated' });
    });

    expect(result.current.data).toEqual({ data: 'mutated' });

    act(() => {
      result.current.mutate((prev: any) => ({ data: prev.data + '-updated' }));
    });

    expect(result.current.data).toEqual({ data: 'mutated-updated' });
  });

  it('should support cancel', async () => {
    vi.useFakeTimers();

    const service = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ data: 'success' }), 1000);
      });
    });

    const { result } = renderHook(() => useRequest(service, {
      manual: true
    }));

    act(() => {
      result.current.run();
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(result.current.loading).toBe(false);

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Data should not be updated because request was cancelled
    expect(result.current.data).toBeUndefined();

    vi.useRealTimers();
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: 0 }
    });

    // Initial value should be set immediately
    expect(result.current).toBe(0);

    // Update value
    rerender({ value: 1 });

    // Value should not change yet
    expect(result.current).toBe(0);

    // Advance time by less than delay
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(0);

    // Update value again before timeout completes
    rerender({ value: 2 });

    // Advance time to complete first timeout
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Value should still be initial because second update reset the timer
    expect(result.current).toBe(0);

    // Advance time to complete second timeout
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Now value should be updated to latest
    expect(result.current).toBe(2);
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 200), {
      initialProps: { value: 0 }
    });

    // Initial value should be set immediately
    expect(result.current).toBe(0);

    // Update value
    rerender({ value: 1 });

    // Value should not change yet
    expect(result.current).toBe(0);

    // Advance time to complete throttle period
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Now value should be updated
    expect(result.current).toBe(1);

    // Update value multiple times within throttle period
    rerender({ value: 2 });
    rerender({ value: 3 });
    rerender({ value: 4 });

    // Value should not change yet
    expect(result.current).toBe(1);

    // Advance time to complete throttle period
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Value should be updated to latest
    expect(result.current).toBe(4);
  });
});

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 200));

    // Call the debounced function
    act(() => {
      result.current.run('test1');
    });

    // Function should not be called yet
    expect(fn).not.toHaveBeenCalled();

    // Call again before timeout completes
    act(() => {
      result.current.run('test2');
    });

    // Advance time by less than delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Function should still not be called
    expect(fn).not.toHaveBeenCalled();

    // Advance time to complete timeout
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Function should be called with latest args
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test2');
  });

  it('should support cancel', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 200));

    // Call the debounced function
    act(() => {
      result.current.run('test');
    });

    // Cancel before timeout completes
    act(() => {
      result.current.cancel();
    });

    // Advance time past delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Function should not be called
    expect(fn).not.toHaveBeenCalled();
  });

  it('should support flush', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 200));

    // Call the debounced function
    act(() => {
      result.current.run('test');
    });

    // Flush before timeout completes
    act(() => {
      result.current.flush();
    });

    // Function should not be called (flush just cancels the timer)
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

  it('should throttle function calls', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 200));

    // Call the throttled function
    act(() => {
      result.current.run('test1');
    });

    // Function should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test1');

    fn.mockClear();

    // Call again before throttle period completes
    act(() => {
      result.current.run('test2');
    });

    // Function should not be called again yet
    expect(fn).not.toHaveBeenCalled();

    // Advance time to complete throttle period
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Function should not be called automatically after period
    expect(fn).not.toHaveBeenCalled();

    // Call again after throttle period
    act(() => {
      result.current.run('test3');
    });

    // Function should be called again
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test3');
  });

  it('should support cancel', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 200));

    // Call the throttled function
    act(() => {
      result.current.run('test1');
    });

    fn.mockClear();

    // Call again before throttle period completes
    act(() => {
      result.current.run('test2');
    });

    // Cancel pending call
    act(() => {
      result.current.cancel();
    });

    // Advance time past throttle period
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Function should not be called
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('useSelections', () => {
  const items = [1, 2, 3, 4, 5];

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSelections(items));

    expect(result.current.selected).toEqual([]);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.noneSelected).toBe(true);
    expect(result.current.partiallySelected).toBe(false);
  });

  it('should initialize with default selection', () => {
    const { result } = renderHook(() => useSelections(items, [1, 3]));

    expect(result.current.selected).toEqual([1, 3]);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.noneSelected).toBe(false);
    expect(result.current.partiallySelected).toBe(true);
  });

  it('should select and unselect items', () => {
    const { result } = renderHook(() => useSelections(items));

    // Select one item
    act(() => {
      result.current.select(2);
    });

    expect(result.current.selected).toEqual([2]);
    expect(result.current.isSelected(2)).toBe(true);
    expect(result.current.isSelected(1)).toBe(false);

    // Select another item
    act(() => {
      result.current.select(4);
    });

    expect(result.current.selected).toEqual([2, 4]);
    expect(result.current.partiallySelected).toBe(true);

    // Unselect an item
    act(() => {
      result.current.unSelect(2);
    });

    expect(result.current.selected).toEqual([4]);
    expect(result.current.isSelected(2)).toBe(false);
  });

  it('should toggle items', () => {
    const { result } = renderHook(() => useSelections(items, [1]));

    // Toggle selected item
    act(() => {
      result.current.toggle(1);
    });

    expect(result.current.selected).toEqual([]);
    expect(result.current.isSelected(1)).toBe(false);

    // Toggle unselected item
    act(() => {
      result.current.toggle(3);
    });

    expect(result.current.selected).toEqual([3]);
    expect(result.current.isSelected(3)).toBe(true);
  });

  it('should select and unselect all items', () => {
    const { result } = renderHook(() => useSelections(items));

    // Select all
    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selected).toEqual(items);
    expect(result.current.allSelected).toBe(true);
    expect(result.current.noneSelected).toBe(false);
    expect(result.current.partiallySelected).toBe(false);

    // Unselect all
    act(() => {
      result.current.unSelectAll();
    });

    expect(result.current.selected).toEqual([]);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.noneSelected).toBe(true);
    expect(result.current.partiallySelected).toBe(false);
  });

  it('should toggle all items', () => {
    const { result } = renderHook(() => useSelections(items));

    // Toggle all (none selected -> all selected)
    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selected).toEqual(items);
    expect(result.current.allSelected).toBe(true);

    // Toggle all (all selected -> none selected)
    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selected).toEqual([]);
    expect(result.current.noneSelected).toBe(true);
  });
});

// More tests can be added for other hooks as needed
