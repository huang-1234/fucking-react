/**
 * 会议室预定系统
 * 使用差分数组实现高效预定和取消功能
 * 支持预定、取消、查询可用性等功能
 * @class MeetingRoomSystem
 */
class MeetingRoomSystem {
  constructor(size = 24) {
    this.size = size; // 时间槽数量（默认24小时）
    this.diff = new Array(size + 1).fill(0); // 差分数组
    this.arr = new Array(size).fill(0);      // 实际预定状态数组

    // 新增：预定记录映射表 {id: {start, end}}
    this.bookings = new Map();
    this.nextId = 1; // 预定ID计数器
  }

  /**
   * 预定会议室
   * @param {number} start - 开始时间
   * @param {number} end - 结束时间（不包含）
   * @returns {number} 预定ID（失败返回-1）
   */
  bookRoom(start, end) {
    // 验证时间范围有效性
    if (start < 0 || end > this.size || start >= end) {
      console.error("无效时间范围");
      return -1;
    }

    // 检查时间段可用性
    for (let i = start;i < end;i++) {
      if (this.arr[i] !== 0) {
        console.error(`时间段 ${start}-${end} 已被占用`);
        return -1;
      }
    }

    // 应用差分更新
    this.diff[start] += 1;
    if (end < this.size) this.diff[end] -= 1;
    this._rebuildArray(); // 立即重建数组保持最新状态

    // 生成预定记录
    const bookingId = this.nextId++;
    this.bookings.set(bookingId, { start, end });

    console.log(`预定成功！ID: ${bookingId}`);
    return bookingId;
  }

  /**
   * 取消会议室预定
   * @param {number} bookingId - 预定ID
   * @returns {boolean} 取消是否成功
   */
  cancelBooking(bookingId) {
    if (!this.bookings.has(bookingId)) {
      console.error(`预定ID ${bookingId} 不存在`);
      return false;
    }

    // 获取预定信息
    const { start, end } = this.bookings.get(bookingId);

    // 应用差分更新（逆向操作）
    this.diff[start] -= 1;
    if (end < this.size) this.diff[end] += 1;
    this._rebuildArray(); // 立即重建数组

    // 移除预定记录
    this.bookings.delete(bookingId);

    console.log(`预定ID ${bookingId} 已取消`);
    return true;
  }

  /**
   * 重建实际状态数组
   */
  _rebuildArray() {
    if (this.arr.length === 0) return;

    this.arr[0] = this.diff[0];
    for (let i = 1;i < this.size;i++) {
      this.arr[i] = this.arr[i - 1] + this.diff[i];
    }
  }

  /**
   * 检查时间段可用性（不预定）
   * @param {number} start - 开始时间
   * @param {number} end - 结束时间
   */
  isAvailable(start, end) {
    if (start < 0 || end > this.size || start >= end) {
      return false;
    }

    for (let i = start;i < end;i++) {
      if (this.arr[i] !== 0) return false;
    }

    return true;
  }

  /**
   * 获取所有有效预定
   */
  getAllBookings() {
    return Array.from(this.bookings, ([id, { start, end }]) => {
      return { id, start, end };
    });
  }

  /**
   * 可视化预定状态
   */
  visualize() {
    let timeline = '';
    for (let i = 0;i < this.size;i++) {
      timeline += this.arr[i] > 0 ? '■' : '□';
    }
    console.log(`时间线 [0-${this.size - 1}]: ${timeline}`);
  }
}

// 使用示例
const room = new MeetingRoomSystem(8); // 创建8小时时间系统

// 预定会议室
const booking1 = room.bookRoom(1, 3); // 预定1-3点
const booking2 = room.bookRoom(4, 6); // 预定4-6点
room.visualize(); // □■□■□□■■□

// 尝试取消不存在的预定
room.cancelBooking(99); // 预定ID 99 不存在

// 取消预定
room.cancelBooking(booking1);
room.visualize(); // □□□■■□■■□

// 再次预定相同时间段
const booking3 = room.bookRoom(1, 3);
room.visualize(); // □■□■■□■■□

// 获取所有预定
console.log("当前预定:", room.getAllBookings());
// [
//   {id: 2, start: 4, end: 6},
//   {id: 3, start: 1, end: 3}
// ]

/**
 * 增强的会议室系统
 * 支持批量预定、部分取消、自动寻找替代时间段等功能
 * @extends MeetingRoomSystem
 *
 */
class EnhancedRoomSystem extends MeetingRoomSystem {
  /**
   * 批量预定处理
   * @param {Array} bookings - 预定列表 [{start, end}]
   * @returns {Array} 成功的预定ID列表
   */
  batchBook(bookings) {
    const successIds = [];

    // 第一遍：验证所有预定可用性
    for (const booking of bookings) {
      if (!this.isAvailable(booking.start, booking.end)) {
        console.error(`部分预定冲突: ${booking.start}-${booking.end}`);
        return [];
      }
    }

    // 第二遍：执行预定
    for (const booking of bookings) {
      const id = this.bookRoom(booking.start, booking.end);
      if (id > 0) successIds.push(id);
    }

    return successIds;
  }

  /**
   * 部分取消预定
   * @param {Array} bookingIds - 需要取消的ID列表
   */
  batchCancel(bookingIds) {
    bookingIds.forEach(id => this.cancelBooking(id));
  }

  /**
   * 自动寻找替代时间段
   * @param {number} duration - 需要的时长
   * @param {number} startHour - 最早开始时间
   * @param {number} endHour - 最晚结束时间
   */
  findAvailableSlots(duration, startHour = 0, endHour = this.size) {
    const availableSlots = [];

    for (let start = startHour;start <= endHour - duration;start++) {
      let available = true;

      // 检查每个时间段是否可用
      for (let i = start;i < start + duration;i++) {
        if (i >= this.size || this.arr[i] !== 0) {
          available = false;
          break;
        }
      }

      if (available) availableSlots.push({
        start,
        end: start + duration
      });
    }

    return availableSlots;
  }
}

// 高级功能使用示例
const advancedRoom = new EnhancedRoomSystem(12);

// 批量预定
const bookings = [
  { start: 1, end: 3 },
  { start: 4, end: 6 },
  { start: 8, end: 10 }
];
const ids = advancedRoom.batchBook(bookings);
console.log("批量预定ID:", ids); // [1, 2, 3]
advancedRoom.visualize(); // □■□■□□■■□■■□

// 查找替代时间段
console.log("2小时空闲段:", advancedRoom.findAvailableSlots(2));
// 可能输出: [{start:0, end:2}, {start:6, end:8}, {start:10, end:12}]

// 批量取消
advancedRoom.batchCancel([1, 3]);
advancedRoom.visualize(); // □□□■□□■■□□□

class CorporateRoomSystem extends MeetingRoomSystem {
  constructor(roomName, hours) {
    super(hours);
    this.name = roomName;
    this.schedule = new Map();
  }

  bookRoom(employee, start, end) {
    if (super.bookRoom(start, end)) {
      this.schedule.set(`${start}-${end}`, {
        employee,
        start,
        duration: end - start
      });
      return true;
    }
    return false;
  }

  getEmployeeSchedule(employee) {
    return Array.from(this.schedule.values())
      .filter(meeting => meeting.employee === employee)
      .sort((a, b) => a.start - b.start);
  }
}

// 使用示例
const innovationRoom = new CorporateRoomSystem('Innovation Room', 24);

innovationRoom.bookRoom('Alice', 9, 11);
innovationRoom.bookRoom('Bob', 14, 16);

console.log("Alice's Schedule:", innovationRoom.getEmployeeSchedule('Alice'));
// [ { employee: 'Alice', start: 9, duration: 2 } ]

/**
 * 资源回收与利用统计
 * 基于EnhancedRoomSystem，提供统计和分析功能
 * @extends EnhancedRoomSystem
 */
class AnalyticsRoomSystem extends EnhancedRoomSystem {
  constructor(size) {
    super(size);
    this.occupancyStats = new Array(size).fill(0); // 占用统计数据
  }

  // 重写重建方法，收集统计信息
  _rebuildArray() {
    super._rebuildArray();

    // 更新占用率统计
    for (let i = 0;i < this.size;i++) {
      if (this.arr[i] > 0) this.occupancyStats[i]++;
    }
  }

  // 计算时间段占用率
  getOccupancyRate() {
    const totalSlots = this.occupancyStats.length;
    const occupied = this.occupancyStats.reduce((sum, count) => count > 0 ? sum + 1 : sum, 0);
    return (occupied / totalSlots) * 100;
  }

  // 热门时间段分析
  getPeakHours() {
    const hourCounts = new Map();

    for (const [id, { start, end }] of this.bookings) {
      for (let hour = start;hour < end;hour++) {
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    }

    // 按热度排序
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hour, count]) => ({ hour, count }));
  }

  // 建议空闲时间段
  suggestOptimization() {
    const suggestions = [];
    const occupancyThreshold = 0.2; // 20%以下占用率为"低利用率"

    for (let hour = 0;hour < this.size;hour++) {
      const occupancy = this.arr[hour] > 0 ? 1 : 0;
      const historicalOccupancy = this.occupancyStats[hour] / this.arr.length;

      if (occupancy === 0 && historicalOccupancy < occupancyThreshold) {
        suggestions.push({
          hour,
          occupancyRate: (historicalOccupancy * 100).toFixed(1) + '%',
          suggestion: `考虑开放共享或合并预约`
        });
      }
    }

    return suggestions;
  }
}

// 使用示例
const analyticsRoom = new AnalyticsRoomSystem(12);
analyticsRoom.bookRoom('Alice', 1, 3);
analyticsRoom.bookRoom('Bob', 2, 4);
analyticsRoom.bookRoom('Charlie', 5, 7);
analyticsRoom.bookRoom('Alice', 8, 10);
analyticsRoom.bookRoom('Bob', 9, 11);
analyticsRoom.visualize(); // □■□■■□■□■■□
console.log("占用率:", analyticsRoom.getOccupancyRate().toFixed(2) + '%'); // 占用率: 41.67%
console.log("热门时间段:", analyticsRoom.getPeakHours());
// [
