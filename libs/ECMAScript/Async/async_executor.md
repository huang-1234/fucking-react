# AsyncExecutor - 异步执行器

## 简介

AsyncExecutor 是一个功能强大的异步操作管理工具，用于处理复杂的异步场景，包括并发控制、取消操作、重试机制、超时处理等。它能有效地管理大量异步任务，提供可靠的错误处理和资源管理能力。

## 特性

- **并发控制**：限制同时执行的异步操作数量
- **取消操作**：支持取消单个任务或所有任务
- **重试机制**：自动重试失败的异步操作
- **超时处理**：为异步操作设置超时时间
- **暂停/恢复**：支持暂停和恢复任务队列处理
- **链式调用**：支持方法的链式调用
- **完善的回调**：提供成功、失败、完成、取消等回调
- **资源管理**：自动清理和管理资源，避免内存泄漏

## 使用方法

### 基本用法

```javascript
import { AsyncExecutor } from './async_executor.js';

// 创建一个异步执行器，用于处理HTTP请求
const fetchExecutor = new AsyncExecutor(
  async (url, options = {}, { signal } = {}) => {
    return fetch(url, { ...options, signal });
  },
  {
    concurrency: 3, // 最多同时执行3个请求
    timeout: 5000,  // 5秒超时
    retries: 2,     // 失败后重试2次
  }
);

// 添加任务
const task1 = fetchExecutor.add('https://api.example.com/data1');
const task2 = fetchExecutor.add('https://api.example.com/data2');

// 处理结果
task1.then(response => response.json())
  .then(data => console.log('Task 1 data:', data))
  .catch(err => console.error('Task 1 error:', err));

// 取消特定任务
fetchExecutor.cancelTask(task2);
```

### 高级用法

#### 并发控制

```javascript
// 创建一个限制并发数为5的执行器
const executor = new AsyncExecutor(asyncFunction, { concurrency: 5 });

// 添加100个任务
for (let i = 0; i < 100; i++) {
  executor.add(i);
}
```

#### 取消操作

```javascript
// 创建执行器
const executor = new AsyncExecutor(asyncFunction);

// 添加任务并获取任务ID
const taskPromise = executor.add('task data');

// 在某个条件下取消所有任务
if (shouldCancel) {
  executor.abort();
}
```

#### 重试机制

```javascript
// 创建一个具有重试功能的执行器
const executor = new AsyncExecutor(unreliableFunction, {
  retries: 3,           // 最多重试3次
  retryDelay: 1000,     // 每次重试间隔1秒
  onError: (err, taskId) => {
    console.log(`Task ${taskId} failed with error: ${err.message}`);
  }
});
```

#### 暂停和恢复

```javascript
const executor = new AsyncExecutor(heavyFunction, { autoStart: true });

// 添加一些任务
for (let i = 0; i < 10; i++) {
  executor.add(i);
}

// 暂停处理
executor.pause();

// 稍后恢复处理
setTimeout(() => {
  executor.resume();
}, 5000);
```

## API参考

### 构造函数

```javascript
new AsyncExecutor(fn, options)
```

- `fn`: 异步函数，将被执行器调用
- `options`: 配置选项对象
  - `concurrency`: 并发数，默认为1
  - `timeout`: 超时时间（毫秒），默认为0（无超时）
  - `retries`: 重试次数，默认为0
  - `retryDelay`: 重试延迟（毫秒），默认为1000
  - `onError`: 错误处理回调，默认为console.error
  - `onSuccess`: 成功处理回调
  - `onComplete`: 所有任务完成时的回调
  - `onCancel`: 任务取消时的回调
  - `autoStart`: 是否自动开始处理队列，默认为true
  - `abortOnError`: 出错时是否中止所有任务，默认为false

### 方法

#### add(...args)

添加任务到队列。

- `args`: 传递给异步函数的参数
- 返回: Promise，当任务完成时resolve

#### start()

开始处理队列。

- 返回: this，支持链式调用

#### pause()

暂停处理队列。

- 返回: this，支持链式调用

#### resume()

恢复处理队列。

- 返回: this，支持链式调用

#### abort()

取消所有任务。

- 返回: this，支持链式调用

#### cancelTask(taskId)

取消指定的任务。

- `taskId`: 任务ID
- 返回: boolean，是否成功取消

#### clearHistory()

清空结果和错误记录。

- 返回: this，支持链式调用

### 属性

#### queueSize

获取当前队列长度。

- 返回: number

#### runningCount

获取当前运行中的任务数。

- 返回: number

#### isIdle

获取是否所有任务都已完成。

- 返回: boolean

## 高级场景示例

### 防抖和节流

可以结合AsyncExecutor实现高级的防抖和节流功能：

```javascript
// 防抖实现
function debounce(fn, delay) {
  let executor = new AsyncExecutor(fn, { autoStart: false });
  let lastTaskId = null;

  return (...args) => {
    if (lastTaskId) {
      executor.cancelTask(lastTaskId);
    }

    const promise = executor.add(...args);
    lastTaskId = promise.taskId;

    executor.pause();
    setTimeout(() => executor.resume(), delay);

    return promise;
  };
}

// 节流实现
function throttle(fn, interval) {
  let executor = new AsyncExecutor(fn, { concurrency: 1 });
  let lastExecutionTime = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastExecutionTime < interval) {
      // 如果距离上次执行时间不足interval，则延迟执行
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          executor.add(...args).then(resolve).catch(reject);
          lastExecutionTime = Date.now();
        }, interval - (now - lastExecutionTime));
      });
    } else {
      // 直接执行
      lastExecutionTime = now;
      return executor.add(...args);
    }
  };
}
```

### 批量处理与进度跟踪

```javascript
// 创建一个带进度跟踪的执行器
const batchExecutor = new AsyncExecutor(processItem, {
  concurrency: 5,
  onSuccess: (result, taskId) => {
    updateProgress(++completedCount / totalCount * 100);
  }
});

let completedCount = 0;
const totalCount = items.length;

// 添加所有项目
const promises = items.map(item => batchExecutor.add(item));

// 等待所有任务完成
Promise.all(promises)
  .then(results => console.log('All items processed'))
  .catch(err => console.error('Batch processing failed:', err));
```

## 性能考虑

AsyncExecutor 在处理大量异步任务时表现出色，但需要注意以下几点：

1. **内存使用**：结果和错误历史会消耗内存，对于长期运行的执行器，应定期调用 `clearHistory()`
2. **任务优先级**：当前实现不支持任务优先级，所有任务按添加顺序处理
3. **资源限制**：设置合理的并发数，避免系统资源过载

## 最佳实践

1. **合理设置并发数**：根据任务类型和系统资源设置适当的并发数
2. **使用超时机制**：为可能长时间运行的任务设置超时
3. **实现错误回调**：始终提供错误处理回调，避免未捕获的异常
4. **取消不必要的任务**：及时取消不再需要的任务，释放资源
5. **链式调用**：利用方法的链式调用特性，使代码更简洁

## 常见问题

### Q: 如何处理任务间的依赖关系？

A: 可以使用 Promise 链在任务完成后添加新任务：

```javascript
executor.add(task1)
  .then(result => executor.add(task2, result))
  .then(finalResult => console.log('Done:', finalResult));
```

### Q: 如何实现任务优先级？

A: 当前版本不直接支持优先级，但可以通过多个执行器实现：

```javascript
const highPriorityExecutor = new AsyncExecutor(fn, { concurrency: 2 });
const lowPriorityExecutor = new AsyncExecutor(fn, { concurrency: 1 });

// 高优先级任务
highPriorityExecutor.add(importantTask);

// 低优先级任务
lowPriorityExecutor.add(lessImportantTask);
```

### Q: 如何处理任务超时？

A: 使用内置的超时机制：

```javascript
const executor = new AsyncExecutor(fn, {
  timeout: 3000,  // 3秒超时
  onError: (err) => {
    if (err.message.includes('timed out')) {
      console.log('Task timed out');
    }
  }
});
```

## 总结

AsyncExecutor 提供了一种强大而灵活的方式来管理复杂的异步操作。通过合理配置和使用其丰富的API，可以有效地处理各种异步场景，提高应用程序的可靠性和性能。
