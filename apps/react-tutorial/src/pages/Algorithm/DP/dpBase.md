下面我将系统梳理各类动态规划（DP）问题，提供问题描述、测试用例、算法解析与TypeScript实现，并设计可视化技术方案。内容分为五个部分：

---

### 一、经典动态规划问题扩展
#### 1. **经典线性DP：爬楼梯问题**
- **问题描述**：每次爬1或2阶，求到达第`n`阶的方案数
- **测试用例**：
  ```typescript
  n=3 → 3 (1+2, 2+1, 1+1+1)
  n=5 → 8
  ```
- **核心算法**：
  ```typescript
  function climbStairs(n: number): number {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
      [a, b] = [b, a + b];  // 状态转移：dp[i] = dp[i-1] + dp[i-2]
    }
    return b;
  }
  ```

#### 2. **二维DP：最小路径和**
- **问题描述**：在`m x n`网格中从左上角到右下角，求数字和最小的路径
- **测试用例**：
  ```typescript
  grid = [[1,3,1],[1,5,1],[4,2,1]] → 7 (1→3→1→1→1)
  ```
- **算法步骤**：
  1. 初始化第一行/列累加和
  2. 状态转移：`dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`
- **TS实现**：
  ```typescript
  function minPathSum(grid: number[][]): number {
    const m = grid.length, n = grid[0].length;
    for (let i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
    for (let j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
      }
    }
    return grid[m-1][n-1];
  }
  ```

#### 3. **背包问题：0-1背包**
- **问题描述**：容量`C`的背包，`n`个物品（重量`w[i]`，价值`v[i]`），求最大价值
- **测试用例**：
  ```typescript
  weights = [2,3,4], values = [3,4,5], C=5 → 7 (选物品0和2)
  ```
- **状态转移**：
  `dp[j] = max(dp[j], dp[j - w[i]] + v[i])` （倒序遍历容量）
- **TS代码**：
  ```typescript
  function knapsack(weights: number[], values: number[], C: number): number {
    const dp: number[] = new Array(C+1).fill(0);
    for (let i = 0; i < weights.length; i++) {
      for (let j = C; j >= weights[i]; j--) { // 倒序避免重复选择
        dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
      }
    }
    return dp[C];
  }
  ```

#### 4. **序列问题：最长上升子序列（LIS）**
- **问题描述**：求数组中最长严格递增子序列长度
- **测试用例**：
  ```typescript
  nums = [10,9,2,5,3,7,101,18] → 4 (2→3→7→101)
  ```
- **优化解法**：贪心+二分查找
  ```typescript
  function lengthOfLIS(nums: number[]): number {
    const tails: number[] = [];
    for (const num of nums) {
      let left = 0, right = tails.length;
      while (left < right) {
        const mid = (left + right) >> 1;
        if (tails[mid] < num) left = mid + 1;
        else right = mid;
      }
      if (left === tails.length) tails.push(num);
      else tails[left] = num;
    }
    return tails.length;
  }
  ```

#### 5. **状态机DP：买卖股票的最佳时机**
- **问题描述**：第`i`天股价`prices[i]`，最多交易`k`次，求最大利润
- **状态定义**：
  `dp[i][0]`：第`i`天不持股的最大利润，`dp[i][1]`：持股的最大利润
- **状态转移**：
  ```typescript
  dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] + prices[i]); // 卖出
  dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] - prices[i]); // 买入
  ```

---

### 二、动态规划可视化技术方案
#### 1. **可视化目标**
- 展示DP表填充过程（如二维网格、一维数组）
- 高亮状态转移依赖（如前驱单元格）
- 实时显示决策路径（如背包问题物品选择）

#### 2. **技术栈整合**
```typescript
// 依赖库选择
import * as echarts from 'echarts';  // 动态图表
import { Table } from 'antd';        // 表格渲染DP数组
import React, { useEffect, useState } from 'react';
```

#### 3. **核心组件设计**
- **DP表渲染器**
  ```tsx
  const DPTable = ({ data }: { data: number[][] }) => (
    <Table
      columns={data[0].map((_, j) => ({ title: `Col ${j}`, dataIndex: j }))}
      dataSource={data.map((row, i) => ({ key: i, ...row }))}
    />
  );
  ```
- **状态转移动画**
  ```tsx
  const animateTransition = (grid: number[][], i: number, j: number) => {
    // 高亮当前单元格和依赖单元格 (i-1,j) 和 (i,j-1)
    echarts.getInstanceByDom(gridEl).setOption({
      visualMap: { pieces: [{ min: i, max: i }, { min: j, max: j }] }
    });
  };
  ```
- **决策路径回溯**
  ```tsx
  const renderPath = (decisions: boolean[]) => (
    decisions.map((selected, idx) => (
      <div key={idx}>{selected ? '选' : '不选'}物品{idx}</div>
    ))
  );
  ```

#### 4. **可视化示例：0-1背包问题**
```tsx
function KnapsackVisualizer({ weights, values, C }) {
  const [dp, setDp] = useState<number[]>(new Array(C+1).fill(0));
  const [selected, setSelected] = useState<boolean[]>([]);

  useEffect(() => {
    const newDp = [...dp];
    const newSelected = new Array(weights.length).fill(false);
    for (let i = 0; i < weights.length; i++) {
      for (let j = C; j >= weights[i]; j--) {
        if (newDp[j] < newDp[j - weights[i]] + values[i]) {
          newDp[j] = newDp[j - weights[i]] + values[i];
          newSelected[i] = true; // 记录选择
        }
      }
    }
    setDp(newDp);
    setSelected(newSelected);
  }, []);

  return (
    <div>
      <DPTable data={[dp]} />
      <DecisionPath selected={selected} />
    </div>
  );
}
```

---

### 三、动态规划问题解决框架
1. **问题分解**
   - 识别最优子结构（如LIS的子序列）
   - 确认重叠子问题（如斐波那契重复计算）

2. **状态设计**
   - 一维状态：线性问题（爬楼梯）
   - 二维状态：网格/字符串问题（编辑距离）
   - 状态压缩：背包问题滚动数组

3. **转移方程**
   - 递推关系（如`dp[i] = dp[i-1] + dp[i-2]`）
   - 边界处理（如`dp[0]=0, dp[1]=1`）

4. **实现优化**
   - 空间优化：用变量替代数组（爬楼梯）
   - 时间优化：单调队列/二分查找（LIS）

---