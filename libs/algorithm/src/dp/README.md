# 动态规划算法集合

## 概述

动态规划（Dynamic Programming，DP）是一种通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。本模块实现了经典的动态规划算法，包括最长递增子序列等重要问题。

## 算法目录

### 1. 最长递增子序列 (Longest Increasing Subsequence, LIS)
- **路径**: `lengthOfLIS/`
- **实现版本**: 
  - `lengthOfLIS_dp1.js` - 经典DP解法 O(n²)
  - `lengthOfLIS_tails.js` - 优化解法 O(n log n)

## 核心算法设计

### 最长递增子序列算法

#### 问题描述
给定一个整数数组 `nums`，找到其中最长严格递增子序列的长度。

**示例**:
```
输入: nums = [10,9,2,5,3,7,101,18]
输出: 4
解释: 最长递增子序列是 [2,3,7,18]，因此长度为 4
```

#### 解法一：经典动态规划 O(n²)

**算法思路**:
使用 `dp[i]` 表示以 `nums[i]` 结尾的最长递增子序列的长度。

**核心步骤**:

1. **状态定义**
```javascript
// dp[i] 表示以 nums[i] 结尾的最长递增子序列长度
const dp = new Array(nums.length).fill(1)
```

2. **状态转移方程**
```javascript
// 对于每个位置 i，检查所有前面的位置 j
for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
            dp[i] = Math.max(dp[i], dp[j] + 1)
        }
    }
}
```

3. **完整实现**
```javascript
function lengthOfLIS(nums) {
    if (nums.length === 0) return 0
    
    const dp = new Array(nums.length).fill(1)
    let maxLength = 1
    
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
        maxLength = Math.max(maxLength, dp[i])
    }
    
    return maxLength
}
```

**时间复杂度**: O(n²)  
**空间复杂度**: O(n)

#### 解法二：贪心 + 二分查找 O(n log n)

**算法思路**:
维护一个 `tails` 数组，其中 `tails[i]` 表示长度为 `i+1` 的递增子序列的最小尾部元素。

**核心步骤**:

1. **数据结构设计**
```javascript
// tails[i] = 长度为 i+1 的递增子序列的最小尾部元素
const tails = []
```

2. **贪心策略**
```javascript
function lengthOfLIS(nums) {
    const tails = []
    
    for (const num of nums) {
        // 二分查找插入位置
        let left = 0, right = tails.length
        
        while (left < right) {
            const mid = Math.floor((left + right) / 2)
            if (tails[mid] < num) {
                left = mid + 1
            } else {
                right = mid
            }
        }
        
        // 如果 left === tails.length，说明 num 比所有元素都大
        if (left === tails.length) {
            tails.push(num)
        } else {
            tails[left] = num  // 替换为更小的元素
        }
    }
    
    return tails.length
}
```

**关键洞察**:
- `tails` 数组始终保持递增
- 对于相同长度的子序列，保留尾部元素最小的那个
- 二分查找找到第一个 ≥ 当前元素的位置进行替换

**时间复杂度**: O(n log n)  
**空间复杂度**: O(n)

#### 算法对比分析

| 方法 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 |
|------|------------|------------|------|------|
| 经典DP | O(n²) | O(n) | 思路直观，易理解 | 效率较低 |
| 贪心+二分 | O(n log n) | O(n) | 效率高 | 理解难度大 |

#### 扩展变形

1. **最长递减子序列**
```javascript
// 只需修改比较条件
if (nums[j] > nums[i]) {  // 改为 >
    dp[i] = Math.max(dp[i], dp[j] + 1)
}
```

2. **最长非递减子序列**
```javascript
// 允许相等元素
if (nums[j] <= nums[i]) {  // 改为 <=
    dp[i] = Math.max(dp[i], dp[j] + 1)
}
```

3. **打印具体的LIS序列**
```javascript
function printLIS(nums) {
    const dp = new Array(nums.length).fill(1)
    const prev = new Array(nums.length).fill(-1)
    let maxLength = 1, maxIndex = 0
    
    // 构建DP表和前驱数组
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1
                prev[i] = j  // 记录前驱
            }
        }
        if (dp[i] > maxLength) {
            maxLength = dp[i]
            maxIndex = i
        }
    }
    
    // 回溯构建序列
    const result = []
    let current = maxIndex
    while (current !== -1) {
        result.unshift(nums[current])
        current = prev[current]
    }
    
    return result
}
```

## 动态规划设计模式

### 1. 状态设计原则
- **明确状态含义**: 每个状态代表什么
- **状态无后效性**: 当前状态不依赖未来状态
- **状态完备性**: 能够表示所有可能的情况

### 2. 转移方程设计
- **最优子结构**: 问题的最优解包含子问题的最优解
- **重叠子问题**: 递归过程中存在重复计算
- **边界条件**: 明确初始状态和边界情况

### 3. 优化技巧
- **空间优化**: 滚动数组、状态压缩
- **时间优化**: 单调队列、数据结构优化
- **记忆化搜索**: 自顶向下的DP实现

## 实际应用场景

### 1. 股票交易问题
```javascript
// 最多进行k次交易的最大利润
function maxProfit(k, prices) {
    // buy[i][j] = 第i天进行了j次交易后持有股票的最大利润
    // sell[i][j] = 第i天进行了j次交易后不持有股票的最大利润
}
```

### 2. 编辑距离
```javascript
// 将字符串s1转换为s2的最小操作数
function editDistance(s1, s2) {
    // dp[i][j] = s1[0...i-1]转换为s2[0...j-1]的最小操作数
}
```

### 3. 背包问题
```javascript
// 0-1背包问题
function knapsack(weights, values, capacity) {
    // dp[i][w] = 前i个物品在容量为w时的最大价值
}
```

## 测试用例

```javascript
// 测试最长递增子序列
console.log(lengthOfLIS([10,9,2,5,3,7,101,18]))  // 4
console.log(lengthOfLIS([0,1,0,3,2,3]))          // 4
console.log(lengthOfLIS([7,7,7,7,7,7,7]))        // 1
console.log(lengthOfLIS([1,3,6,7,9,4,10,5,6]))   // 6

// 边界情况
console.log(lengthOfLIS([]))                      // 0
console.log(lengthOfLIS([1]))                     // 1
console.log(lengthOfLIS([2,1]))                   // 1
```

## 学习建议

1. **理解状态转移**: 重点掌握如何设计状态和转移方程
2. **多做练习**: 通过大量练习培养DP思维
3. **总结模式**: 归纳常见的DP问题类型和解法模板
4. **优化意识**: 学会分析和优化DP算法的时空复杂度

## 扩展阅读

1. **区间DP**: 处理区间相关的动态规划问题
2. **树形DP**: 在树结构上进行动态规划
3. **数位DP**: 处理数字相关的计数问题
4. **状态压缩DP**: 使用位运算优化状态表示

动态规划是算法设计中的重要思想，通过合理的状态设计和转移方程，可以高效解决许多复杂的优化问题。