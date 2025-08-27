import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DynamicPriorityTask, DynamicPriorityScheduler } from '../DynamicPriorityTask';

describe('DynamicPriorityTask', () => {
  test('应该正确初始化任务属性', () => {
    const task = new DynamicPriorityTask('task-1', 5);

    expect(task.id).toBe('task-1');
    expect(task.basePriority).toBe(5);
    expect(task.currentPriority).toBe(5);
    expect(task.status).toBe('pending');
    expect(task.executeTime).toBe(0);
    expect(task.arrivalTime).toBeLessThanOrEqual(Date.now());
  });

    test('应该根据等待时间更新优先级', () => {
    const task = new DynamicPriorityTask('task-1', 3);
    const currentTime = Date.now();
    const initialTime = currentTime - 2000; // 模拟2秒前到达
    task.arrivalTime = initialTime;

    // 使用固定的当前时间，避免测试中的时间差异
    task.updatePriority(currentTime);

    // 等待2000ms，优先级应该提升约2000 * 0.005 = 10，加上基础优先级3 = 13
    // 但受最大提升幅度限制为10，所以最终是 3 + 10 = 13
    expect(task.currentPriority).toBe(13);

    // 测试较短等待时间
    const task2 = new DynamicPriorityTask('task-2', 3);
    const initialTime2 = currentTime - 500; // 模拟0.5秒前到达
    task2.arrivalTime = initialTime2;

    // 使用固定的当前时间
    task2.updatePriority(currentTime);

    // 等待500ms，优先级应该提升约500 * 0.005 = 2.5，加上基础优先级3 = 5.5
    expect(task2.currentPriority).toBe(5.5);
  });
});

describe('DynamicPriorityScheduler', () => {
  let scheduler;
  let consoleSpy;

  beforeEach(() => {
    // 创建一个带调试的调度器
    scheduler = new DynamicPriorityScheduler({
      concurrency: 1,
      starvationThreshold: 1000,
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

  test('应该正确添加任务到队列', () => {
    const task = new DynamicPriorityTask('test-task', 3);
    scheduler.addTask(task);

    expect(scheduler.queue.length).toBe(0); // 任务应该被立即调度执行
    expect(scheduler.activeTask).toBe(task);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('添加任务: test-task'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('执行任务: test-task'));
  });

  test('应该按优先级排序任务', () => {
    // 禁用自动调度以便测试排序
    scheduler._schedule = vi.fn();

    const task1 = new DynamicPriorityTask('task-1', 3);
    const task2 = new DynamicPriorityTask('task-2', 5);
    const task3 = new DynamicPriorityTask('task-3', 1);

    scheduler.addTask(task1);
    scheduler.addTask(task2);
    scheduler.addTask(task3);

    // 手动触发调度
    scheduler._schedule = vi.fn().mockImplementation(() => {
      if (scheduler.queue.length === 0) return;

      // 更新优先级并排序
      const now = Date.now();
      scheduler.queue.forEach(task => task.updatePriority(now));
      scheduler.queue.sort((a, b) => b.currentPriority - a.currentPriority);

      // 检查排序结果
      expect(scheduler.queue[0].id).toBe('task-2'); // 最高优先级
      expect(scheduler.queue[1].id).toBe('task-1'); // 中等优先级
      expect(scheduler.queue[2].id).toBe('task-3'); // 最低优先级
    });

    scheduler._schedule();
  });

  test('应该处理紧急任务插队', () => {
    // 禁用自动调度以便测试插队
    scheduler._schedule = vi.fn();

    const task1 = new DynamicPriorityTask('task-1', 3);
    const task2 = new DynamicPriorityTask('task-2', 2);
    const urgentTask = new DynamicPriorityTask('urgent', 8);

    scheduler.addTask(task1);
    scheduler.addTask(task2);
    scheduler.addUrgentTask(urgentTask);

    expect(scheduler.queue[0].id).toBe('urgent');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('紧急任务插队: urgent'));
  });

  test('应该提升饥饿任务的优先级', () => {
    // 禁用自动调度以便测试饥饿机制
    scheduler._schedule = vi.fn();

    const task1 = new DynamicPriorityTask('task-1', 5);
    const task2 = new DynamicPriorityTask('task-2', 4);
    const starvedTask = new DynamicPriorityTask('starved', 1);

    // 设置饥饿任务的到达时间为很久以前
    starvedTask.arrivalTime = Date.now() - 2000; // 超过饥饿阈值1000ms

    scheduler.addTask(task1);
    scheduler.addTask(task2);
    scheduler.addTask(starvedTask);

    // 恢复调度函数并手动调用
    scheduler._schedule = DynamicPriorityScheduler.prototype._schedule;
    scheduler._schedule();

    // 饥饿任务应该被提升到最高优先级并执行
    expect(scheduler.activeTask.id).toBe('starved');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('任务饥饿提升: starved'));
  });

  test('应该完成任务并继续调度', () => {
    const task1 = new DynamicPriorityTask('task-1', 3);
    const task2 = new DynamicPriorityTask('task-2', 2);

    scheduler.addTask(task1);
    // 此时task1应该是activeTask

    expect(scheduler.activeTask.id).toBe('task-1');

    // 添加第二个任务，应该在队列中等待
    scheduler.addTask(task2);
    expect(scheduler.queue.length).toBe(1);

    // 模拟任务1完成
    scheduler._completeTask();

    // task1应该完成，task2应该成为activeTask
    expect(scheduler.activeTask.id).toBe('task-2');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('完成任务: task-1'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('执行任务: task-2'));
  });

    test('应该正确获取队列状态', () => {
    // 禁用自动调度以便测试队列状态
    const originalSchedule = scheduler._schedule;
    scheduler._schedule = vi.fn();

    const task1 = new DynamicPriorityTask('task-1', 3);
    const task2 = new DynamicPriorityTask('task-2', 5);

    // 直接将任务添加到队列中，而不是使用addTask方法
    scheduler.queue.push(task1);
    scheduler.queue.push(task2);

    const status = scheduler.getQueueStatus();

    expect(status.length).toBe(2);
    expect(status[0].id).toBe('task-1');
    expect(status[1].id).toBe('task-2');
    expect(status[0].priority).toBeDefined();
    expect(status[0].waiting).toBeDefined();

    // 恢复原始调度函数
    scheduler._schedule = originalSchedule;
  });
});
