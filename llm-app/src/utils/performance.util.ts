import { Logger } from '@nestjs/common';

export class PerformanceTracker {
  private readonly logger: Logger;
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor(context: string) {
    this.logger = new Logger(context);
    this.startTime = Date.now();
  }

  /**
   * 记录一个检查点
   * @param name 检查点名称
   */
  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime);
    this.logger.log(`检查点 [${name}]: ${this.checkpoints.get(name)}ms`);
  }

  /**
   * 获取两个检查点之间的时间差
   * @param from 起始检查点名称
   * @param to 结束检查点名称
   */
  getTimeBetween(from: string, to: string): number | null {
    const fromTime = this.checkpoints.get(from);
    const toTime = this.checkpoints.get(to);

    if (fromTime === undefined || toTime === undefined) {
      return null;
    }

    return toTime - fromTime;
  }

  /**
   * 获取从开始到指定检查点的时间
   * @param checkpoint 检查点名称
   */
  getTimeToCheckpoint(checkpoint: string): number | null {
    const time = this.checkpoints.get(checkpoint);
    return time !== undefined ? time : null;
  }

  /**
   * 获取从开始到现在的总时间
   */
  getTotalTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * 打印性能报告
   */
  printReport(): void {
    this.logger.log('性能报告:');
    this.logger.log(`总时间: ${this.getTotalTime()}ms`);

    // 按时间顺序打印检查点
    const sortedCheckpoints = Array.from(this.checkpoints.entries())
      .sort((a, b) => a[1] - b[1]);

    sortedCheckpoints.forEach(([name, time], index) => {
      const previousTime = index > 0 ? sortedCheckpoints[index - 1][1] : 0;
      const timeSincePrevious = time - previousTime;

      this.logger.log(`[${name}]: ${time}ms (距上一检查点: +${timeSincePrevious}ms)`);
    });
  }

  /**
   * 重置性能跟踪器
   */
  reset(): void {
    this.startTime = Date.now();
    this.checkpoints.clear();
  }
}
