import { describe, test, expect } from 'vitest';
import * as TaskSchedulers from '../index';

describe('任务调度器模块集合', () => {
  test('应该正确导出所有模块', () => {
    // 验证异步控制器导出
    expect(TaskSchedulers.AsyncController).toBeDefined();
    expect(TaskSchedulers.delayTime).toBeDefined();
    expect(TaskSchedulers.runAsyncControllerExample).toBeDefined();

    // 验证动态优先级调度器导出
    expect(TaskSchedulers.DynamicPriorityTask).toBeDefined();
    expect(TaskSchedulers.DynamicPriorityScheduler).toBeDefined();
    expect(TaskSchedulers.runDynamicPriorityExample).toBeDefined();

    // 验证双队列调度器导出
    expect(TaskSchedulers.DualQueueScheduler).toBeDefined();
    expect(TaskSchedulers.runDualQueueExample).toBeDefined();

    // 验证优先级调度器导出
    expect(TaskSchedulers.PriorityScheduler).toBeDefined();
    expect(TaskSchedulers.runPriorityExample).toBeDefined();

    // 验证运行所有示例函数导出
    expect(TaskSchedulers.runAllExamples).toBeDefined();
  });

  test('导出的类应该是正确的构造函数', () => {
    // 验证各个调度器类是否可以正确实例化
    expect(new TaskSchedulers.AsyncController()).toBeInstanceOf(TaskSchedulers.AsyncController);
    expect(new TaskSchedulers.DynamicPriorityTask('test', 5)).toBeInstanceOf(TaskSchedulers.DynamicPriorityTask);
    expect(new TaskSchedulers.DynamicPriorityScheduler()).toBeInstanceOf(TaskSchedulers.DynamicPriorityScheduler);
    expect(new TaskSchedulers.DualQueueScheduler()).toBeInstanceOf(TaskSchedulers.DualQueueScheduler);
    expect(new TaskSchedulers.PriorityScheduler()).toBeInstanceOf(TaskSchedulers.PriorityScheduler);
  });
});
