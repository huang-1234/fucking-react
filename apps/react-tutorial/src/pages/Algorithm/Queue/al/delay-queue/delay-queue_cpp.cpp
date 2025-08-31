/**
 * 延迟队列的C++实现
 * 基于优先队列实现，按照到期时间排序
 */
#include <queue>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <functional>
#include <thread>
#include <atomic>
#include <optional>
#include <vector>

template <typename T>
class DelayQueue {
public:
    /**
     * 延迟队列中的元素
     */
    struct DelayedItem {
        T item;                      // 元素值
        std::chrono::milliseconds expiry;  // 到期时间点

        // 比较运算符，用于优先队列排序（按到期时间升序）
        bool operator>(const DelayedItem& other) const {
            return expiry > other.expiry;
        }
    };

private:
    // 优先队列，按到期时间排序
    std::priority_queue<DelayedItem, std::vector<DelayedItem>, std::greater<DelayedItem>> queue;

    // 互斥锁和条件变量
    mutable std::mutex mutex;
    std::condition_variable available;

    // 后台线程，用于处理到期元素
    std::thread worker;
    std::atomic<bool> running{false};

    // 队列变更监听器
    std::vector<std::function<void()>> changeListeners;

    /**
     * 通知所有监听器队列已变更
     */
    void notifyListeners() {
        for (const auto& listener : changeListeners) {
            listener();
        }
    }

    /**
     * 后台工作线程函数
     */
    void workerThread() {
        std::unique_lock<std::mutex> lock(mutex);

        while (running) {
            // 如果队列为空，等待
            if (queue.empty()) {
                available.wait(lock);
                continue;
            }

            // 获取队首元素
            const auto& top = queue.top();
            auto now = std::chrono::steady_clock::now();
            auto expiryTime = top.expiry;

            // 如果队首元素未到期，等待到期
            if (now < expiryTime) {
                available.wait_until(lock, expiryTime);
                continue;
            }

            // 队首元素已到期，移除并通知等待的线程
            T item = top.item;
            queue.pop();

            // 通知监听器
            notifyListeners();

            // 通知等待的线程
            available.notify_all();
        }
    }

public:
    /**
     * 创建延迟队列
     */
    DelayQueue() {
        running = true;
        worker = std::thread(&DelayQueue::workerThread, this);
    }

    /**
     * 析构函数
     */
    ~DelayQueue() {
        {
            std::lock_guard<std::mutex> lock(mutex);
            running = false;
            available.notify_all();
        }

        if (worker.joinable()) {
            worker.join();
        }
    }

    /**
     * 添加元素到队列中，在指定延迟后可用
     * @param item 要添加的元素
     * @param delayMs 延迟时间（毫秒）
     */
    void add(const T& item, long delayMs) {
        auto expiry = std::chrono::steady_clock::now() + std::chrono::milliseconds(delayMs);

        {
            std::lock_guard<std::mutex> lock(mutex);
            queue.push({item, std::chrono::duration_cast<std::chrono::milliseconds>(expiry.time_since_epoch())});

            // 通知监听器
            notifyListeners();
        }

        // 通知工作线程
        available.notify_one();
    }

    /**
     * 尝试获取已到期的元素，如果没有到期元素则返回std::nullopt
     * @return 已到期的元素，如果没有则返回std::nullopt
     */
    std::optional<T> poll() {
        std::lock_guard<std::mutex> lock(mutex);

        // 检查队列是否为空
        if (queue.empty()) {
            return std::nullopt;
        }

        // 检查队首元素是否已到期
        const auto& top = queue.top();
        auto now = std::chrono::steady_clock::now();

        if (now < top.expiry) {
            return std::nullopt;
        }

        // 队首元素已到期，移除并返回
        T item = top.item;
        queue.pop();

        // 通知监听器
        notifyListeners();

        return item;
    }

    /**
     * 获取已到期的元素，如果没有到期元素则阻塞
     * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
     * @return 已到期的元素，如果超时则返回std::nullopt
     */
    std::optional<T> take(std::optional<long> timeout = std::nullopt) {
        std::unique_lock<std::mutex> lock(mutex);

        // 设置超时时间点
        std::chrono::steady_clock::time_point deadline;
        if (timeout) {
            deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(*timeout);
        }

        // 等待直到有元素到期或超时
        while (true) {
            // 检查队列是否为空
            if (queue.empty()) {
                if (!timeout) {
                    available.wait(lock);
                } else {
                    if (available.wait_until(lock, deadline) == std::cv_status::timeout) {
                        return std::nullopt;
                    }
                }
                continue;
            }

            // 检查队首元素是否已到期
            const auto& top = queue.top();
            auto now = std::chrono::steady_clock::now();

            if (now < top.expiry) {
                // 计算等待时间
                auto waitTime = std::min(
                    top.expiry,
                    timeout ? deadline : top.expiry
                );

                // 等待元素到期或超时
                if (available.wait_until(lock, waitTime) == std::cv_status::timeout && timeout && now >= deadline) {
                    return std::nullopt;
                }
                continue;
            }

            // 队首元素已到期，移除并返回
            T item = top.item;
            queue.pop();

            // 通知监听器
            notifyListeners();

            return item;
        }
    }

    /**
     * 查看下一个将到期的元素但不移除
     * @return 下一个将到期的元素，如果队列为空则返回std::nullopt
     */
    std::optional<DelayedItem> peek() const {
        std::lock_guard<std::mutex> lock(mutex);

        if (queue.empty()) {
            return std::nullopt;
        }

        return queue.top();
    }

    /**
     * 获取队列大小
     * @return 队列中的元素数量
     */
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.size();
    }

    /**
     * 检查队列是否为空
     * @return 队列是否为空
     */
    bool isEmpty() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.empty();
    }

    /**
     * 清空队列
     */
    void clear() {
        std::lock_guard<std::mutex> lock(mutex);

        // 清空队列
        std::priority_queue<DelayedItem, std::vector<DelayedItem>, std::greater<DelayedItem>> emptyQueue;
        std::swap(queue, emptyQueue);

        // 通知监听器
        notifyListeners();
    }

    /**
     * 获取当前时间到下一个元素到期的剩余时间（毫秒）
     * @return 剩余时间，如果队列为空则返回-1
     */
    long getDelayToNextExpiry() const {
        std::lock_guard<std::mutex> lock(mutex);

        if (queue.empty()) {
            return -1;
        }

        auto now = std::chrono::steady_clock::now();
        auto expiry = queue.top().expiry;

        if (now >= expiry) {
            return 0;
        }

        return std::chrono::duration_cast<std::chrono::milliseconds>(expiry - now).count();
    }

    /**
     * 添加队列变更监听器
     * @param listener 监听器函数
     */
    void addChangeListener(std::function<void()> listener) {
        std::lock_guard<std::mutex> lock(mutex);
        changeListeners.push_back(listener);
    }

    /**
     * 移除队列变更监听器
     * @param listener 监听器函数
     */
    void removeChangeListener(std::function<void()> listener) {
        std::lock_guard<std::mutex> lock(mutex);
        // 注意：这里简化处理，实际应该比较函数指针
        // 在C++中比较std::function是复杂的，这里仅作示意
    }
};

// 使用示例
/*
int main() {
    DelayQueue<std::string> queue;

    // 添加元素，1秒后到期
    queue.add("Task 1", 1000);
    std::cout << "Added Task 1, expires in 1 second" << std::endl;

    // 添加元素，2秒后到期
    queue.add("Task 2", 2000);
    std::cout << "Added Task 2, expires in 2 seconds" << std::endl;

    // 添加元素，500毫秒后到期
    queue.add("Task 3", 500);
    std::cout << "Added Task 3, expires in 0.5 seconds" << std::endl;

    // 等待并获取到期元素
    for (int i = 0; i < 3; ++i) {
        auto item = queue.take();
        if (item) {
            std::cout << "Took: " << *item << std::endl;
        }
    }

    return 0;
}
*/
