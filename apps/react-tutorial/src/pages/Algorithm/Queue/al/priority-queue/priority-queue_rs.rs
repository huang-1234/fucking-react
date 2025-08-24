/**
 * 优先队列的Rust实现
 * 基于二叉堆实现，支持最小优先队列和最大优先队列
 */

use std::cmp::Ordering;
use std::collections::BinaryHeap;

/// 堆中的元素，包含值和优先级
#[derive(Debug, Clone, Eq, PartialEq)]
struct HeapItem<T> {
    value: T,
    priority: i32,
}

impl<T> Ord for HeapItem<T> where T: Eq + PartialEq {
    fn cmp(&self, other: &Self) -> Ordering {
        // 优先级比较（用于最小堆）
        other.priority.cmp(&self.priority)
    }
}

impl<T> PartialOrd for HeapItem<T> where T: Eq + PartialEq {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// 优先队列接口
pub trait PriorityQueue<T> {
    /// 入队操作
    fn enqueue(&mut self, item: T, priority: i32);

    /// 出队操作
    fn dequeue(&mut self) -> Option<T>;

    /// 查看队首元素但不移除
    fn peek(&self) -> Option<&T>;

    /// 获取队列大小
    fn size(&self) -> usize;

    /// 检查队列是否为空
    fn is_empty(&self) -> bool;

    /// 清空队列
    fn clear(&mut self);
}

/// 最小优先队列实现
/// 优先级数字越小，优先级越高
pub struct MinPriorityQueue<T> {
    heap: BinaryHeap<HeapItem<T>>,
}

impl<T> MinPriorityQueue<T> where T: Eq + PartialEq {
    /// 创建一个新的最小优先队列
    pub fn new() -> Self {
        MinPriorityQueue {
            heap: BinaryHeap::new(),
        }
    }
}

impl<T> PriorityQueue<T> for MinPriorityQueue<T> where T: Eq + PartialEq {
    fn enqueue(&mut self, item: T, priority: i32) {
        self.heap.push(HeapItem { value: item, priority });
    }

    fn dequeue(&mut self) -> Option<T> {
        self.heap.pop().map(|item| item.value)
    }

    fn peek(&self) -> Option<&T> {
        self.heap.peek().map(|item| &item.value)
    }

    fn size(&self) -> usize {
        self.heap.len()
    }

    fn is_empty(&self) -> bool {
        self.heap.is_empty()
    }

    fn clear(&mut self) {
        self.heap.clear();
    }
}

/// 最大优先队列实现
/// 优先级数字越大，优先级越高
pub struct MaxPriorityQueue<T> {
    min_queue: MinPriorityQueue<T>,
}

impl<T> MaxPriorityQueue<T> where T: Eq + PartialEq {
    /// 创建一个新的最大优先队列
    pub fn new() -> Self {
        MaxPriorityQueue {
            min_queue: MinPriorityQueue::new(),
        }
    }
}

impl<T> PriorityQueue<T> for MaxPriorityQueue<T> where T: Eq + PartialEq {
    fn enqueue(&mut self, item: T, priority: i32) {
        // 对于最大优先队列，我们使用负的优先级来转换为最小堆
        self.min_queue.enqueue(item, -priority);
    }

    fn dequeue(&mut self) -> Option<T> {
        self.min_queue.dequeue()
    }

    fn peek(&self) -> Option<&T> {
        self.min_queue.peek()
    }

    fn size(&self) -> usize {
        self.min_queue.size()
    }

    fn is_empty(&self) -> bool {
        self.min_queue.is_empty()
    }

    fn clear(&mut self) {
        self.min_queue.clear();
    }
}

/// 使用优先队列进行排序
pub fn priority_sort<T, F>(items: &[T], get_priority: F, ascending: bool) -> Vec<T>
where
    T: Clone + Eq + PartialEq,
    F: Fn(&T) -> i32,
{
    let mut result = Vec::with_capacity(items.len());

    if ascending {
        let mut queue = MinPriorityQueue::new();
        for item in items {
            queue.enqueue(item.clone(), get_priority(item));
        }

        while !queue.is_empty() {
            if let Some(item) = queue.dequeue() {
                result.push(item);
            }
        }
    } else {
        let mut queue = MaxPriorityQueue::new();
        for item in items {
            queue.enqueue(item.clone(), get_priority(item));
        }

        while !queue.is_empty() {
            if let Some(item) = queue.dequeue() {
                result.push(item);
            }
        }
    }

    result
}

/*
// 使用示例
fn main() {
    // 创建最小优先队列
    let mut min_queue = MinPriorityQueue::new();
    min_queue.enqueue("Task 1", 5);
    min_queue.enqueue("Task 2", 2);
    min_queue.enqueue("Task 3", 8);

    // 按优先级顺序出队
    while !min_queue.is_empty() {
        println!("{}", min_queue.dequeue().unwrap());
    }

    // 创建最大优先队列
    let mut max_queue = MaxPriorityQueue::new();
    max_queue.enqueue("Task A", 5);
    max_queue.enqueue("Task B", 2);
    max_queue.enqueue("Task C", 8);

    // 按优先级顺序出队
    while !max_queue.is_empty() {
        println!("{}", max_queue.dequeue().unwrap());
    }
}
*/
