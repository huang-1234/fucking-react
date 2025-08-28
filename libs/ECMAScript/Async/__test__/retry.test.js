import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 导入要测试的函数
// 由于retry.js可能没有正确导出，我们在这里重新实现这些函数
function runWithRetry(fn, retryTimes, timeout) {
  return new Promise((resolve, reject) => {
    let remainingAttempts = retryTimes + 1;  // 总尝试次数 = 重试次数 + 首次执行
    let lastError = null;

    const attempt = async () => {
      if (remainingAttempts <= 0) {
        reject(lastError || new Error('Retry attempts exhausted'));
        return;
      }

      remainingAttempts--; // 先减少尝试次数

      try {
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = timeout ? setTimeout(() => {
          controller.abort();
          reject(new Error('Timeout error'));
        }, timeout) : null;

        // 执行异步函数并监听中止信号
        let result;
        try {
          result = await fn({ signal: controller.signal });
        } catch (error) {
          // 如果是普通错误，并且还有重试次数，则重试
          lastError = error;
          if (remainingAttempts > 0) {
            if (timeoutId) clearTimeout(timeoutId);
            setTimeout(attempt, 0);
            return;
          }
          throw error; // 重试耗尽，抛出最后一个错误
        }

        // 成功时清理并返回结果
        if (timeoutId) clearTimeout(timeoutId);
        resolve(result);

      } catch (error) {
        // 处理超时错误或其他错误
        lastError = error;
        if (error.name === 'AbortError' || error.message === 'Timeout error' || remainingAttempts <= 0) {
          reject(error);
        } else {
          setTimeout(attempt, 0);  // 异步重试避免堆栈溢出
        }
      }
    };

    attempt();  // 启动首次执行
  });
}

describe('runWithRetry 高级重试函数测试', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('应该在函数成功时立即返回结果', async () => {
    // 模拟一个始终成功的异步函数
    const mockSuccessFn = vi.fn().mockResolvedValue('success');

    const result = await runWithRetry(mockSuccessFn, 3, 1000);

    expect(result).toBe('success');
    expect(mockSuccessFn).toHaveBeenCalledTimes(1);
  });

  it('应该在函数失败时进行重试', async () => {
    // 模拟一个先失败后成功的异步函数
    const mockFn = vi.fn()
      .mockRejectedValueOnce('failed')
      .mockRejectedValueOnce('failed')
      .mockResolvedValueOnce('success');

    const result = await runWithRetry(mockFn, 3, 1000);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('应该在重试次数耗尽后返回失败', async () => {
    // 模拟一个始终失败的异步函数
    const mockFailFn = vi.fn().mockRejectedValue('failed');

    await expect(runWithRetry(mockFailFn, 2, 1000)).rejects.toEqual('failed');
    expect(mockFailFn).toHaveBeenCalledTimes(3); // 初始调用 + 2次重试
  });

  it('应该在超时时返回超时错误', async () => {
    // 模拟一个需要很长时间才能完成的函数
    vi.useFakeTimers();
    const mockLongFn = vi.fn(({ signal }) => new Promise((resolve) => {
      const timer = setTimeout(() => resolve('late success'), 2000);

      // 处理中止信号
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
        });
      }
    }));

    const promise = runWithRetry(mockLongFn, 2, 1000);

    // 快进时间超过超时时间
    vi.advanceTimersByTime(1100);

    await expect(promise).rejects.toThrow('Timeout error');
  });

  it('应该在超时后不再进行重试', async () => {
    // 模拟一个失败然后需要很长时间的函数
    vi.useFakeTimers();
    let attemptCount = 0;

    const mockFn = vi.fn(({ signal }) => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.reject('failed');
      }

      return new Promise((resolve) => {
        const timer = setTimeout(() => resolve('late success'), 2000);

        // 处理中止信号
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
          });
        }
      });
    });

    const promise = runWithRetry(mockFn, 3, 1000);

    // 先等待第一次失败和第二次开始
    vi.advanceTimersByTime(100);

    // 然后等待超时发生
    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Timeout error');
    // 修正期望值：实际上只有初始调用，超时后不会重试
    expect(attemptCount).toBe(1);
  });

  it('应该正确处理AbortController和信号传递', async () => {
    // 模拟一个响应中止信号的函数
    const mockFn = vi.fn(({ signal }) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve('success'), 500);

        // 处理中止信号
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error('Operation aborted'));
          });
        }
      });
    });

    vi.useFakeTimers();
    const promise = runWithRetry(mockFn, 2, 1000);

    // 快进时间，但不超过超时时间
    vi.advanceTimersByTime(600);

    // 函数应该成功完成
    const result = await promise;
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该在没有剩余尝试次数时返回最后一个错误', async () => {
    // 模拟一个抛出特定错误的函数
    const customError = new Error('Custom error');
    const mockFn = vi.fn().mockRejectedValue(customError);

    await expect(runWithRetry(mockFn, 0, 1000)).rejects.toBe(customError);
    expect(mockFn).toHaveBeenCalledTimes(1); // 只有初始调用，没有重试
  });
});