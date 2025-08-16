// Async/Await基础代码
const asyncAwaitBasicsCode = `// 基本的async函数
async function fetchData() {
  try {
    // await后面可以是任何Promise
    const response = await fetch('https://api.example.com/data');

    // 等待Promise解决后继续执行
    const data = await response.json();

    console.log('获取的数据:', data);
    return data; // 返回值会被包装成Promise
  } catch (error) {
    // 捕获await过程中的任何错误
    console.error('获取数据失败:', error);
    throw error; // 重新抛出错误，使调用者可以捕获
  }
}

// 调用async函数
fetchData()
  .then(data => {
    console.log('处理返回的数据:', data);
  })
  .catch(error => {
    console.error('处理错误:', error);
  });

// 也可以使用await调用（在另一个async函数中）
async function processData() {
  try {
    const data = await fetchData();
    // 处理数据...
  } catch (error) {
    // 处理错误...
  }
}`;

// 与Promise比较代码
const comparisonCode = `// 使用Promise链
function fetchUserDataPromise(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => {
      if (!response.ok) throw new Error('用户数据获取失败');
      return response.json();
    })
    .then(user => {
      return fetch(\`/api/posts?userId=\${user.id}\`)
        .then(response => {
          if (!response.ok) throw new Error('帖子数据获取失败');
          return response.json();
        })
        .then(posts => {
          user.posts = posts;
          return user;
        });
    });
}

// 使用Async/Await
async function fetchUserDataAsync(userId) {
  // 获取用户数据
  const userResponse = await fetch(\`/api/users/\${userId}\`);
  if (!userResponse.ok) throw new Error('用户数据获取失败');
  const user = await userResponse.json();

  // 获取用户的帖子
  const postsResponse = await fetch(\`/api/posts?userId=\${user.id}\`);
  if (!postsResponse.ok) throw new Error('帖子数据获取失败');
  const posts = await postsResponse.json();

  // 组合数据
  user.posts = posts;
  return user;
}`;

// 错误处理代码
const errorHandlingCode = `// 使用try/catch处理错误
async function fetchWithErrorHandling() {
  try {
    const response = await fetch('https://api.example.com/data');

    if (!response.ok) {
      throw new Error(\`HTTP错误: \${response.status}\`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('发生错误:', error);

    // 可以根据错误类型进行不同处理
    if (error.name === 'TypeError') {
      console.log('网络错误或CORS问题');
    } else if (error.name === 'SyntaxError') {
      console.log('JSON解析错误');
    }

    // 可以返回默认值
    return { error: true, message: error.message };
  } finally {
    // 无论成功或失败都会执行
    console.log('请求完成');
  }
}

// 不使用try/catch，让调用者处理错误
async function fetchWithoutTryCatch() {
  const response = await fetch('https://api.example.com/data');

  if (!response.ok) {
    throw new Error(\`HTTP错误: \${response.status}\`);
  }

  return response.json();
}

// 调用者处理错误
async function caller() {
  try {
    const data = await fetchWithoutTryCatch();
    // 处理数据
  } catch (error) {
    // 处理错误
  }
}`;

// 并行执行代码
const parallelExecutionCode = `// 串行执行 - 每个请求都等待前一个完成
async function fetchSequentially() {
  console.time('sequential');

  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());

  console.timeEnd('sequential');
  return { user, posts, comments };
}

// 并行执行 - 同时发起所有请求
async function fetchParallel() {
  console.time('parallel');

  // 同时启动所有fetch请求
  const userPromise = fetch('/api/user').then(r => r.json());
  const postsPromise = fetch('/api/posts').then(r => r.json());
  const commentsPromise = fetch('/api/comments').then(r => r.json());

  // 等待所有请求完成
  const user = await userPromise;
  const posts = await postsPromise;
  const comments = await commentsPromise;

  console.timeEnd('parallel');
  return { user, posts, comments };
}

// 使用Promise.all更简洁地并行执行
async function fetchParallelWithPromiseAll() {
  console.time('promise.all');

  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);

  console.timeEnd('promise.all');
  return { user, posts, comments };
}`;

// 实用模式代码
const patternCode = `// 1. 超时处理
async function fetchWithTimeout(url, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), ms);
  });

  try {
    // 使用Promise.race实现超时
    const response = await Promise.race([
      fetch(url),
      timeout
    ]);

    return response.json();
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 2. 重试机制
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url).then(r => r.json());
    } catch (error) {
      console.log(\`尝试 \${i + 1} 失败，剩余重试次数: \${retries - i - 1}\`);
      lastError = error;

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// 3. 并发控制
async function fetchWithConcurrency(urls, concurrency = 2) {
  const results = [];
  const inProgress = new Set();

  // 处理单个URL的函数
  async function fetchUrl(url, index) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      results[index] = { success: true, data };
    } catch (error) {
      results[index] = { success: false, error };
    }

    inProgress.delete(index);

    // 如果还有URL待处理，继续处理
    if (nextIndex < urls.length) {
      const currentIndex = nextIndex++;
      inProgress.add(currentIndex);
      await fetchUrl(urls[currentIndex], currentIndex);
    }
  }

  // 初始化结果数组
  results.length = urls.length;

  // 开始处理，最多同时处理concurrency个URL
  let nextIndex = 0;
  const initialBatch = Math.min(concurrency, urls.length);

  // 启动初始批次
  const initialPromises = [];
  for (let i = 0; i < initialBatch; i++) {
    const currentIndex = nextIndex++;
    inProgress.add(currentIndex);
    initialPromises.push(fetchUrl(urls[currentIndex], currentIndex));
  }

  // 等待所有URL处理完成
  await Promise.all(initialPromises);

  return results;
}`;

// Async/Await原理代码
const underTheHoodCode = `// Async/Await是基于Generator和Promise的语法糖
// 下面是一个简化版的实现原理

// 1. Generator函数示例
function* generatorExample() {
  console.log('开始执行');
  const result1 = yield Promise.resolve('第一个结果');
  console.log('第一个结果:', result1);

  const result2 = yield Promise.resolve('第二个结果');
  console.log('第二个结果:', result2);

  return '完成';
}

// 2. 手动执行Generator
function runGenerator(generatorFn) {
  const generator = generatorFn();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value)
      .then(res => handle(generator.next(res)))
      .catch(err => handle(generator.throw(err)));
  }

  return handle(generator.next());
}

// 使用runGenerator执行generatorExample
runGenerator(generatorExample)
  .then(finalResult => console.log('最终结果:', finalResult))
  .catch(err => console.error('错误:', err));

// 3. 模拟async/await的实现
function asyncToGenerator(generatorFn) {
  return function() {
    const generator = generatorFn.apply(this, arguments);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;
        try {
          result = generator[key](arg);
        } catch (error) {
          return reject(error);
        }

        const { value, done } = result;

        if (done) {
          return resolve(value);
        } else {
          return Promise.resolve(value)
            .then(val => step('next', val))
            .catch(err => step('throw', err));
        }
      }

      return step('next');
    });
  };
}

// 使用asyncToGenerator实现async函数
const fetchData = asyncToGenerator(function* () {
  try {
    const response = yield fetch('https://api.example.com/data');
    const data = yield response.json();
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
});

// 等同于:
// async function fetchData() {
//   try {
//     const response = await fetch('https://api.example.com/data');
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('获取数据失败:', error);
//     throw error;
//   }
// }`;

// 模拟异步操作执行步骤
const asyncSteps = [
  {
    title: '开始执行',
    description: '进入async函数',
    code: 'async function fetchData() {'
  },
  {
    title: '第一个await',
    description: '遇到第一个await表达式，暂停执行',
    code: 'const response = await fetch(url);'
  },
  {
    title: '等待Promise',
    description: '等待fetch Promise完成',
    code: '// 函数执行被暂停，等待fetch完成'
  },
  {
    title: 'Promise已完成',
    description: 'fetch Promise已完成，恢复函数执行',
    code: '// fetch完成，response现在包含结果'
  },
  {
    title: '第二个await',
    description: '遇到第二个await表达式，再次暂停执行',
    code: 'const data = await response.json();'
  },
  {
    title: '等待JSON解析',
    description: '等待response.json() Promise完成',
    code: '// 函数执行被暂停，等待JSON解析'
  },
  {
    title: 'JSON解析完成',
    description: 'JSON解析完成，恢复函数执行',
    code: '// JSON解析完成，data包含解析后的数据'
  },
  {
    title: '函数返回',
    description: '函数执行完毕，返回结果',
    code: 'return data; // 返回值会被包装成Promise'
  }
];