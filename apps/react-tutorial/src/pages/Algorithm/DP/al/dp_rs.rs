use std::cmp;

/**
 * 打家劫舍问题的动态规划实现（Rust版）
 * @param nums 房屋金额数组
 * @return 最大偷窃金额
 */
pub fn rob(nums: Vec<i32>) -> i32 {
    let n = nums.len();
    if n == 0 {
        return 0;
    }
    if n == 1 {
        return nums[0];
    }

    let mut dp = vec![0; n];
    dp[0] = nums[0];
    dp[1] = cmp::max(nums[0], nums[1]);

    for i in 2..n {
        dp[i] = cmp::max(dp[i-1], dp[i-2] + nums[i]);
    }

    dp[n-1]
}

/**
 * 打家劫舍问题的优化实现（空间复杂度O(1)）
 * @param nums 房屋金额数组
 * @return 最大偷窃金额
 */
pub fn rob_optimized(nums: Vec<i32>) -> i32 {
    let n = nums.len();
    if n == 0 {
        return 0;
    }
    if n == 1 {
        return nums[0];
    }

    let mut a = nums[0];
    let mut b = cmp::max(nums[0], nums[1]);

    for i in 2..n {
        let c = cmp::max(b, a + nums[i]);
        a = b;
        b = c;
    }

    b
}

/**
 * 最长递增子序列问题的动态规划实现
 * @param nums 数字数组
 * @return 最长递增子序列的长度
 */
pub fn length_of_lis(nums: Vec<i32>) -> i32 {
    let n = nums.len();
    if n == 0 {
        return 0;
    }

    let mut dp = vec![1; n]; // 每个元素至少是长度为1的子序列
    let mut max_length = 1;

    for i in 1..n {
        for j in 0..i {
            if nums[i] > nums[j] {
                dp[i] = cmp::max(dp[i], dp[j] + 1);
            }
        }
        max_length = cmp::max(max_length, dp[i]);
    }

    max_length as i32
}

/**
 * 0-1背包问题的动态规划实现
 * @param weights 物品重量数组
 * @param values 物品价值数组
 * @param capacity 背包容量
 * @return 最大价值
 */
pub fn knapsack01(weights: Vec<i32>, values: Vec<i32>, capacity: i32) -> i32 {
    let n = weights.len();
    let capacity = capacity as usize;
    let mut dp = vec![vec![0; capacity + 1]; n + 1];

    for i in 1..=n {
        let item_index = i - 1;
        let item_weight = weights[item_index] as usize;
        let item_value = values[item_index];

        for w in 0..=capacity {
            // 默认不选当前物品
            dp[i][w] = dp[i - 1][w];

            // 如果当前物品可以放入背包
            if item_weight <= w {
                dp[i][w] = cmp::max(dp[i][w], dp[i - 1][w - item_weight] + item_value);
            }
        }
    }

    dp[n][capacity]
}

// 示例使用
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rob() {
        let houses = vec![1, 2, 3, 1];
        assert_eq!(rob(houses), 4);

        let houses = vec![2, 7, 9, 3, 1];
        assert_eq!(rob(houses), 12);
    }

    #[test]
    fn test_rob_optimized() {
        let houses = vec![1, 2, 3, 1];
        assert_eq!(rob_optimized(houses), 4);

        let houses = vec![2, 7, 9, 3, 1];
        assert_eq!(rob_optimized(houses), 12);
    }

    #[test]
    fn test_length_of_lis() {
        let sequence = vec![10, 9, 2, 5, 3, 7, 101, 18];
        assert_eq!(length_of_lis(sequence), 4); // [2, 5, 7, 101] 或 [2, 3, 7, 18]
    }

    #[test]
    fn test_knapsack01() {
        let weights = vec![2, 3, 4, 5];
        let values = vec![3, 4, 5, 6];
        let capacity = 8;
        assert_eq!(knapsack01(weights, values, capacity), 10);
    }
}
