// ecommerce-logistics-system.ts

// 类型定义
type ProductID = string;
type UserID = string;
type TimeSlot = number; // 时间槽（小时）
type LocationID = string;

export interface Product {
  id: ProductID;
  name: string;
  basePrice: number;
}

export interface Order {
  id: string;
  userId: UserID;
  products: { productId: ProductID; quantity: number }[];
  createdAt: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Promotion {
  id: string;
  productId: ProductID;
  discount: number; // 折扣百分比 (0-1)
  startTime: Date;
  endTime: Date;
}

export interface DeliveryRoute {
  id: string;
  origin: LocationID;
  destination: LocationID;
  capacity: number; // 最大配送量
}

export interface UserActivity {
  userId: UserID;
  activityType: 'view' | 'add_to_cart' | 'purchase';
  productId?: ProductID;
  timestamp: Date;
}

// 电子商务物流系统
export class ECommerceLogisticsSystem {
  // 库存管理
  private inventoryDiff: Map<ProductID, number[]> = new Map();
  private inventoryBase: Map<ProductID, number> = new Map();

  // 订单处理
  private orderProcessingTimes: Map<string, [Date, Date | null]> = new Map();

  // 配送调度
  private deliveryRoutes: Map<string, DeliveryRoute> = new Map();
  private deliverySchedules: Map<string, Map<TimeSlot, number[]>> = new Map();

  // 促销活动
  private promotions: Promotion[] = [];
  private promotionActiveMap: Map<ProductID, boolean[]> = new Map();

  // 用户行为分析
  private userActivityDiff: Map<UserID, Map<TimeSlot, number>> = new Map();

  /**
   * @desc 时间槽数量（默认24小时）
   * @default 24
   */
  private timeSlots: number;

  constructor(timeSlots: number = 24) {
    this.timeSlots = timeSlots;
  }

  // ================== 库存管理 ==================

  /**
   * 添加新产品
   * @param product 产品信息
   * @param initialStock 初始库存
   */
  addProduct(product: Product, initialStock: number): void {
    this.inventoryBase.set(product.id, initialStock);
    this.inventoryDiff.set(product.id, new Array(this.timeSlots).fill(0));
  }

  /**
   * 更新库存（进货/销售）
   * @param productId 产品ID
   * @param quantity 数量（正数为进货，负数为销售）
   * @param timeSlot 时间槽
   */
  updateInventory(productId: ProductID, quantity: number, timeSlot: TimeSlot): void {
    const diff = this.inventoryDiff.get(productId);
    if (!diff) throw new Error(`Product ${productId} not found`);

    if (timeSlot < 0 || timeSlot >= this.timeSlots) {
      throw new Error(`Invalid time slot: ${timeSlot}`);
    }

    diff[timeSlot] += quantity;
  }

  /**
   * 获取当前库存
   * @param productId 产品ID
   * @param timeSlot 时间槽
   */
  getCurrentInventory(productId: ProductID, timeSlot: TimeSlot): number {
    const base = this.inventoryBase.get(productId);
    const diff = this.inventoryDiff.get(productId);

    if (base === undefined || !diff) {
      throw new Error(`Product ${productId} not found`);
    }

    let currentStock = base;
    for (let i = 0; i <= timeSlot; i++) {
      currentStock += diff[i];
    }

    return currentStock;
  }

  /**
   * 获取库存变化历史
   * @param productId 产品ID
   */
  getInventoryHistory(productId: ProductID): number[] {
    const base = this.inventoryBase.get(productId);
    const diff = this.inventoryDiff.get(productId);

    if (base === undefined || !diff) {
      throw new Error(`Product ${productId} not found`);
    }

    const history: number[] = [];
    let currentStock = base;

    for (let i = 0; i < this.timeSlots; i++) {
      currentStock += diff[i];
      history.push(currentStock);
    }

    return history;
  }

  // ================== 订单处理 ==================

  /**
   * 创建新订单
   * @param order 订单信息
   */
  createOrder(order: Order): void {
    if (order.status !== 'pending') {
      throw new Error('New orders must have "pending" status');
    }

    // 检查库存
    for (const item of order.products) {
      const currentStock = this.getCurrentInventory(item.productId, this.getCurrentTimeSlot());
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // 预留库存
    for (const item of order.products) {
      this.updateInventory(item.productId, -item.quantity, this.getCurrentTimeSlot());
    }

    this.orderProcessingTimes.set(order.id, [new Date(), null]);
  }

  /**
   * 更新订单状态
   * @param orderId 订单ID
   * @param newStatus 新状态
   */
  updateOrderStatus(orderId: string, newStatus: Order['status']): void {
    const times = this.orderProcessingTimes.get(orderId);
    if (!times) throw new Error(`Order ${orderId} not found`);

    const [startTime, endTime] = times;

    if (newStatus === 'processing' && !endTime) {
      // 开始处理
      this.orderProcessingTimes.set(orderId, [startTime, new Date()]);
    } else if (newStatus === 'cancelled') {
      // 取消订单，恢复库存
      const order = this.getOrderById(orderId);
      for (const item of order.products) {
        this.updateInventory(item.productId, item.quantity, this.getCurrentTimeSlot());
      }
    }
  }

  /**
   * 获取订单处理时间（分钟）
   * @param orderId 订单ID
   */
  getOrderProcessingTime(orderId: string): number | null {
    const times = this.orderProcessingTimes.get(orderId);
    if (!times) return null;

    const [startTime, endTime] = times;
    if (!endTime) return null;

    return (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  }

  /**
   * 获取平均订单处理时间
   */
  getAverageProcessingTime(): number {
    let totalTime = 0;
    let count = 0;

    for (const [_, times] of this.orderProcessingTimes) {
      const [startTime, endTime] = times;
      if (endTime) {
        totalTime += (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        count++;
      }
    }

    return count > 0 ? totalTime / count : 0;
  }

  // 辅助方法：获取当前时间槽
  getCurrentTimeSlot(): TimeSlot {
    const now = new Date();
    return now.getHours() % this.timeSlots;
  }

  // 辅助方法：获取订单（模拟）
  private getOrderById(orderId: string): Order {
    // 实际实现中应从数据库获取
    return {
      id: orderId,
      userId: 'user1',
      products: [{ productId: 'prod1', quantity: 1 }],
      createdAt: new Date(),
      status: 'pending'
    };
  }

  // ================== 配送调度 ==================

  /**
   * 添加配送路线
   * @param route 配送路线
   */
  addDeliveryRoute(route: DeliveryRoute): void {
    this.deliveryRoutes.set(route.id, route);
    this.deliverySchedules.set(route.id, new Map());
  }

  /**
   * 安排配送
   * @param routeId 路线ID
   * @param timeSlot 时间槽
   * @param quantity 配送量
   */
  scheduleDelivery(routeId: string, timeSlot: TimeSlot, quantity: number): void {
    const route = this.deliveryRoutes.get(routeId);
    if (!route) throw new Error(`Route ${routeId} not found`);

    if (timeSlot < 0 || timeSlot >= this.timeSlots) {
      throw new Error(`Invalid time slot: ${timeSlot}`);
    }

    let schedule = this.deliverySchedules.get(routeId);
    if (!schedule) {
      schedule = new Map();
      this.deliverySchedules.set(routeId, schedule);
    }

    if (!schedule.has(timeSlot)) {
      schedule.set(timeSlot, new Array(this.timeSlots).fill(0));
    }

    const diff = schedule.get(timeSlot)!;
    diff[timeSlot] += quantity;

    // 检查是否超过容量
    const currentLoad = this.getCurrentDeliveryLoad(routeId, timeSlot);
    if (currentLoad > route.capacity) {
      // 回滚
      diff[timeSlot] -= quantity;
      throw new Error(`Exceeds capacity for route ${routeId} at time slot ${timeSlot}`);
    }
  }

  /**
   * 获取当前配送负载
   * @param routeId 路线ID
   * @param timeSlot 时间槽
   */
  getCurrentDeliveryLoad(routeId: string, timeSlot: TimeSlot): number {
    const schedule = this.deliverySchedules.get(routeId);
    if (!schedule) return 0;

    let totalLoad = 0;

    for (const [slot, diff] of schedule) {
      if (slot <= timeSlot) {
        totalLoad += diff[slot];
      }
    }

    return totalLoad;
  }

  /**
   * 获取路线利用率
   * @param routeId 路线ID
   */
  getRouteUtilization(routeId: string): number {
    const route = this.deliveryRoutes.get(routeId);
    if (!route) return 0;

    let totalLoad = 0;
    const schedule = this.deliverySchedules.get(routeId);

    if (schedule) {
      for (const [_, diff] of schedule) {
        totalLoad += diff.reduce((sum, val) => sum + val, 0);
      }
    }

    const maxPossibleLoad = route.capacity * this.timeSlots;
    return maxPossibleLoad > 0 ? totalLoad / maxPossibleLoad : 0;
  }

  // ================== 促销活动 ==================

  /**
   * 添加促销活动
   * @param promotion 促销信息
   */
  addPromotion(promotion: Promotion): void {
    this.promotions.push(promotion);

    // 初始化促销活动映射
    if (!this.promotionActiveMap.has(promotion.productId)) {
      this.promotionActiveMap.set(promotion.productId, new Array(this.timeSlots).fill(false));
    }

    const activeMap = this.promotionActiveMap.get(promotion.productId)!;

    // 计算促销时间槽
    const startSlot = promotion.startTime.getHours() % this.timeSlots;
    const endSlot = promotion.endTime.getHours() % this.timeSlots;

    // 使用差分数组标记促销活动
    activeMap[startSlot] = true;
    /**
     * TODO:
     * 这里测试出现错误
     */
    if (endSlot + 1 < this.timeSlots) {
      activeMap[endSlot + 1] = false;
    }

    // 确保促销期间标记正确
    let currentActive = false;
    for (let i = 0; i < this.timeSlots; i++) {
      if (activeMap[i] !== undefined) {
        currentActive = activeMap[i];
      } else {
        activeMap[i] = currentActive;
      }
    }
  }

  /**
   * 检查产品在特定时间是否有促销
   * @param productId 产品ID
   * @param timeSlot 时间槽
   */
  isPromotionActive(productId: ProductID, timeSlot: TimeSlot): boolean {
    const activeMap = this.promotionActiveMap.get(productId);
    return activeMap ? activeMap[timeSlot] : false;
  }

  /**
   * 获取产品促销折扣
   * @param productId 产品ID
   * @param timeSlot 时间槽
   */
  getPromotionDiscount(productId: ProductID, timeSlot: TimeSlot): number {
    if (!this.isPromotionActive(productId, timeSlot)) return 0;

    // 查找当前有效的促销
    const currentPromotions = this.promotions.filter(p =>
      p.productId === productId &&
      this.isPromotionActive(productId, timeSlot)
    );

    // 返回最大折扣（如果有多个促销）
    return currentPromotions.length > 0
      ? Math.max(...currentPromotions.map(p => p.discount))
      : 0;
  }

  // ================== 用户行为分析 ==================

  /**
   * 记录用户行为
   * @param activity 用户行为
   */
  recordUserActivity(activity: UserActivity): void {
    const timeSlot = activity.timestamp.getHours() % this.timeSlots;

    if (!this.userActivityDiff.has(activity.userId)) {
      this.userActivityDiff.set(activity.userId, new Map());
    }

    const userActivities = this.userActivityDiff.get(activity.userId)!;

    if (!userActivities.has(timeSlot)) {
      userActivities.set(timeSlot, 0);
    }

    // 增加该时间槽的活动计数
    userActivities.set(timeSlot, userActivities.get(timeSlot)! + 1);
  }

  /**
   * 获取用户活跃时间段
   * @param userId 用户ID
   */
  getUserActivityPattern(userId: UserID): number[] {
    const userActivities = this.userActivityDiff.get(userId);
    if (!userActivities) return new Array(this.timeSlots).fill(0);

    const pattern = new Array(this.timeSlots).fill(0);

    for (const [slot, count] of userActivities) {
      pattern[slot] = count;
    }

    return pattern;
  }

  /**
   * 获取热门时间段
   */
  getPeakActivityHours(): { hour: TimeSlot, activity: number }[] {
    const totalActivity = new Array(this.timeSlots).fill(0);

    // 汇总所有用户的活动
    for (const userActivities of this.userActivityDiff.values()) {
      for (const [slot, count] of userActivities) {
        totalActivity[slot] += count;
      }
    }

    // 转换为排序后的数组
    return totalActivity
      .map((activity, hour) => ({ hour, activity }))
      .sort((a, b) => b.activity - a.activity);
  }

  /**
   * 获取用户相似度（基于活动模式）
   * @param userId1 用户ID1
   * @param userId2 用户ID2
   */
  getUserSimilarity(userId1: UserID, userId2: UserID): number {
    const pattern1 = this.getUserActivityPattern(userId1);
    const pattern2 = this.getUserActivityPattern(userId2);

    // 计算余弦相似度
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < this.timeSlots; i++) {
      dotProduct += pattern1[i] * pattern2[i];
      magnitude1 += pattern1[i] * pattern1[i];
      magnitude2 += pattern2[i] * pattern2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    return magnitude1 > 0 && magnitude2 > 0
      ? dotProduct / (magnitude1 * magnitude2)
      : 0;
  }
}