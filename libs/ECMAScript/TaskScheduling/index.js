/**
 * 任务调度器模块集合
 *
 * 包含以下调度器：
 * 1. AsyncController - 异步控制器，支持动态调整并发量和顺序返回结果
 * 2. DynamicPriorityScheduler - 动态优先级调度器，支持任务优先级随等待时间动态提升
 * 3. DualQueueScheduler - 双队列调度器，支持普通任务和紧急任务分开调度
 * 4. PriorityScheduler - 优先级调度器，支持按优先级排序任务
 */

import { AsyncController, delayTime, main as runAsyncControllerExample } from './AsyncController';
import { DynamicPriorityTask, DynamicPriorityScheduler, runDynamicPriorityExample } from './DynamicPriorityTask';
import { DualQueueScheduler, runDualQueueExample } from './DualQueueScheduler';
import { PriorityScheduler, runPriorityExample } from './PriorityScheduler';

/**
 * 运行所有调度器示例
 */
function runAllExamples() {
  console.log('======== AsyncController 示例 ========');
  runAsyncControllerExample();

  console.log('\n======== DynamicPriorityScheduler 示例 ========');
  runDynamicPriorityExample();

  console.log('\n======== DualQueueScheduler 示例 ========');
  runDualQueueExample();

  console.log('\n======== PriorityScheduler 示例 ========');
  runPriorityExample();
}

export {
  // 异步控制器
  AsyncController,
  delayTime,
  runAsyncControllerExample,

  // 动态优先级调度器
  DynamicPriorityTask,
  DynamicPriorityScheduler,
  runDynamicPriorityExample,

  // 双队列调度器
  DualQueueScheduler,
  runDualQueueExample,

  // 优先级调度器
  PriorityScheduler,
  runPriorityExample,

  // 运行所有示例
  runAllExamples
};
