/**
 * 阻塞队列的Rust实现
 * 使用互斥锁和条件变量实现线程同步
 */
use std::collections::VecDeque;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, Instant};

/// 阻塞队列
pub struct BlockingQueue<T> {
    /// 队列数据
    queue: Mutex<VecDeque<T>>,
    /// 非空条件变量
    not_empty: Condvar,
    /// 非满条件变量
    not_full: Condvar,
    /// 队列最大容量
    max_size: usize,
    /// 等待的生产者数量
    waiting_producers: AtomicUsize,
    /// 等待的消费者数量
    waiting_consumers: AtomicUsize,
}

impl<T: Clone> BlockingQueue<T> {
    /// 创建阻塞队列
    ///
    /// # Arguments
    ///
    /// * `max_size` - 队列最大容量，默认为usize::MAX（无限容量）
    ///
    /// # Returns
    ///
    /// 新创建的阻塞队列
    pub fn new(max_size: usize) -> Self {
        BlockingQueue {
            queue: Mutex::new(VecDeque::new()),
            not_empty: Condvar::new(),
            not_full: Condvar::new(),
            max_size,
            waiting_producers: AtomicUsize::new(0),
            waiting_consumers: AtomicUsize::new(0),
        }
    }

    /// 将元素添加到队列中，如果队列已满则阻塞
    ///
    /// # Arguments
    ///
    /// * `item` - 要添加的元素
    /// * `timeout` - 超时时间（毫秒），如果提供，则在指定时间后自动放弃
    ///
    /// # Returns
    ///
    /// 是否成功添加元素
    pub fn put(&self, item: T, timeout: Option<u64>) -> bool {
        let mut queue = self.queue.lock().unwrap();

        // 如果队列已满，等待空间
        self.waiting_producers.fetch_add(1, Ordering::SeqCst);

        let result = match timeout {
            Some(timeout_ms) => {
                let timeout_duration = Duration::from_millis(timeout_ms);
                let start = Instant::now();

                while queue.len() >= self.max_size {
                    let remaining = match timeout_duration.checked_sub(start.elapsed()) {
                        Some(remaining) => remaining,
                        None => {
                            self.waiting_producers.fetch_sub(1, Ordering::SeqCst);
                            return false; // 超时
                        }
                    };

                    let (new_queue, timeout_result) =
                        self.not_full.wait_timeout(queue, remaining).unwrap();
                    queue = new_queue;

                    if timeout_result.timed_out() && queue.len() >= self.max_size {
                        self.waiting_producers.fetch_sub(1, Ordering::SeqCst);
                        return false; // 超时
                    }
                }

                true
            }
            None => {
                while queue.len() >= self.max_size {
                    queue = self.not_full.wait(queue).unwrap();
                }
                true
            }
        };

        self.waiting_producers.fetch_sub(1, Ordering::SeqCst);

        if result {
            // 添加元素
            queue.push_back(item);

            // 通知等待的消费者
            self.not_empty.notify_one();
        }

        result
    }

    /// 尝试将元素添加到队列中，如果队列已满则立即返回false
    ///
    /// # Arguments
    ///
    /// * `item` - 要添加的元素
    ///
    /// # Returns
    ///
    /// 是否成功添加元素
    pub fn offer(&self, item: T) -> bool {
        let mut queue = match self.queue.try_lock() {
            Ok(guard) => guard,
            Err(_) => return false,
        };

        if queue.len() >= self.max_size {
            return false;
        }

        queue.push_back(item);
        self.not_empty.notify_one();
        true
    }

    /// 尝试将元素添加到队列中，如果队列已满则等待指定时间
    ///
    /// # Arguments
    ///
    /// * `item` - 要添加的元素
    /// * `timeout_ms` - 超时时间（毫秒）
    ///
    /// # Returns
    ///
    /// 是否成功添加元素
    pub fn offer_with_timeout(&self, item: T, timeout_ms: u64) -> bool {
        self.put(item, Some(timeout_ms))
    }

    /// 从队列中取出元素，如果队列为空则阻塞
    ///
    /// # Arguments
    ///
    /// * `timeout` - 超时时间（毫秒），如果提供，则在指定时间后自动放弃
    ///
    /// # Returns
    ///
    /// 取出的元素，如果超时则返回None
    pub fn take(&self, timeout: Option<u64>) -> Option<T> {
        let mut queue = self.queue.lock().unwrap();

        // 如果队列为空，等待元素
        self.waiting_consumers.fetch_add(1, Ordering::SeqCst);

        let result = match timeout {
            Some(timeout_ms) => {
                let timeout_duration = Duration::from_millis(timeout_ms);
                let start = Instant::now();

                while queue.is_empty() {
                    let remaining = match timeout_duration.checked_sub(start.elapsed()) {
                        Some(remaining) => remaining,
                        None => {
                            self.waiting_consumers.fetch_sub(1, Ordering::SeqCst);
                            return None; // 超时
                        }
                    };

                    let (new_queue, timeout_result) =
                        self.not_empty.wait_timeout(queue, remaining).unwrap();
                    queue = new_queue;

                    if timeout_result.timed_out() && queue.is_empty() {
                        self.waiting_consumers.fetch_sub(1, Ordering::SeqCst);
                        return None; // 超时
                    }
                }

                queue.pop_front()
            }
            None => {
                while queue.is_empty() {
                    queue = self.not_empty.wait(queue).unwrap();
                }
                queue.pop_front()
            }
        };

        self.waiting_consumers.fetch_sub(1, Ordering::SeqCst);

        if result.is_some() {
            // 通知等待的生产者
            self.not_full.notify_one();
        }

        result
    }

    /// 尝试从队列中取出元素，如果队列为空则立即返回None
    ///
    /// # Returns
    ///
    /// 取出的元素，如果队列为空则返回None
    pub fn poll(&self) -> Option<T> {
        let mut queue = match self.queue.try_lock() {
            Ok(guard) => guard,
            Err(_) => return None,
        };

        if queue.is_empty() {
            return None;
        }

        let item = queue.pop_front();
        self.not_full.notify_one();
        item
    }

    /// 尝试从队列中取出元素，如果队列为空则等待指定时间
    ///
    /// # Arguments
    ///
    /// * `timeout_ms` - 超时时间（毫秒）
    ///
    /// # Returns
    ///
    /// 取出的元素，如果超时则返回None
    pub fn poll_with_timeout(&self, timeout_ms: u64) -> Option<T> {
        self.take(Some(timeout_ms))
    }

    /// 查看队首元素但不移除
    ///
    /// # Returns
    ///
    /// 队首元素，如果队列为空则返回None
    pub fn peek(&self) -> Option<T> {
        let queue = match self.queue.try_lock() {
            Ok(guard) => guard,
            Err(_) => return None,
        };

        queue.front().cloned()
    }

    /// 获取队列大小
    ///
    /// # Returns
    ///
    /// 队列中的元素数量
    pub fn size(&self) -> usize {
        let queue = self.queue.lock().unwrap();
        queue.len()
    }

    /// 检查队列是否为空
    ///
    /// # Returns
    ///
    /// 队列是否为空
    pub fn is_empty(&self) -> bool {
        let queue = self.queue.lock().unwrap();
        queue.is_empty()
    }

    /// 检查队列是否已满
    ///
    /// # Returns
    ///
    /// 队列是否已满
    pub fn is_full(&self) -> bool {
        let queue = self.queue.lock().unwrap();
        queue.len() >= self.max_size
    }

    /// 清空队列
    pub fn clear(&self) {
        let mut queue = self.queue.lock().unwrap();
        queue.clear();
        self.not_full.notify_all();
    }

    /// 获取队列中的所有元素（用于可视化）
    ///
    /// # Returns
    ///
    /// 队列中的所有元素
    pub fn get_items(&self) -> Vec<T> {
        let queue = self.queue.lock().unwrap();
        queue.iter().cloned().collect()
    }

    /// 获取队列容量
    ///
    /// # Returns
    ///
    /// 队列的最大容量
    pub fn capacity(&self) -> usize {
        self.max_size
    }

    /// 获取等待的生产者数量
    ///
    /// # Returns
    ///
    /// 等待的生产者数量
    pub fn get_waiting_producers(&self) -> usize {
        self.waiting_producers.load(Ordering::SeqCst)
    }

    /// 获取等待的消费者数量
    ///
    /// # Returns
    ///
    /// 等待的消费者数量
    pub fn get_waiting_consumers(&self) -> usize {
        self.waiting_consumers.load(Ordering::SeqCst)
    }
}

// 使用示例
/*
fn main() {
    use std::thread;
    use std::time::Duration;

    // 创建容量为5的阻塞队列
    let queue = Arc::new(BlockingQueue::<i32>::new(5));

    // 生产者线程
    let producer_queue = Arc::clone(&queue);
    let producer = thread::spawn(move || {
        for i in 0..10 {
            producer_queue.put(i, None);
            println!("Produced: {}", i);
            thread::sleep(Duration::from_millis(100));
        }
    });

    // 消费者线程
    let consumer_queue = Arc::clone(&queue);
    let consumer = thread::spawn(move || {
        for _ in 0..10 {
            if let Some(item) = consumer_queue.take(None) {
                println!("Consumed: {}", item);
            }
            thread::sleep(Duration::from_millis(200));
        }
    });

    producer.join().unwrap();
    consumer.join().unwrap();
}
*/
