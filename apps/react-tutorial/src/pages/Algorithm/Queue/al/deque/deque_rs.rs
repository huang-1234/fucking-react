// 双端队列基本实现、支持在两端进行添加和删除操作、使用 Rust 实现

struct Deque<T> {
    items: Vec<T>,
}

impl<T> Deque<T> {
    fn new() -> Self {
        Self { items: Vec::new() }
    }

    // 在队列前端添加元素
    fn push_front(&mut self, item: T) {
        self.items.insert(0, item);
    }

    // 在队列后端添加元素
    fn push_back(&mut self, item: T) {
        self.items.push(item);
    }

    // 从队列前端移除元素
    fn pop_front(&mut self) -> Option<T> {
        if self.items.is_empty() {
            None
        } else {
            Some(self.items.remove(0))
        }
    }

    // 从队列后端移除元素
    fn pop_back(&mut self) -> Option<T> {
        self.items.pop()
    }

    // 查看队列前端元素但不移除
    fn peek_front(&self) -> Option<&T> {
        self.items.first()
    }

    // 查看队列后端元素但不移除
    fn peek_back(&self) -> Option<&T> {
        self.items.last()
    }

    // 返回队列长度
    fn len(&self) -> usize {
        self.items.len()
    }

    // 检查队列是否为空
    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    // 清空队列
    fn clear(&mut self) {
        self.items.clear();
    }
}

struct MonotonicDecreasingDeque<T: Ord> {
    deque: Deque<T>,
}

impl<T: Ord> MonotonicDecreasingDeque<T> {
    fn new() -> Self {
        Self { deque: Deque::new() }
    }

    // 添加元素，保持队列单调递减
    fn push(&mut self, item: T) {
        // 移除所有小于当前元素的值，保持单调递减
        while !self.deque.is_empty() && *self.deque.peek_back().unwrap() < item {
            self.deque.pop_back();
        }
        self.deque.push_back(item);
    }

    // 移除指定元素（如果它在队列前端）
    fn pop(&mut self, item: &T) {
        if !self.deque.is_empty() && self.deque.peek_front().unwrap() == item {
            self.deque.pop_front();
        }
    }

    // 获取最大值（队列前端）
    fn max(&self) -> Option<&T> {
        self.deque.peek_front()
    }

    fn is_empty(&self) -> bool {
        self.deque.is_empty()
    }

    fn len(&self) -> usize {
        self.deque.len()
    }
}

struct MonotonicIncreasingDeque<T: Ord> {
    deque: Deque<T>,
}

impl<T: Ord> MonotonicIncreasingDeque<T> {
    fn new() -> Self {
        Self { deque: Deque::new() }
    }

    // 添加元素，保持队列单调递增
    fn push(&mut self, item: T) {
        // 移除所有大于当前元素的值，保持单调递增
        while !self.deque.is_empty() && *self.deque.peek_back().unwrap() > item {
            self.deque.pop_back();
        }
        self.deque.push_back(item);
    }

    // 移除指定元素（如果它在队列前端）
    fn pop(&mut self, item: &T) {
        if !self.deque.is_empty() && self.deque.peek_front().unwrap() == item {
            self.deque.pop_front();
        }
    }

    // 获取最小值（队列前端）
    fn min(&self) -> Option<&T> {
        self.deque.peek_front()
    }
    // 获取最大值（队列后端）
    fn max(&self) -> Option<&T> {
        self.deque.peek_back()
    }
    // 获取最大值（队列后端）
    fn is_empty(&self) -> bool {
        self.deque.is_empty()
    }
    // 获取队列长度
    fn len(&self) -> usize {
        self.deque.len()
    }
    // 清空队列
    fn clear(&mut self) {
        self.deque.clear();
    }
    // 迭代器
    fn iter(&self) -> std::collections::deque::Iter<T> {
        self.deque.iter()
    }
}

// 示例函数：滑动窗口最大值
fn sliding_window_maximum(nums: &[i32], k: usize) -> Vec<i32> {
    if nums.is_empty() || k == 0 {
        return Vec::new();
    }

    let mut result = Vec::new();
    let mut deque = MonotonicDecreasingDeque::new();

    // 处理前k个元素
    for i in 0..k {
        deque.push(nums[i]);
    }

    // 第一个窗口的最大值
    result.push(*deque.max().unwrap());

    // 处理剩余元素
    for i in k..nums.len() {
        // 移除离开窗口的元素
        deque.pop(&nums[i - k]);
        // 添加新元素
        deque.push(nums[i]);
        // 添加当前窗口的最大值
        result.push(*deque.max().unwrap());
    }

    result
}

// 示例函数：基本双端队列使用
fn deque_example() {
    let mut deque = Deque::new();

    // 添加元素
    deque.push_back(1);
    deque.push_back(2);
    deque.push_front(0);
    // 此时队列为 [0, 1, 2]

    // 移除元素
    let front = deque.pop_front(); // 返回 Some(0)
    let back = deque.pop_back();   // 返回 Some(2)
    // 此时队列为 [1]

    // 查看元素
    let peek_front = deque.peek_front(); // 返回 Some(&1)

    // 检查长度
    let length = deque.len(); // 返回 1

    // 检查是否为空
    let is_empty = deque.is_empty(); // 返回 false

    // 清空队列
    deque.clear();
    // 此时队列为 []
}