/**
 * 阻塞队列的C++实现
 * 使用互斥锁和条件变量实现线程同步
 */
#include <queue>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <optional>
#include <atomic>

template <typename T>
class BlockingQueue {
private:
    std::queue<T> queue;
    size_t maxSize;

    mutable std::mutex mutex;
    std::condition_variable notEmpty;
    std::condition_variable notFull;

    std::atomic<int> waitingProducers{0};
    std::atomic<int> waitingConsumers{0};

public:
    /**
     * 创建阻塞队列
     * @param maxSize 队列最大容量，默认为SIZE_MAX（无限容量）
     */
    explicit BlockingQueue(size_t maxSize = SIZE_MAX) : maxSize(maxSize) {}

    /**
     * 将元素添加到队列中，如果队列已满则阻塞
     * @param item 要添加的元素
     * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
     * @return 是否成功添加元素
     */
    bool put(const T& item, std::optional<std::chrono::milliseconds> timeout = std::nullopt) {
        std::unique_lock<std::mutex> lock(mutex);

        // 如果队列已满，等待空间
        waitingProducers++;
        bool notTimedOut = true;

        if (timeout) {
            notTimedOut = notFull.wait_for(lock, *timeout, [this] {
                return queue.size() < maxSize;
            });
        } else {
            notFull.wait(lock, [this] {
                return queue.size() < maxSize;
            });
        }

        waitingProducers--;

        if (!notTimedOut) {
            return false; // 超时
        }

        // 添加元素
        queue.push(item);

        // 通知等待的消费者
        notEmpty.notify_one();

        return true;
    }

    /**
     * 尝试将元素添加到队列中，如果队列已满则立即返回false
     * @param item 要添加的元素
     * @return 是否成功添加元素
     */
    bool offer(const T& item) {
        std::unique_lock<std::mutex> lock(mutex, std::try_to_lock);

        if (!lock.owns_lock() || queue.size() >= maxSize) {
            return false;
        }

        queue.push(item);
        notEmpty.notify_one();
        return true;
    }

    /**
     * 尝试将元素添加到队列中，如果队列已满则等待指定时间
     * @param item 要添加的元素
     * @param timeout 超时时间（毫秒）
     * @return 是否成功添加元素
     */
    bool offerWithTimeout(const T& item, std::chrono::milliseconds timeout) {
        return put(item, timeout);
    }

    /**
     * 从队列中取出元素，如果队列为空则阻塞
     * @param timeout 超时时间（毫秒），如果提供，则在指定时间后自动放弃
     * @return 取出的元素，如果超时则返回std::nullopt
     */
    std::optional<T> take(std::optional<std::chrono::milliseconds> timeout = std::nullopt) {
        std::unique_lock<std::mutex> lock(mutex);

        // 如果队列为空，等待元素
        waitingConsumers++;
        bool notTimedOut = true;

        if (timeout) {
            notTimedOut = notEmpty.wait_for(lock, *timeout, [this] {
                return !queue.empty();
            });
        } else {
            notEmpty.wait(lock, [this] {
                return !queue.empty();
            });
        }

        waitingConsumers--;

        if (!notTimedOut) {
            return std::nullopt; // 超时
        }

        // 取出元素
        T item = queue.front();
        queue.pop();

        // 通知等待的生产者
        notFull.notify_one();

        return item;
    }

    /**
     * 尝试从队列中取出元素，如果队列为空则立即返回std::nullopt
     * @return 取出的元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> poll() {
        std::unique_lock<std::mutex> lock(mutex, std::try_to_lock);

        if (!lock.owns_lock() || queue.empty()) {
            return std::nullopt;
        }

        T item = queue.front();
        queue.pop();
        notFull.notify_one();
        return item;
    }

    /**
     * 尝试从队列中取出元素，如果队列为空则等待指定时间
     * @param timeout 超时时间（毫秒）
     * @return 取出的元素，如果超时则返回std::nullopt
     */
    std::optional<T> pollWithTimeout(std::chrono::milliseconds timeout) {
        return take(timeout);
    }

    /**
     * 查看队首元素但不移除
     * @return 队首元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> peek() const {
        std::unique_lock<std::mutex> lock(mutex, std::try_to_lock);

        if (!lock.owns_lock() || queue.empty()) {
            return std::nullopt;
        }

        return queue.front();
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
     * 检查队列是否已满
     * @return 队列是否已满
     */
    bool isFull() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.size() >= maxSize;
    }

    /**
     * 清空队列
     */
    void clear() {
        std::lock_guard<std::mutex> lock(mutex);
        std::queue<T> emptyQueue;
        std::swap(queue, emptyQueue);
        notFull.notify_all();
    }

    /**
     * 获取队列容量
     * @return 队列的最大容量
     */
    size_t capacity() const {
        return maxSize;
    }

    /**
     * 获取等待的生产者数量
     * @return 等待的生产者数量
     */
    int getWaitingProducers() const {
        return waitingProducers.load();
    }

    /**
     * 获取等待的消费者数量
     * @return 等待的消费者数量
     */
    int getWaitingConsumers() const {
        return waitingConsumers.load();
    }
};

// 使用示例
/*
int main() {
    BlockingQueue<int> queue(5); // 创建容量为5的阻塞队列

    // 生产者线程
    std::thread producer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            queue.put(i);
            std::cout << "Produced: " << i << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    });

    // 消费者线程
    std::thread consumer([&queue]() {
        for (int i = 0; i < 10; ++i) {
            auto item = queue.take();
            if (item) {
                std::cout << "Consumed: " << *item << std::endl;
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(200));
        }
    });

    producer.join();
    consumer.join();

    return 0;
}
*/
