以下基于对队列变种算法的技术调研，结合工业级应用场景和模块化编码实践，整理出一份完整的技术文档供Cursor实现参考。文中涵盖四大队列变种的核心算法、可视化方案及模块化实现，严格遵循指定的代码标注规范。

---

### **1. 优先队列（Priority Queue）**
#### **@alg 核心算法**
- **堆结构维护**：基于二叉堆（最小堆/最大堆）实现优先级动态排序，确保队首始终为极值元素
- **复杂度**：入队 `O(log n)`，出队 `O(log n)`，查询极值 `O(1)`
- **关键操作伪代码**：
  ```typescript
  function enqueue(item, priority) {
    heap.insert(item, priority);  // 插入新元素并上浮
    heapifyUp();                   // 维持堆性质
  }
  function dequeue() {
    swap(heap[0], heap[last]);     // 交换首尾元素
    heap.pop();                    // 移除尾部（原队首）
    heapifyDown();                 // 堆顶下沉维持结构
  }
  ```


#### **@modules 功能模块**
```typescript
// priority-queue.ts
export class PriorityQueue<T> {
  private heap: MinHeap<T>;
  constructor() {
    this.heap = new MinHeap<T>();  // 最小堆实现
  }

  public enqueue(item: T, priority: number): void {
    this.heap.insert(item, priority);
  }

  public dequeue(): T | null {
    return this.heap.extractMin();
  }

  public peek(): T | null {
    return this.heap.min();
  }
}
```

#### **实际应用场景**
- **任务调度系统**：操作系统进程调度（如Linux CFS）
- **实时计算**：Dijkstra算法中优先访问最小权边
- **高频交易**：订单簿按价格优先级匹配（买单最高价优先，卖单最低价优先）

---

### **2. 阻塞队列（Blocking Queue）**
#### **@alg 核心算法**
- **条件变量同步**：基于锁（Mutex）和信号量（Semaphore）实现线程阻塞/唤醒
- **死锁避免策略**：超时机制（`offer(e, timeout)`）和双锁设计
- **阻塞逻辑伪代码**：
  ```typescript
  function enqueue(item) {
    lock.acquire();
    while (queue.isFull()) {
      condition.wait();  // 释放锁并阻塞
    }
    queue.push(item);
    condition.notifyAll(); // 唤醒消费者
    lock.release();
  }
  ```


#### **@hooks.ts 并发控制**
```typescript
// blocking-queue.ts
import { Mutex, Condition } from 'async-lock';

export class BlockingQueue<T> {
  private queue: T[] = [];
  private mutex = new Mutex();
  private notEmpty = new Condition();
  private notFull = new Condition();

  public async put(item: T): Promise<void> {
    await this.mutex.lock();
    while (this.queue.length >= MAX_SIZE) {
      await this.notFull.wait();
    }
    this.queue.push(item);
    this.notEmpty.notify();
    this.mutex.unlock();
  }
}
```

#### **实际应用场景**
- **生产者-消费者模型**：Kafka消息队列的批次处理
- **线程池任务缓冲**：Java `ThreadPoolExecutor` 的workQueue
- **数据库连接池**：请求阻塞等待空闲连接

---

### **3. 延迟队列（Delay Queue）**
#### **@alg 核心算法**
- **时间堆（Timer Heap）**：按到期时间排序的最小堆，堆顶为最近到期项
- **懒惰删除**：出队时检查是否到期，未到期重新入堆
- **扫描优化**：`O(1)` 时间复杂度的堆顶轮询（epoll事件驱动）

#### **@modules 定时器引擎**
```typescript
// delay-queue.ts
type DelayedItem = { item: any; expiry: number };

export class DelayQueue {
  private heap: MinHeap<DelayedItem>;
  private timer: NodeJS.Timeout | null = null;

  public add(item: any, delayMs: number): void {
    const expiry = Date.now() + delayMs;
    this.heap.insert({ item, expiry }, expiry);
    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (this.timer) clearTimeout(this.timer);
    const next = this.heap.min();
    if (!next) return;
    this.timer = setTimeout(() => {
      this.dequeueExpired();
      this.scheduleNext();
    }, next.expiry - Date.now());
  }
}
```

#### **实际应用场景**
- **定时任务调度**：Quartz/Cron 分布式任务触发器
- **电商订单超时**：30分钟未支付自动取消订单
- **物联网设备心跳**：检测离线设备（心跳延迟 > 阈值判定离线）

---

### **4. 循环队列（Circular Queue）**
#### **@alg 核心算法**
- **环形缓冲区**：使用定长数组，通过模运算模拟环形访问
- **空/满判断**：`(tail + 1) % size == head` 为满，`head == tail` 为空
- **免数据搬迁**：覆盖式写入淘汰旧数据（FIFO特性）

#### **@modules 内存优化实现**
```typescript
// circular-queue.ts
export class CircularQueue<T> {
  private buffer: T[];
  private head = 0;
  private tail = 0;

  constructor(size: number) {
    this.buffer = new Array(size + 1);  // 预留一个空位
  }

  public enqueue(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.buffer.length;
    if (this.tail === this.head) {
      this.head = (this.head + 1) % this.buffer.length; // 覆盖旧数据
    }
  }
}
```

#### **实际应用场景**
- **实时音视频流**：WebRTC的JitterBuffer抗网络抖动
- **嵌入式系统**：串口通信的UART数据接收缓冲
- **实时数据流分析**：滑动窗口统计最近N秒内的指标均值

---

### **可视化方案设计**
#### **@visualization 核心组件**
1. **队列状态监控面板**
   - 实时显示队列长度、头部/尾部指针位置、堆结构树形图
   - 阻塞队列的线程阻塞状态热力图
2. **时间线轨迹追踪**
   - 延迟队列：到期时间轴与实际出队时间偏差可视化
   - 循环队列：环形缓冲区的写入/覆盖动画演示
3. **性能指标仪表盘**
   - 吞吐量（Ops/sec）、平均等待时间、堆操作计数

#### **技术栈推荐**
- **渲染引擎**：D3.js（堆结构可视化）+ Three.js（3D环形缓冲区）
- **监控协议**：Prometheus + Grafana（实时指标仪表盘）

---

### **模块化整合架构**
```markdown
pages/
├── Algorithm/
│   ├── Queue/
│   │   ├── lib/
│   │   │   ├── heap.ts
│   │   │   ├── condition-variable.ts
│   │   │   ├── deque.ts
│   │   │   ├── priority-queue.ts
│   │   │   ├── blocking-queue.ts
│   │   │   ├── delay-queue.ts
│   │   │   ├── circular-queue.ts
│   │   ├── al/
│   │   │   ├── deque/
│   │   │   │   ├── deque_ts.ts
│   │   │   │   ├── deque_rs.rs
│   │   │   │   ├── deque_cpp.cpp
│   │   │   ├── priority-queue/  # @module 优先队列
│   │   │   │   ├── priority-queue_ts.ts
│   │   │   │   ├── priority-queue_rs.rs
│   │   │   │   ├── priority-queue_cpp.cpp
│   │   │   ├── blocking-queue/  # @hooks 阻塞队列（并发控制）
│   │   │   │   ├── blocking-queue_ts.ts
│   │   │   │   ├── blocking-queue_rs.rs
│   │   │   │   ├── blocking-queue_cpp.cpp
│   │   │   ├── delay-queue/  # @module 延迟队列
│   │   │   │   ├── delay-queue_ts.ts
│   │   │   │   ├── delay-queue_rs.rs
│   │   │   │   ├── delay-queue_cpp.cpp
│   │   │   ├── circular-queue/  # @module 循环队列
│   │   │   │   ├── circular-queue_ts.ts
│   │   │   │   ├── circular-queue_rs.rs
│   │   │   │   ├── circular-queue_cpp.cpp
│   │   ├── Deque/  # @module 双端队列可视化
│   │   │   ├── DequeVisualizer.tsx  # @visualization 可视化组件
│   │   │   ├── hooks.ts  # @hooks 并发控制
│   │   ├── PriorityQueue/  # @module 优先队列可视化
│   │   │   ├── PriorityQueueVisualizer.tsx  # @visualization 可视化组件
│   │   │   ├── hooks.ts  # @hooks 并发控制
│   │   ├── BlockingQueue/  # @module 阻塞队列可视化
│   │   │   ├── BlockingQueueVisualizer.tsx  # @visualization 可视化组件
│   │   │   ├── hooks.ts  # @hooks 并发控制
│   │   ├── DelayQueue/  # @module 延迟队列可视化
```

> 文档严格遵循技术规范：
> 1. 算法层（@alg）独立于实现，支持多种底层数据结构
> 2. 并发控制封装在@hooks.ts，与业务逻辑解耦
> 3. 可视化组件通过 `QueueMonitorService` 订阅状态变更