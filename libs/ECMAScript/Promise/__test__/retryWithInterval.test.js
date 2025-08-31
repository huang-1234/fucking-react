import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { retryWithInterval } from '../retryWithInterval';
// 导入要测试的函数


describe('retryWithInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('基本功能测试', () => {
    it('应该在第一次尝试成功时立即返回结果', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await retryWithInterval(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在失败后重试并最终成功', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('第一次失败'))
        .mockRejectedValueOnce(new Error('第二次失败'))
        .mockResolvedValue('第三次成功');

      const promise = retryWithInterval(mockFn, 3, 100);

      // 快进时间以跳过延迟
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toBe('第三次成功');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('应该在达到最大重试次数后抛出错误', async () => {
      const error = new Error('持续失败');
      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = retryWithInterval(mockFn, 2, 100);

      // 快进时间以跳过延迟
      await vi.advanceTimersByTimeAsync(2000);

      await expect(promise).rejects.toThrow('持续失败');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('应该在错误对象上附加重试次数信息', async () => {
      const error = new Error('测试错误');
      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = retryWithInterval(mockFn, 3, 100);

      await vi.advanceTimersByTimeAsync(3000);

      try {
        await promise;
      } catch (caughtError) {
        expect(caughtError.attempts).toBe(3);
      }
    });
  });

  describe('延迟机制测试', () => {
    it('应该使用指数退避策略', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('失败'));
      const baseDelay = 100;

      const promise = retryWithInterval(mockFn, 3, baseDelay);

      // 第一次失败后的延迟应该是 baseDelay * 2^0 + 随机值
      await vi.advanceTimersByTimeAsync(baseDelay + 500);

      // 第二次失败后的延迟应该是 baseDelay * 2^1 + 随机值
      await vi.advanceTimersByTimeAsync(baseDelay * 2 + 500);

      await expect(promise).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('错误过滤测试', () => {
    it('应该只对通过过滤器的错误进行重试', async () => {
      const retryableError = new Error('可重试错误');
      retryableError.code = 'RETRYABLE';

      const nonRetryableError = new Error('不可重试错误');
      nonRetryableError.code = 'NON_RETRYABLE';

      const mockFn = vi.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(nonRetryableError);

      const errorFilter = (error) => error.code === 'RETRYABLE';

      const promise = retryWithInterval(mockFn, 3, 100, { errorFilter });

      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).rejects.toThrow('不可重试错误');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('应该在错误不通过过滤器时立即失败', async () => {
      const error = new Error('不可重试');
      error.code = 'NON_RETRYABLE';

      const mockFn = vi.fn().mockRejectedValue(error);
      const errorFilter = (error) => error.code === 'RETRYABLE';

      const promise = retryWithInterval(mockFn, 3, 100, { errorFilter });

      await expect(promise).rejects.toThrow('不可重试');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('超时控制测试', () => {
    it('应该在指定时间内超时', async () => {
      const mockFn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 2000)));

      const promise = retryWithInterval(mockFn, 3, 100, { timeoutMs: 500 });

      await vi.advanceTimersByTimeAsync(600);

      await expect(promise).rejects.toThrow('Timeout after 500ms');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在超时后进行重试', async () => {
      const mockFn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 2000)));

      const promise = retryWithInterval(mockFn, 2, 100, { timeoutMs: 500 });

      // 第一次超时
      await vi.advanceTimersByTimeAsync(600);
      // 等待重试延迟
      await vi.advanceTimersByTimeAsync(700);
      // 第二次超时
      await vi.advanceTimersByTimeAsync(600);

      await expect(promise).rejects.toThrow('Timeout after 500ms');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('取消信号测试', () => {
    it('应该在信号已经中止时立即拒绝', async () => {
      const controller = new AbortController();
      controller.abort();

      const mockFn = vi.fn().mockResolvedValue('success');

      const promise = retryWithInterval(mockFn, 3, 100, { signal: controller.signal });

      await expect(promise).rejects.toThrow('Operation aborted');
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('应该在执行过程中响应取消信号', async () => {
      const controller = new AbortController();
      const mockFn = vi.fn().mockRejectedValue(new Error('失败'));

      const promise = retryWithInterval(mockFn, 3, 100, { signal: controller.signal });

      // 让第一次尝试失败
      await vi.advanceTimersByTimeAsync(50);

      // 在重试延迟期间取消
      controller.abort();

      await vi.advanceTimersByTimeAsync(200);

      await expect(promise).rejects.toThrow('Operation aborted');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在取消后清理事件监听器', async () => {
      const controller = new AbortController();
      const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener');

      const mockFn = vi.fn().mockResolvedValue('success');

      // 先中止信号
      controller.abort();

      const promise = retryWithInterval(mockFn, 3, 100, { signal: controller.signal });

      await expect(promise).rejects.toThrow('Operation aborted');
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('参数默认值测试', () => {
    it('应该使用默认的最大重试次数', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('失败'));

      const promise = retryWithInterval(mockFn);

      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(3); // 默认值
    });

    it('应该使用默认的基础延迟时间', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('失败'))
        .mockResolvedValue('成功');

      const startTime = Date.now();
      const promise = retryWithInterval(mockFn, 2);

      await vi.advanceTimersByTimeAsync(1500); // 1000ms + 随机值

      const result = await promise;
      expect(result).toBe('成功');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理 maxAttempts 为 1 的情况', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('失败'));

      const promise = retryWithInterval(mockFn, 1);

      await expect(promise).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该处理 maxAttempts 为 0 的情况', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('失败'));

      const promise = retryWithInterval(mockFn, 0);

      await expect(promise).rejects.toThrow();
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('应该处理函数返回非 Promise 值的情况', async () => {
      const mockFn = vi.fn().mockReturnValue('同步结果');

      const result = await retryWithInterval(mockFn);

      expect(result).toBe('同步结果');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});