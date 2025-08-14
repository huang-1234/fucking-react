// user-behavior-analytics.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UserBehaviorAnalytics, type UserOperation } from './user-behavior-analytics';

describe('UserBehaviorAnalytics', () => {
  let analytics: UserBehaviorAnalytics;
  const now = new Date('2023-10-01T10:00:00');

  beforeEach(() => {
    // 固定当前时间
    vi.useFakeTimers();
    vi.setSystemTime(now);

    // 创建分析系统，使用1分钟的时间槽，共12个槽（12分钟）
    analytics = new UserBehaviorAnalytics(1, 12);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 测试记录操作
  it('should record operations correctly', () => {
    const operation: UserOperation = {
      userId: 'user1',
      operation: 'shelf',
      itemCount: 10,
      timestamp: new Date(now)
    };

    analytics.recordOperation(operation);

    const trend = analytics.getOperationTrend('shelf');
    expect(trend[0].count).toBe(1);
    expect(trend[0].quantity).toBe(10);
  });

  // 测试批量操作统计
  it('should calculate batch operation stats', () => {
    const operations: UserOperation[] = [
      { userId: 'user1', operation: 'shelf', itemCount: 5, timestamp: new Date(now) },
      { userId: 'user1', operation: 'shelf', itemCount: 15, timestamp: new Date(now) },
      { userId: 'user1', operation: 'shelf', itemCount: 10, timestamp: new Date(now) },
      { userId: 'user2', operation: 'delete', itemCount: 20, timestamp: new Date(now) },
    ];

    operations.forEach(op => analytics.recordOperation(op));

    const stats = analytics.getBatchOperationStats();

    const shelfStats = stats.find(s => s.operation === 'shelf');
    expect(shelfStats?.avgBatchSize).toBe(10); // (5+15+10)/3
    expect(shelfStats?.maxBatchSize).toBe(15);
    expect(shelfStats?.minBatchSize).toBe(5);

    const deleteStats = stats.find(s => s.operation === 'delete');
    expect(deleteStats?.avgBatchSize).toBe(20);
  });

  // 测试时间槽更新
  it('should update time slots correctly', () => {
    // 记录第0分钟的操作
    analytics.recordOperation({
      userId: 'user1',
      operation: 'shelf',
      itemCount: 10,
      timestamp: new Date(now)
    });

    // 前进到第1分钟
    vi.advanceTimersByTime(60 * 1000);

    // 记录第1分钟的操作
    analytics.recordOperation({
      userId: 'user1',
      operation: 'shelf',
      itemCount: 5,
      timestamp: new Date(now.getTime() + 60 * 1000)
    });

    const trend = analytics.getOperationTrend('shelf');
    expect(trend[0].count).toBe(1); // 第0分钟
    expect(trend[0].quantity).toBe(10);
    expect(trend[1].count).toBe(1); // 第1分钟
    expect(trend[1].quantity).toBe(5);
  });

  // 测试时间槽回绕
  it('should handle slot wrap-around', () => {
    // 记录第0分钟的操作
    analytics.recordOperation({
      userId: 'user1',
      operation: 'shelf',
      itemCount: 10,
      timestamp: new Date(now)
    });

    // 前进到第12分钟（回绕到第0分钟）
    vi.advanceTimersByTime(12 * 60 * 1000);

    // 记录第12分钟的操作（应该覆盖第0分钟）
    analytics.recordOperation({
      userId: 'user1',
      operation: 'shelf',
      itemCount: 5,
      timestamp: new Date(now.getTime() + 12 * 60 * 1000)
    });

    const trend = analytics.getOperationTrend('shelf');
    expect(trend[0].count).toBe(1); // 第0分钟（新数据）
    expect(trend[0].quantity).toBe(5);
    expect(trend[11].count).toBe(0); // 最后分钟应该被清空
  });

  // 测试高峰时段检测
  it('should detect peak operation slots', () => {
    // 在第0分钟记录3次操作
    for (let i = 0; i < 3; i++) {
      analytics.recordOperation({
        userId: 'user1',
        operation: 'shelf',
        itemCount: 5,
        timestamp: new Date(now)
      });
    }

    // 在第5分钟记录1次操作
    vi.advanceTimersByTime(5 * 60 * 1000);
    analytics.recordOperation({
      userId: 'user1',
      operation: 'shelf',
      itemCount: 10,
      timestamp: new Date(now.getTime() + 5 * 60 * 1000)
    });

    const peakSlots = analytics.getPeakOperationSlots('shelf');
    expect(peakSlots[0].slotIndex).toBe(0); // 最高峰在第0分钟
    expect(peakSlots[0].count).toBe(3);
    expect(peakSlots[1].slotIndex).toBe(5); // 次高峰在第5分钟
    expect(peakSlots[1].count).toBe(1);
  });

  // 测试热力图数据生成
  it('should generate operation heatmap data', () => {
    // 记录不同操作类型
    analytics.recordOperation({
      userId: 'user1',
      operation: 'shelf',
      itemCount: 10,
      timestamp: new Date(now)
    });

    analytics.recordOperation({
      userId: 'user1',
      operation: 'delete',
      itemCount: 5,
      timestamp: new Date(now)
    });

    const heatmap = analytics.getOperationHeatmap();

    /**
     * @desc 操作类型
     */
    const shelfData = heatmap.find((h: any) => h.operation === 'shelf');

    expect(shelfData?.slots[0].count).toBe(1);

    const deleteData = heatmap.find(h => h.operation === 'delete');
    expect(deleteData?.slots[0].count).toBe(1);
  });

  // 测试时间槽时间范围计算
  it('should calculate slot time ranges correctly', () => {
    const slot0 = analytics.getSlotTimeRange(0);
    /**
     * @TODO:
     */
    expect(slot0.start.toISOString()).toBe('2023-10-01T02:00:00.000Z');
    expect(slot0.end.toISOString()).toBe('2023-10-01T02:01:00.000Z');

    const slot5 = analytics.getSlotTimeRange(5);
    expect(slot5.start.toISOString()).toBe('2023-10-01T02:05:00.000Z');
    expect(slot5.end.toISOString()).toBe('2023-10-01T02:06:00.000Z');
  });
});