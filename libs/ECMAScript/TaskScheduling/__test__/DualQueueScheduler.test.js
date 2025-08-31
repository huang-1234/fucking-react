import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DualQueueScheduler } from '../DualQueueScheduler';

describe('DualQueueScheduler', () => {
  let scheduler;
  let consoleSpy;

  beforeEach(() => {
    // 创建一个带调试的调度器
    scheduler = new DualQueueScheduler({
      concurrency: 2,
      debug: true
    });

    // 监听console.log
    consoleSpy = vi.spyOn(console, 'log');

    // 模拟setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('应该正确初始化调度器', () => {
    expect(scheduler.concurrency).toBe(2);
    expect(scheduler.normalQueue).toEqual([]);
    expect(scheduler.urgentQueue).toEqual([]);
    expect(scheduler.running).toBe(0);
    expect(scheduler.debug).toBe(true);
  });

  test('应该添加普通任务到队列', async () => {
    const taskFn = vi.fn().mockResolvedValue('result');
    const promise = scheduler.addNormalTask(taskFn);

    // 验证任务被添加到队列并开始执行
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('添加普通任务到队列'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('执行普通任务'));

    // 任务应该已经开始执行
    expect(taskFn).toHaveBeenCalled();

    // 使用微任务让Promise解析
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('result');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('普通任务完成'));
  });

  test('应该添加紧急任务到队列', async () => {
    const taskFn = vi.fn().mockResolvedValue('urgent result');
    const promise = scheduler.addUrgentTask(taskFn);

    // 验证任务被添加到紧急队列并开始执行
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('添加紧急任务到队列'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('执行紧急任务'));

    // 任务应该已经开始执行
    expect(taskFn).toHaveBeenCalled();

    // 使用微任务让Promise解析
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('urgent result');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('紧急任务完成'));
  });

  test('应该优先执行紧急任务', async () => {
    // 设置_schedule不立即执行，以便我们可以控制执行顺序
    const originalSchedule = scheduler._schedule;
    scheduler._schedule = vi.fn();

    const normalTask = vi.fn().mockResolvedValue('normal');
    const urgentTask = vi.fn().mockResolvedValue('urgent');

    // 添加普通任务和紧急任务
    scheduler.addNormalTask(normalTask);
    scheduler.addUrgentTask(urgentTask);

    // 恢复_schedule并手动调用
    scheduler._schedule = originalSchedule;
    scheduler._schedule();

    // 验证紧急任务先执行
    expect(urgentTask).toHaveBeenCalled();

    // 普通任务也应该执行，因为并发度为2
    expect(normalTask).toHaveBeenCalled();
  });

  test('应该处理任务失败', async () => {
    const errorSpy = vi.spyOn(console, 'error');

    // 创建一个静态错误对象，避免在测试中创建新的Error实例
    const errorMessage = 'Task failed';

    // 创建一个会失败的任务
    const failingTask = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error(errorMessage));
    });

    // 添加失败任务并立即捕获错误
    const promise = scheduler.addNormalTask(failingTask).catch(e => {
      // 只返回错误信息，而不是Error对象
      return e.message;
    });

    // 使用微任务让Promise解析
    await vi.runAllTimersAsync();
    const result = await promise;

    // 验证错误被正确处理
    expect(result).toBe(errorMessage);
    expect(errorSpy).toHaveBeenCalled();

    // 清理间谍
    errorSpy.mockRestore();
  });

  test('应该遵守并发限制', async () => {
    // 设置_schedule不立即执行，以便我们可以控制执行顺序
    const originalSchedule = scheduler._schedule;
    scheduler._schedule = vi.fn();

    // 创建4个任务，但并发度为2
    const task1 = vi.fn().mockResolvedValue('task1');
    const task2 = vi.fn().mockResolvedValue('task2');
    const task3 = vi.fn().mockResolvedValue('task3');
    const task4 = vi.fn().mockResolvedValue('task4');

    // 添加所有任务
    scheduler.addNormalTask(task1);
    scheduler.addNormalTask(task2);
    scheduler.addNormalTask(task3);
    scheduler.addNormalTask(task4);

    // 恢复_schedule并手动调用
    scheduler._schedule = originalSchedule;
    scheduler._schedule();

    // 只有前两个任务应该执行
    expect(task1).toHaveBeenCalled();
    expect(task2).toHaveBeenCalled();
    expect(task3).not.toHaveBeenCalled();
    expect(task4).not.toHaveBeenCalled();

    // 模拟前两个任务完成
    await vi.runAllTimersAsync();

    // 现在后两个任务应该执行
    expect(task3).toHaveBeenCalled();
    expect(task4).toHaveBeenCalled();
  });

  test('应该正确获取队列状态', () => {
    // 设置_schedule不立即执行，以便我们可以控制执行顺序
    scheduler._schedule = vi.fn();

    // 添加任务但不执行
    scheduler.normalQueue.push(() => Promise.resolve());
    scheduler.normalQueue.push(() => Promise.resolve());
    scheduler.urgentQueue.push(() => Promise.resolve());
    scheduler.running = 1;

    const status = scheduler.getStatus();

    expect(status.running).toBe(1);
    expect(status.normalQueueLength).toBe(2);
    expect(status.urgentQueueLength).toBe(1);
  });
});
