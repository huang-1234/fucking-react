# 队列算法集合

## 概述

队列是一种先进先出（FIFO）的数据结构，在算法设计中有着广泛的应用。本模块实现了基于队列和滑动窗口技术的经典算法，包括字符串匹配、子数组问题、容器盛水等重要问题。

## 算法目录

### 1. 滑动窗口最大值
- **路径**: `data_nums.js`
- **算法**: 单调队列优化
- **应用**: 数据流处理、实时统计

### 2. 字母异位词查找
- **路径**: `findAnagrams.js`
- **算法**: 滑动窗口 + 哈希表
- **应用**: 字符串匹配、模式识别

### 3. 最长无重复子串
- **路径**: `lengthOfLongestSubstring.js`
- **算法**: 滑动窗口 + 哈希表
- **应用**: 字符串处理、去重

### 4. 盛水容器
- **路径**: `maxArea.js`
- **算法**: 双指针技术
- **应用**: 几何问题、优化问题

### 5. 数组旋转
- **路径**: `rotate.js`
- **算法**: 环形替换、反转
- **应用**: 数组操作、循环移位

## 核心算法设计

### 1. 滑动窗口最大值

#### 问题描述
给定一个数组 `nums` 和滑动窗口的大小 `k`，返回滑动窗口中的最大值数组。

#### 算法设计

**朴素解法 O(nk)**:
```javascript
function maxSlidingWindowNaive(nums, k) {
    const result = []

    for (let i = 0; i <= nums.length - k; i++) {
        let max = nums[i]
        for (let j = i; j < i + k; j++) {
            max = Math.max(max, nums[j])
        }
        result.push(max)
    }

    return result
}
```

**单调队列优化 O(n)**:
```javascript
function maxSlidingWindow(nums, k) {
    const result = []
    const deque = []  // 存储数组索引，保持递减顺序

    for (let i = 0; i < nums.length; i++) {
        // 移除超出窗口范围的元素
        while (deque.length > 0 && deque[0] <= i - k) {
            deque.shift()
        }

        // 维护单调递减队列
        while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
            deque.pop()
        }

        deque.push(i)

        // 当窗口大小达到k时，记录最大值
        if (i >= k - 1) {
            result.push(nums[deque[0]])
        }
    }

    return result
}
```

### 2. 字母异位词查找

#### 问题描述
给定字符串 `s` 和 `p`，找到 `s` 中所有 `p` 的异位词的起始索引。

#### 算法设计
```javascript
function findAnagrams(s, p) {
    if (s.length < p.length) return []

    const result = []
    const pCount = new Array(26).fill(0)
    const windowCount = new Array(26).fill(0)

    // 统计p中字符频次
    for (const char of p) {
        pCount[char.charCodeAt(0) - 97]++
    }

    // 滑动窗口
    for (let i = 0; i < s.length; i++) {
        // 添加右边界字符
        windowCount[s.charCodeAt(i) - 97]++

        // 移除左边界字符（当窗口大小超过p的长度）
        if (i >= p.length) {
            windowCount[s.charCodeAt(i - p.length) - 97]--
        }

        // 检查是否为异位词
        if (i >= p.length - 1 && arraysEqual(pCount, windowCount)) {
            result.push(i - p.length + 1)
        }
    }

    return result
}

function arraysEqual(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}
```

### 3. 最长无重复子串

#### 问题描述
给定字符串 `s`，找出其中不含有重复字符的最长子串的长度。

#### 算法设计
```javascript
function lengthOfLongestSubstring(s) {
    const charMap = new Map()
    let maxLength = 0
    let left = 0

    for (let right = 0; right < s.length; right++) {
        const char = s[right]

        // 如果字符已存在且在当前窗口内
        if (charMap.has(char) && charMap.get(char) >= left) {
            left = charMap.get(char) + 1
        }

        charMap.set(char, right)
        maxLength = Math.max(maxLength, right - left + 1)
    }

    return maxLength
}
```

### 4. 盛水容器

#### 问题描述
给定 `n` 个非负整数表示容器的高度，找出其中的两条线，使得它们与 x 轴构成的容器能够容纳最多的水。

#### 算法设计
```javascript
function maxArea(height) {
    let left = 0
    let right = height.length - 1
    let maxWater = 0

    while (left < right) {
        // 计算当前容器的水量
        const width = right - left
        const currentHeight = Math.min(height[left], height[right])
        const currentArea = width * currentHeight

        maxWater = Math.max(maxWater, currentArea)

        // 移动较矮的指针
        if (height[left] < height[right]) {
            left++
        } else {
            right--
        }
    }

    return maxWater
}
```

### 5. 数组旋转

#### 问题描述
给定数组，将数组中的元素向右轮转 `k` 个位置。

#### 算法设计

**方法一：环形替换**
```javascript
function rotate(nums, k) {
    const n = nums.length
    k = k % n
    let count = 0

    for (let start = 0; count < n; start++) {
        let current = start
        let prev = nums[start]

        do {
            const next = (current + k) % n
            const temp = nums[next]
            nums[next] = prev
            prev = temp
            current = next
            count++
        } while (start !== current)
    }
}
```

**方法二：反转数组**
```javascript
function rotateByReverse(nums, k) {
    k = k % nums.length

    // 反转整个数组
    reverse(nums, 0, nums.length - 1)
    // 反转前k个元素
    reverse(nums, 0, k - 1)
    // 反转后n-k个元素
    reverse(nums, k, nums.length - 1)
}

function reverse(nums, start, end) {
    while (start < end) {
        [nums[start], nums[end]] = [nums[end], nums[start]]
        start++
        end--
    }
}
```

## 高级队列算法

### 1. 单调队列

```javascript
class MonotonicQueue {
    constructor() {
        this.deque = []
    }

    // 添加元素，维护单调性
    push(val) {
        while (this.deque.length > 0 && this.deque[this.deque.length - 1] < val) {
            this.deque.pop()
        }
        this.deque.push(val)
    }

    // 移除元素
    pop(val) {
        if (this.deque.length > 0 && this.deque[0] === val) {
            this.deque.shift()
        }
    }

    // 获取最大值
    max() {
        return this.deque.length > 0 ? this.deque[0] : null
    }
}
```

### 2. 优先队列（堆实现）

```javascript
class PriorityQueue {
    constructor(compareFn = (a, b) => a - b) {
        this.heap = []
        this.compare = compareFn
    }

    parent(index) {
        return Math.floor((index - 1) / 2)
    }

    leftChild(index) {
        return 2 * index + 1
    }

    rightChild(index) {
        return 2 * index + 2
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
    }

    enqueue(value) {
        this.heap.push(value)
        this.heapifyUp(this.heap.length - 1)
    }

    dequeue() {
        if (this.heap.length === 0) return null
        if (this.heap.length === 1) return this.heap.pop()

        const root = this.heap[0]
        this.heap[0] = this.heap.pop()
        this.heapifyDown(0)

        return root
    }

    heapifyUp(index) {
        while (index > 0) {
            const parentIndex = this.parent(index)
            if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) {
                break
            }
            this.swap(index, parentIndex)
            index = parentIndex
        }
    }

    heapifyDown(index) {
        while (this.leftChild(index) < this.heap.length) {
            let minIndex = this.leftChild(index)
            const rightIndex = this.rightChild(index)

            if (rightIndex < this.heap.length &&
                this.compare(this.heap[rightIndex], this.heap[minIndex]) < 0) {
                minIndex = rightIndex
            }

            if (this.compare(this.heap[index], this.heap[minIndex]) <= 0) {
                break
            }

            this.swap(index, minIndex)
            index = minIndex
        }
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0] : null
    }

    size() {
        return this.heap.length
    }

    isEmpty() {
        return this.heap.length === 0
    }
}
```

### 3. 循环队列

```javascript
class CircularQueue {
    constructor(k) {
        this.queue = new Array(k)
        this.head = -1
        this.tail = -1
        this.size = k
    }

    enQueue(value) {
        if (this.isFull()) return false

        if (this.isEmpty()) {
            this.head = 0
        }

        this.tail = (this.tail + 1) % this.size
        this.queue[this.tail] = value

        return true
    }

    deQueue() {
        if (this.isEmpty()) return false

        if (this.head === this.tail) {
            this.head = -1
            this.tail = -1
        } else {
            this.head = (this.head + 1) % this.size
        }

        return true
    }

    Front() {
        return this.isEmpty() ? -1 : this.queue[this.head]
    }

    Rear() {
        return this.isEmpty() ? -1 : this.queue[this.tail]
    }

    isEmpty() {
        return this.head === -1
    }

    isFull() {
        return ((this.tail + 1) % this.size) === this.head
    }
}
```

## 时间复杂度分析

| 算法 | 时间复杂度 | 空间复杂度 | 特点 |
|------|------------|------------|------|
| 滑动窗口最大值(朴素) | O(nk) | O(1) | 简单直观 |
| 滑动窗口最大值(单调队列) | O(n) | O(k) | 高效优化 |
| 字母异位词查找 | O(n) | O(1) | 固定窗口 |
| 最长无重复子串 | O(n) | O(min(m,n)) | 动态窗口 |
| 盛水容器 | O(n) | O(1) | 双指针 |
| 数组旋转(环形替换) | O(n) | O(1) | 原地操作 |

## 应用场景

### 1. 实时数据处理
```javascript
// 股票价格滑动窗口分析
function analyzeStockPrices(prices, windowSize) {
    const maxPrices = maxSlidingWindow(prices, windowSize)
    const trends = []

    for (let i = 1; i < maxPrices.length; i++) {
        if (maxPrices[i] > maxPrices[i - 1]) {
            trends.push('上涨')
        } else if (maxPrices[i] < maxPrices[i - 1]) {
            trends.push('下跌')
        } else {
            trends.push('持平')
        }
    }

    return { maxPrices, trends }
}
```

### 2. 网络流量监控
```javascript
// 网络请求频率限制
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests
        this.timeWindow = timeWindow
        this.requests = []
    }

    isAllowed() {
        const now = Date.now()

        // 移除超出时间窗口的请求
        while (this.requests.length > 0 &&
               now - this.requests[0] > this.timeWindow) {
            this.requests.shift()
        }

        if (this.requests.length < this.maxRequests) {
            this.requests.push(now)
            return true
        }

        return false
    }
}
```

## 测试用例

```javascript
// 滑动窗口最大值测试
console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3))  // [3,3,5,5,6,7]

// 字母异位词查找测试
console.log(findAnagrams("abab", "ab"))  // [0,2]
console.log(findAnagrams("abcab", "ab"))  // [0,3]

// 最长无重复子串测试
console.log(lengthOfLongestSubstring("abcabcbb"))  // 3
console.log(lengthOfLongestSubstring("bbbbb"))     // 1

// 盛水容器测试
console.log(maxArea([1,8,6,2,5,4,8,3,7]))  // 49

// 数组旋转测试
const nums = [1,2,3,4,5,6,7]
rotate(nums, 3)
console.log(nums)  // [5,6,7,1,2,3,4]
```

## 总结

队列算法通过FIFO的特性和滑动窗口技术，为解决序列处理、实时计算等问题提供了高效的解决方案。单调队列、优先队列等高级数据结构进一步扩展了队列的应用范围，在算法竞赛和实际工程中都有重要价值。掌握这些算法对于处理流式数据和优化问题具有重要意义。