/**
 * 条件变量和互斥锁的模拟实现
 * 用于阻塞队列的线程同步
 */

/**
 * 表示一个等待中的Promise
 */
interface Waiter<T = void> {
  /**
   * 解析Promise的函数
   */
  resolve: (value: T | PromiseLike<T>) => void;

  /**
   * 拒绝Promise的函数
   */
  reject: (reason?: any) => void;

  /**
   * 超时定时器ID
   */
  timeoutId?: NodeJS.Timeout;
}

/**
 * 互斥锁
 * 用于保护共享资源，确保同一时间只有一个线程可以访问
 */
export class Mutex {
  private locked = false;
  private waiters: Waiter[] = [];

  /**
   * 获取锁
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃获取锁
   * @returns 一个Promise，在获取锁时解析
   */
  async acquire(timeout?: number): Promise<void> {
    // 如果锁未被占用，立即获取
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve();
    }

    // 否则等待锁被释放
    return new Promise<void>((resolve, reject) => {
      const waiter: Waiter = { resolve, reject };

      // 如果设置了超时
      if (timeout !== undefined) {
        waiter.timeoutId = setTimeout(() => {
          // 从等待队列中移除
          const index = this.waiters.indexOf(waiter);
          if (index !== -1) {
            this.waiters.splice(index, 1);
          }
          reject(new Error('Mutex acquisition timed out'));
        }, timeout);
      }

      this.waiters.push(waiter);
    });
  }

  /**
   * 释放锁
   */
  release(): void {
    if (!this.locked) {
      throw new Error('Mutex not acquired');
    }

    // 如果有等待的线程，唤醒第一个
    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!;
      if (waiter.timeoutId) {
        clearTimeout(waiter.timeoutId);
      }
      waiter.resolve();
    } else {
      this.locked = false;
    }
  }

  /**
   * 检查锁是否被占用
   */
  isLocked(): boolean {
    return this.locked;
  }

  /**
   * 使用锁执行函数
   * @param fn 要在锁内执行的函数
   * @param timeout 获取锁的超时时间
   * @returns 函数的返回值
   */
  async withLock<T>(fn: () => Promise<T> | T, timeout?: number): Promise<T> {
    await this.acquire(timeout);
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/**
 * 条件变量
 * 用于线程之间的同步，允许线程等待特定条件变为真
 */
export class Condition {
  private waiters: Waiter[] = [];
  private mutex: Mutex;

  /**
   * 创建条件变量
   * @param mutex 与条件变量关联的互斥锁
   */
  constructor(mutex: Mutex) {
    this.mutex = mutex;
  }

  /**
   * 等待条件变为真
   * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃等待
   * @returns 一个Promise，在条件变量被通知时解析
   */
  async wait(timeout?: number): Promise<void> {
    if (!this.mutex.isLocked()) {
      throw new Error('Mutex must be locked before waiting on condition');
    }

    // 创建等待Promise
    const waitPromise = new Promise<void>((resolve, reject) => {
      const waiter: Waiter = { resolve, reject };

      // 如果设置了超时
      if (timeout !== undefined) {
        waiter.timeoutId = setTimeout(() => {
          // 从等待队列中移除
          const index = this.waiters.indexOf(waiter);
          if (index !== -1) {
            this.waiters.splice(index, 1);
          }
          reject(new Error('Condition wait timed out'));
        }, timeout);
      }

      this.waiters.push(waiter);
    });

    // 释放锁，允许其他线程修改条件
    this.mutex.release();

    try {
      // 等待条件变量被通知
      await waitPromise;
    } finally {
      // 重新获取锁
      await this.mutex.acquire();
    }
  }

  /**
   * 通知一个等待的线程
   */
  notify(): void {
    if (!this.mutex.isLocked()) {
      throw new Error('Mutex must be locked before notifying condition');
    }

    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!;
      if (waiter.timeoutId) {
        clearTimeout(waiter.timeoutId);
      }
      waiter.resolve();
    }
  }

  /**
   * 通知所有等待的线程
   */
  notifyAll(): void {
    if (!this.mutex.isLocked()) {
      throw new Error('Mutex must be locked before notifying condition');
    }

    for (const waiter of this.waiters) {
      if (waiter.timeoutId) {
        clearTimeout(waiter.timeoutId);
      }
      waiter.resolve();
    }
    this.waiters = [];
  }
}
