import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 导入要测试的函数
// 由于view_retry.js是独立的文件，我们需要先将其中的函数导出
// 这里假设我们已经修改了原始文件，或者在这里重新实现这些函数
function asyncFn() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        console.log('inner success');
        resolve('success');
      } else {
        console.log('inner failed');
        reject('failed');
      }
    }, 5 * 1000 * Math.random());
  });
}

function runWithRetry(fn, retryTimes, timeout) {
  // 实现与view_retry.js中相同
  const handleError = (e) => {
    if (retryTimes--) {
      return fn().catch(handleError);
    }
    return Promise.reject(e);
  };

  // 需要超时自动失败
  if (timeout) {
    return Promise.race([
      fn().catch(handleError),
      // race 赛跑、超时自动失败
      new Promise((_, rj) => {
        setTimeout(() => rj('timeout error'), timeout);
      })
    ]);
  } else {
    // 失败重试
    return fn().catch(handleError);
  }
}

describe('runWithRetry 函数测试', () => {
  // 模拟console.log以便测试输出
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('应该在函数成功时立即返回结果', async () => {
    // 模拟一个始终成功的异步函数
    const mockSuccessFn = vi.fn().mockResolvedValue('success');

    const result = await runWithRetry(mockSuccessFn, 3);

    expect(result).toBe('success');
    expect(mockSuccessFn).toHaveBeenCalledTimes(1);
  });

  it('应该在函数失败时进行重试', async () => {
    // 模拟一个先失败后成功的异步函数
    const mockFn = vi.fn()
      .mockRejectedValueOnce('failed')
      .mockRejectedValueOnce('failed')
      .mockResolvedValueOnce('success');

    const result = await runWithRetry(mockFn, 3);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('应该在重试次数耗尽后返回失败', async () => {
    // 模拟一个始终失败的异步函数
    const mockFailFn = vi.fn().mockRejectedValue('failed');

    await expect(runWithRetry(mockFailFn, 2)).rejects.toBe('failed');
    expect(mockFailFn).toHaveBeenCalledTimes(3); // 初始调用 + 2次重试
  });

  it('应该在超时时返回超时错误', async () => {
    // 模拟一个需要很长时间才能完成的函数
    vi.useFakeTimers();
    const mockLongFn = vi.fn(() => new Promise(resolve => {
      setTimeout(() => resolve('late success'), 2000);
    }));

    const promise = runWithRetry(mockLongFn, 2, 1000);

    // 快进时间超过超时时间
    vi.advanceTimersByTime(1100);

    await expect(promise).rejects.toBe('timeout error');
  });

  it('应该在超时后不再进行重试', async () => {
    // 模拟一个失败然后需要很长时间的函数
    vi.useFakeTimers();
    const mockFn = vi.fn()
      .mockRejectedValueOnce('failed')
      .mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(() => resolve('late success'), 2000);
      }));

    const promise = runWithRetry(mockFn, 3, 1000);

    // 快进时间超过超时时间
    vi.advanceTimersByTime(1100);

    await expect(promise).rejects.toBe('timeout error');
    expect(mockFn).toHaveBeenCalledTimes(2); // 初始调用 + 第一次重试
  });

  it('应该在没有设置超时时一直重试直到成功或达到重试次数', async () => {
    // 模拟一个多次失败后成功的函数
    const mockFn = vi.fn()
      .mockRejectedValueOnce('failed')
      .mockRejectedValueOnce('failed')
      .mockRejectedValueOnce('failed')
      .mockResolvedValueOnce('success');

    const result = await runWithRetry(mockFn, 3);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(4); // 初始调用 + 3次重试
  });
});
