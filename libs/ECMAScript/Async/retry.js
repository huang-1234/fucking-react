/**
 * 带有超时和重试功能的异步函数执行器
 * @param {Function} fn 要执行的异步函数
 * @param {number} retryTimes 重试次数
 * @param {number} timeout 超时时间(毫秒)
 * @returns {Promise<any>} 异步函数的执行结果
 */
function runWithRetry(fn, retryTimes, timeout) {
  return new Promise((resolve, reject) => {
    let remainingAttempts = retryTimes + 1;  // 总尝试次数 = 重试次数 + 首次执行
    let lastError = null;

    const attempt = async () => {
      if (remainingAttempts <= 0) {
        reject(lastError || new Error('Retry attempts exhausted'));
        return;
      }

      remainingAttempts--; // 先减少尝试次数

      try {
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = timeout ? setTimeout(() => {
          controller.abort();
          reject(new Error('Timeout error'));
        }, timeout) : null;

        // 执行异步函数并监听中止信号
        let result;
        try {
          result = await fn({ signal: controller.signal });
        } catch (error) {
          // 如果是普通错误，并且还有重试次数，则重试
          lastError = error;
          if (remainingAttempts > 0) {
            if (timeoutId) clearTimeout(timeoutId);
            setTimeout(attempt, 0);
            return;
          }
          throw error; // 重试耗尽，抛出最后一个错误
        }

        // 成功时清理并返回结果
        if (timeoutId) clearTimeout(timeoutId);
        resolve(result);

      } catch (error) {
        // 处理超时错误或其他错误
        lastError = error;
        if (error.name === 'AbortError' || error.message === 'Timeout error' || remainingAttempts <= 0) {
          reject(error);
        } else {
          setTimeout(attempt, 0);  // 异步重试避免堆栈溢出
        }
      }
    };

    attempt();  // 启动首次执行
  });
}

/**
 * 示例异步函数，支持中止信号
 * @param {Object} params 参数对象
 * @param {AbortSignal} [params.signal] 中止信号
 * @returns {Promise<string>} 异步执行结果
 */
function asyncFn(params = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (Math.random() < 0.2) {
        resolve('success');
      } else {
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

// 导出函数以便测试 (CommonJS语法)
module.exports = {
  runWithRetry,
  asyncFn
};