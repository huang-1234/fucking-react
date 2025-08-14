/**
 * 异步执行器使用示例
 */
import { AsyncExecutor } from './async_executor.js';

// 模拟一个异步API请求函数
const mockFetch = async (url, options = {}, { signal } = {}) => {
  console.log(`开始请求: ${url}`);

  // 模拟网络延迟
  await new Promise((resolve, reject) => {
    const delay = Math.random() * 2000 + 500;
    const timeoutId = setTimeout(() => {
      resolve();
    }, delay);

    // 支持取消操作
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('请求被取消'));
      });
    }
  });

  // 模拟随机失败
  if (Math.random() < 0.3) {
    throw new Error(`请求失败: ${url}`);
  }

  return { url, data: `来自 ${url} 的数据` };
};

// 示例1: 基本使用
const basicExample = async () => {
  console.log('--- 基本使用示例 ---');

  const executor = new AsyncExecutor(mockFetch, {
    concurrency: 2, // 最多同时执行2个请求
    timeout: 3000,  // 3秒超时
    retries: 1,     // 失败后重试1次
    onSuccess: (result) => console.log(`成功: ${result.url}`),
    onError: (error) => console.log(`错误: ${error.message}`),
    onComplete: (results) => console.log(`所有任务完成，成功: ${results.length}个`)
  });

  // 添加多个任务
  const urls = [
    'https://api.example.com/users',
    'https://api.example.com/products',
    'https://api.example.com/orders',
    'https://api.example.com/settings'
  ];

  const promises = urls.map(url => executor.add(url));

  // 等待所有任务完成
  try {
    const results = await Promise.all(promises);
    console.log('所有请求完成:', results.length);
  } catch (error) {
    console.error('部分请求失败');
  }
};

// 示例2: 取消操作
const cancelExample = async () => {
  console.log('\n--- 取消操作示例 ---');

  const executor = new AsyncExecutor(mockFetch, {
    concurrency: 3,
    onCancel: (taskId) => console.log(`任务已取消: ${taskId}`)
  });

  // 添加任务并获取任务ID
  const taskPromise1 = executor.add('https://api.example.com/data1');
  const taskPromise2 = executor.add('https://api.example.com/data2');
  const taskPromise3 = executor.add('https://api.example.com/data3');

  // 取消特定任务
  setTimeout(() => {
    console.log('取消第二个任务');
    executor.cancelTask(taskPromise2.taskId);
  }, 500);

  // 1秒后取消所有任务
  setTimeout(() => {
    console.log('取消所有任务');
    executor.abort();
  }, 1000);

  // 尝试等待所有任务完成（但会被取消）
  try {
    await Promise.all([taskPromise1, taskPromise2, taskPromise3]);
  } catch (error) {
    console.log('任务被取消:', error.message);
  }
};

// 示例3: 暂停和恢复
const pauseResumeExample = async () => {
  console.log('\n--- 暂停和恢复示例 ---');

  const executor = new AsyncExecutor(mockFetch, {
    concurrency: 1,
    autoStart: true
  });

  // 添加多个任务
  const urls = [
    'https://api.example.com/resource1',
    'https://api.example.com/resource2',
    'https://api.example.com/resource3',
    'https://api.example.com/resource4'
  ];

  const promises = urls.map(url => executor.add(url));

  // 立即暂停
  console.log('暂停队列处理');
  executor.pause();

  // 2秒后恢复
  setTimeout(() => {
    console.log('恢复队列处理');
    executor.resume();
  }, 2000);

  // 等待所有任务完成
  try {
    await Promise.all(promises);
    console.log('所有请求完成');
  } catch (error) {
    console.error('部分请求失败:', error);
  }
};

// 示例4: 错误处理和重试
const errorHandlingExample = async () => {
  console.log('\n--- 错误处理和重试示例 ---');

  // 一个总是失败的函数
  const alwaysFailFn = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('操作失败');
  };

  const executor = new AsyncExecutor(alwaysFailFn, {
    retries: 3,
    retryDelay: 1000,
    onError: (error, taskId) => console.log(`任务 ${taskId} 失败: ${error.message}`),
  });

  try {
    await executor.add();
    console.log('任务成功'); // 不会执行到这里
  } catch (error) {
    console.log(`最终失败 (重试3次后): ${error.message}`);
  }
};

// 运行所有示例
const runAllExamples = async () => {
  await basicExample();
  await cancelExample();
  await pauseResumeExample();
  await errorHandlingExample();

  console.log('\n所有示例执行完毕');
};

runAllExamples().catch(console.error);
