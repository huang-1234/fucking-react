/**
 * 双队列调度器
 * @param {Object} options 配置选项
 * @param {number} [options.concurrency=2] 并发数
 * @param {boolean} [options.debug=false] 是否开启调试日志
 */
class DualQueueScheduler {
  /**
   * @property {number} concurrency 并发数
   * @property {Array<() => Promise<any>>} normalQueue 普通队列
   * @property {Array<() => Promise<any>>} urgentQueue 紧急队列
   * @property {number} running 正在运行的任务数
   * @property {boolean} debug 是否开启调试日志
   */
  constructor(options = { concurrency: 2, debug: false }) {
    /**
     * @desc 并发数
     * @type {number}
     */
    this.concurrency = options.concurrency || 2;
    /**
     * @desc 普通队列
     * @type {Array<() => Promise<any>>}
     * @private
     */
    this.normalQueue = [];
    /**
     * @desc 紧急队列
     * @type {Array<() => Promise<any>>}
     * @private
     */
    this.urgentQueue = [];
    /**
     * @desc 正在运行的任务数
     * @type {number}
     * @private
     */
    this.running = 0;
    /**
     * @desc 是否开启调试日志
     * @type {boolean}
     */
    this.debug = options.debug || false;
  }

  /**
   * 添加普通任务
   * @param {() => Promise<any>} task 任务函数
   * @returns {Promise<any>} 任务执行结果
   */
  addNormalTask(task) {
    return new Promise((resolve, reject) => {
      // 包装任务，添加错误处理和结果传递
      const wrappedTask = async () => {
        try {
          if (this.debug) {
            console.log(`🔵 执行普通任务`);
          }
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          if (this.debug) {
            console.error(`❌ 普通任务执行失败:`, error);
          }
          reject(error);
          throw error;
        } finally {
          if (this.debug) {
            console.log(`✓ 普通任务完成`);
          }
        }
      };

      if (this.debug) {
        console.log(`➕ 添加普通任务到队列, 当前队列长度: ${this.normalQueue.length}`);
      }
      this.normalQueue.push(wrappedTask);
      this._schedule();
    });
  }

  /**
   * 添加紧急任务（插队）
   * @param {() => Promise<any>} task 任务函数
   * @returns {Promise<any>} 任务执行结果
   */
  addUrgentTask(task) {
    return new Promise((resolve, reject) => {
      // 包装任务，添加错误处理和结果传递
      const wrappedTask = async () => {
        try {
          if (this.debug) {
            console.log(`🔴 执行紧急任务`);
          }
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          if (this.debug) {
            console.error(`❌ 紧急任务执行失败:`, error);
          }
          reject(error);
          throw error;
        } finally {
          if (this.debug) {
            console.log(`✓ 紧急任务完成`);
          }
        }
      };

      if (this.debug) {
        console.log(`🚨 添加紧急任务到队列, 当前队列长度: ${this.urgentQueue.length}`);
      }
      this.urgentQueue.push(wrappedTask);
      this._schedule();
    });
  }

  /**
   * 调度执行
   * @private
   */
  _schedule() {
    if (this.debug) {
      console.log(`📊 调度状态: 运行中${this.running}/${this.concurrency}, 紧急队列${this.urgentQueue.length}, 普通队列${this.normalQueue.length}`);
    }

    while (this.running < this.concurrency &&
          (this.urgentQueue.length > 0 || this.normalQueue.length > 0)) {
      // 优先执行紧急队列
      const task = this.urgentQueue.length > 0
        ? this.urgentQueue.shift()
        : this.normalQueue.shift();

      this.running++;

      // 执行任务并在完成后减少运行计数，继续调度
      task().finally(() => {
        this.running--;
        this._schedule();
      });
    }
  }

  /**
   * 获取队列状态
   * @returns {{running: number, urgentQueueLength: number, normalQueueLength: number}} 队列状态
   */
  getStatus() {
    return {
      running: this.running,
      urgentQueueLength: this.urgentQueue.length,
      normalQueueLength: this.normalQueue.length
    };
  }
}

/**
 * 运行示例
 */
function runDualQueueExample() {
  const scheduler = new DualQueueScheduler({ concurrency: 2, debug: true });

  console.log('启动双队列调度器示例...');

  // 添加普通任务
  scheduler.addNormalTask(() =>
    new Promise(resolve => setTimeout(() => {
      console.log('普通任务1完成');
      resolve('normal1');
    }, 1000))
  );

  // 添加紧急任务
  scheduler.addUrgentTask(() =>
    new Promise(resolve => setTimeout(() => {
      console.log('紧急任务1完成');
      resolve('urgent1');
    }, 500))
  );

  // 添加更多任务
  scheduler.addNormalTask(() =>
    new Promise(resolve => setTimeout(() => {
      console.log('普通任务2完成');
      resolve('normal2');
    }, 1000))
  );

  scheduler.addUrgentTask(() =>
    new Promise(resolve => setTimeout(() => {
      console.log('紧急任务2完成');
      resolve('urgent2');
    }, 500))
  );

  // 添加失败任务
  scheduler.addNormalTask(() =>
    new Promise((_, reject) => setTimeout(() => {
      console.log('普通任务3失败');
      reject(new Error('任务失败示例'));
    }, 800))
  ).catch(err => console.log('捕获到错误:', err.message));
}

export { DualQueueScheduler, runDualQueueExample };