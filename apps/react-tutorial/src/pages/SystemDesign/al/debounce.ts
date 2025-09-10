/**
 * 实现一个带取消功能的防抖函数
 *
 * 时间复杂度：O(1) - 每次调用的时间复杂度是常数级
 * 空间复杂度：O(1) - 只存储了少量变量
 *
 * @param func 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 返回防抖处理后的函数，包含cancel方法
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { immediate?: boolean } = {}
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T>;
  const { immediate = false } = options;

  // 清除定时器的函数
  function clearTimer() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  // 执行函数
  function invokeFunc() {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = null;
    timeoutId = null;

    if (args) {
      result = func.apply(thisArg, args);
    }

    return result;
  }

  // 主函数
  function debounced(this: any, ...args: Parameters<T>): void {
    lastArgs = args;
    lastThis = this;

    clearTimer();

    if (immediate && timeoutId === null) {
      result = func.apply(this, args);
    } else {
      timeoutId = setTimeout(invokeFunc, delay);
    }
  }

  // 取消方法
  debounced.cancel = function() {
    clearTimer();
    lastArgs = null;
    lastThis = null;
  };

  // 立即执行方法
  debounced.flush = function() {
    if (timeoutId !== null) {
      return invokeFunc();
    }
  };

  return debounced;
}

/**
 * 生成防抖函数的可视化数据
 * @param callTimestamps 函数调用时间戳数组
 * @param delay 防抖延迟时间
 * @returns 可视化数据对象
 */
export function visualizeDebounce(callTimestamps: number[], delay: number) {
  const executionTimestamps: number[] = [];
  let lastPlannedExecution: number | null = null;

  callTimestamps.forEach((timestamp, index) => {
    // 如果当前调用会取消之前的计划执行
    if (lastPlannedExecution !== null && timestamp < lastPlannedExecution) {
      // 取消之前的计划
      lastPlannedExecution = timestamp + delay;
    } else {
      // 设置新的计划执行时间
      lastPlannedExecution = timestamp + delay;
    }

    // 如果是最后一个调用或者下一个调用时间晚于当前计划执行时间
    if (index === callTimestamps.length - 1 ||
        callTimestamps[index + 1] > lastPlannedExecution) {
      executionTimestamps.push(lastPlannedExecution);
    }
  });

  return {
    calls: callTimestamps,
    executions: executionTimestamps,
    delay
  };
}
