/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @param {boolean} [immediate=false] - 是否立即执行（true：触发时立即执行，false：延迟后执行）
 * @returns {Function} 防抖处理后的函数
 */
function debounce(func, wait, immediate = false) {
  let timer = null; // 定时器标识

  // 返回包装后的函数
  const debounced = function (...args) {
    const context = this; // 保存原函数的this指向

    // 如果已有定时器，清除它（重新计时）
    if (timer) clearTimeout(timer);

    // 立即执行逻辑
    if (immediate) {
      // 首次触发或定时器已执行完，才执行
      const callNow = !timer;
      // 设定定时器，wait时间后清空timer（允许下次立即执行）
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      // 立即执行原函数
      if (callNow) func.apply(context, args);
    } else {
      // 延迟执行逻辑：重新设定定时器，wait时间后执行
      timer = setTimeout(() => {
        func.apply(context, args); // 绑定this和参数
        timer = null; // 执行后清空定时器
      }, wait);
    }
  };

  // 提供取消防抖的方法
  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

// 测试示例
function handleInput(value) {
  console.log('处理输入:', value);
}

// 延迟执行版（输入结束后1000ms执行）
const debouncedInput = debounce(handleInput, 1000);
// 立即执行版（输入时立即执行，后续1000ms内输入不重复执行）
const immediateInput = debounce(handleInput, 1000, true);

// 模拟频繁触发
debouncedInput('a');
debouncedInput('ab');
debouncedInput('abc'); // 1000ms后仅执行此调用



function throttleSimple(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

function throttleDefer(fn, delay) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

function throttle(fn, delay, { leading = true, trailing = true } = {}) {
  let lastTime = 0; // 记录上次执行时间
  let timer = null; // 定时器标识

  // 包装后的函数
  const throttled = function (...args) {
    const now = Date.now(); // 当前时间戳

    // 若首次触发且不需要立即执行，初始化lastTime
    if (!lastTime && !leading) {
      lastTime = now;
    }

    // 计算剩余时间（距离下次可执行的时间）
    const remaining = delay - (now - lastTime);

    // 情况1：超过间隔时间，立即执行
    if (remaining <= 0) {
      // 清除可能存在的定时器（避免trailing重复执行）
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(this, args); // 绑定this和参数
      lastTime = now; // 更新执行时间
    } else if (trailing && !timer) { // 情况2：未超过间隔，且需要trailing执行，设置定时器
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = leading ? Date.now() : 0; // 重置lastTime（配合leading）
        timer = null; // 清空定时器
      }, remaining);
    }
  };

  // 提供取消方法（可选，体现完整性）
  throttled.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    lastTime = 0;
  };

  return throttled;
}
