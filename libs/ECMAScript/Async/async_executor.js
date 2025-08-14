/**
 * @typedef {Object} AsyncExecutorOptions
 * @property {Function} fn 异步函数
 * @property {Number} concurrency 并发数，默认为1
 * @property {Number} timeout 超时时间（毫秒），默认为0（无超时）
 * @property {Number} retries 重试次数，默认为0
 * @property {Number} retryDelay 重试延迟（毫秒），默认为1000
 * @property {Function} onError 错误处理回调，默认为console.error
 * @property {Function} onSuccess 成功处理回调
 * @property {Function} onComplete 所有任务完成时的回调
 * @property {Function} onCancel 任务取消时的回调
 * @property {Boolean} autoStart 是否自动开始处理队列，默认为true
 * @property {Boolean} abortOnError 出错时是否中止所有任务，默认为false
 */

/**
 * @typedef {Object} AsyncExecutorTask
 * @property {string} id 任务ID
 * @property {any[]} args 传递给异步函数的参数
 * @property {Function} resolve 成功处理回调
 * @property {Function} reject 错误处理回调
 * @property {number} retries 重试次数
 * @property {number} timestamp 任务创建时间
 */

/**
 * @typedef {Object} AsyncExecutorResult
 * @property {string} id 任务ID
 * @property {any} result 任务结果
 * @property {number} timestamp 任务完成时间
 */

/**
 * @typedef {Object} AsyncExecutorError
 * @property {string} id 任务ID
 * @property {Error} error 错误
 */

/**
 * @typedef {Object} AsyncExecutorAbortController
 * @property {string} id 任务ID
 * @property {AbortController} controller AbortController实例
 */

/**
 * @typedef {Object} AsyncExecutor
 * @property {Function} fn 异步函数
 * @property {AsyncExecutorOptions} options 选项
 * @property {Array<AsyncExecutorTask>} queue 队列
 * @property {Number} running 运行中的任务数
 * @property {Array<AsyncExecutorResult>} results 结果
 * @property {Array<AsyncExecutorError>} errors 错误
 */

/**
 *
 * @description 异步执行器，用于管理异步操作的并发、取消、重试、防抖、节流、内存管理等。
 * @example 异步操作的取消：在实际应用中，我们可能需要取消一个正在进行的异步操作（如用户取消请求）。虽然原生Promise不支持取消，但可以通过AbortController实现。
 * @example 并发控制：当有大量异步操作需要执行时，需要限制同时执行的数量（如避免同时发起太多网络请求）。用户代码中未涉及此场景，但在实际应用中非常重要。
 * @example 重试机制：对于可能失败的异步操作，实现自动重试逻辑（如网络请求失败后重试）。
 * @example 高阶异步模式：如异步操作的防抖（debounce）和节流（throttle），这在处理频繁触发的事件（如滚动、输入）时非常有用。
 * @example 异步内存管理：特别是涉及大量数据或长期存在的Promise时，需要注意内存泄漏问题。
 * @example Promise组合的高级模式：如动态生成Promise链、递归处理异步操作等。
 * @example 微任务与宏任务的深层交互：如Promise与MutationObserver、requestAnimationFrame等的交互时序问题。
 * @example Node.js特有的异步问题：如nextTick与setImmediate的差异、Stream的背压处理等。
 *
 * @see https://juejin.cn/post/7341906210000000000
 *
 * @desc 异步执行器
 * @param {Function} fn 异步函数
 * @param {Object} options 选项
 * @param {Number} options.concurrency 并发数，默认为1
 * @param {Number} options.timeout 超时时间（毫秒），默认为0（无超时）
 * @param {Number} options.retries 重试次数，默认为0
 * @param {Number} options.retryDelay 重试延迟（毫秒），默认为1000
 * @param {Function} options.onError 错误处理回调，默认为console.error
 * @param {Function} options.onSuccess 成功处理回调
 * @param {Function} options.onComplete 所有任务完成时的回调
 * @param {Function} options.onCancel 任务取消时的回调
 * @param {Boolean} options.autoStart 是否自动开始处理队列，默认为true
 * @param {Boolean} options.abortOnError 出错时是否中止所有任务，默认为false
 *
 * 给每一个属性使用jsDoc编写注释类型，并添加默认值
 * @example
 * @property {Function} fn 异步函数
 * @property {Object} options 选项
 * @property {Array} queue 队列
 * @property {Number} running 运行中的任务数
 * @property {Array} results 结果
 * @property {Array} errors 错误
 */
export class AsyncExecutor {
  /**
   *
   * @param {Function} fn 异步函数
   * @param {AsyncExecutorOptions} options 选项
   */
  constructor(fn, options = {}) {
    /**
     * @type {Function}
     */
    this.fn = fn;
    /**
     * @type {AsyncExecutorOptions}
     * @default {
     *  concurrency: 1,
     *  timeout: 0,
     *  retries: 0,
     *  retryDelay: 1000,
     *  onError: ((err) => console.error(err)),
     *  onSuccess: (() => {}),
     *  onComplete: (() => {}),
     *  onCancel: (() => {}),
     *  autoStart: true,
     *  abortOnError: false,
     * }
     */
    this.options = {
      concurrency: options.concurrency || 1,
      timeout: options.timeout || 0,
      retries: options.retries || 0,
      retryDelay: options.retryDelay || 1000,
      onError: options.onError || ((err) => console.error(err)),
      onSuccess: options.onSuccess || (() => {}),
      onComplete: options.onComplete || (() => {}),
      onCancel: options.onCancel || (() => {}),
      autoStart: options.autoStart !== undefined ? options.autoStart : true,
      abortOnError: options.abortOnError !== undefined ? options.abortOnError : false,
    };
    /**
     * @type {Array<AsyncExecutorTask>}
     * @default []
     */
    this.queue = [];
    /**
     * @type {Number}
     */
    this.running = 0;
    /**
     * @type {Array<AsyncExecutorResult>}
     * @default []
     */
    this.results = [];
    /**
     * @type {Array<AsyncExecutorError>}
     * @default []
     */
    this.errors = [];
    /**
     * @type {Map<string, AsyncExecutorAbortController>}
     * @default new Map()
     */
    this.abortControllers = new Map();
    /**
     * @type {Boolean}
     * @default false
     */
    this.isProcessing = false;
    /**
     * @type {Boolean}
     * @default false
     */
    this.isPaused = false;
    /**
     * @type {Boolean}
     * @default false
     */
    this.isAborted = false;

    // 如果设置了自动启动，则立即开始处理队列
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * 添加任务到队列
   * @param {...any} args 传递给异步函数的参数
   * @returns {Promise} 返回一个Promise，当任务完成时resolve
   */
  add(...args) {
    return new Promise((resolve, reject) => {
      const taskId = Date.now() + Math.random().toString(36).substring(2, 9);
      const task = {
        id: taskId,
        args,
        resolve,
        reject,
        retries: 0,
        timestamp: Date.now(),
      };

      this.queue.push(task);

      if (this.options.autoStart && !this.isPaused && !this.isAborted) {
        this.processQueue();
      }

      return taskId;
    });
  }

  /**
   * 开始处理队列
   * @returns {AsyncExecutor} 返回this以支持链式调用
   */
  start() {
    this.isPaused = false;
    /**
     * @type {Boolean}
     */
    this.isAborted = false;
    this.processQueue();
    return this;
  }

  /**
   * 暂停处理队列
   * @returns {AsyncExecutor} 返回this以支持链式调用
   */
  pause() {
    this.isPaused = true;
    return this;
  }

  /**
   * 恢复处理队列
   * @returns {AsyncExecutor} 返回this以支持链式调用
   */
  resume() {
    this.isPaused = false;
    this.processQueue();
    return this;
  }

  /**
   * 取消所有任务
   * @returns {AsyncExecutor} 返回this以支持链式调用
   */
  abort() {
    this.isAborted = true;

    // 取消所有正在运行的任务
    for (const [taskId, controller] of this.abortControllers.entries()) {
      controller.abort();
      this.options.onCancel(taskId);
    }

    // 清空队列中的任务
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      task.reject(new Error('Task was cancelled'));
    }

    this.abortControllers.clear();
    this.running = 0;

    return this;
  }

  /**
   * 取消指定的任务
   * @param {string} taskId 任务ID
   * @returns {boolean} 是否成功取消
   */
  cancelTask(taskId) {
    // 检查是否在运行中的任务
    if (this.abortControllers.has(taskId)) {
      const controller = this.abortControllers.get(taskId);
      controller.abort();
      this.abortControllers.delete(taskId);
      this.running--;
      this.options.onCancel(taskId);
      return true;
    }

    // 检查是否在队列中的任务
    const index = this.queue.findIndex(task => task.id === taskId);
    if (index !== -1) {
      const task = this.queue[index];
      this.queue.splice(index, 1);
      task.reject(new Error('Task was cancelled'));
      this.options.onCancel(taskId);
      return true;
    }

    return false;
  }

  /**
   * 处理队列中的任务
   * @private
   */
  processQueue() {
    if (this.isProcessing || this.isPaused || this.isAborted) {
      return;
    }

    this.isProcessing = true;

    // 尝试执行尽可能多的任务，直到达到并发限制
    while (this.queue.length > 0 && this.running < this.options.concurrency) {
      const task = this.queue.shift();
      this.executeTask(task);
    }

    this.isProcessing = false;

    // 检查是否所有任务都已完成
    if (this.running === 0 && this.queue.length === 0) {
      this.options.onComplete(this.results, this.errors);
    }
  }

  /**
   * 执行单个任务
   * @param {AsyncExecutorTask} task 任务对象
   * @private
   */
  async executeTask(task) {
    this.running++;

    // 创建AbortController用于取消任务
    const controller = new AbortController();
    this.abortControllers.set(task.id, controller);

    try {
      // 添加超时处理
      let timeoutId;
      const timeoutPromise = this.options.timeout > 0
        ? new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`Task timed out after ${this.options.timeout}ms`));
            }, this.options.timeout);
          })
        : null;

      // 执行任务
      const resultPromise = this.fn(...task.args, { signal: controller.signal });

      // 如果设置了超时，则使用Promise.race
      const result = timeoutPromise
        ? await Promise.race([resultPromise, timeoutPromise])
        : await resultPromise;

      // 清除超时计时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 任务成功完成
      this.results.push({ id: task.id, result });
      this.options.onSuccess(result, task.id);
      task.resolve(result);
    } catch (error) {
      // 判断是否需要重试
      if (task.retries < this.options.retries && !this.isAborted && !controller.signal.aborted) {
        task.retries++;

        // 延迟后重新添加到队列
        setTimeout(() => {
          this.queue.unshift(task);
          this.running--;
          this.abortControllers.delete(task.id);
          this.processQueue();
        }, this.options.retryDelay);

        return;
      }

      // 达到最大重试次数或任务被取消
      this.errors.push({ id: task.id, error });
      this.options.onError(error, task.id);
      task.reject(error);

      // 如果设置了错误中止，则中止所有任务
      if (this.options.abortOnError) {
        this.abort();
      }
    } finally {
      // 如果任务已完成（不是重试），则清理资源
      if (!task.retries || task.retries >= this.options.retries) {
        this.running--;
        this.abortControllers.delete(task.id);
        this.processQueue();
      }
    }
  }

  /**
   * 清空结果和错误记录
   * @returns {AsyncExecutor} 返回this以支持链式调用
   */
  clearHistory() {
    this.results = [];
    this.errors = [];
    return this;
  }

  /**
   * 获取当前队列长度
   * @returns {number} 队列长度
   */
  get queueSize() {
    return this.queue.length;
  }

  /**
   * 获取当前运行中的任务数
   * @returns {number} 运行中的任务数
   */
  get runningCount() {
    return this.running;
  }

  /**
   * 获取是否所有任务都已完成
   * @returns {boolean} 是否所有任务都已完成
   */
  get isIdle() {
    return this.running === 0 && this.queue.length === 0;
  }
}