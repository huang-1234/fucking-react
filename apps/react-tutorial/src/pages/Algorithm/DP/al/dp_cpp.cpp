#include <vector>
#include <algorithm>
#include <string>
#include <iostream>

/**
 * 打家劫舍问题的动态规划实现（C++版）
 * @param nums 房屋金额数组
 * @return 最大偷窃金额
 */
int rob(std::vector<int>& nums) {
    int n = nums.size();
    if (n == 0) return 0;
    if (n == 1) return nums[0];

    std::vector<int> dp(n, 0);
    dp[0] = nums[0];
    dp[1] = std::max(nums[0], nums[1]);

    for (int i = 2; i < n; i++) {
        dp[i] = std::max(dp[i-1], dp[i-2] + nums[i]);
    }

    return dp[n-1];
}

/**
 * 打家劫舍问题的优化实现（空间复杂度O(1)）
 * @param nums 房屋金额数组
 * @return 最大偷窃金额
 */
int robOptimized(std::vector<int>& nums) {
    int n = nums.size();
    if (n == 0) return 0;
    if (n == 1) return nums[0];

    int a = nums[0];
    int b = std::max(nums[0], nums[1]);
    int c = b;

    for (int i = 2; i < n; i++) {
        c = std::max(b, a + nums[i]);
        a = b;
        b = c;
    }

    return c;
}

/**
 * 最长递增子序列问题的动态规划实现
 * @param nums 数字数组
 * @return 最长递增子序列的长度
 */
int lengthOfLIS(std::vector<int>& nums) {
    int n = nums.size();
    if (n == 0) return 0;

    std::vector<int> dp(n, 1); // 每个元素至少是长度为1的子序列
    int maxLength = 1;

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = std::max(dp[i], dp[j] + 1);
            }
        }
        maxLength = std::max(maxLength, dp[i]);
    }

    return maxLength;
}

/**
 * 0-1背包问题的动态规划实现
 * @param weights 物品重量数组
 * @param values 物品价值数组
 * @param capacity 背包容量
 * @return 最大价值
 */
int knapsack01(std::vector<int>& weights, std::vector<int>& values, int capacity) {
    int n = weights.size();
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; i++) {
        int itemIndex = i - 1;
        int itemWeight = weights[itemIndex];
        int itemValue = values[itemIndex];

        for (int w = 0; w <= capacity; w++) {
            // 默认不选当前物品
            dp[i][w] = dp[i - 1][w];

            // 如果当前物品可以放入背包
            if (itemWeight <= w) {
                dp[i][w] = std::max(dp[i][w], dp[i - 1][w - itemWeight] + itemValue);
            }
        }
    }

    return dp[n][capacity];
}

// 示例使用
int main() {
    // 打家劫舍问题示例
    std::vector<int> houses = {1, 2, 3, 1};
    std::cout << "House Robber: " << rob(houses) << std::endl; // 应输出 4

    // 最长递增子序列问题示例
    std::vector<int> sequence = {10, 9, 2, 5, 3, 7, 101, 18};
    std::cout << "Longest Increasing Subsequence: " << lengthOfLIS(sequence) << std::endl; // 应输出 4

    // 0-1背包问题示例
    std::vector<int> weights = {2, 3, 4, 5};
    std::vector<int> values = {3, 4, 5, 6};
    int capacity = 8;
    std::cout << "0-1 Knapsack: " << knapsack01(weights, values, capacity) << std::endl; // 应输出 10

    return 0;
}
