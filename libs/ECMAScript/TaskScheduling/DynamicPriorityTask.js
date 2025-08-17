/**
 * 动态优先级任务
 * @param {string} id 任务ID
 * @param {number} basePriority 基础优先级
 */
class DynamicPriorityTask {
  /**
   * @property {string} id 任务ID
   * @property {number} basePriority 基础优先级
   * @property {number} currentPriority 动态调整的优先级
   * @property {number} arrivalTime 任务到达时间
   * @property {number} executeTime 实际执行时间
   * @property {'pending' | 'running' | 'completed'} status 任务状态
   */
  constructor(id, basePriority) {
    /**
     * @desc 任务ID
     * @type {string}
     */
    this.id = id;
    /**
     * @desc 基础优先级
     * @type {number}
     */
    this.basePriority = basePriority;
    /**
     * @desc 动态调整的优先级
     * @type {number}
     */
    this.currentPriority = basePriority;
    /**
     * @desc 任务到达时间
     * @type {number}
     */
    this.arrivalTime = Date.now();
    /**
     * @desc 实际执行时间
     * @type {number}
     */
    this.executeTime = 0;
    /**
     * @desc 任务状态
     * @type {'pending' | 'running' | 'completed'}
     */
    this.status = 'pending';
  }

  /**
   * 动态更新优先级（核心逻辑）
   * @param {number} currentTime 当前时间
   */
  updatePriority(currentTime) {
    const waitingTime = currentTime - this.arrivalTime;

    // 动态提升逻辑：等待时间越长，优先级提升越大
    const priorityBoost = Math.min(
      10, // 最大提升幅度（防饥饿机制）
      waitingTime * 0.005 // 等待时间系数（每毫秒提升0.005）
    );

    this.currentPriority = this.basePriority + priorityBoost;
  }
}

/**
 * 动态优先级调度器
 * @param {Object} options 配置选项
 * @param {number} [options.concurrency=1] 并发数
 * @param {number} [options.starvationThreshold=5000] 饥饿判定阈值（毫秒）
 * @param {boolean} [options.debug=false] 是否开启调试日志
 */
class DynamicPriorityScheduler {
  /**
   * @property {DynamicPriorityTask[]} queue 任务队列
   * @property {DynamicPriorityTask|null} activeTask 当前活动任务
   * @property {number} concurrency 并发数
   * @property {number} starvationThreshold 饥饿判定阈值（毫秒）
   * @property {boolean} debug 是否开启调试日志
   */
  constructor(options = { concurrency: 1, starvationThreshold: 5000, debug: false }) {
    /**
     * @desc 任务队列
     * @type {DynamicPriorityTask[]}
     * @private
     */
    this.queue = [];
    /**
     * @desc 当前活动任务
     * @type {DynamicPriorityTask|null}
     * @private
     */
    this.activeTask = null;
    /**
     * @desc 并发数
     * @type {number}
     */
    this.concurrency = options.concurrency || 1;
    /**
     * @desc 饥饿判定阈值（毫秒）
     * @type {number}
     */
    this.starvationThreshold = options.starvationThreshold || 5000;
    /**
     * @desc 是否开启调试日志
     * @type {boolean}
     */
    this.debug = options.debug || false;
  }

  /**
   * 添加任务（支持优先级）
   * @param {DynamicPriorityTask} task 任务
   */
  addTask(task) {
    // 高优先级任务插队逻辑
    if (this.queue.length > 0 && task.currentPriority > this.queue[0].currentPriority) {
      if (this.debug) {
        console.log(`📊 高优先级任务插队: ${task.id} (优先级${task.currentPriority.toFixed(2)})`);
      }
      this.queue.unshift(task);
    } else {
      this.queue.push(task);
      if (this.debug) {
        console.log(`➕ 添加任务: ${task.id} (优先级${task.currentPriority.toFixed(2)})`);
      }
    }
    this._schedule();
  }

  /**
   * 紧急任务插队方法
   * @param {DynamicPriorityTask} task 任务
   */
  addUrgentTask(task) {
    if (this.debug) {
      console.log(`🚨 紧急任务插队: ${task.id} (优先级${task.basePriority})`);
    }
    this.queue.unshift(task); // 直接插入队列头部
    this._schedule();
  }

  /**
   * 调度执行核心逻辑
   * @private
   */
  _schedule() {
    // 跳过已有正在执行的任务
    if (this.activeTask || this.queue.length === 0) return;

    // 更新所有任务优先级
    const now = Date.now();
    this.queue.forEach(task => task.updatePriority(now));

    // 按动态优先级排序（数值越大优先级越高）
    this.queue.sort((a, b) => b.currentPriority - a.currentPriority);

    // 检查任务饥饿状态
    const starvedTask = this.queue.find(task =>
      (now - task.arrivalTime) > this.starvationThreshold
    );

    if (starvedTask) {
      if (this.debug) {
        console.log(`⚠️ 任务饥饿提升: ${starvedTask.id} 等待${now - starvedTask.arrivalTime}ms`);
      }
      starvedTask.currentPriority = 10; // 饥饿任务提升至最高优先级
      this.queue.sort((a, b) => b.currentPriority - a.currentPriority);
    }

    // 执行最高优先级任务
    this.activeTask = this.queue.shift();
    this.activeTask.status = 'running';
    this.activeTask.executeTime = now;

    if (this.debug) {
      console.log(`▶️ 执行任务: ${this.activeTask.id} | ` +
        `动态优先级: ${this.activeTask.currentPriority.toFixed(2)} | ` +
        `等待时间: ${now - this.activeTask.arrivalTime}ms`);
    }

    // 模拟任务执行（实际应用替换为真实逻辑）
    setTimeout(() => this._completeTask(), 1000);
  }

  /**
   * 完成任务
   * @private
   */
  _completeTask() {
    if (!this.activeTask) return;

    if (this.debug) {
      console.log(`✅ 完成任务: ${this.activeTask.id}`);
    }
    this.activeTask.status = 'completed';
    this.activeTask = null;
    this._schedule(); // 继续调度
  }

  /**
   * 获取队列状态（调试用）
   * @returns {Array<{id: string, priority: string, waiting: number}>} 队列状态
   */
  getQueueStatus() {
    return this.queue.map(task => ({
      id: task.id,
      priority: task.currentPriority.toFixed(2),
      waiting: Date.now() - task.arrivalTime
    }));
  }
}

// 示例运行函数
function runDynamicPriorityExample() {
  const scheduler = new DynamicPriorityScheduler({ concurrency: 1, debug: true }); // 单线程调度

  // 添加初始任务
  scheduler.addTask(new DynamicPriorityTask('T1', 3)); // 中优先级
  scheduler.addTask(new DynamicPriorityTask('T2', 1)); // 低优先级
  scheduler.addTask(new DynamicPriorityTask('T3', 2)); // 中低优先级

  // 添加高优先级任务（正常添加）
  setTimeout(() => {
    scheduler.addTask(new DynamicPriorityTask('T4', 5)); // 高优先级
  }, 1500);

  // 添加紧急任务（插队执行）
  setTimeout(() => {
    const urgentTask = new DynamicPriorityTask('URGENT', 1);
    urgentTask.basePriority = 8; // 提升基础优先级
    scheduler.addUrgentTask(urgentTask);
  }, 3000);

  // 添加饥饿任务演示
  setTimeout(() => {
    const longTask = new DynamicPriorityTask('STARVED', 1);
    scheduler.addTask(longTask);

    // 10秒后查看饥饿任务状态
    setTimeout(() => {
      if (scheduler.debug) {
        console.log('饥饿任务状态:', scheduler.getQueueStatus());
      }
    }, 10000);
  }, 500);
}

export { DynamicPriorityTask, DynamicPriorityScheduler, runDynamicPriorityExample };
