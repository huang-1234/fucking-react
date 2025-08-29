function asyncFn() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        console.log('inner success');
        resolve('success');
      } else {
        console.log('inner failed');
        reject('failed');
      }
    }, 5 * 1000 * Math.random());
  });
}

function runWithRetry(fn, retryTimes, timeout) {
  // 你的实现
  // retryTimes不为0时自动递归调用fn
  const handleError = (e) => {
    if (retryTimes--) {
      fn().catch(handleError)
    }
  }
  // 需要超时自动失败
  if (timeout) {
    return new Promise.race([
      fn().catch(handleError),
      // race 赛跑、超时自动失败
      new Promise((rs, rj) => {
        setTimeount(() => rj('timeout error'), timeout)
      })
    ])
  } else {
    // 失败重试
    return fn().catch(handleError)
  }
}

runWithRetry(asyncFn, 3, 10 * 1000) // 重复调用asyncFn函数直至成功（返回resolved的Promise）或达到重试次数上限，或者超时
  .then(console.log, console.log);

// 可能的输出1：
// inner failed 第一次失败
// inner failed 第一次重试失败
// inner success 第二次重试成功
// success

// 可能的输出2:
// inner failed 第一次失败
// timeout error 超时
// inner failed 超时前发起的重试调用


/**
 * 用户提供的代码框架有几个关键点需要注意：

1. 需要同时处理超时和重试机制
2. 重试次数和超时时间都需要作为参数
3. 超时控制会影响重试流程
我注意到原实现存在几个问题：
1. 递归调用时没有创建新的超时Promise，导致后续重试没有超时控制
2. 错误处理逻辑会立即返回，没有实现真正的重试
3. 超时后无法取消正在进行的重试操作

从搜索结果中找到了几个重要参考：

展示了Promise.race实现超时的标准模式，但未结合重试

提供了类封装管理超时ID的思路提到多个数据源竞争的场景，但用户需要的是串行重试

中AbortController的方案更适合现代浏览器环境

解决方案需要：

1.用递归实现重试机制

2.每次尝试都创建新的超时Promise

3.超时后能终止后续重试

4.区分超时错误和业务错误

特别要注意用户代码中的陷阱：

- 原handleError定义位置错误

- retryTimes--会导致立即递减

- 没有处理超时后取消正在进行的请求

优化后的实现思路：

1.创建核心执行函数，包含当前重试计数

2.每次执行都创建新的超时控制器

3.用async/await简化流程控制

4.超时或失败时递归调用

5.成功/超时/耗尽重试次数时终止

考虑到实际应用场景，还应该：
- 添加attempt事件通知
- 允许自定义退避策略
- 区分错误类型
最终实现方案将包含：

1.循环执行而非递归避免栈溢出

- 每次尝试独立超时控制

- 区分错误类型、精确的错误类型判断

- 清晰的执行状态跟踪
 */