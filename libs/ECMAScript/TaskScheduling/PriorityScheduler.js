/**
 * 优先级任务
 * @typedef {Object} PriorityTask
 * @property {() => Promise<any>} task 任务函数
 * @property {number} priority 优先级（数值越大优先级越高）
 * @property {string} [id] 任务ID
 */

/**
 * 优先级调度器
 * @param {Object} options 配置选项
 * @param {number} [options.concurrency=2] 最大并发数
 * @param {boolean} [options.debug=false] 是否开启调试日志
 */
class PriorityScheduler {
  /**
   * @property {number} concurrency 最大并发数
   * @property {Array<PriorityTask>} queue 优先级队列
   * @property {number} running 运行中任务数
   * @property {boolean} debug 是否开启调试日志
   */
  constructor(options = { concurrency: 2, debug: false }) {
    /**
     * @desc 最大并发数
     * @type {number}
     */
    this.concurrency = options.concurrency || 2;
    /**
     * @desc 优先级队列（数组存储）
     * @type {Array<PriorityTask>}
     * @private
     */
    this.queue = [];
    /**
     * @desc 运行中任务数
     * @type {number}
     * @private
     */
    this.running = 0;
    /**
     * @desc 是否开启调试日志
     * @type {boolean}
     */
    this.debug = options.debug || false;
    /**
     * @desc 任务计数器（用于生成唯一ID）
     * @type {number}
     * @private
     */
    this.taskCounter = 0;
  }

  /**
   * 添加任务（支持优先级）
   * @param {() => Promise<any>} task 任务函数
   * @param {number} [priority=0] 优先级（数值越大优先级越高）
   * @param {string} [taskId] 任务ID（可选，如不提供则自动生成）
   * @returns {Promise<any>} 任务执行结果
   */
  addTask(task, priority = 0, taskId) {
    return new Promise((resolve, reject) => {
      // 生成任务ID
      const id = taskId || `task-${++this.taskCounter}`;

      // 包装任务，添加错误处理和结果传递
      const wrappedTask = async () => {
        try {
          if (this.debug) {
            console.log(`▶️ 执行任务: ${id} (优先级: ${priority})`);
          }
          const result = await task();
          if (this.debug) {
            console.log(`✅ 任务完成: ${id}`);
          }
          resolve(result);
          return result;
        } catch (error) {
          if (this.debug) {
            console.error(`❌ 任务失败: ${id}`, error);
          }
          reject(error);
          // 不要重新抛出错误，因为它已经被reject处理了
        }
      };

      // 创建任务包装对象
      const taskWrapper = { task: wrappedTask, priority, id };

      // 按优先级降序插入（优先数越大，优先级越高）
      let index = this.queue.findIndex(t => t.priority < priority);
      if (index === -1) {
        this.queue.push(taskWrapper);
        if (this.debug) {
          console.log(`➕ 添加任务: ${id} (优先级: ${priority}) 到队列末尾`);
        }
      } else {
        this.queue.splice(index, 0, taskWrapper);
        if (this.debug) {
          console.log(`➕ 添加任务: ${id} (优先级: ${priority}) 到队列位置 ${index}`);
        }
      }

      this._schedule();
    });
  }

  /**
   * 调度执行
   * @private
   */
  _schedule() {
    if (this.debug) {
      console.log(`📊 调度状态: 运行中${this.running}/${this.concurrency}, 队列长度${this.queue.length}`);
      if (this.queue.length > 0) {
        console.log(`📋 队列内容: ${this.queue.map(t => `${t.id}(${t.priority})`).join(', ')}`);
      }
    }

    while (this.running < this.concurrency && this.queue.length > 0) {
      const { task, id, priority } = this.queue.shift(); // 取出最高优先级任务

      if (this.debug) {
        console.log(`🔄 调度任务: ${id} (优先级: ${priority})`);
      }

      this.running++;

      task().finally(() => {
        this.running--;
        this._schedule(); // 递归调度
      });
    }
  }

  /**
   * 获取队列状态
   * @returns {{running: number, queueLength: number, queuedTasks: Array<{id: string, priority: number}>}} 队列状态
   */
  getStatus() {
    return {
      running: this.running,
      queueLength: this.queue.length,
      queuedTasks: this.queue.map(({ id, priority }) => ({ id, priority }))
    };
  }
}

/**
 * 运行示例
 */
function runPriorityExample() {
  const scheduler = new PriorityScheduler({ concurrency: 2, debug: true });

  console.log('启动优先级调度器示例...');

  // 添加低优先级任务
  scheduler.addTask(
    () => new Promise(resolve => setTimeout(() => resolve('低优先级任务结果'), 1000)),
    1,
    'low-priority'
  );

  // 添加中优先级任务
  scheduler.addTask(
    () => new Promise(resolve => setTimeout(() => resolve('中优先级任务结果'), 800)),
    5,
    'medium-priority'
  );

  // 添加高优先级任务
  scheduler.addTask(
    () => new Promise(resolve => setTimeout(() => resolve('高优先级任务结果'), 500)),
    10,
    'high-priority'
  );

  // 添加失败任务
  scheduler.addTask(
    () => new Promise((_, reject) => setTimeout(() => reject(new Error('任务执行失败')), 300)),
    3,
    'failing-task'
  ).catch(err => console.log('捕获到错误:', err.message));

  // 添加更多任务测试队列
  setTimeout(() => {
    scheduler.addTask(
      () => new Promise(resolve => setTimeout(() => resolve('延迟高优先级任务'), 300)),
      8,
      'delayed-high'
    );
  }, 200);
}

export { PriorityScheduler, runPriorityExample };