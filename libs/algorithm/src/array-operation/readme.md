# 数组操作算法集合

## 概述

本模块包含了高效的数组操作算法实现，主要包括差分数组、区间问题等核心算法。这些算法在处理大量区间更新、范围查询等场景中具有重要应用价值。

## 算法目录

### 1. 差分数组 (Difference Array)
- **路径**: `diff-array/`
- **核心算法**: 区间更新优化
- **应用场景**: 会议室预定系统、资源调度、区间批量更新

### 2. 区间问题 (Interval Problems)
- **路径**: `interval-problem/`
- **核心算法**: 最大子数组和
- **应用场景**: 股票买卖、连续子序列优化

## 核心算法设计

### 差分数组算法

#### 算法原理
差分数组是一种用于高效处理区间更新操作的数据结构。通过维护原数组的差分信息，可以将区间更新的时间复杂度从 O(n) 降低到 O(1)。

#### 核心步骤

1. **初始化差分数组**
```javascript
// 对于原数组 arr，构建差分数组 diff
diff[0] = arr[0]
for (let i = 1; i < n; i++) {
    diff[i] = arr[i] - arr[i-1]
}
```

2. **区间更新操作**
```javascript
// 对区间 [left, right] 增加 val
function rangeUpdate(left, right, val) {
    diff[left] += val
    if (right + 1 < n) {
        diff[right + 1] -= val
    }
}
```

3. **还原原数组**
```javascript
// 从差分数组还原原数组
function restore() {
    arr[0] = diff[0]
    for (let i = 1; i < n; i++) {
        arr[i] = arr[i-1] + diff[i]
    }
}
```

#### 时间复杂度分析
- **区间更新**: O(1)
- **单点查询**: O(n) (需要还原)
- **空间复杂度**: O(n)

#### 应用实例：会议室预定系统

**问题描述**: 实现一个会议室预定系统，支持预定、取消、查询可用性等操作。

**设计思路**:
1. 使用差分数组维护时间段占用状态
2. 预定操作转化为区间更新
3. 取消操作为逆向区间更新
4. 查询通过还原数组检查

**核心实现**:
```javascript
class MeetingRoomSystem {
    constructor(size = 24) {
        this.size = size
        this.diff = new Array(size + 1).fill(0)
        this.arr = new Array(size).fill(0)
        this.bookings = new Map()
        this.nextId = 1
    }
    
    // 预定会议室
    bookRoom(start, end) {
        // 检查可用性
        if (!this.isAvailable(start, end)) {
            return -1
        }
        
        // 差分数组更新
        this.diff[start] += 1
        if (end < this.size) this.diff[end] -= 1
        
        // 重建数组
        this._rebuildArray()
        
        // 记录预定
        const bookingId = this.nextId++
        this.bookings.set(bookingId, {start, end})
        return bookingId
    }
    
    // 取消预定
    cancelBooking(bookingId) {
        if (!this.bookings.has(bookingId)) {
            return false
        }
        
        const {start, end} = this.bookings.get(bookingId)
        
        // 逆向差分更新
        this.diff[start] -= 1
        if (end < this.size) this.diff[end] += 1
        
        this._rebuildArray()
        this.bookings.delete(bookingId)
        return true
    }
    
    // 重建数组
    _rebuildArray() {
        this.arr[0] = this.diff[0]
        for (let i = 1; i < this.size; i++) {
            this.arr[i] = this.arr[i - 1] + this.diff[i]
        }
    }
}
```

### 最大子数组和算法 (Kadane's Algorithm)

#### 算法原理
动态规划思想，通过维护以当前位置结尾的最大子数组和，逐步求解全局最优解。

#### 核心步骤

1. **状态定义**
```javascript
// dp[i] 表示以 nums[i] 结尾的最大子数组和
dp[i] = max(nums[i], dp[i-1] + nums[i])
```

2. **状态转移**
```javascript
function maxSubArray(nums) {
    let maxSum = nums[0]
    let currentSum = nums[0]
    
    for (let i = 1; i < nums.length; i++) {
        // 选择：重新开始 vs 继续累加
        currentSum = Math.max(nums[i], currentSum + nums[i])
        maxSum = Math.max(maxSum, currentSum)
    }
    
    return maxSum
}
```

#### 时间复杂度分析
- **时间复杂度**: O(n)
- **空间复杂度**: O(1)

#### 扩展应用
1. **股票买卖最佳时机**
2. **环形数组最大子数组和**
3. **二维数组最大子矩阵和**

## 性能对比

| 算法 | 操作类型 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|----------|------------|------------|----------|
| 差分数组 | 区间更新 | O(1) | O(n) | 频繁区间更新 |
| 差分数组 | 单点查询 | O(n) | O(n) | 批量查询 |
| Kadane算法 | 最大子数组 | O(n) | O(1) | 连续子序列优化 |

## 使用建议

### 差分数组适用场景
1. **频繁区间更新，少量查询**
2. **批量处理后统一查询**
3. **资源调度系统**
4. **时间段管理**

### 最大子数组算法适用场景
1. **股票交易问题**
2. **游戏得分优化**
3. **信号处理**
4. **数据分析**

## 扩展阅读

1. **线段树**: 支持区间更新和区间查询的高级数据结构
2. **树状数组**: 另一种高效的区间操作数据结构
3. **分治算法**: 最大子数组和的分治解法
4. **前缀和**: 区间查询的基础技术

## 测试用例

```javascript
// 差分数组测试
const room = new MeetingRoomSystem(8)
const booking1 = room.bookRoom(1, 3)  // 预定1-3点
const booking2 = room.bookRoom(4, 6)  // 预定4-6点
console.log(room.isAvailable(2, 4))   // false (冲突)
room.cancelBooking(booking1)          // 取消预定
console.log(room.isAvailable(1, 3))   // true (可用)

// 最大子数组测试
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  // 6
console.log(maxSubArray([1]))                        // 1
console.log(maxSubArray([5,4,-1,7,8]))              // 23
```

## 总结

数组操作算法是算法设计中的基础且重要的部分。差分数组通过巧妙的数学变换实现了高效的区间更新，而最大子数组算法展示了动态规划的经典应用。掌握这些算法对于解决实际工程问题具有重要意义。