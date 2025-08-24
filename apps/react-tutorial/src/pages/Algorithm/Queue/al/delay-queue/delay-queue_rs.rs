/**
 * 延迟队列的Rust实现
 * 基于优先队列实现，按照到期时间排序
 */

use std::cmp::Ordering;
use std::collections::BinaryHeap;
use std::sync::{Arc, Mutex, Condvar};
use std::time::{Duration, Instant};
use std::thread;

/// 延迟队列中的元素
#[derive(Debug, Clone, Eq, PartialEq)]
pub struct DelayedItem<T> {
    /// 元素值
    pub item: T,

    /// 到期时间点
    pub expiry: Instant,
}

impl<T> Ord for DelayedItem<T> where T: Eq + PartialEq {
    fn cmp(&self, other: &Self) -> Ordering {
        // 按到期时间排序（升序），到期时间早的优先级高
        other.expiry.cmp(&self.expiry)
    }
}

impl<T> PartialOrd for DelayedItem<T> where T: Eq + PartialEq {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// 延迟队列内部状态
struct DelayQueueState<T> {
    /// 优先队列，按到期时间排序
    heap: BinaryHeap<DelayedItem<T>>,

    /// 队列是否正在运行
    running: bool,

    /// 队列变更监听器
    change_listeners: Vec<Box<dyn Fn() + Send>>,
}

/// 延迟队列
pub struct DelayQueue<T> {
    /// 队列状态
    state: Arc<(Mutex<DelayQueueState<T>>, Condvar)>,

    /// 工作线程句柄
    worker: Option<thread::JoinHandle<()>>,
}

impl<T: Clone + Send + 'static> DelayQueue<T> {
    /// 创建延迟队列
    pub fn new() -> Self {
        let state = Arc::new((
            Mutex::new(DelayQueueState {
                heap: BinaryHeap::new(),
                running: true,
                change_listeners: Vec::new(),
            }),
            Condvar::new(),
        ));

        // 创建工作线程
        let worker_state = Arc::clone(&state);
        let worker = thread::spawn(move || {
            Self::worker_thread(worker_state);
        });

        DelayQueue {
            state,
            worker: Some(worker),
        }
    }

    /// 工作线程函数
    fn worker_thread(state: Arc<(Mutex<DelayQueueState<T>>, Condvar)>) {
        let (mutex, cvar) = &*state;

        let mut lock = mutex.lock().unwrap();

        while lock.running {
            // 如果队列为空，等待
            if lock.heap.is_empty() {
                lock = cvar.wait(lock).unwrap();
                continue;
            }

            // 获取队首元素
            let top = lock.heap.peek().unwrap();
            let now = Instant::now();
            let expiry = top.expiry;

            // 如果队首元素未到期，等待到期
            if now < expiry {
                let wait_duration = expiry.duration_since(now);
                let (new_lock, timeout_result) = cvar.wait_timeout(lock, wait_duration).unwrap();
                lock = new_lock;

                if timeout_result.timed_out() {
                    // 超时，继续检查
                    continue;
                }
            } else {
                // 队首元素已到期，移除并通知等待的线程
                lock.heap.pop();

                // 通知监听器
                for listener in &lock.change_listeners {
                    listener();
                }

                // 通知等待的线程
                cvar.notify_all();
            }
        }
    }

    /// 添加元素到队列中，在指定延迟后可用
    ///
    /// # Arguments
    ///
    /// * `item` - 要添加的元素
    /// * `delay_ms` - 延迟时间（毫秒）
    pub fn add(&self, item: T, delay_ms: u64) {
        let (mutex, cvar) = &*self.state;
        let mut lock = mutex.lock().unwrap();

        let expiry = Instant::now() + Duration::from_millis(delay_ms);
        let delayed_item = DelayedItem { item, expiry };

        lock.heap.push(delayed_item);

        // 通知监听器
        for listener in &lock.change_listeners {
            listener();
        }

        // 通知工作线程
        cvar.notify_one();
    }

    /// 尝试获取已到期的元素，如果没有到期元素则返回None
    pub fn poll(&self) -> Option<T> {
        let (mutex, cvar) = &*self.state;
        let mut lock = mutex.lock().unwrap();

        // 检查队列是否为空
        if lock.heap.is_empty() {
            return None;
        }

        // 检查队首元素是否已到期
        let top = lock.heap.peek().unwrap();
        let now = Instant::now();

        if now < top.expiry {
            return None;
        }

        // 队首元素已到期，移除并返回
        let delayed_item = lock.heap.pop().unwrap();

        // 通知监听器
        for listener in &lock.change_listeners {
            listener();
        }

        Some(delayed_item.item)
    }

    /// 获取已到期的元素，如果没有到期元素则阻塞
    ///
    /// # Arguments
    ///
    /// * `timeout` - 超时时间（毫秒），如果提供，则在指定时间后自动放弃
    ///
    /// # Returns
    ///
    /// 已到期的元素，如果超时则返回None
    pub fn take(&self, timeout: Option<u64>) -> Option<T> {
        let (mutex, cvar) = &*self.state;
        let mut lock = mutex.lock().unwrap();

        // 设置超时时间点
        let deadline = timeout.map(|t| Instant::now() + Duration::from_millis(t));

        // 等待直到有元素到期或超时
        loop {
            // 检查队列是否为空
            if lock.heap.is_empty() {
                match deadline {
                    Some(deadline) => {
                        let now = Instant::now();
                        if now >= deadline {
                            return None;
                        }

                        let wait_duration = deadline.duration_since(now);
                        let (new_lock, timeout_result) = cvar.wait_timeout(lock, wait_duration).unwrap();
                        lock = new_lock;

                        if timeout_result.timed_out() {
                            return None;
                        }
                    },
                    None => {
                        lock = cvar.wait(lock).unwrap();
                    }
                }
                continue;
            }

            // 检查队首元素是否已到期
            let top = lock.heap.peek().unwrap();
            let now = Instant::now();

            if now < top.expiry {
                // 计算等待时间
                let wait_duration = match deadline {
                    Some(deadline) => {
                        if now >= deadline {
                            return None;
                        }

                        let expiry_duration = top.expiry.duration_since(now);
                        let deadline_duration = deadline.duration_since(now);

                        if deadline_duration < expiry_duration {
                            deadline_duration
                        } else {
                            expiry_duration
                        }
                    },
                    None => top.expiry.duration_since(now)
                };

                let (new_lock, timeout_result) = cvar.wait_timeout(lock, wait_duration).unwrap();
                lock = new_lock;

                if timeout_result.timed_out() && deadline.map_or(false, |d| Instant::now() >= d) {
                    return None;
                }
                continue;
            }

            // 队首元素已到期，移除并返回
            let delayed_item = lock.heap.pop().unwrap();

            // 通知监听器
            for listener in &lock.change_listeners {
                listener();
            }

            return Some(delayed_item.item);
        }
    }

    /// 查看下一个将到期的元素但不移除
    pub fn peek(&self) -> Option<DelayedItem<T>> {
        let (mutex, _) = &*self.state;
        let lock = mutex.lock().unwrap();

        lock.heap.peek().cloned()
    }

    /// 获取队列大小
    pub fn size(&self) -> usize {
        let (mutex, _) = &*self.state;
        let lock = mutex.lock().unwrap();

        lock.heap.len()
    }

    /// 检查队列是否为空
    pub fn is_empty(&self) -> bool {
        let (mutex, _) = &*self.state;
        let lock = mutex.lock().unwrap();

        lock.heap.is_empty()
    }

    /// 清空队列
    pub fn clear(&self) {
        let (mutex, _) = &*self.state;
        let mut lock = mutex.lock().unwrap();

        lock.heap.clear();

        // 通知监听器
        for listener in &lock.change_listeners {
            listener();
        }
    }

    /// 获取队列中的所有元素（用于可视化）
    pub fn get_items(&self) -> Vec<DelayedItem<T>> {
        let (mutex, _) = &*self.state;
        let lock = mutex.lock().unwrap();

        lock.heap.iter().cloned().collect()
    }

    /// 获取当前时间到下一个元素到期的剩余时间（毫秒）
    pub fn get_delay_to_next_expiry(&self) -> i64 {
        let (mutex, _) = &*self.state;
        let lock = mutex.lock().unwrap();

        if lock.heap.is_empty() {
            return -1;
        }

        let now = Instant::now();
        let expiry = lock.heap.peek().unwrap().expiry;

        if now >= expiry {
            return 0;
        }

        expiry.duration_since(now).as_millis() as i64
    }

    /// 添加队列变更监听器
    pub fn add_change_listener<F>(&self, listener: F)
    where
        F: Fn() + Send + 'static,
    {
        let (mutex, _) = &*self.state;
        let mut lock = mutex.lock().unwrap();

        lock.change_listeners.push(Box::new(listener));
    }
}

impl<T> Drop for DelayQueue<T> {
    fn drop(&mut self) {
        // 停止工作线程
        {
            let (mutex, cvar) = &*self.state;
            let mut lock = mutex.lock().unwrap();
            lock.running = false;
            cvar.notify_all();
        }

        // 等待工作线程结束
        if let Some(worker) = self.worker.take() {
            let _ = worker.join();
        }
    }
}

// 使用示例
/*
fn main() {
    use std::thread;
    use std::time::Duration;

    // 创建延迟队列
    let queue = DelayQueue::new();

    // 添加元素，1秒后到期
    queue.add("Task 1", 1000);
    println!("Added Task 1, expires in 1 second");

    // 添加元素，2秒后到期
    queue.add("Task 2", 2000);
    println!("Added Task 2, expires in 2 seconds");

    // 添加元素，500毫秒后到期
    queue.add("Task 3", 500);
    println!("Added Task 3, expires in 0.5 seconds");

    // 等待并获取到期元素
    for _ in 0..3 {
        if let Some(item) = queue.take(None) {
            println!("Took: {}", item);
        }
    }
}
*/
