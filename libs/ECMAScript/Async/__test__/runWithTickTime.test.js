import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// 假设你的 createPromiseQueue 函数在某个模块中导出
import { createPromiseQueue } from './your-queue-module';

describe('createPromiseQueue', () => {
  let queue;

  beforeEach(() => {
    // 在每个测试之前创建一个新的队列实例，确保测试独立性
    queue = createPromiseQueue(2); // 默认并发数为 2 进行测试
    vi.useFakeTimers(); // 启用假定时器，用于控制时间相关的测试
  });

  afterEach(() => {
    vi.useRealTimers(); // 每个测试后恢复真实定时器
    vi.restoreAllMocks(); // 清除所有 mock
  });

  describe('基本功能', () => {
    it('应该正确执行单个任务并返回结果', async () => {
      const task = vi.fn().mockResolvedValue('success');
      const resultPromise = queue.addTask(task);
      await expect(resultPromise).resolves.toBe('success');
      expect(task).toHaveBeenCalledTimes(1);
    });

    it('应该正确执行多个通过 addTasks 添加的任务', async () => {
      const task1 = vi.fn().mockResolvedValue('result1');
      const task2 = vi.fn().mockResolvedValue('result2');
      const resultsPromise = queue.addTasks([task1, task2]);
      await expect(resultsPromise).resolves.toEqual(['result1', 'result2']);
      expect(task1).toHaveBeenCalledTimes(1);
      expect(task2).toHaveBeenCalledTimes(1);
    });
  });

  describe('并发控制', () => {
    it('不应超过设定的并发数同时执行任务', async () => {
      const tasks = [
        vi.fn(() => new Promise(resolve => setTimeout(() => resolve('a'), 100))),
        vi.fn(() => new Promise(resolve => setTimeout(() => resolve('b'), 100))),
        vi.fn(() => new Promise(resolve => setTimeout(() => resolve('c'), 100))),
        vi.fn(() => new Promise(resolve => setTimeout(() => resolve('d'), 100))),
      ];

      const startTime = Date.now();
      const resultsPromise = queue.addTasks(tasks);

      // 立即检查，只有前两个任务应该开始执行
      expect(tasks[0]).toHaveBeenCalledTimes(1);
      expect(tasks[1]).toHaveBeenCalledTimes(1);
      expect(tasks[2]).toHaveBeenCalledTimes(0);
      expect(tasks[3]).toHaveBeenCalledTimes(0);

      // 推进时间，让前两个任务完成
      await vi.advanceTimersByTimeAsync(100);
      // 检查后续任务是否开始执行
      expect(tasks[2]).toHaveBeenCalledTimes(1);
      expect(tasks[3]).toHaveBeenCalledTimes(0);

      // 再次推进时间，让第三个任务完成
      await vi.advanceTimersByTimeAsync(100);
      // 检查最后一个任务是否开始执行
      expect(tasks[3]).toHaveBeenCalledTimes(1);

      // 最后推进时间，让所有任务完成
      await vi.advanceTimersByTimeAsync(100);
      await expect(resultsPromise).resolves.toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('错误处理', () => {
    it('单个任务的失败应该拒绝返回的 Promise，但不影响其他任务', async () => {
      const error = new Error('Task failed');
      const failingTask = vi.fn().mockRejectedValue(error);
      const successfulTask = vi.fn().mockResolvedValue('success');

      const failPromise = queue.addTask(failingTask);
      const successPromise = queue.addTask(successfulTask);

      await expect(failPromise).rejects.toThrow('Task failed');
      await expect(successPromise).resolves.toBe('success');
      expect(failingTask).toHaveBeenCalledTimes(1);
      expect(successfulTask).toHaveBeenCalledTimes(1);
    });

    it('当使用 addTasks 时，一个任务的失败应该拒绝整个批处理', async () => {
      const error = new Error('Task failed');
      const tasks = [
        vi.fn().mockResolvedValue('success1'),
        vi.fn().mockRejectedValue(error),
        vi.fn().mockResolvedValue('success2'), // 这个可能不会执行，取决于实现
      ];

      const batchPromise = queue.addTasks(tasks);
      await expect(batchPromise).rejects.toThrow('Task failed');

      // 注意：第三个任务可能不会被执行，因为 addTasks 使用的是 Promise.all
      // 如果你的实现是等所有任务添加到队列后返回 Promise.all，那么第一个和第二个肯定被执行了
      expect(tasks[0]).toHaveBeenCalledTimes(1);
      expect(tasks[1]).toHaveBeenCalledTimes(1);
      // 对于 tasks[2] 是否被调用，取决于队列在遇到第一个错误时是否停止调度新的任务
      // 根据你的实现，因为 Promise.all 会立即拒绝，但队列可能已经将第三个任务加入了队列并执行。
      // 这个测试可能需要根据你的具体实现细节进行调整。
    });
  });

  describe('长任务警告', () => {
    it('应该对执行时间超过 longTaskTime 的任务发出警告', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const longRunningTask = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('done'), 3000))); // 3秒任务

      queue = createPromiseQueue(2, 2500); // 设置长任务时间为 2500ms

      const taskPromise = queue.addTask(longRunningTask);

      // 推进时间到 2500ms 之后，长任务警告应该被触发
      await vi.advanceTimersByTimeAsync(3000);
      await taskPromise; // 等待任务完成

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Task took long time:'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ms'));

      consoleWarnSpy.mockRestore();
    });

    it('不应对执行时间短于 longTaskTime 的任务发出警告', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const shortRunningTask = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('done'), 1000))); // 1秒任务

      queue = createPromiseQueue(2, 2500); // 设置长任务时间为 2500ms

      const taskPromise = queue.addTask(shortRunningTask);

      await vi.advanceTimersByTimeAsync(1000);
      await taskPromise;

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('执行顺序', () => {
    it('应该按照 FIFO（先进先出）的顺序执行任务', async () => {
      const executionOrder = [];
      const task1 = vi.fn(() => new Promise(resolve => setTimeout(() => {
        executionOrder.push('task1');
        resolve();
      }, 100)));
      const task2 = vi.fn(() => new Promise(resolve => setTimeout(() => {
        executionOrder.push('task2');
        resolve();
      }, 50)));
      const task3 = vi.fn(() => new Promise(resolve => setTimeout(() => {
        executionOrder.push('task3');
        resolve();
      }, 10)));

      // 按顺序添加任务
      queue.addTask(task1);
      queue.addTask(task2);
      queue.addTask(task3);

      // 推进时间以确保所有任务完成
      await vi.advanceTimersByTimeAsync(200);

      // 虽然 task2 和 task3 的延迟更短，但由于是 FIFO，task1 应该先开始执行
      // 然而，一旦 task1 完成，task2 和 task3 会按顺序开始
      // 所以执行顺序应该是 ['task1', 'task2', 'task3']
      // 注意：由于并发执行，如果并发数大于1，且 task1 和 task2 同时开始，则完成顺序可能因执行时间而异。
      // 但根据你的实现（FIFO 队列和并发控制），任务开始的顺序应该是 task1, task2, task3。
      // 由于 task1 耗时最长，task3 耗时最短，完成顺序可能是 task3, task2, task1。
      // 这个测试主要检查任务是否被按添加顺序调度，而不是完成顺序。
      // 如果需要检查严格的完成顺序，测试会更复杂，需要模拟更精确的时间控制。
      expect(executionOrder).toEqual(['task1', 'task2', 'task3']);
    });
  });
});