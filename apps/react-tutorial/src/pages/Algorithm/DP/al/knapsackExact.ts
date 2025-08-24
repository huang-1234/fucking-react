import type { DPState } from './dp_ts';

/**
 * 0-1背包问题 - 恰好装满背包的最大价值
 * @param weights 物品重量数组
 * @param values 物品价值数组
 * @param capacity 背包容量
 * @returns 包含每一步DP状态的数组和最终结果
 */
export function knapsackExact(weights: number[], values: number[], capacity: number): {
  steps: DPState[];
  maxValue: number;
} {
  const n = weights.length;
  // 初始化DP数组：dp[j]表示容量j恰好装满时的最大价值
  const dp: number[] = new Array(capacity + 1).fill(Number.MIN_SAFE_INTEGER);
  dp[0] = 0;  // 容量0时价值为0（已装满）

  const steps: DPState[] = [];

  // 记录初始状态
  steps.push({
    dp: [...dp],
    decision: "初始化：dp[0]=0（空背包已装满），其他为负无穷（未装满无效）",
    step: 0,
    highlightIndices: [0]
  });

  // 动态规划填表
  for (let i = 0; i < n; i++) {
    const weight = weights[i];
    const value = values[i];
    const prevDp = [...dp];

    // 倒序遍历背包容量（避免重复选择）
    for (let j = capacity; j >= weight; j--) {
      const prevValue = dp[j];

      if (dp[j - weight] !== Number.MIN_SAFE_INTEGER) {
        dp[j] = Math.max(dp[j], dp[j - weight] + value);

        if (dp[j] !== prevValue) {
          steps.push({
            dp: [...dp],
            decision: `考虑物品${i}（重量=${weight}, 价值=${value}）：` +
                     `选择此物品，dp[${j}] = dp[${j - weight}](${dp[j - weight]}) + ${value} = ${dp[j]}`,
            step: steps.length,
            highlightIndices: [j, j - weight],
            prevValues: prevDp
          });
        }
      } else if (j === weight) {
        // 特殊情况：当前物品重量正好等于当前容量
        dp[j] = Math.max(dp[j], value);

        if (dp[j] !== prevValue) {
          steps.push({
            dp: [...dp],
            decision: `考虑物品${i}（重量=${weight}, 价值=${value}）：` +
                     `物品重量正好等于当前容量，dp[${j}] = ${value}`,
            step: steps.length,
            highlightIndices: [j],
            prevValues: prevDp
          });
        }
      }
    }

    // 记录当前物品处理完后的状态
    if (steps[steps.length - 1].step !== i) {
      steps.push({
        dp: [...dp],
        decision: `处理完物品${i}（重量=${weight}, 价值=${value}）后的状态`,
        step: steps.length,
        highlightIndices: []
      });
    }
  }

  // 最终结果
  const maxValue = dp[capacity] > Number.MIN_SAFE_INTEGER ? dp[capacity] : -1;

  steps.push({
    dp: [...dp],
    decision: maxValue > -1
      ? `最终结果：dp[${capacity}] = ${maxValue}，成功找到恰好装满背包的最大价值方案`
      : `最终结果：dp[${capacity}] = ${Number.MIN_SAFE_INTEGER}，无法恰好装满背包，返回-1`,
    step: steps.length,
    highlightIndices: [capacity]
  });

  return {
    steps,
    maxValue
  };
}

/**
 * 获取背包问题的解决方案（选择了哪些物品）
 * @param weights 物品重量数组
 * @param values 物品价值数组
 * @param capacity 背包容量
 * @param dp 动态规划数组
 * @returns 选择的物品索引数组
 */
export function getKnapsackSolution(
  weights: number[],
  values: number[],
  capacity: number,
  dp: number[]
): number[] {
  const n = weights.length;
  const selected: number[] = [];
  let remainingCapacity = capacity;

  // 从后往前推导选择了哪些物品
  for (let i = n - 1; i >= 0; i--) {
    // 如果当前容量减去当前物品重量后的状态值 + 当前物品价值 = 当前状态值
    // 说明选择了当前物品
    if (remainingCapacity >= weights[i] &&
        dp[remainingCapacity] === dp[remainingCapacity - weights[i]] + values[i]) {
      selected.push(i);
      remainingCapacity -= weights[i];
    }
  }

  return selected.reverse(); // 按照从小到大的索引顺序返回
}
