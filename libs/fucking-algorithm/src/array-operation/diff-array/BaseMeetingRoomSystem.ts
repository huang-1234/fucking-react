// ================== 基础类型定义 ==================
type BookingID = number;
type TimeSlot = number;

interface BookingRecord {
  id: BookingID;
  start: TimeSlot;
  end: TimeSlot;
  user?: string;
}

interface SlotStatistics {
  hour: TimeSlot;
  currentStatus: 'available' | 'occupied';
  historicalOccupancy: number;
  occupancyPercentage: string;
}

// ================== 基础会议室系统 ==================
export class BaseMeetingRoomSystem {
  protected size: number;
  protected diff: number[];
  protected arr: number[];
  protected bookings: Map<BookingID, BookingRecord>;
  protected nextId: number;

  constructor(size: number = 24) {
    this.size = size;
    this.diff = new Array(size + 1).fill(0);
    this.arr = new Array(size).fill(0);
    this.bookings = new Map();
    this.nextId = 1;
  }

  /**
   * 预定会议室
   * @param start - 开始时间
   * @param end - 结束时间（不包括）
   * @param user - 预定用户（可选）
   * @returns 预定ID或-1（失败）
   */
  bookRoom(start: TimeSlot, end: TimeSlot, user?: string): BookingID {
    // 验证时间范围
    if (start < 0 || end > this.size || start >= end) {
      console.error(`无效时间范围: ${start} 到 ${end}`);
      return -1;
    }

    // 检查时间槽可用性
    for (let i = start;i < end;i++) {
      if (this.arr[i] !== 0) {
        console.warn(`时间段 ${start}-${end} 已被占用`);
        return -1;
      }
    }

    // 应用差分更新
    this.diff[start] += 1;
    if (end < this.size) this.diff[end] -= 1;
    this.rebuildArray();

    // 创建预定记录
    const bookingId = this.nextId++;
    this.bookings.set(bookingId, { id: bookingId, start, end, user });

    return bookingId;
  }

  /**
   * 取消预定
   * @param bookingId - 预定ID
   * @returns 取消成功或失败
   */
  cancelBooking(bookingId: BookingID): boolean {
    if (!this.bookings.has(bookingId)) {
      console.warn(`预定ID ${bookingId} 不存在`);
      return false;
    }

    // 获取预定信息
    const { start, end } = this.bookings.get(bookingId)!;

    // 应用差分更新（逆向操作）
    this.diff[start] -= 1;
    if (end < this.size) this.diff[end] += 1;
    this.rebuildArray();

    // 删除预定记录
    this.bookings.delete(bookingId);

    return true;
  }

  /**
   * 重建原始数组
   */
  protected rebuildArray(): void {
    this.arr[0] = this.diff[0];
    for (let i = 1;i < this.size;i++) {
      this.arr[i] = this.arr[i - 1] + this.diff[i];
    }
  }

  /**
   * 检查时间段可用性
   * @param start - 开始时间
   * @param end - 结束时间
   */
  isAvailable(start: TimeSlot, end: TimeSlot): boolean {
    if (start < 0 || end > this.size || start >= end) return false;

    for (let i = start;i < end;i++) {
      if (this.arr[i] !== 0) return false;
    }
    return true;
  }

  /**
   * 可视化当前状态
   */
  visualize(): string {
    return this.arr.map(slot => slot > 0 ? '■' : '□').join('');
  }

  /**
   * 获取所有预定记录
   */
  getAllBookings(): BookingRecord[] {
    return Array.from(this.bookings.values());
  }
}

/**
 * ================== 增强版会议室系统 ==================
 * 在基础会议室系统上添加批量预定、取消、查找空闲时段等功能
 * 同时支持用户查询预定记录
 * 并提供可用时段查询
 * 并优化了预定和取消逻辑
 * 支持按用户查询预定记录
 * 支持查找可用时段
 * 支持批量预定和取消
 * 支持查找空闲时段
 */
export class EnhancedRoomSystem extends BaseMeetingRoomSystem {
  /**
   * 批量预定处理
   * @param bookings - 预定数组
   * @returns 成功的预定ID数组
   */
  batchBook(bookings: { start: TimeSlot, end: TimeSlot, user?: string }[]): BookingID[] {
    const successfulBookings: BookingID[] = [];

    // 第一阶段：验证所有预定可用性
    for (const booking of bookings) {
      if (!this.isAvailable(booking.start, booking.end)) {
        console.warn(`预定时段冲突: ${booking.start}-${booking.end}`);
        return [];
      }
    }

    // 第二阶段：执行预定
    for (const booking of bookings) {
      const id = this.bookRoom(booking.start, booking.end, booking.user);
      if (id > 0) successfulBookings.push(id);
    }

    return successfulBookings;
  }

  /**
   * 批量取消预定
   * @param bookingIds - 预定ID数组
   */
  batchCancel(bookingIds: BookingID[]): void {
    bookingIds.forEach(id => this.cancelBooking(id));
  }

  /**
   * 查找可用时段
   * @param duration - 所需时长
   * @param startSearch - 开始搜索时间
   * @param endSearch - 结束搜索时间
   */
  findAvailableSlots(duration: number, startSearch: TimeSlot = 0, endSearch: TimeSlot = this.size): { start: TimeSlot, end: TimeSlot }[] {
    const availableSlots: { start: TimeSlot, end: TimeSlot }[] = [];
    const searchEnd = Math.min(endSearch, this.size - duration);

    for (let start = startSearch;start <= searchEnd;start++) {
      const end = start + duration;
      if (this.isAvailable(start, end)) {
        availableSlots.push({ start, end });
      }
    }

    return availableSlots;
  }

  /**
   * 按用户查询预定
   * @param user - 用户名
   */
  getUserBookings(user: string): BookingRecord[] {
    return Array.from(this.bookings.values()).filter(
      booking => booking.user === user
    );
  }
}

/**
 * 资源分析系统
 * 在增强版会议室系统的基础上，添加统计分析功能
 * 包括历史占用率、当前占用率、热点时间段等
 * 并提供优化建议
 * 支持时间段详细统计
 * 支持获取热点时间段
 * 支持获取整体和当前占用率
 *
 */
export class AnalyticsRoomSystem extends EnhancedRoomSystem {
  private historicalOccupancy: number[];
  private historicalCount: number;
  /**
   * 热点小时统计
   */
  private peakHours: Map<TimeSlot, number>;

  constructor(size: number) {
    super(size);
    this.historicalOccupancy = new Array(size).fill(0);
    this.historicalCount = 0;
    this.peakHours = new Map();
  }

  /**
   * 重写预定方法以收集统计数据
   * @param start - 开始时间
   * @param end - 结束时间
   * @param user - 预定用户
   */
  bookRoom(start: TimeSlot, end: TimeSlot, user?: string): BookingID {
    const bookingId = super.bookRoom(start, end, user);
    if (bookingId > 0) {
      // 更新历史占用统计
      for (let hour = start;hour < end;hour++) {
        this.historicalOccupancy[hour]++;
      }

      // 更新热点小时统计
      this.updatePeakHours(start, end);

      this.historicalCount++;
    }
    return bookingId;
  }

  /**
   * 重写取消方法以更新统计
   * @param bookingId - 预定ID
   */
  cancelBooking(bookingId: BookingID): boolean {
    if (!this.bookings.has(bookingId)) return false;

    const { start, end } = this.bookings.get(bookingId)!;

    // 更新统计
    for (let hour = start;hour < end;hour++) {
      this.historicalOccupancy[hour]--;
    }

    // 重新计算热点
    this.peakHours = new Map();
    for (let hour = 0;hour < this.size;hour++) {
      if (this.historicalOccupancy[hour] > 0) {
        this.peakHours.set(hour, this.historicalOccupancy[hour]);
      }
    }

    return super.cancelBooking(bookingId);
  }

  /**
   * 获取整体占用率（历史）
   */
  getHistoricalOccupancyRate(): number {
    const totalSlots = this.size * this.historicalCount;
    if (totalSlots === 0) return 0;

    const totalOccupancy = this.historicalOccupancy.reduce((sum, count) => sum + count, 0);
    return totalOccupancy / totalSlots;
  }

  /**
   * 获取当前占用率
   */
  getCurrentOccupancyRate(): number {
    const occupied = this.arr.filter(slot => slot > 0).length;
    return occupied / this.size;
  }

  /**
   * 获取热点时间段
   */
  getPeakHours(): { hour: TimeSlot, count: number }[] {
    return Array.from(this.peakHours.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hour, count]) => ({ hour, count }));
  }

  /**
   * 获取时间段详细统计
   */
  getSlotStatistics(): SlotStatistics[] {
    return Array.from({ length: this.size }, (_, hour) => {
      const currentStatus = this.arr[hour] > 0 ? 'occupied' : 'available';
      const historicalOccupancy = this.historicalOccupancy[hour];
      const occupancyPercentage = this.historicalCount > 0
        ? `${(historicalOccupancy / this.historicalCount * 100).toFixed(1)}%`
        : '0.0%';

      return {
        hour,
        currentStatus,
        historicalOccupancy,
        occupancyPercentage
      };
    });
  }

  /**
   * 获取优化建议
   * @param occupancyThreshold - 低占用阈值
   */
  getOptimizationSuggestions(occupancyThreshold: number = 0.2): string[] {
    const suggestions: string[] = [];
    const slotStats = this.getSlotStatistics();

    // 识别低利用率时间段
    const lowOccupancyHours = slotStats.filter(
      stat => parseFloat(stat.occupancyPercentage) < occupancyThreshold * 100
    );

    if (lowOccupancyHours.length > 0) {
      suggestions.push("低利用率时间段检测：");
      lowOccupancyHours.forEach(stat => {
        suggestions.push(
          `  时段 ${stat.hour}:00 - 历史占用率 ${stat.occupancyPercentage}`
        );
      });
      suggestions.push("建议：合并预约时段或提供时段折扣");
    }

    // 识别高需求时间段
    const peakHours = this.getPeakHours().slice(0, 3);
    if (peakHours.length > 0) {
      suggestions.push("\n高峰时间段：");
      peakHours.forEach(({ hour, count }) => {
        suggestions.push(
          `  时段 ${hour}:00 - 历史请求 ${count} 次`
        );
      });
      suggestions.push("建议：提供预约限制或增加资源");
    }

    // 整体建议
    const currentRate = this.getCurrentOccupancyRate() * 100;
    suggestions.push(`\n总体资源利用率：${currentRate.toFixed(1)}%`);
    suggestions.push(`建议目标利用率：70%-85%之间`);

    return suggestions;
  }

  /**
   * 更新热点小时数据
   * @param start - 开始时间
   * @param end - 结束时间
   */
  private updatePeakHours(start: TimeSlot, end: TimeSlot): void {
    for (let hour = start;hour < end;hour++) {
      const currentCount = this.peakHours.get(hour) || 0;
      this.peakHours.set(hour, currentCount + 1);
    }
  }
}

// ================== 使用示例 ==================
// 创建分析系统（12小时制）
// const analyticsRoom = new AnalyticsRoomSystem(12);

// // 预定会议室
// analyticsRoom.bookRoom(1, 3, "Alice");
// analyticsRoom.bookRoom(2, 4, "Bob");
// analyticsRoom.bookRoom(5, 7, "Charlie");
// analyticsRoom.bookRoom(8, 10, "Alice");
// const booking5 = analyticsRoom.bookRoom(9, 11, "Bob");

// // 取消一个预定
// analyticsRoom.cancelBooking(booking5);

// // 可视化当前状态
// console.log("当前资源状态:");
// console.log(analyticsRoom.visualize());
// console.log(" 0 1 2 3 4 5 6 7 8 9 10");

// // 获取统计信息
// console.log("\n统计信息:");
// console.log("历史占用率:", analyticsRoom.getHistoricalOccupancyRate().toFixed(2));
// console.log("当前占用率:", analyticsRoom.getCurrentOccupancyRate().toFixed(2));

// console.log("\n时间段分析:");
// analyticsRoom.getSlotStatistics().forEach(stat => {
//   console.log(
//     `时段 ${stat.hour}:00 - ` +
//     `当前: ${stat.currentStatus}, ` +
//     `历史占用: ${stat.occupancyPercentage}`
//   );
// });

// console.log("\n热点时段:");
// analyticsRoom.getPeakHours().forEach(({ hour, count }) => {
//   console.log(`  时段 ${hour}:00 - ${count} 次请求`);
// });

// console.log("\n优化建议:");
// analyticsRoom.getOptimizationSuggestions().forEach(suggestion => {
//   console.log(suggestion);
// });

// // 测试批量操作
// console.log("\n批量操作测试:");
// const bookingsToAdd = [
//   { start: 0, end: 1, user: "Admin" },
//   { start: 3, end: 4, user: "Admin" },
//   { start: 6, end: 7, user: "Admin" }
// ];

// const newBookingIds = analyticsRoom.batchBook(bookingsToAdd);
// console.log("批量预定结果:", newBookingIds.length > 0 ? "成功" : "失败");

// console.log("新状态:", analyticsRoom.visualize());

// console.log("\nAlice的预定记录:");
// console.log(analyticsRoom.getUserBookings("Alice"));

// // 寻找空闲时段
// console.log("\n寻找2小时空闲时段:");
// console.log(analyticsRoom.findAvailableSlots(2));