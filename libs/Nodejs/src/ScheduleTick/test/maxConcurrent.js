function asyncPool(tasks, maxConcurrent = 3) {
  let isRunning = 0;           // 当前正在运行的任务数
  let completedCount = 0;      // 已完成的任务数
  const totalTasks = tasks.length; // 总任务数
  const results = new Array(totalTasks).fill(null); // 存储所有任务结果
  let finalResolve;             // 最终Promise的resolve函数

  // 执行单个任务
  const exec = (task, index) => {
    isRunning++;


    console.log('exec task', index);
    // 执行任务并处理超时
    Promise.race([
      task.fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`任务超时: ${task.timeout || 2000}ms`)), task.timeout || 2000)
      )
    ])
    .then(result => {
      results[index] = { status: 'fulfilled', value: result };
    })
    .catch(error => {
      results[index] = { status: 'rejected', reason: error.message };
    })
    .finally(() => {
      completedCount++;
      isRunning--;
      handleQueue();

      // 所有任务完成时，解析最终Promise
      if (completedCount === totalTasks) {
        finalResolve(results);
      }
    });
  };

  // 处理任务队列
  const handleQueue = () => {
    // 执行队列中可运行的任务
    while (isRunning < maxConcurrent && tasks.length > 0) {
      const task = tasks.shift();
      exec(task, task.index);
    }
  };

  return new Promise((resolve) => {
    finalResolve = resolve;

    // 为每个任务添加索引（保持原始顺序）
    tasks = tasks.map((task, index) => ({
      ...task,
      index // 保留原始索引以保证结果顺序
    }));

    // 开始处理队列
    handleQueue();
  });
}

// 使用示例
asyncPool([
  // 每个任务是一个对象，包含执行函数和可选的超时设置
  {
    fn: () => fetch('https://api.example.com/data1'),
    timeout: 3000 // 3秒超时
  },
  {
    fn: () => new Promise(res => setTimeout(() => res('Task 2 completed'), 1500)),
    // 不设置timeout时使用默认2000ms超时
  },
  {
    fn: () => fetch('https://api.example.com/data3'),
    timeout: 1000
  },
  ...new Array(10).fill(0).map((_, index) => ({
    fn: () => fetch(`https://api.example.com/data${index + 4}`),
    timeout: 1900
  }))
])
.then(results => {
  console.log('所有任务完成:');
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`任务 ${i} 成功:`, result.value);
    } else {
      console.error(`任务 ${i} 失败:`, result.reason);
    }
  });
});