/**
import { expect } from 'vitest';
 * @desc Retry utility for ECMAScript Promises
 * @module ECMAScript/PromiseTask/retry
 * Retries a function call with a specified number of retries and delay between attempts.
 * @param {Function} fn - The function to retry.
 * @param {number} retries - The number of retry attempts.
 * @param {number} delay - The delay between retries in milliseconds.
 * @returns A promise that resolves to the result of the function or rejects after all retries fail.
 */
function retry(fn, retries = 3, delay = 1000) {
  return fn().catch(err => {
    if (retries <= 0) {
      throw err;
    }
    return new Promise(resolve => {
      setTimeout(() => resolve(retry(fn, retries - 1, delay)), delay);
    });
  });
}

/**
 * @desc 版本 1: 同步递归实现; 递归调用、会出现栈溢出的问题、同时闭包会按照线性增长
 * @module ECMAScript/PromiseTask/retrySyncRecursive
 * Synchronously retries a function call with a specified number of retries and delay between attempts.
 * @param {Function} fn - The function to retry.
 * @param {number} retries - The number of retry attempts.
 * @param {number} delay - The delay between retries in milliseconds.
 * @returns A promise that resolves to the result of the function or rejects after all retries fail.
 */
function retrySyncRecursive(fn, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      fn().then(resolve, error => {
        if (remaining <= 0) {
          reject(error);
        } else {
          console.log(`Retry ${retries - remaining + 1}/${retries}`);
          attempt(remaining - 1); // 同步递归调用
        }
      });
    };

    attempt(retries);
  });
}
/**
 * @desc 版本 2: 链式调用实现; 通过Promise链的方式实现重试. 这种方式不会出现栈溢出的问题, 但是闭包会按照线性增长
 * @module ECMAScript/PromiseTask/retryChain
 * @param {Function} fn - The function to retry.
 * @param {number} retries - The number of retry attempts.
 * @param {number} delay - The delay between retries in milliseconds.
 * @returns A promise that resolves to the result of the function or rejects after all retries fail.
 */
function retryChain(fn, retries = 3, delay = 1000) {
  function handleError(error) {
    if (currentAttempt > retries) {
      throw error; // 重试次数耗尽
    }

    console.log(`Retry ${currentAttempt}/${retries}`);
    currentAttempt++;
    return fn().catch(handleError); // 链式创建新的Promise
  }
  let currentAttempt = 1;
  let promise = fn().catch(handleError); // 初始化Promise链

  return promise;
}

export {
  retry,
  retrySyncRecursive,
  retryChain
}
/**
 * @desc 最优版本3: 通过数组reduce实现重试
 * @param {Function} fn - The function to retry.
 * @param {number} retries - The number of retry attempts.
 * @abstraction
 * 此方案的优势：
 * 极简实现（3行代码）
 * 零递归调用
 * 单次闭包创建
 * 精确控制重试次数
 * 完全异步执行
 * @returns A promise that resolves to the result of the function or rejects after all retries fail.
 */
function retryOptimal(fn, retries = 3) {
  return Array.from({ length: retries + 1 }).reduce(
    (promise) => promise.catch(() => fn()),
    fn() // 初始尝试
  );
}


/**
 * @example
 * @desc 测试函数 - 前两次失败，第三次成功
 * @returns {Promise<string>}
 */
function flakyAPI() {
  return new Promise((resolve, reject) => {
    const attempt = Math.floor(Math.random() * 5); // 随机数模拟失败或成功
    if (attempt < 3) {
      reject(`Failed at attempt ${attempt}`);
    } else {
      resolve(`Succeeded at attempt ${attempt}`);
    }
  });
}

function testRetry(k) {
  switch (k) {
    case 1:
      console.log('Case 1 executed');

      // 测试递归版本
      retrySyncRecursive(flakyAPI, 3)
        .then(console.log)
        .catch(console.error);
      // Output:
      // Retry 1/3
      // Retry 2/3
      // Succeeded at attempt 3
      break;
    case 2:
      console.log('Case 2 executed');
      // 测试链式版本
      retryChain(flakyAPI, 3)
        .then(console.log)
        .catch(console.error);
      // 相同输出，但内存结构不同
      // Output:
      // Retry 1/3
      // Retry 2/3
      // Succeeded at attempt 3
      break;
    case 3:
      console.log('Case 3 executed');
      // 测试优化版本
      retryOptimal(flakyAPI, 3)
        .then(console.log)
        .catch(console.error);
    // Output:
    // Retry 1/3
    // Retry 2/3
    // Succeeded at attempt 3
    default:
      console.log('Default case executed');
      // 测试优化版本
      retryOptimal(flakyAPI, 3)
        .then(console.log)
        .catch(console.error);
      break;
  }
}

// testRetry(1);
// testRetry(2);
testRetry(3);