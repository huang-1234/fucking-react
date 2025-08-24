### 📦 2548. 填满背包的最大价格（0-1背包问题）

---

#### 📝 **问题描述**
给定一组物品，每个物品有重量 `weight[i]` 和价值 `value[i]`，以及一个容量为 `capacity` 的背包。每个物品**只能选或不选**（不可重复使用），求在**恰好装满背包**的前提下，能获得的最大总价值。若无法恰好装满，返回 `-1`。

#### ⚙️ **输入输出示例**
1. **示例 1**
   - 输入：
     ```python
     weights = [2, 3, 5]
     values = [1, 5, 4]
     capacity = 6
     ```
   - 输出：`9`
   - 解释：选物品1（重3，值5）和物品2（重5，值4），总重 `3+5=8>6`？ 更正：物品0（重2，值1）、物品1（重3，值5）、物品2（重5，值4）。
     实际：选物品1（重3，值5）和物品2（重5，值4），总重 `3+5=8>6` 无效；正确方案是物品0和物品2（重2+5=7>6？），或物品1和物品2（重3+5=8>6）。
     重新设计：
     ```
     weights = [1, 2, 3]
     values = [6, 10, 12]
     capacity = 5
     ```
     输出：`22`（选物品1重2值10 + 物品2重3值12）

2. **示例 2**
   - 输入：
     ```python
     weights = [2]
     values = [1]
     capacity = 3
     ```
   - 输出：`-1`
   - 解释：无法用重2的物品装满容量3的背包。

3. **边界示例**
   - 输入：`weights = [], values = [], capacity = 0` → 输出：`0`（空背包）
   - 输入：`weights = [1], values = [10], capacity = 1` → 输出：`10`

---

#### 🧠 **算法与思考过程**
**核心目标**：在总重量**恰好等于** `capacity` 的前提下最大化总价值。

##### 🔢 **动态规划解法**
1. **状态定义**
   - `dp[j]`：容量为 `j` 的背包**恰好装满**时的最大价值。
   - 初始化：
     - `dp[0] = 0`（容量0时价值为0）
     - `dp[j] = -∞`（`j > 0`，表示未装满）。

2. **状态转移方程**
   - 对于每个物品 `i`，遍历背包容量 `j` **从大到小**（避免重复选择）：
     ```python
     if j >= weights[i]:
         dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
     ```
   - **关键**：仅当 `dp[j - weights[i]]` 不是 `-∞` 时，说明剩余容量可被装满。

3. **填表逻辑**
   - **倒序遍历背包容量**：确保每个物品只选一次（0-1背包特性）。
   - **初始化负无穷**：强制要求恰好装满，若未装满则值无效。

4. **结果提取**
   - 若 `dp[capacity] > -∞` → 返回 `dp[capacity]`
   - 否则返回 `-1`。

##### ⏱️ **复杂度分析**
- **时间复杂度**：`O(n * capacity)`（`n` 为物品数量）
- **空间复杂度**：`O(capacity)`（一维DP表优化）。

---

#### 💻 **完整代码（JavaScript）**
```javascript
/**
 * @param {number[]} weights
 * @param {number[]} values
 * @param {number} capacity
 * @return {number}
 */
function knapsack(weights, values, capacity) {
    const n = weights.length;
    // 初始化DP数组：dp[j]表示容量j恰好装满时的最大价值
    const dp = new Array(capacity + 1).fill(Number.MIN_SAFE_INTEGER);
    dp[0] = 0;  // 容量0时价值为0（已装满）

    // 动态规划填表
    for (let i = 0; i < n; i++) {
        // 倒序遍历背包容量（避免重复选择）
        for (let j = capacity; j >= weights[i]; j--) {
            if (dp[j - weights[i]] !== Number.MIN_SAFE_INTEGER) {
                dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
            }
        }
    }

    // 返回结果（若未装满则返回-1）
    return dp[capacity] > Number.MIN_SAFE_INTEGER ? dp[capacity] : -1;
}

// 测试示例
console.log(knapsack([1, 2, 3], [6, 10, 12], 5)); // 输出：22 (10+12)
console.log(knapsack([2], [1], 3));                // 输出：-1
```

---

#### 🚀 **关键点总结**
1. **恰好装满**：
   - 初始化 `dp[0]=0`，其他为 `-∞`，确保状态转移仅基于有效装满方案。
2. **一维DP空间优化**：
   - 倒序遍历背包容量避免重复选择，空间复杂度降至 `O(capacity)`。
3. **0-1背包与完全背包区别**：
   - 0-1背包：物品不可重复 → **倒序**遍历容量
   - 完全背包：物品可重复 → **正序**遍历容量。

此解法可扩展至其他背包变种（如分割等和子集、目标和问题），只需调整状态定义和转移逻辑。