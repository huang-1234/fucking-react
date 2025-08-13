class LazyRoomSystem extends MeetingRoomSystem {
  constructor(size) {
    super(size);
    this.dirty = false; // 标记是否需要重建
  }

  bookRoom(start, end) {
    if (super.bookRoom(start, end) > 0) {
      // 不立即重建，仅标记脏状态
      this.dirty = true;
      return true;
    }
    return false;
  }

  cancelBooking(bookingId) {
    if (super.cancelBooking(bookingId)) {
      this.dirty = true;
      return true;
    }
    return false;
  }

  // 重写查询方法，按需重建
  isAvailable(start, end) {
    if (this.dirty) this._rebuild();
    return super.isAvailable(start, end);
  }

  // 重写可视化方法
  visualize() {
    if (this.dirty) this._rebuild();
    super.visualize();
  }

  // 实际重建方法
  _rebuild() {
    super._rebuildArray();
    this.dirty = false;
  }
  compressTimeSlots() {
    // 压缩差分数组中的连续零值
    let compressed = [];
    let count = 0;

    for (let i = 0;i < this.diff.length;i++) {
      if (this.diff[i] === 0) {
        count++;
      } else {
        if (count > 0) {
          compressed.push({ value: 0, count });
          count = 0;
        }
        compressed.push(this.diff[i]);
      }
    }

    // 更新数据
    this.compressedDiff = compressed;
    this.compressed = true;
  }

  expandTimeSlots() {
    // 解压缩差分数组
    let expanded = [];

    for (const item of this.compressedDiff) {
      if (typeof item === 'number') {
        expanded.push(item);
      } else {
        expanded.push(...Array(item.count).fill(0));
      }
    }

    this.diff = expanded;
    this.compressed = false;
    this._rebuildArray();
  }
}