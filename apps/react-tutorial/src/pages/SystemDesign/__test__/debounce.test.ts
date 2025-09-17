import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, visualizeDebounce } from '../al/debounce';

describe('防抖函数测试', () => {
  // 设置和清理
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该在指定延迟后只调用一次函数', () => {
    // 准备
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    // 执行
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // 验证调用前回调未执行
    expect(callback).not.toBeCalled();

    // 快进时间
    vi.advanceTimersByTime(999);
    expect(callback).not.toBeCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toBeCalledTimes(1);
  });

  it('如果在延迟时间内再次调用，应该重置定时器', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    // 首次调用
    debouncedFn();
    vi.advanceTimersByTime(500);

    // 500ms后再次调用，应该重置定时器
    debouncedFn();
    vi.advanceTimersByTime(999);
    expect(callback).not.toBeCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toBeCalledTimes(1);
  });

  it('应该支持取消功能', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    debouncedFn();
    debouncedFn.cancel();

    vi.advanceTimersByTime(1000);
    expect(callback).not.toBeCalled();
  });

  it('应该支持立即执行选项', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000, { immediate: true });

    // 首次调用应该立即执行
    debouncedFn();
    expect(callback).toBeCalledTimes(1);

    // 再次调用不应立即执行
    debouncedFn();
    expect(callback).toBeCalledTimes(1);

    // 等待延迟后也不应再执行
    vi.advanceTimersByTime(1000);
    expect(callback).toBeCalledTimes(1);

    // 延迟后再调用应该再次立即执行
    debouncedFn();
    expect(callback).toBeCalledTimes(2);
  });

  it('应该支持flush方法立即执行', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    debouncedFn();
    expect(callback).not.toBeCalled();

    debouncedFn.flush();
    expect(callback).toBeCalledTimes(1);

    // 再次调用flush不应执行回调
    debouncedFn.flush();
    expect(callback).toBeCalledTimes(1);
  });

  it('应该正确传递参数和this上下文', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);
    const context = { name: 'test' };

    debouncedFn.call(context, 'arg1', 'arg2');
    vi.advanceTimersByTime(1000);

    expect(callback).toBeCalledWith('arg1', 'arg2');
    expect(callback.mock.instances[0]).toBe(context);
  });

  it('应该返回函数执行的结果', () => {
    const callback = vi.fn().mockReturnValue('result');
    const debouncedFn = debounce(callback, 1000, { immediate: true });

    const result = debouncedFn();
    expect(result).toBe('result');
  });
});

describe('防抖可视化测试', () => {
  it('应该正确生成可视化数据', () => {
    const callTimestamps = [0, 100, 300, 600, 1200];
    const delay = 500;

    const result = visualizeDebounce(callTimestamps, delay);

    expect(result).toEqual({
      calls: callTimestamps,
      executions: [1100, 1700], // 只有最后一次调用和间隔超过延迟的调用会执行
      delay: 500
    });
  });

  it('如果所有调用都在延迟时间内，应该只执行最后一次', () => {
    const callTimestamps = [0, 100, 200, 300, 400];
    const delay = 500;

    const result = visualizeDebounce(callTimestamps, delay);

    expect(result.executions).toEqual([900]); // 只有最后一次调用会执行
  });

  it('如果调用之间的间隔大于延迟时间，应该执行多次', () => {
    const callTimestamps = [0, 600, 1200];
    const delay = 500;

    const result = visualizeDebounce(callTimestamps, delay);

    expect(result.executions).toEqual([500, 1100, 1700]); // 每次调用都会执行
  });
});
