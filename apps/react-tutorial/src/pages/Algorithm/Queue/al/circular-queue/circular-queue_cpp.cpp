/**
 * 循环队列的C++实现
 * 使用定长数组和头尾指针实现高效的FIFO队列
 */
#include <vector>
#include <stdexcept>
#include <optional>

template <typename T>
class CircularQueue {
private:
    std::vector<std::optional<T>> buffer;
    size_t head = 0;
    size_t tail = 0;
    size_t count = 0;
    size_t maxSize;

public:
    /**
     * 创建循环队列
     * @param capacity 队列容量
     */
    explicit CircularQueue(size_t capacity) {
        if (capacity == 0) {
            throw std::invalid_argument("Capacity must be positive");
        }
        maxSize = capacity;
        buffer.resize(capacity);
    }

    /**
     * 入队操作
     * @param item 要入队的元素
     * @return 是否成功入队
     */
    bool enqueue(const T& item) {
        if (isFull()) {
            return false;
        }

        buffer[tail] = item;
        tail = (tail + 1) % maxSize;
        count++;
        return true;
    }

    /**
     * 出队操作
     * @return 队首元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> dequeue() {
        if (isEmpty()) {
            return std::nullopt;
        }

        std::optional<T> item = buffer[head];
        buffer[head] = std::nullopt;
        head = (head + 1) % maxSize;
        count--;
        return item;
    }

    /**
     * 查看队首元素但不移除
     * @return 队首元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> front() const {
        if (isEmpty()) {
            return std::nullopt;
        }

        return buffer[head];
    }

    /**
     * 查看队尾元素但不移除
     * @return 队尾元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> rear() const {
        if (isEmpty()) {
            return std::nullopt;
        }

        // 计算尾部元素的索引
        size_t rearIndex = (tail - 1 + maxSize) % maxSize;
        return buffer[rearIndex];
    }

    /**
     * 检查队列是否为空
     * @return 队列是否为空
     */
    bool isEmpty() const {
        return count == 0;
    }

    /**
     * 检查队列是否已满
     * @return 队列是否已满
     */
    bool isFull() const {
        return count == maxSize;
    }

    /**
     * 获取队列大小
     * @return 队列中的元素数量
     */
    size_t size() const {
        return count;
    }

    /**
     * 获取队列容量
     * @return 队列的最大容量
     */
    size_t capacity() const {
        return maxSize;
    }

    /**
     * 清空队列
     */
    void clear() {
        for (auto& item : buffer) {
            item = std::nullopt;
        }
        head = 0;
        tail = 0;
        count = 0;
    }

    /**
     * 获取队列中的所有元素（用于可视化）
     * @return 队列中的所有元素
     */
    std::vector<std::optional<T>> getItems() const {
        return buffer;
    }

    /**
     * 获取头指针位置
     * @return 头指针位置
     */
    size_t getHeadIndex() const {
        return head;
    }

    /**
     * 获取尾指针位置
     * @return 尾指针位置
     */
    size_t getTailIndex() const {
        return tail;
    }
};

/**
 * 覆盖式循环队列
 * 当队列已满时，新元素会覆盖最旧的元素
 */
template <typename T>
class OverwritingCircularQueue {
private:
    std::vector<std::optional<T>> buffer;
    size_t head = 0;
    size_t tail = 0;
    size_t count = 0;
    size_t maxSize;

public:
    /**
     * 创建覆盖式循环队列
     * @param capacity 队列容量
     */
    explicit OverwritingCircularQueue(size_t capacity) {
        if (capacity == 0) {
            throw std::invalid_argument("Capacity must be positive");
        }
        maxSize = capacity;
        buffer.resize(capacity);
    }

    /**
     * 入队操作，如果队列已满则覆盖最旧的元素
     * @param item 要入队的元素
     * @return 始终返回true
     */
    bool enqueue(const T& item) {
        // 如果队列已满，移动头指针
        if (isFull()) {
            head = (head + 1) % maxSize;
            count--;
        }

        buffer[tail] = item;
        tail = (tail + 1) % maxSize;
        count++;
        return true;
    }

    /**
     * 出队操作
     * @return 队首元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> dequeue() {
        if (isEmpty()) {
            return std::nullopt;
        }

        std::optional<T> item = buffer[head];
        buffer[head] = std::nullopt;
        head = (head + 1) % maxSize;
        count--;
        return item;
    }

    /**
     * 查看队首元素但不移除
     * @return 队首元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> front() const {
        if (isEmpty()) {
            return std::nullopt;
        }

        return buffer[head];
    }

    /**
     * 查看队尾元素但不移除
     * @return 队尾元素，如果队列为空则返回std::nullopt
     */
    std::optional<T> rear() const {
        if (isEmpty()) {
            return std::nullopt;
        }

        // 计算尾部元素的索引
        size_t rearIndex = (tail - 1 + maxSize) % maxSize;
        return buffer[rearIndex];
    }

    /**
     * 检查队列是否为空
     * @return 队列是否为空
     */
    bool isEmpty() const {
        return count == 0;
    }

    /**
     * 检查队列是否已满
     * @return 队列是否已满
     */
    bool isFull() const {
        return count == maxSize;
    }

    /**
     * 获取队列大小
     * @return 队列中的元素数量
     */
    size_t size() const {
        return count;
    }

    /**
     * 获取队列容量
     * @return 队列的最大容量
     */
    size_t capacity() const {
        return maxSize;
    }

    /**
     * 清空队列
     */
    void clear() {
        for (auto& item : buffer) {
            item = std::nullopt;
        }
        head = 0;
        tail = 0;
        count = 0;
    }

    /**
     * 获取队列中的所有元素（用于可视化）
     * @return 队列中的所有元素
     */
    std::vector<std::optional<T>> getItems() const {
        return buffer;
    }

    /**
     * 获取头指针位置
     * @return 头指针位置
     */
    size_t getHeadIndex() const {
        return head;
    }

    /**
     * 获取尾指针位置
     * @return 尾指针位置
     */
    size_t getTailIndex() const {
        return tail;
    }
};

// 使用示例
/*
int main() {
    // 创建容量为5的循环队列
    CircularQueue<int> queue(5);

    // 入队元素
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    // 出队元素
    auto item = queue.dequeue();
    if (item) {
        std::cout << "Dequeued: " << *item << std::endl;
    }

    // 查看队首和队尾元素
    auto frontItem = queue.front();
    auto rearItem = queue.rear();
    if (frontItem && rearItem) {
        std::cout << "Front: " << *frontItem << ", Rear: " << *rearItem << std::endl;
    }

    // 创建容量为3的覆盖式循环队列
    OverwritingCircularQueue<int> overwritingQueue(3);

    // 入队元素
    overwritingQueue.enqueue(1);
    overwritingQueue.enqueue(2);
    overwritingQueue.enqueue(3);

    // 队列已满，但仍可以入队，会覆盖最旧的元素
    overwritingQueue.enqueue(4);

    // 查看队首元素
    auto frontItem2 = overwritingQueue.front();
    if (frontItem2) {
        std::cout << "Front: " << *frontItem2 << std::endl; // 应该是2，因为1被覆盖了
    }

    return 0;
}
*/
