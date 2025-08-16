/**
 * @fileoverview 异步任务调度控制器
 * @author huangsq
 * @version 1.0.0
 * @description 该模块提供了一个异步任务调度控制器，支持最大并发量和最小并发量的配置。
 * @license MIT
 * @template T
 * @typedef {{ value: T, error: Error | null, idx: number }} TaskResult
 * @typedef {{ status: 'fulfilled' | 'rejected', value?: T, reason?: Error }} Result<T>
 * @property {Array<() => Promise<T>>} queue 任务队列
 * @property {Array<{idx: number, result: T} | {idx: number, error: Error}>} results 结果队列
 * @property {number} isRunning 正在进行的任务数
 * @property {number} index 当前结果索引
 * @property {Map<number, (result: {idx: number, result: T} | {idx: number, error: Error}) => void>} pendingResolves 未解决的 Promise
 * =======
 * @property {number} concurrency 当前并发量
 * @property {number} maxConcurrency 最大并发量
 * @property {number} minConcurrency 最小并发量
 * @property {Array<() => Promise<T>>} taskQueue 任务队列
 * @class
 * @example
 * const controller = new AsyncController(4, 2); // 并发2-4
 * const tasks = [
 *   () => new Promise((res) => setTimeout(() => res("Task1"), delayTime.fast)),
 *   () => new Promise((res) => setTimeout(() => res("Task2"), delayTime.slow)),
 * ];
 * const results = await controller.run(tasks);
 * console.log(results);
 * for (const result of controller.getOrderedResult()) {
 *   console.log(result);
 * }
 */
export class InnerAsyncController {
  /**
   * @param {Object} options
   * @param {number} options.maxConcurrency - 最大并发量
   * @param {number} options.minConcurrency - 最小并发量
   * @param {number} options.timeout - 超时自动失败时间
   * @param {number} options.retryCount - 最大重试次数
   * @param {boolean} options.debug - 是否开启调试模式
   * @description 创建一个异步任务调度控制器
   * @example
   */
  constructor(options = { maxConcurrency: 4, minConcurrency: 2, timeout: 5000, retryCount: 0 }) {
    const { maxConcurrency, minConcurrency, debug } = options;
    this.debug = debug || false;
    this.maxConcurrency = maxConcurrency;
    this.minConcurrency = minConcurrency;
    this.concurrency = Math.max(minConcurrency, Math.min(maxConcurrency, 1));
    this.retryCount = options.retryCount || 0;
    this.timeout = options.timeout || 5000;
    this.pendingResolves = new Map();
    this.taskQueue = [];
    this.isRunning = 0;
    this.completed = 0;
    this.fulfilled = 0;
    this.rejected = 0;
    this.result = [];
    this.allResolved = Promise.resolve();
  }
  timeoutFinish() {
  }
  retry(task) {
    if (this.retryCount > 0) {
      this.retryCount--;
      return task().catch(this.retry.bind(this));
    }
  }

  /**
   * 运行任务
   * @param {Array<() => Promise<T>>} tasks
   * @returns {Promise<Array<TaskResult>>}
   */
  run(tasks) {
    this.result = new Array(tasks.length).fill(null);
    this.fulfilled = 0;
    return new Promise((resolve) => {
      this.allResolved = resolve;
      tasks.forEach((task, idx) => {
        const promiseTask = async () => {
          try {
            const result = await task();
            return { result, idx };
          } catch (reason) {
            return { reason, idx };
          }
        };
        this.taskQueue.push(promiseTask);
      });
      return this._processQueue();
    });
  }
  /**
   * 添加任务
   * @param {() => Promise<T>} task 任务
   * @returns {Promise<TaskResult<T>>} 结果
   */
  add(task) {
    const promiseTask = async () => {
      try {
        const result = await task();
        return { value: result, error: null, idx: this.taskQueue.length - 1 };
      } catch (error) {
        return this.retry ? this.retry(task) : { value: null, error, idx: this.taskQueue.length - 1 };
      }
    };
    this.taskQueue.push(promiseTask);
    return this._processQueue();
  }
  /**
   * 处理队列
   * @returns {Promise<void>}
   */
  _processQueue() {
    while (this.isRunning < this.concurrency && this.taskQueue.length) {
      const task = this.taskQueue.shift();
      this.debug && console.log("_processQueue", this.concurrency, "inProgress", this.isRunning, "this.queue.length", this.taskQueue.length);
      this.isRunning++;
      if (typeof task === "function") {
        task().then(this._handleCompletion.bind(this))
      }
    }
  }
  /**
   * 处理完成
   * @param {{result: T, idx: number}} result 结果
   *
   */
  _handleCompletion({ idx, result, reason }) {
    if (result) {
      this.fulfilled++;
      this.result[idx] = { status: "fulfilled", value: result };
    }
    if (reason) {
      this.rejected++;
      this.result[idx] = { status: "rejected", reason };
    }
    this.isRunning--;
    this.completed++;
    this.debug && console.log("inProgress", this.isRunning, "this.queue.length", this.taskQueue.length, "completed", this.completed);
    this._processQueue();
    if (this.completed === this.result.length && this.isRunning === 0) {
      this.allResolved(this.result);
    }
  }
  getOrderedResult() {
    return this.result.map((item, idx) => {
      if (item === null) {
        return { status: "pending", idx };
      }
      return { ...item, idx };
    });
  }
}

const delayTime = {
  fast: 200,
  slow: 2000,
  outTime: 2000,
};
// 使用示例
async function main() {
  console.time("main");
  const tasks = [
    () => new Promise((res) => setTimeout(() => res("Task1"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task2"), delayTime.slow)),
    () =>
      new Promise((_, rej) =>
        setTimeout(() => rej("Task3 error"), delayTime.outTime)
      ),
    () => new Promise((res) => setTimeout(() => res("Task4"), delayTime.slow)),
    () => new Promise((res) => setTimeout(() => res("Task5"), delayTime.slow)),
    () => new Promise((res) => setTimeout(() => res("Task6"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task7"), delayTime.slow)),
    () => new Promise((res) => setTimeout(() => res("Task8"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task9"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task10"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task11"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task12"), delayTime.slow)),
    () => new Promise((res) => setTimeout(() => res("Task13"), delayTime.slow)),
    () => new Promise((res) => setTimeout(() => res("Task14"), delayTime.slow)),
    () => new Promise((res) => setTimeout(() => res("Task15"), delayTime.fast)),
    () => new Promise((res) => setTimeout(() => res("Task16"), delayTime.fast)),
  ];

  const controller = new InnerAsyncController({
    maxConcurrency: 4,
    minConcurrency: 2,
    debug: true,
  }); // 并发2-4
  const results = await controller.run(tasks);

  console.timeEnd("main");
  console.log("最终结果:");
  console.log('results', results);
  // 可选：按需获取有序结果（流式处理）
  for (const result of controller.getOrderedResult()) {
    console.log(result);
  }
}
main().catch(console.error);