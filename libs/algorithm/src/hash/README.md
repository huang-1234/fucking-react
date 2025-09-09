# 哈希算法集合

## 概述

哈希算法是一类重要的算法，通过哈希函数将任意长度的数据映射为固定长度的哈希值。本模块实现了基于哈希表的经典算法，特别是最长连续序列问题的高效解法。

## 算法目录

### 1. 最长连续序列
- **路径**: `longestConsecutive.js`
- **算法**: 基于哈希表的O(n)解法
- **应用**: 数组处理、序列分析

## 核心算法设计

### 最长连续序列算法

#### 问题描述
给定一个未排序的整数数组 `nums`，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

**要求**: 时间复杂度为 O(n)

**示例**:
```
输入: nums = [100,4,200,1,3,2]
输出: 4
解释: 最长数字连续序列是 [1, 2, 3, 4]，长度为 4
```

#### 算法设计思路

1. **朴素解法 O(n log n)**
```javascript
function longestConsecutiveNaive(nums) {
    if (nums.length === 0) return 0
    
    // 排序
    nums.sort((a, b) => a - b)
    
    let maxLength = 1
    let currentLength = 1
    
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            continue  // 跳过重复元素
        } else if (nums[i] === nums[i - 1] + 1) {
            currentLength++
        } else {
            maxLength = Math.max(maxLength, currentLength)
            currentLength = 1
        }
    }
    
    return Math.max(maxLength, currentLength)
}
```

2. **哈希表优化解法 O(n)**

**核心思想**: 
- 使用哈希表存储所有数字，实现O(1)查找
- 对每个数字，只有当它是序列起点时才开始计算长度
- 序列起点的特征：`num - 1` 不在哈希表中

```javascript
function longestConsecutive(nums) {
    if (nums.length === 0) return 0
    
    // 使用Set去重并提供O(1)查找
    const numSet = new Set(nums)
    let maxLength = 0
    
    for (const num of numSet) {
        // 只有当num是序列起点时才计算
        if (!numSet.has(num - 1)) {
            let currentNum = num
            let currentLength = 1
            
            // 向右扩展序列
            while (numSet.has(currentNum + 1)) {
                currentNum++
                currentLength++
            }
            
            maxLength = Math.max(maxLength, currentLength)
        }
    }
    
    return maxLength
}
```

#### 算法分析

**时间复杂度**: O(n)
- 虽然有嵌套循环，但每个数字最多被访问两次
- 外层循环访问一次，内层while循环最多访问一次
- 总体时间复杂度为O(n)

**空间复杂度**: O(n)
- 需要额外的哈希表存储所有数字

#### 详细实现

```javascript
function longestConsecutive(nums) {
    if (!nums || nums.length === 0) return 0
    
    const numSet = new Set(nums)
    let maxLength = 0
    
    for (const num of numSet) {
        // 检查是否为序列起点
        if (!numSet.has(num - 1)) {
            let currentNum = num
            let currentLength = 1
            
            // 向右扩展，寻找连续数字
            while (numSet.has(currentNum + 1)) {
                currentNum += 1
                currentLength += 1
            }
            
            // 更新最大长度
            maxLength = Math.max(maxLength, currentLength)
        }
    }
    
    return maxLength
}
```

#### 扩展变形

1. **返回最长连续序列**
```javascript
function longestConsecutiveSequence(nums) {
    if (!nums || nums.length === 0) return []
    
    const numSet = new Set(nums)
    let maxLength = 0
    let longestSequence = []
    
    for (const num of numSet) {
        if (!numSet.has(num - 1)) {
            const currentSequence = [num]
            let currentNum = num
            
            while (numSet.has(currentNum + 1)) {
                currentNum += 1
                currentSequence.push(currentNum)
            }
            
            if (currentSequence.length > maxLength) {
                maxLength = currentSequence.length
                longestSequence = currentSequence
            }
        }
    }
    
    return longestSequence
}
```

2. **所有最长连续序列**
```javascript
function allLongestConsecutiveSequences(nums) {
    if (!nums || nums.length === 0) return []
    
    const numSet = new Set(nums)
    let maxLength = 0
    const allSequences = []
    
    for (const num of numSet) {
        if (!numSet.has(num - 1)) {
            const currentSequence = [num]
            let currentNum = num
            
            while (numSet.has(currentNum + 1)) {
                currentNum += 1
                currentSequence.push(currentNum)
            }
            
            if (currentSequence.length > maxLength) {
                maxLength = currentSequence.length
                allSequences.length = 0  // 清空之前的序列
                allSequences.push(currentSequence)
            } else if (currentSequence.length === maxLength) {
                allSequences.push(currentSequence)
            }
        }
    }
    
    return allSequences
}
```

3. **带权重的连续序列**
```javascript
function longestConsecutiveWithWeight(nums, weights) {
    if (!nums || nums.length === 0) return { length: 0, weight: 0 }
    
    const numMap = new Map()
    
    // 构建数字到权重的映射
    for (let i = 0; i < nums.length; i++) {
        if (!numMap.has(nums[i])) {
            numMap.set(nums[i], weights[i])
        } else {
            // 如果有重复数字，取较大权重
            numMap.set(nums[i], Math.max(numMap.get(nums[i]), weights[i]))
        }
    }
    
    let maxLength = 0
    let maxWeight = 0
    
    for (const [num] of numMap) {
        if (!numMap.has(num - 1)) {
            let currentNum = num
            let currentLength = 1
            let currentWeight = numMap.get(num)
            
            while (numMap.has(currentNum + 1)) {
                currentNum += 1
                currentLength += 1
                currentWeight += numMap.get(currentNum)
            }
            
            if (currentLength > maxLength || 
                (currentLength === maxLength && currentWeight > maxWeight)) {
                maxLength = currentLength
                maxWeight = currentWeight
            }
        }
    }
    
    return { length: maxLength, weight: maxWeight }
}
```

## 哈希表相关算法

### 1. 两数之和

```javascript
function twoSum(nums, target) {
    const map = new Map()
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i]
        
        if (map.has(complement)) {
            return [map.get(complement), i]
        }
        
        map.set(nums[i], i)
    }
    
    return []
}
```

### 2. 字符串中的第一个唯一字符

```javascript
function firstUniqChar(s) {
    const charCount = new Map()
    
    // 统计字符频次
    for (const char of s) {
        charCount.set(char, (charCount.get(char) || 0) + 1)
    }
    
    // 找到第一个频次为1的字符
    for (let i = 0; i < s.length; i++) {
        if (charCount.get(s[i]) === 1) {
            return i
        }
    }
    
    return -1
}
```

### 3. 有效的字母异位词

```javascript
function isAnagram(s, t) {
    if (s.length !== t.length) return false
    
    const charCount = new Map()
    
    // 统计s中字符频次
    for (const char of s) {
        charCount.set(char, (charCount.get(char) || 0) + 1)
    }
    
    // 减去t中字符频次
    for (const char of t) {
        if (!charCount.has(char)) return false
        
        charCount.set(char, charCount.get(char) - 1)
        
        if (charCount.get(char) === 0) {
            charCount.delete(char)
        }
    }
    
    return charCount.size === 0
}
```

### 4. 分组字母异位词

```javascript
function groupAnagrams(strs) {
    const groups = new Map()
    
    for (const str of strs) {
        // 使用排序后的字符串作为key
        const key = str.split('').sort().join('')
        
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        
        groups.get(key).push(str)
    }
    
    return Array.from(groups.values())
}
```

## 哈希函数设计

### 1. 简单哈希函数

```javascript
function simpleHash(str, tableSize) {
    let hash = 0
    
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i)
    }
    
    return hash % tableSize
}
```

### 2. DJB2哈希函数

```javascript
function djb2Hash(str) {
    let hash = 5381
    
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i)
    }
    
    return hash >>> 0  // 转换为无符号32位整数
}
```

### 3. 多项式滚动哈希

```javascript
class RollingHash {
    constructor(base = 31, mod = 1e9 + 7) {
        this.base = base
        this.mod = mod
    }
    
    hash(str) {
        let hash = 0
        let power = 1
        
        for (let i = 0; i < str.length; i++) {
            hash = (hash + (str.charCodeAt(i) * power)) % this.mod
            power = (power * this.base) % this.mod
        }
        
        return hash
    }
    
    // 滑动窗口哈希更新
    updateHash(oldHash, oldChar, newChar, windowSize) {
        // 移除最左边的字符
        const oldCharValue = oldChar.charCodeAt(0)
        const power = this.fastPow(this.base, windowSize - 1)
        oldHash = (oldHash - (oldCharValue * power) % this.mod + this.mod) % this.mod
        
        // 添加新字符
        oldHash = (oldHash * this.base + newChar.charCodeAt(0)) % this.mod
        
        return oldHash
    }
    
    fastPow(base, exp) {
        let result = 1
        while (exp > 0) {
            if (exp % 2 === 1) {
                result = (result * base) % this.mod
            }
            base = (base * base) % this.mod
            exp = Math.floor(exp / 2)
        }
        return result
    }
}
```

## 性能对比

| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|------------|------------|----------|
| 最长连续序列(排序) | O(n log n) | O(1) | 空间受限 |
| 最长连续序列(哈希) | O(n) | O(n) | 时间优先 |
| 两数之和(暴力) | O(n²) | O(1) | 小数据集 |
| 两数之和(哈希) | O(n) | O(n) | 大数据集 |

## 测试用例

```javascript
// 最长连续序列测试
console.log(longestConsecutive([100,4,200,1,3,2]))  // 4
console.log(longestConsecutive([0,3,7,2,5,8,4,6,0,1]))  // 9
console.log(longestConsecutive([]))  // 0
console.log(longestConsecutive([1]))  // 1

// 返回序列测试
console.log(longestConsecutiveSequence([100,4,200,1,3,2]))  // [1,2,3,4]

// 两数之和测试
console.log(twoSum([2,7,11,15], 9))  // [0,1]
console.log(twoSum([3,2,4], 6))      // [1,2]

// 字母异位词测试
console.log(isAnagram("anagram", "nagaram"))  // true
console.log(isAnagram("rat", "car"))          // false

// 分组异位词测试
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]))
// [["eat","tea","ate"],["tan","nat"],["bat"]]
```

## 应用场景

1. **数据去重**: 使用Set快速去除重复元素
2. **快速查找**: O(1)时间复杂度的查找操作
3. **缓存系统**: LRU缓存的实现基础
4. **数据库索引**: 哈希索引的底层实现
5. **分布式系统**: 一致性哈希算法
6. **密码学**: 哈希函数在安全领域的应用

## 总结

哈希算法通过空间换时间的策略，在许多场景下能够显著提升算法效率。最长连续序列问题展示了如何巧妙地使用哈希表将O(n log n)的问题优化到O(n)。掌握哈希表的使用技巧对于解决查找、去重、分组等问题具有重要意义。