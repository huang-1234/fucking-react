/**
 * 优先队列的C++实现
 * 基于二叉堆实现，支持最小优先队列和最大优先队列
 */
#include <vector>
#include <functional>
#include <algorithm>
#include <stdexcept>

template <typename T, typename Compare = std::less<T>>
class PriorityQueue {
private:
    // 存储堆元素的数组
    std::vector<std::pair<T, int>> heap;

    // 比较函数，用于确定元素的优先级
    Compare compare;

    // 向上调整堆
    void heapifyUp(int index) {
        while (index > 0) {
            int parentIndex = (index - 1) / 2;
            if (compare(heap[parentIndex].second, heap[index].second)) {
                break;
            }
            std::swap(heap[index], heap[parentIndex]);
            index = parentIndex;
        }
    }

    // 向下调整堆
    void heapifyDown(int index) {
        int size = heap.size();
        while (true) {
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;
            int smallest = index;

            if (leftChild < size && compare(heap[leftChild].second, heap[smallest].second)) {
                smallest = leftChild;
            }

            if (rightChild < size && compare(heap[rightChild].second, heap[smallest].second)) {
                smallest = rightChild;
            }

            if (smallest == index) {
                break;
            }

            std::swap(heap[index], heap[smallest]);
            index = smallest;
        }
    }

public:
    // 构造函数
    PriorityQueue() : compare(Compare()) {}

    // 入队操作
    void enqueue(const T& value, int priority) {
        heap.push_back(std::make_pair(value, priority));
        heapifyUp(heap.size() - 1);
    }

    // 出队操作
    T dequeue() {
        if (isEmpty()) {
            throw std::runtime_error("Priority queue is empty");
        }

        T result = heap[0].first;
        heap[0] = heap.back();
        heap.pop_back();

        if (!heap.empty()) {
            heapifyDown(0);
        }

        return result;
    }

    // 查看队首元素但不移除
    T peek() const {
        if (isEmpty()) {
            throw std::runtime_error("Priority queue is empty");
        }
        return heap[0].first;
    }

    // 获取队列大小
    size_t size() const {
        return heap.size();
    }

    // 检查队列是否为空
    bool isEmpty() const {
        return heap.empty();
    }

    // 清空队列
    void clear() {
        heap.clear();
    }
};

// 最小优先队列（数字越小优先级越高）
template <typename T>
using MinPriorityQueue = PriorityQueue<T, std::less<int>>;

// 最大优先队列（数字越大优先级越高）
template <typename T>
using MaxPriorityQueue = PriorityQueue<T, std::greater<int>>;

// 使用示例
/*
int main() {
    // 创建最小优先队列
    MinPriorityQueue<std::string> minQueue;
    minQueue.enqueue("Task 1", 5);
    minQueue.enqueue("Task 2", 2);
    minQueue.enqueue("Task 3", 8);

    // 按优先级顺序出队
    while (!minQueue.isEmpty()) {
        std::cout << minQueue.dequeue() << std::endl;
    }

    // 创建最大优先队列
    MaxPriorityQueue<std::string> maxQueue;
    maxQueue.enqueue("Task A", 5);
    maxQueue.enqueue("Task B", 2);
    maxQueue.enqueue("Task C", 8);

    // 按优先级顺序出队
    while (!maxQueue.isEmpty()) {
        std::cout << maxQueue.dequeue() << std::endl;
    }

    return 0;
}
*/
