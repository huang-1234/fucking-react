/**
 * 动态规划状态类型定义
 */
export type DPState = {
  dp: number[];      // DP数组
  decision: string;  // 当前决策描述
  step: number;      // 当前步骤
  highlightIndices?: number[]; // 当前高亮的索引
  prevValues?: number[]; // 前一状态的值
};

/**
 * 通用动态规划模板函数
 * @param nums 输入数组
 * @param stateTransition 状态转移函数
 * @param initialStates 初始状态设置函数
 * @returns 包含每一步DP状态的数组
 */
export function dynamicProgrammingTemplate(
  nums: number[],
  stateTransition: (dp: number[], i: number, nums: number[]) => { newValue: number, decision: string, highlightIndices: number[] },
  initialStates: (nums: number[]) => { dp: number[], steps: DPState[] }
): DPState[] {
  // 处理边界情况
  if (nums.length === 0) return [];

  // 初始化状态
  const { dp, steps } = initialStates(nums);

  // 状态转移
  for (let i = steps.length; i < nums.length; i++) {
    const prevDp = [...dp];
    const { newValue, decision, highlightIndices } = stateTransition(dp, i, nums);
    dp[i] = newValue;

    steps.push({
      dp: [...dp],
      decision,
      step: i,
      highlightIndices,
      prevValues: prevDp
    });
  }

  return steps;
}

/**
 * 打家劫舍问题的动态规划实现
 * @param nums 房屋金额数组
 * @returns 每一步DP状态的数组
 */
export function houseRobber(nums: number[]): DPState[] {
  // 初始化状态设置
  const initialStates = (nums: number[]) => {
    const dp: number[] = new Array(nums.length).fill(0);
    const steps: DPState[] = [];

    // 边界初始化
    if (nums.length > 0) {
      dp[0] = nums[0];
      steps.push({
        dp: [...dp],
        decision: `初始化：偷窃第0间房，获得金额 ${nums[0]}`,
        step: 0,
        highlightIndices: [0]
      });
    }

    if (nums.length > 1) {
      dp[1] = Math.max(nums[0], nums[1]);
      steps.push({
        dp: [...dp],
        decision: `比较第0/1间房：选择金额更大的 ${dp[1]}（${dp[1] === nums[0] ? "不偷第1间" : "偷第1间"}）`,
        step: 1,
        highlightIndices: [0, 1],
        prevValues: [dp[0], 0]
      });
    }

    return { dp, steps };
  };

  // 状态转移函数
  const stateTransition = (dp: number[], i: number, nums: number[]) => {
    const noRob = dp[i - 1];       // 不偷当前房屋
    const rob = dp[i - 2] + nums[i]; // 偷当前房屋
    const newValue = Math.max(noRob, rob);

    const decision = rob > noRob
      ? `偷第${i}间房：获得 ${nums[i]} + dp[${i - 2}](${dp[i - 2]}) = ${rob}`
      : `不偷第${i}间房：继承 dp[${i - 1}](${noRob}) = ${noRob}`;

    const highlightIndices = rob > noRob ? [i, i - 2] : [i, i - 1];

    return { newValue, decision, highlightIndices };
  };

  return dynamicProgrammingTemplate(nums, stateTransition, initialStates);
}

/**
 * 打家劫舍问题的优化实现（空间复杂度O(1)）
 * @param nums 房屋金额数组
 * @returns 最大偷窃金额
 */
export function robOptimized(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let a = nums[0];
  let b = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    const c = Math.max(b, a + nums[i]);
    a = b;
    b = c;
  }

  return b;
}

/**
 * 最长递增子序列问题的动态规划实现
 * @param nums 数字数组
 * @returns 每一步DP状态的数组
 */
export function longestIncreasingSubsequence(nums: number[]): DPState[] {
  // 初始化状态设置
  const initialStates = (nums: number[]) => {
    const dp: number[] = new Array(nums.length).fill(1); // 每个元素至少是长度为1的子序列
    const steps: DPState[] = [];

    if (nums.length > 0) {
      steps.push({
        dp: [...dp],
        decision: `初始化：每个位置的LIS至少为1`,
        step: 0,
        highlightIndices: [0]
      });
    }

    return { dp, steps };
  };

  // 状态转移函数
  const stateTransition = (dp: number[], i: number, nums: number[]) => {
    let maxLength = dp[i]; // 默认为1
    let maxJ = -1;

    // 检查之前的所有元素
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j] && dp[j] + 1 > maxLength) {
        maxLength = dp[j] + 1;
        maxJ = j;
      }
    }

    let decision = '';
    let highlightIndices = [i];

    if (maxJ !== -1) {
      decision = `位置${i}(值=${nums[i]})：可以接在位置${maxJ}(值=${nums[maxJ]})后面，形成长度为${maxLength}的递增子序列`;
      highlightIndices = [i, maxJ];
    } else {
      decision = `位置${i}(值=${nums[i]})：无法接在之前任何元素后面，保持长度为1的子序列`;
    }

    return { newValue: maxLength, decision, highlightIndices };
  };

  return dynamicProgrammingTemplate(nums, stateTransition, initialStates);
}

/**
 * 0-1背包问题的动态规划实现
 * @param weights 物品重量数组
 * @param values 物品价值数组
 * @param capacity 背包容量
 * @returns 每一步DP状态的二维数组
 */
export function knapsack01(weights: number[], values: number[], capacity: number): {
  steps: Array<{
    dp: number[][];
    decision: string;
    step: number;
    item: number;
    weight: number;
    value: number;
    highlightCells: Array<[number, number]>;
  }>;
  maxValue: number;
} {
  const n = weights.length;
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));

  const steps: Array<{
    dp: number[][];
    decision: string;
    step: number;
    item: number;
    weight: number;
    value: number;
    highlightCells: Array<[number, number]>;
  }> = [];

  // 初始状态
  steps.push({
    dp: dp.map(row => [...row]),
    decision: "初始化：空背包或没有物品时价值为0",
    step: 0,
    item: -1,
    weight: 0,
    value: 0,
    highlightCells: [[0, 0]]
  });

  // 填充DP表
  for (let i = 1; i <= n; i++) {
    const itemIndex = i - 1;
    const itemWeight = weights[itemIndex];
    const itemValue = values[itemIndex];

    for (let w = 0; w <= capacity; w++) {
      // 默认不选当前物品
      dp[i][w] = dp[i - 1][w];

      let decision = `不选物品${itemIndex}(重量=${itemWeight},价值=${itemValue})，继承上一行的价值${dp[i - 1][w]}`;
      let highlightCells: Array<[number, number]> = [[i, w], [i - 1, w]];

      // 如果当前物品可以放入背包
      if (itemWeight <= w) {
        const valueIfTaken = dp[i - 1][w - itemWeight] + itemValue;

        if (valueIfTaken > dp[i][w]) {
          dp[i][w] = valueIfTaken;
          decision = `选择物品${itemIndex}(重量=${itemWeight},价值=${itemValue})，`
            + `总价值 = 剩余容量${w - itemWeight}的价值${dp[i - 1][w - itemWeight]} + 当前物品价值${itemValue} = ${valueIfTaken}`;
          highlightCells = [[i, w], [i - 1, w - itemWeight]];
        }
      }

      // 只记录有意义的步骤（状态发生变化）
      if (w === 0 || dp[i][w] !== dp[i][w - 1] || dp[i][w] !== dp[i - 1][w]) {
        steps.push({
          dp: dp.map(row => [...row]),
          decision,
          step: steps.length,
          item: itemIndex,
          weight: itemWeight,
          value: itemValue,
          highlightCells
        });
      }
    }
  }

  return {
    steps,
    maxValue: dp[n][capacity]
  };
}
