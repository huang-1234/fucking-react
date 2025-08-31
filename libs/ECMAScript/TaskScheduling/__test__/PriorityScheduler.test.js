import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { PriorityScheduler } from '../PriorityScheduler';

describe('PriorityScheduler', () => {
  let scheduler;
  let consoleSpy;

  beforeEach(() => {
    // 创建一个带调试的调度器
    scheduler = new PriorityScheduler({
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
    expect(scheduler.queue).toEqual([]);
    expect(scheduler.running).toBe(0);
    expect(scheduler.debug).toBe(true);
    expect(scheduler.taskCounter).toBe(0);
  });

  test('应该添加任务到队列', async () => {
    const taskFn = vi.fn().mockResolvedValue('result');
    const promise = scheduler.addTask(taskFn, 5, 'test-task');

    // 验证任务被添加到队列并开始执行
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('添加任务: test-task'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('执行任务: test-task'));

    // 任务应该已经开始执行
    expect(taskFn).toHaveBeenCalled();

    // 使用微任务让Promise解析
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('result');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('任务完成: test-task'));
  });

  test('应该按优先级排序任务', async () => {
    // 设置_schedule不立即执行，以便我们可以控制执行顺序
    const originalSchedule = scheduler._schedule;
    scheduler._schedule = vi.fn();

    // 添加不同优先级的任务
    scheduler.addTask(vi.fn().mockResolvedValue('low'), 1, 'low');
    scheduler.addTask(vi.fn().mockResolvedValue('medium'), 5, 'medium');
    scheduler.addTask(vi.fn().mockResolvedValue('high'), 10, 'high');
    scheduler.addTask(vi.fn().mockResolvedValue('medium2'), 5, 'medium2');

    // 验证队列排序
    expect(scheduler.queue[0].id).toBe('high');    // 最高优先级
    expect(scheduler.queue[1].id).toBe('medium');  // 中等优先级
    expect(scheduler.queue[2].id).toBe('medium2'); // 中等优先级
    expect(scheduler.queue[3].id).toBe('low');     // 最低优先级

    // 恢复_schedule并手动调用
    scheduler._schedule = originalSchedule;
    scheduler._schedule();

    // 验证高优先级任务先执行
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('调度任务: high'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('调度任务: medium'));

    // 由于并发度为2，其他任务应该还在队列中
    expect(scheduler.queue.length).toBe(2);
    expect(scheduler.queue[0].id).toBe('medium2');
    expect(scheduler.queue[1].id).toBe('low');
  });

    test('应该处理任务失败', async () => {
    const errorSpy = vi.spyOn(console, 'error');

    // 使用静态错误消息而不是创建Error对象
    const errorMessage = 'Task failed';

    // 创建一个会失败的任务，使用字符串而不是Error对象
    const failingTask = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error(errorMessage));
    });

    // 添加失败任务并立即捕获错误
    const promise = scheduler.addTask(failingTask, 5, 'failing-task').catch(e => {
      // 返回错误消息而不是Error对象
      return e.message;
    });

    // 使用微任务让Promise解析
    await vi.runAllTimersAsync();
    const result = await promise;

    // 验证错误消息而不是Error对象
    expect(result).toBe(errorMessage);
    expect(errorSpy).toHaveBeenCalled();

    // 清理间谍
    errorSpy.mockRestore();
  });

  test('应该生成自动任务ID', async () => {
    // 设置_schedule不立即执行，以便我们可以检查任务ID
    scheduler._schedule = vi.fn();

    // 添加没有指定ID的任务
    scheduler.addTask(vi.fn().mockResolvedValue('result'), 5);

    // 验证任务ID是自动生成的
    expect(scheduler.queue[0].id).toBe('task-1');

    // 添加另一个任务
    scheduler.addTask(vi.fn().mockResolvedValue('result2'), 3);

    // 验证任务ID递增
    expect(scheduler.queue[1].id).toBe('task-2');
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

    // 添加所有任务，相同优先级
    scheduler.addTask(task1, 5, 'task1');
    scheduler.addTask(task2, 5, 'task2');
    scheduler.addTask(task3, 5, 'task3');
    scheduler.addTask(task4, 5, 'task4');

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
    scheduler.addTask(vi.fn(), 5, 'task1');
    scheduler.addTask(vi.fn(), 10, 'task2');
    scheduler.running = 1;

    const status = scheduler.getStatus();

    expect(status.running).toBe(1);
    expect(status.queueLength).toBe(2);
    expect(status.queuedTasks).toHaveLength(2);
    expect(status.queuedTasks[0].id).toBe('task2');
    expect(status.queuedTasks[0].priority).toBe(10);
    expect(status.queuedTasks[1].id).toBe('task1');
    expect(status.queuedTasks[1].priority).toBe(5);
  });
});
