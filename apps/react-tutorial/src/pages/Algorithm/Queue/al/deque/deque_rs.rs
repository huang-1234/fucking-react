// 双端队列基本实现、支持在两端进行添加和删除操作、使用 Rust 实现

struct Deque<T> {
    items: Vec<T>,
}

impl<T> Deque<T> {
    fn new() -> Self {
        Self { items: Vec::new() }
    }
}

struct MonotonicDecreasingDeque<T> {
    deque: Deque<T>,
}

impl<T> MonotonicDecreasingDeque<T> {
    fn new() -> Self {
        Self { deque: Deque::new() }
    }
}

struct MonotonicIncreasingDeque<T> {
    deque: Deque<T>,
}

impl<T> MonotonicIncreasingDeque<T> {
    fn new() -> Self {
        Self { deque: Deque::new() }
    }
}