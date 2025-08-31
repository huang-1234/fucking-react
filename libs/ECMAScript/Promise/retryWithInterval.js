function retryWithInterval(fn, maxAttempts = 3, baseDelay = 1000,
  options = {}
) {
  const {
    errorFilter = () => true,
    timeoutMs = null,
    signal = null
  } = options;

  return new Promise(async (resolve, reject) => {
    let attempt = 0;

    // 取消监听逻辑
    const abortHandler = () => {
      reject(new Error('Operation aborted'));
      if (signal) signal.removeEventListener('abort', abortHandler);
    };
    if (signal) {
      if (signal.aborted) return abortHandler();
      signal.addEventListener('abort', abortHandler);
    }

    while (attempt < maxAttempts) {
      attempt++;
      try {
        // 支持单次超时控制
        const result = timeoutMs
          ? await Promise.race([
              fn(),
              new Promise((_, rj) =>
                setTimeout(() => rj(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
              )
            ])
          : await fn();

        resolve(result);
        return;
      } catch (error) {
        // 检查取消信号
        if (signal?.aborted) return abortHandler();

        // 错误过滤与重试判断
        const shouldRetry = attempt < maxAttempts
          && errorFilter(error);

        if (!shouldRetry) {
          error.attempts = attempt; // 附加重试信息
          reject(error);
          return;
        }

        // 指数退避 + 随机抖动
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  });
}