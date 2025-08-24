/**
 * 循环队列的Rust实现
 * 使用定长数组和头尾指针实现高效的FIFO队列
 */

/// 循环队列
pub struct CircularQueue<T> {
    /// 存储元素的缓冲区
    buffer: Vec<Option<T>>,
    /// 头指针位置
    head: usize,
    /// 尾指针位置
    tail: usize,
    /// 元素数量
    count: usize,
    /// 队列最大容量
    max_size: usize,
}

impl<T: Clone> CircularQueue<T> {
    /// 创建循环队列
    ///
    /// # Arguments
    ///
    /// * `capacity` - 队列容量
    ///
    /// # Returns
    ///
    /// 新创建的循环队列
    pub fn new(capacity: usize) -> Self {
        if capacity == 0 {
            panic!("Capacity must be positive");
        }

        CircularQueue {
            buffer: vec![None; capacity],
            head: 0,
            tail: 0,
            count: 0,
            max_size: capacity,
        }
    }

    /// 入队操作
    ///
    /// # Arguments
    ///
    /// * `item` - 要入队的元素
    ///
    /// # Returns
    ///
    /// 是否成功入队
    pub fn enqueue(&mut self, item: T) -> bool {
        if self.is_full() {
            return false;
        }

        self.buffer[self.tail] = Some(item);
        self.tail = (self.tail + 1) % self.max_size;
        self.count += 1;
        true
    }

    /// 出队操作
    ///
    /// # Returns
    ///
    /// 队首元素，如果队列为空则返回None
    pub fn dequeue(&mut self) -> Option<T> {
        if self.is_empty() {
            return None;
        }

        let item = self.buffer[self.head].take();
        self.head = (self.head + 1) % self.max_size;
        self.count -= 1;
        item
    }

    /// 查看队首元素但不移除
    ///
    /// # Returns
    ///
    /// 队首元素，如果队列为空则返回None
    pub fn front(&self) -> Option<T> {
        if self.is_empty() {
            return None;
        }

        self.buffer[self.head].clone()
    }

    /// 查看队尾元素但不移除
    ///
    /// # Returns
    ///
    /// 队尾元素，如果队列为空则返回None
    pub fn rear(&self) -> Option<T> {
        if self.is_empty() {
            return None;
        }

        // 计算尾部元素的索引
        let rear_index = (self.tail + self.max_size - 1) % self.max_size;
        self.buffer[rear_index].clone()
    }

    /// 检查队列是否为空
    ///
    /// # Returns
    ///
    /// 队列是否为空
    pub fn is_empty(&self) -> bool {
        self.count == 0
    }

    /// 检查队列是否已满
    ///
    /// # Returns
    ///
    /// 队列是否已满
    pub fn is_full(&self) -> bool {
        self.count == self.max_size
    }

    /// 获取队列大小
    ///
    /// # Returns
    ///
    /// 队列中的元素数量
    pub fn size(&self) -> usize {
        self.count
    }

    /// 获取队列容量
    ///
    /// # Returns
    ///
    /// 队列的最大容量
    pub fn capacity(&self) -> usize {
        self.max_size
    }

    /// 清空队列
    pub fn clear(&mut self) {
        for item in &mut self.buffer {
            *item = None;
        }
        self.head = 0;
        self.tail = 0;
        self.count = 0;
    }

    /// 获取队列中的所有元素（用于可视化）
    ///
    /// # Returns
    ///
    /// 队列中的所有元素
    pub fn get_items(&self) -> Vec<Option<T>> {
        self.buffer.clone()
    }

    /// 获取头指针位置
    ///
    /// # Returns
    ///
    /// 头指针位置
    pub fn get_head_index(&self) -> usize {
        self.head
    }

    /// 获取尾指针位置
    ///
    /// # Returns
    ///
    /// 尾指针位置
    pub fn get_tail_index(&self) -> usize {
        self.tail
    }
}

/// 覆盖式循环队列
/// 当队列已满时，新元素会覆盖最旧的元素
pub struct OverwritingCircularQueue<T> {
    /// 存储元素的缓冲区
    buffer: Vec<Option<T>>,
    /// 头指针位置
    head: usize,
    /// 尾指针位置
    tail: usize,
    /// 元素数量
    count: usize,
    /// 队列最大容量
    max_size: usize,
}

impl<T: Clone> OverwritingCircularQueue<T> {
    /// 创建覆盖式循环队列
    ///
    /// # Arguments
    ///
    /// * `capacity` - 队列容量
    ///
    /// # Returns
    ///
    /// 新创建的覆盖式循环队列
    pub fn new(capacity: usize) -> Self {
        if capacity == 0 {
            panic!("Capacity must be positive");
        }

        OverwritingCircularQueue {
            buffer: vec![None; capacity],
            head: 0,
            tail: 0,
            count: 0,
            max_size: capacity,
        }
    }

    /// 入队操作，如果队列已满则覆盖最旧的元素
    ///
    /// # Arguments
    ///
    /// * `item` - 要入队的元素
    ///
    /// # Returns
    ///
    /// 始终返回true
    pub fn enqueue(&mut self, item: T) -> bool {
        // 如果队列已满，移动头指针
        if self.is_full() {
            self.head = (self.head + 1) % self.max_size;
            self.count -= 1;
        }

        self.buffer[self.tail] = Some(item);
        self.tail = (self.tail + 1) % self.max_size;
        self.count += 1;
        true
    }

    /// 出队操作
    ///
    /// # Returns
    ///
    /// 队首元素，如果队列为空则返回None
    pub fn dequeue(&mut self) -> Option<T> {
        if self.is_empty() {
            return None;
        }

        let item = self.buffer[self.head].take();
        self.head = (self.head + 1) % self.max_size;
        self.count -= 1;
        item
    }

    /// 查看队首元素但不移除
    ///
    /// # Returns
    ///
    /// 队首元素，如果队列为空则返回None
    pub fn front(&self) -> Option<T> {
        if self.is_empty() {
            return None;
        }

        self.buffer[self.head].clone()
    }

    /// 查看队尾元素但不移除
    ///
    /// # Returns
    ///
    /// 队尾元素，如果队列为空则返回None
    pub fn rear(&self) -> Option<T> {
        if self.is_empty() {
            return None;
        }

        // 计算尾部元素的索引
        let rear_index = (self.tail + self.max_size - 1) % self.max_size;
        self.buffer[rear_index].clone()
    }

    /// 检查队列是否为空
    ///
    /// # Returns
    ///
    /// 队列是否为空
    pub fn is_empty(&self) -> bool {
        self.count == 0
    }

    /// 检查队列是否已满
    ///
    /// # Returns
    ///
    /// 队列是否已满
    pub fn is_full(&self) -> bool {
        self.count == self.max_size
    }

    /// 获取队列大小
    ///
    /// # Returns
    ///
    /// 队列中的元素数量
    pub fn size(&self) -> usize {
        self.count
    }

    /// 获取队列容量
    ///
    /// # Returns
    ///
    /// 队列的最大容量
    pub fn capacity(&self) -> usize {
        self.max_size
    }

    /// 清空队列
    pub fn clear(&mut self) {
        for item in &mut self.buffer {
            *item = None;
        }
        self.head = 0;
        self.tail = 0;
        self.count = 0;
    }

    /// 获取队列中的所有元素（用于可视化）
    ///
    /// # Returns
    ///
    /// 队列中的所有元素
    pub fn get_items(&self) -> Vec<Option<T>> {
        self.buffer.clone()
    }

    /// 获取头指针位置
    ///
    /// # Returns
    ///
    /// 头指针位置
    pub fn get_head_index(&self) -> usize {
        self.head
    }

    /// 获取尾指针位置
    ///
    /// # Returns
    ///
    /// 尾指针位置
    pub fn get_tail_index(&self) -> usize {
        self.tail
    }
}

// 使用示例
/*
fn main() {
    // 创建容量为5的循环队列
    let mut queue = CircularQueue::new(5);

    // 入队元素
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    // 出队元素
    if let Some(item) = queue.dequeue() {
        println!("Dequeued: {}", item);
    }

    // 查看队首和队尾元素
    if let (Some(front), Some(rear)) = (queue.front(), queue.rear()) {
        println!("Front: {}, Rear: {}", front, rear);
    }

    // 创建容量为3的覆盖式循环队列
    let mut overwriting_queue = OverwritingCircularQueue::new(3);

    // 入队元素
    overwriting_queue.enqueue(1);
    overwriting_queue.enqueue(2);
    overwriting_queue.enqueue(3);

    // 队列已满，但仍可以入队，会覆盖最旧的元素
    overwriting_queue.enqueue(4);

    // 查看队首元素
    if let Some(front) = overwriting_queue.front() {
        println!("Front: {}", front); // 应该是2，因为1被覆盖了
    }
}
*/
