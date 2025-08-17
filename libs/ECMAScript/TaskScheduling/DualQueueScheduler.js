class DualQueueScheduler {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.normalQueue = [];   // 普通队列
    this.urgentQueue = [];   // 紧急队列
    this.running = 0;
  }

  // 添加普通任务
  addNormalTask(task) {
    // 包装一下task
    const wrappedTask = async () => {
      try {
        return await task();
      } catch (error) {

      }
    };

    this.normalQueue.push(wrappedTask);
    this._schedule();
  }

  // 添加紧急任务（插队）
  addUrgentTask(task) {
    this.urgentQueue.push(task);
    this._schedule();
  }

  _schedule() {
    while (this.running < this.concurrency &&
          (this.urgentQueue.length > 0 || this.normalQueue.length > 0)) {
      // 优先执行紧急队列
      const task = this.urgentQueue.length > 0
        ? this.urgentQueue.shift()
        : this.normalQueue.shift();

      this.running++;
      task().finally(() => {
        this.running--;
        this._schedule();
      });
    }
  }
}

(function test() {
  const scheduler = new DualQueueScheduler(2);
  scheduler.addNormalTask(() => new Promise(resolve => setTimeout(() => resolve('normal'), 1000)));
  scheduler.addUrgentTask(() => new Promise(resolve => setTimeout(() => resolve('urgent'), 500)));
  scheduler.addNormalTask(() => new Promise(resolve => setTimeout(() => resolve('normal2'), 1000)));
  scheduler.addUrgentTask(() => new Promise(resolve => setTimeout(() => resolve('urgent2'), 500)));
})()