function runWithRetry(fn, retryTimes, timeout) {
  return new Promise((resolve, reject) => {
    let remainingAttempts = retryTimes + 1;  // 总尝试次数 = 重试次数 + 首次执行
    let lastError = null;

    const attempt = async () => {
      if (remainingAttempts <= 0) {
        reject(lastError || new Error('Retry attempts exhausted'));
        return;
      }
      console.log('retry:start')
      try {
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error('Timeout error'));
        }, timeout);
        console.log('retry', remainingAttempts)

        // 执行异步函数并监听中止信号
        const result = await Promise.race([
          fn({ signal: controller.signal }),
          new Promise((_, rj) => controller.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            rj(new Error('Operation aborted'));
          }))])

        clearTimeout(timeoutId);
        resolve(result);  // 成功时返回结果

      } catch (error) {
        remainingAttempts--;
        lastError = error;

        if (error.name === 'AbortError' || error.message === 'Timeout error') {
          reject(error);  // 超时立即终止
        } else if (remainingAttempts > 0) {
          setTimeout(attempt, 0);  // 异步重试避免堆栈溢出
        } else {
          reject(error);  // 重试耗尽
        }
      }
    };
    attempt();  // 启动首次执行
  });
}

// 改造原始函数支持中止信号
function asyncFn(params = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (Math.random() < 0.2) {
        console.log('success')
        resolve('success');
      } else {
        console.log('failed')
        reject('failed');
      }
    }, 5000 * Math.random());

    // 监听中止信号
    if (params.signal) {
      params.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Operation aborted'));
      });
    }
  });
}

// 测试用例
runWithRetry(asyncFn, 3, 3000)
  .then(console.log, console.error);