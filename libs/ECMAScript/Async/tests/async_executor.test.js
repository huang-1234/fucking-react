import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AsyncExecutor } from '../async_executor.js';

describe('AsyncExecutor', () => {
  // 模拟异步函数
  let mockAsyncFn;
  // 默认选项
  const defaultOptions = {
    concurrency: 2,
    timeout: 1000,
    retries: 1,
    retryDelay: 100,
    onError: vi.fn(),
    onSuccess: vi.fn(),
    onComplete: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    // 重置所有模拟函数
    vi.useFakeTimers();
    mockAsyncFn = vi.fn();
    defaultOptions.onError.mockReset();
    defaultOptions.onSuccess.mockReset();
    defaultOptions.onComplete.mockReset();
    defaultOptions.onCancel.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // 基本功能测试
  describe('基本功能', () => {
    it('应该能正确创建实例', () => {
      const executor = new AsyncExecutor(mockAsyncFn);
      expect(executor).toBeInstanceOf(AsyncExecutor);
      expect(executor.fn).toBe(mockAsyncFn);
      expect(executor.options.concurrency).toBe(1); // 默认值
      expect(executor.queue).toEqual([]);
      expect(executor.running).toBe(0);
    });

    it('应该使用提供的选项', () => {
      const executor = new AsyncExecutor(mockAsyncFn, defaultOptions);
      expect(executor.options.concurrency).toBe(defaultOptions.concurrency);
      expect(executor.options.timeout).toBe(defaultOptions.timeout);
      expect(executor.options.retries).toBe(defaultOptions.retries);
    });

    it('应该能添加任务到队列', () => {
      mockAsyncFn.mockResolvedValue('result');
      const executor = new AsyncExecutor(mockAsyncFn, { autoStart: false });

      executor.add('task1');
      expect(executor.queue.length).toBe(1);
      expect(executor.queue[0].args).toEqual(['task1']);
    });

    it('应该能执行任务并返回结果', async () => {
      mockAsyncFn.mockResolvedValue('success');
      const executor = new AsyncExecutor(mockAsyncFn);

      const result = await executor.add('task');
      expect(result).toBe('success');
      expect(mockAsyncFn).toHaveBeenCalledWith('task', expect.anything());
      expect(executor.results.length).toBe(1);
      expect(executor.results[0].result).toBe('success');
    });
  });

  // 并发控制测试
  describe('并发控制', () => {
    it('应该限制同时执行的任务数量', async () => {
      // 创建一个不会立即解析的Promise
      let resolvers = [];
      mockAsyncFn.mockImplementation(() => {
        return new Promise(resolve => {
          resolvers.push(() => resolve('result'));
        });
      });

      const executor = new AsyncExecutor(mockAsyncFn, { concurrency: 2 });

      // 添加3个任务
      const promise1 = executor.add('task1');
      const promise2 = executor.add('task2');
      const promise3 = executor.add('task3');

      // 前两个任务应该立即开始执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);
      expect(executor.running).toBe(2);
      expect(executor.queue.length).toBe(1); // 第三个任务在队列中等待

      // 解析第一个任务
      resolvers[0]();
      await vi.runAllTimersAsync();

      // 第三个任务应该开始执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
      expect(executor.running).toBe(2);
      expect(executor.queue.length).toBe(0);

      // 解析剩余任务
      resolvers[1]();
      resolvers[2]();
      await vi.runAllTimersAsync();

      // 所有任务都应该完成
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual(['result', 'result', 'result']);
      expect(executor.running).toBe(0);
    });

    it('应该在任务完成后处理队列中的下一个任务', async () => {
      let resolveTask;
      mockAsyncFn.mockImplementation(() => {
        return new Promise(resolve => {
          resolveTask = resolve;
        });
      });

      const executor = new AsyncExecutor(mockAsyncFn, { concurrency: 1 });

      // 添加两个任务
      const promise1 = executor.add('task1');
      const promise2 = executor.add('task2');

      // 只有第一个任务应该开始执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(executor.running).toBe(1);
      expect(executor.queue.length).toBe(1);

      // 解析第一个任务
      resolveTask('result1');
      await vi.runAllTimersAsync();

      // 第二个任务应该开始执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);

      // 重新设置resolveTask以解析第二个任务
      let newResolveTask;
      mockAsyncFn.mockImplementationOnce(() => {
        return new Promise(resolve => {
          newResolveTask = resolve;
        });
      });

      // 解析第二个任务
      newResolveTask('result2');
      await vi.runAllTimersAsync();

      // 所有任务都应该完成
      const results = await Promise.all([promise1, promise2]);
      expect(results[0]).toBe('result1');
    });
  });

  // 取消操作测试
  describe('取消操作', () => {
    it('应该能取消单个任务', async () => {
      let resolveTask;
      mockAsyncFn.mockImplementation(() => {
        return new Promise(resolve => {
          resolveTask = resolve;
        });
      });

      const executor = new AsyncExecutor(mockAsyncFn);

      // 添加任务
      const taskPromise = executor.add('task');

      // 取消任务
      const taskId = await taskPromise.taskId;
      const cancelled = executor.cancelTask(taskId);

      expect(cancelled).toBe(true);
      expect(defaultOptions.onCancel).toHaveBeenCalled();

      // 任务应该被拒绝
      await expect(taskPromise).rejects.toThrow('Task was cancelled');
    });

    it('应该能取消所有任务', async () => {
      // 创建不会立即解析的Promise
      mockAsyncFn.mockImplementation(() => {
        return new Promise(resolve => {
          // 这个Promise永远不会解析
        });
      });

      const executor = new AsyncExecutor(mockAsyncFn, defaultOptions);

      // 添加多个任务
      const promise1 = executor.add('task1');
      const promise2 = executor.add('task2');
      const promise3 = executor.add('task3'); // 这个会在队列中

      // 中止所有任务
      executor.abort();

      // 所有任务都应该被拒绝
      await expect(promise1).rejects.toThrow('Task was cancelled');
      await expect(promise2).rejects.toThrow('Task was cancelled');
      await expect(promise3).rejects.toThrow('Task was cancelled');

      // 回调应该被调用
      expect(defaultOptions.onCancel).toHaveBeenCalled();

      // 状态应该被重置
      expect(executor.running).toBe(0);
      expect(executor.queue.length).toBe(0);
      expect(executor.abortControllers.size).toBe(0);
    });

    it('应该通过AbortController正确取消正在执行的任务', async () => {
      // 模拟支持AbortController的异步函数
      mockAsyncFn.mockImplementation((_, { signal }) => {
        return new Promise((resolve, reject) => {
          if (signal.aborted) {
            reject(new Error('Task was cancelled'));
          }

          signal.addEventListener('abort', () => {
            reject(new Error('Task was cancelled'));
          });

          // 这个Promise永远不会解析
        });
      });

      const executor = new AsyncExecutor(mockAsyncFn);

      // 添加任务
      const taskPromise = executor.add('task');

      // 取消所有任务
      executor.abort();

      // 任务应该被拒绝
      await expect(taskPromise).rejects.toThrow('Task was cancelled');
    });
  });

  // 重试机制测试
  describe('重试机制', () => {
    it('应该在失败后重试指定次数', async () => {
      // 前两次调用失败，第三次成功
      mockAsyncFn
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const executor = new AsyncExecutor(mockAsyncFn, {
        retries: 2,
        retryDelay: 100
      });

      // 添加任务
      const result = await executor.add('task');

      // 应该重试两次后成功
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
    });

    it('应该在达到最大重试次数后失败', async () => {
      // 所有调用都失败
      mockAsyncFn.mockRejectedValue(new Error('Always fails'));

      const executor = new AsyncExecutor(mockAsyncFn, {
        retries: 2,
        retryDelay: 100,
        onError: defaultOptions.onError
      });

      // 添加任务并等待它失败
      await expect(executor.add('task')).rejects.toThrow('Always fails');

      // 应该重试两次后失败（总共调用3次）
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
      expect(defaultOptions.onError).toHaveBeenCalled();
    });

    it('应该在重试之间等待指定的延迟', async () => {
      // 前两次调用失败，第三次成功
      mockAsyncFn
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const retryDelay = 500;
      const executor = new AsyncExecutor(mockAsyncFn, {
        retries: 2,
        retryDelay
      });

      // 添加任务
      const taskPromise = executor.add('task');

      // 第一次调用后应该失败
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);

      // 前进重试延迟时间
      await vi.advanceTimersByTimeAsync(retryDelay);

      // 第二次调用后应该再次失败
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);

      // 前进重试延迟时间
      await vi.advanceTimersByTimeAsync(retryDelay);

      // 第三次调用应该成功
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);

      // 任务应该成功完成
      const result = await taskPromise;
      expect(result).toBe('success');
    });
  });

  // 超时处理测试
  describe('超时处理', () => {
    it('应该在超时后拒绝Promise', async () => {
      // 创建一个永远不会解析的Promise
      mockAsyncFn.mockImplementation(() => {
        return new Promise(resolve => {
          // 这个Promise永远不会解析
        });
      });

      const timeout = 500;
      const executor = new AsyncExecutor(mockAsyncFn, {
        timeout,
        onError: defaultOptions.onError
      });

      // 添加任务
      const taskPromise = executor.add('task');

      // 前进超时时间
      await vi.advanceTimersByTimeAsync(timeout);

      // 任务应该因超时而被拒绝
      await expect(taskPromise).rejects.toThrow(`Task timed out after ${timeout}ms`);
      expect(defaultOptions.onError).toHaveBeenCalled();
    });

    it('应该在任务完成前不超时', async () => {
      // 创建一个会在指定时间后解析的Promise
      mockAsyncFn.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('success'), 300);
        });
      });

      const timeout = 500;
      const executor = new AsyncExecutor(mockAsyncFn, { timeout });

      // 添加任务
      const taskPromise = executor.add('task');

      // 前进任务完成时间
      await vi.advanceTimersByTimeAsync(300);

      // 任务应该成功完成
      const result = await taskPromise;
      expect(result).toBe('success');
    });
  });

  // 暂停和恢复测试
  describe('暂停和恢复', () => {
    it('应该能暂停队列处理', async () => {
      mockAsyncFn.mockResolvedValue('result');
      const executor = new AsyncExecutor(mockAsyncFn, { concurrency: 1 });

      // 添加一个任务并等待它完成
      await executor.add('task1');
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);

      // 暂停队列处理
      executor.pause();

      // 添加更多任务
      executor.add('task2');
      executor.add('task3');

      // 这些任务不应该开始执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(executor.queue.length).toBe(2);
    });

    it('应该能恢复队列处理', async () => {
      mockAsyncFn.mockResolvedValue('result');
      const executor = new AsyncExecutor(mockAsyncFn, {
        concurrency: 2,
        autoStart: false
      });

      // 添加任务
      executor.add('task1');
      executor.add('task2');
      executor.add('task3');

      // 任务不应该开始执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(0);

      // 开始处理队列
      executor.start();

      // 应该开始执行任务
      expect(mockAsyncFn).toHaveBeenCalledTimes(2); // 并发数为2

      // 等待所有任务完成
      await vi.runAllTimersAsync();

      // 所有任务都应该执行
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
    });
  });

  // 错误处理测试
  describe('错误处理', () => {
    it('应该调用onError回调', async () => {
      const error = new Error('Task failed');
      mockAsyncFn.mockRejectedValue(error);

      const executor = new AsyncExecutor(mockAsyncFn, {
        onError: defaultOptions.onError
      });

      // 添加任务并等待它失败
      await expect(executor.add('task')).rejects.toThrow('Task failed');

      // onError回调应该被调用
      expect(defaultOptions.onError).toHaveBeenCalledWith(error, expect.any(String));

      // 错误应该被记录
      expect(executor.errors.length).toBe(1);
      expect(executor.errors[0].error).toBe(error);
    });

    it('应该在错误时中止所有任务（如果配置了abortOnError）', async () => {
      mockAsyncFn
        .mockRejectedValueOnce(new Error('First task failed'))
        .mockImplementation(() => new Promise(resolve => {})); // 其他任务永远不会解析

      const executor = new AsyncExecutor(mockAsyncFn, {
        abortOnError: true,
        onError: defaultOptions.onError
      });

      // 添加多个任务
      const promise1 = executor.add('task1');
      const promise2 = executor.add('task2');
      const promise3 = executor.add('task3');

      // 第一个任务应该失败
      await expect(promise1).rejects.toThrow('First task failed');

      // 所有其他任务也应该被拒绝
      await expect(promise2).rejects.toThrow('Task was cancelled');
      await expect(promise3).rejects.toThrow('Task was cancelled');

      // onError回调应该被调用
      expect(defaultOptions.onError).toHaveBeenCalled();
    });
  });

  // 边界条件测试
  describe('边界条件', () => {
    it('应该处理空队列', () => {
      const executor = new AsyncExecutor(mockAsyncFn);
      expect(executor.isIdle).toBe(true);
      expect(executor.queueSize).toBe(0);
      expect(executor.runningCount).toBe(0);
    });

    it('应该处理无效的任务ID', () => {
      const executor = new AsyncExecutor(mockAsyncFn);
      const cancelled = executor.cancelTask('non-existent-id');
      expect(cancelled).toBe(false);
    });

    it('应该在没有提供回调时使用默认回调', async () => {
      // 模拟console.error
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockAsyncFn.mockRejectedValue(new Error('Task failed'));
      const executor = new AsyncExecutor(mockAsyncFn);

      // 添加任务并等待它失败
      await expect(executor.add('task')).rejects.toThrow('Task failed');

      // 默认的onError回调应该被调用
      expect(consoleErrorMock).toHaveBeenCalled();

      consoleErrorMock.mockRestore();
    });

    it('应该正确处理clearHistory方法', async () => {
      mockAsyncFn
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('Task failed'));

      const executor = new AsyncExecutor(mockAsyncFn);

      // 添加一个成功的任务
      await executor.add('task1');

      // 添加一个失败的任务
      await expect(executor.add('task2')).rejects.toThrow('Task failed');

      // 结果和错误应该被记录
      expect(executor.results.length).toBe(1);
      expect(executor.errors.length).toBe(1);

      // 清除历史记录
      executor.clearHistory();

      // 结果和错误应该被清除
      expect(executor.results.length).toBe(0);
      expect(executor.errors.length).toBe(0);
    });
  });
});
