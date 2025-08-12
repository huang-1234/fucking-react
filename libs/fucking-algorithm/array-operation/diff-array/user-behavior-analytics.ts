// user-behavior-analytics.ts

// 操作类型定义
type OperationType = 'shelf' | 'unshelf' | 'delete';

// 用户操作记录
export interface UserOperation {
  userId: string;
  operation: OperationType;
  itemCount: number; // 操作的商品数量
  timestamp: Date;
}

// 时间区间定义
type TimeSlot = number; // 时间槽索引

// 用户行为分析系统
export class UserBehaviorAnalytics {
  // 时间槽大小（分钟）
  private readonly slotSize: number;

  // 存储每个时间槽的操作计数
  private operationCounts: Map<OperationType, number[]> = new Map();

  // 存储每个时间槽的操作量（商品数量）
  private operationQuantities: Map<OperationType, number[]> = new Map();

  // 用户操作历史
  private operationHistory: UserOperation[] = [];

  // 时间槽数量
  private readonly slotCount: number;

  // 当前时间槽索引
  private currentSlotIndex: number = 0;

  // 时间槽起始时间
  private slotStartTime: Date;

  /**
   * 初始化用户行为分析系统
   * @param slotSize 时间槽大小（分钟）
   * @param slotCount 时间槽数量
   */
  constructor(slotSize: number = 5, slotCount: number = 12) {
    /**
     * @desc 时间槽数量
     * @default 12
     */
    this.slotCount = slotCount;
    /**
     * @desc 时间槽大小（分钟）
     * @default 5
     */
    this.slotSize = slotSize;

    this.slotCount = slotCount;
    /**
     * @desc 时间槽起始时间
     * @default new Date()
     */
    this.slotStartTime = new Date();

    // 初始化操作计数和操作量数组
    const operationTypes: OperationType[] = ['shelf', 'unshelf', 'delete'];
    operationTypes.forEach(type => {
      this.operationCounts.set(type, new Array(slotCount).fill(0));
      this.operationQuantities.set(type, new Array(slotCount).fill(0));
    });

    // 启动定时器更新当前时间槽
    setInterval(() => this.updateCurrentSlot(), slotSize * 60 * 1000);
  }

  /**
   * 记录用户操作
   * @param operation 用户操作
   */
  recordOperation(operation: UserOperation): void {
    // 更新当前时间槽
    this.updateCurrentSlot();

    // 添加到历史记录
    this.operationHistory.push(operation);

    // 获取当前操作类型的计数和操作量数组
    const counts = this.operationCounts.get(operation.operation);
    const quantities = this.operationQuantities.get(operation.operation);

    if (!counts || !quantities) return;

    // 更新当前时间槽的计数和操作量
    counts[this.currentSlotIndex]++;
    quantities[this.currentSlotIndex] += operation.itemCount;
  }

  /**
   * 获取高频操作时间段
   * @param operationType 操作类型
   * @param n 返回前n个高峰时段
   */
  getPeakOperationSlots(
    operationType: OperationType,
    n: number = 3
  ): { slotIndex: number, count: number, quantity: number }[] {
    const counts = this.operationCounts.get(operationType);
    const quantities = this.operationQuantities.get(operationType);

    if (!counts || !quantities) return [];

    // 创建带索引的数组
    const slotsWithData = counts.map((count, index) => ({
      slotIndex: index,
      count,
      quantity: quantities[index]
    }));

    // 按操作次数降序排序
    return slotsWithData
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }

  /**
   * 获取操作趋势数据
   * @param operationType 操作类型
   */
  getOperationTrend(operationType: OperationType): { count: number, quantity: number }[] {
    const counts = this.operationCounts.get(operationType);
    const quantities = this.operationQuantities.get(operationType);

    if (!counts || !quantities) return [];

    return counts.map((count, index) => ({
      count,
      quantity: quantities[index]
    }));
  }

  /**
   * 获取用户操作热力图数据
   */
  getOperationHeatmap(): {
    operation: OperationType,
    slots: { slotIndex: number, count: number }[]
  }[] {
    const result: {
      operation: OperationType,
      slots: { slotIndex: number, count: number }[]
    }[] = [];

    for (const [operation, counts] of this.operationCounts) {
      const slots = counts.map((count, index) => ({
        slotIndex: index,
        count
      }));

      result.push({ operation, slots });
    }

    return result;
  }

  /**
   * 获取批量操作统计
   */
  getBatchOperationStats(): {
    operation: OperationType,
    avgBatchSize: number,
    maxBatchSize: number,
    minBatchSize: number
  }[] {
    const statsMap = new Map<OperationType, {
      totalItems: number,
      operationCount: number,
      maxBatchSize: number,
      minBatchSize: number
    }>();

    // 初始化统计对象
    const operationTypes: OperationType[] = ['shelf', 'unshelf', 'delete'];
    operationTypes.forEach(type => {
      statsMap.set(type, {
        totalItems: 0,
        operationCount: 0,
        maxBatchSize: 0,
        minBatchSize: Infinity
      });
    });

    // 遍历历史记录计算统计
    for (const operation of this.operationHistory) {
      const stats = statsMap.get(operation.operation);
      if (!stats) continue;

      stats.totalItems += operation.itemCount;
      stats.operationCount++;

      if (operation.itemCount > stats.maxBatchSize) {
        stats.maxBatchSize = operation.itemCount;
      }

      if (operation.itemCount < stats.minBatchSize) {
        stats.minBatchSize = operation.itemCount;
      }
    }

    // 转换为结果数组
    return Array.from(statsMap.entries()).map(([operation, stats]) => ({
      operation,
      avgBatchSize: stats.operationCount > 0
        ? stats.totalItems / stats.operationCount
        : 0,
      maxBatchSize: stats.maxBatchSize,
      minBatchSize: stats.minBatchSize === Infinity ? 0 : stats.minBatchSize
    }));
  }

  /**
   * 更新当前时间槽
   */
  private updateCurrentSlot(): void {
    const now = new Date();
    const elapsedMinutes = Math.floor(
      (now.getTime() - this.slotStartTime.getTime()) / (60 * 1000)
    );

    // 计算当前时间槽索引
    const newSlotIndex = Math.floor(elapsedMinutes / this.slotSize) % this.slotCount;

    // 如果时间槽发生变化，需要清空旧时间槽的数据
    if (newSlotIndex !== this.currentSlotIndex) {
      const slotsToClear = this.calculateSlotsToClear(this.currentSlotIndex, newSlotIndex);

      // 清空过期时间槽的数据
      for (const operationType of this.operationCounts.keys()) {
        const counts = this.operationCounts.get(operationType);
        const quantities = this.operationQuantities.get(operationType);

        if (counts && quantities) {
          for (const slot of slotsToClear) {
            counts[slot] = 0;
            quantities[slot] = 0;
          }
        }
      }

      this.currentSlotIndex = newSlotIndex;
    }
  }

  /**
   * 计算需要清空的时间槽
   * @param current 当前时间槽
   * @param next 下一个时间槽
   */
  private calculateSlotsToClear(current: number, next: number): number[] {
    const slotsToClear: number[] = [];

    // 如果时间槽是连续前进的
    if (next > current) {
      for (let i = current + 1;i <= next;i++) {
        slotsToClear.push(i);
      }
    }
    // 如果时间槽回绕（从尾部回到头部）
    else if (next < current) {
      for (let i = current + 1;i < this.slotCount;i++) {
        slotsToClear.push(i);
      }
      for (let i = 0;i <= next;i++) {
        slotsToClear.push(i);
      }
    }

    return slotsToClear;
  }

  /**
   * 获取时间槽的时间范围
   * @param slotIndex 时间槽索引
   */
  getSlotTimeRange(slotIndex: number): { start: Date, end: Date } {
    const start = new Date(this.slotStartTime);
    start.setMinutes(start.getMinutes() + slotIndex * this.slotSize);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + this.slotSize);

    return { start, end };
  }
}