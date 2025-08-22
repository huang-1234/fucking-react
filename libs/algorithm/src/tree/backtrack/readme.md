# 回溯算法

## 一种通过尝试所有可能的解决方案来找到问题答案的算法、当某个方案被验证不可行时、算法立即回溯到上一步尝试其他可能

## 回溯算法模板
1. 确定回溯函数的参数和返回值
2. 确定回溯函数的终止条件
3. 确定回溯函数中，对参数的取值和操作
4. 确定递归调用的逻辑
5. 确定递归调用的返回值和返回路径
6. 确定递归调用的返回结果
7. 确定递归调用的返回路径



## 回溯算法JS语言实现

```js
const backtrack = function(path, res, nums) {
  res.push(path.slice());
  for (let i = 0; i < nums.length; i++) {
    if (path.indexOf(nums[i]) >= 0) continue; // 剪枝，同路径的节点不重复
    path.push(nums[i]);
    backtrack(path, res, nums);
    path.pop();
  }
}
```
