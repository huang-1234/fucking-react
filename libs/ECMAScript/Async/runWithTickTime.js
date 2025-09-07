function createPromiseQueue(concurrency = 5, longTaskTime = 2000) {
  let runningCount = 0;
  const queue = [];

  function next() {
    // 检查是否可以达到执行条件
    if (runningCount >= concurrency || queue.length === 0) {
      return;
    }
    runningCount++;

    const { task, resolve, reject } = queue.shift(); // FIFO
    const taskStartTime = Date.now();

    // 执行任务，它应该返回一个 Promise
    Promise.resolve()
      .then(() => task())
      .then(resolve)
      .catch(reject)
      .finally(() => {
        runningCount--;
        const actualDuration = Date.now() - taskStartTime;
        if (actualDuration > longTaskTime) {
          console.warn(`Task took long time: ${actualDuration}ms`);
        }
        next(); // 无论成功失败，都执行下一个
      });
  }

  function addTask(task) {
    return new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      next(); // 尝试启动新任务
    });
  }

  function addTasks(tasks) {
    return Promise.all(tasks.map(task => addTask(task)));
  }

  return {
    addTask,
    addTasks
  };
}

// 使用示例
async function runWithTickTime(fns, maxConcurrency = 5, longTime = 2000) {
  const queue = createPromiseQueue(maxConcurrency, longTime);
  try {
    await queue.addTasks(Array.isArray(fns) ? fns : [fns]);
    console.log('All tasks finished');
  } catch (error) {
    console.error('A task failed:', error);
    // 处理错误
  }
}