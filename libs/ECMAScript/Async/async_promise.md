以下是一个完整的JavaScript异步编程演变历史Demo，从回调函数到Promise、Generator，最终到Async/Await，代码结构严格遵循您提供的设计范式：

```javascript
(function () {
  // 1. 基础回调函数实现（原始模式）
  function callbackHell() {
    getAsyncData(1, (data1) => {
      console.log('Callback 1:', data1);
      getAsyncData(2, (data2) => {
        console.log('Callback 2:', data2);
        getAsyncData(3, (data3) => {
          console.log('Callback 3:', data3);
          // 更多嵌套...
        });
      });
    });
  }

  // 2. Promise链式调用（ES6解决方案）
  function promiseChain() {
    getPromise(1)
      .then(data => {
        console.log('Promise 1:', data);
        return getPromise(2);
      })
      .then(data => {
        console.log('Promise 2:', data);
        return getPromise(3);
      })
      .then(data => {
        console.log('Promise 3:', data);
      })
      .catch(err => console.error('Promise Error:', err));
  }

  // 3. Generator+yield（过渡方案）
  function* generatorFlow(getPromise, array = [1, 2, 3], time = 100, error = 0) {
    for (let i = 0; i < array.length; i++) {
      const data = yield getPromise(array[i], time, error);
      console.log(`Generator ${array[i]}:`, data);
    }
    console.log('all data: ', array);
    return 'Generator Complete';
  }

  // 4. Async/Await（现代终极方案）
  async function asyncAwaitFlow(getPromise, array = [1, 2, 3], time = 100, error = 0) {
    try {
      const data1 = await getPromise(array[0], time, error);
      console.log('Async 1:', data1);
      const data2 = await getPromise(array[1], time, error);
      console.log('Async 2:', data2);
      const data3 = await getPromise(array[2], time, error);
      console.log('Async 3:', data3);
      return 'Async Complete';
    } catch (err) {
      console.error('Async Error:', err);
    }
  }

  // ======== 工具函数 ========
  /**
   * @desc 模拟传统回调函数
   * @param {Number} id
   * @param {Function} callback
   * @returns {void}
   */
  function getAsyncData(id, callback) {
    setTimeout(() => callback(`Data${id}`), 100);
  }

  /**
   * @desc 封装为Promise
   * @param {Number} id
   * @param {Number} time
   * @param {Number} error
   * @returns {Promise<string>}
   */
  function getPromise(id, time = 100, error = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (error && Math.random() * 100 < error) {
          reject(new Error(`Error${id}`));
        } else {
          const result = `Data${id}`;
          console.log(`${result} is ready`);
          resolve(result);
        }
      }, time);
    });
  }

  /**
   * @desc Generator执行器
   * @param {Function} genFunc
   * @param {Array<Number>} array
   * @param {Number} time
   * @param {Number} error
   * @returns {void}
   */
  function runGenerator(genFunc, array = [1, 2, 3], time = 100, error = 0) {
    /**
     * @type {Generator<any, any, any>}
     */
    const gen = genFunc(getPromise, array, time, error);
    /**
     * @param {() => IteratorResult<any, any>} nextFn
     * @returns {Promise<any> | void}
     */
    function step(nextFn) {
      /**
       * @type {IteratorResult<any, any>}
       */
      let next;
      try {
        next = nextFn();
      } catch (e) {
        return console.error('Generator Error:', e);
      }
      if (next.done) return next.value;
      Promise.resolve(next.value).then(
        v => step(() => gen.next(v)),
        e => step(() => gen.throw(e))
      );
    }
    step(() => gen.next());
  }

  // ======== 执行控制 ========
  const mode = process.argv[2] || 'async';
  console.log(`\n===== Running ${mode.toUpperCase()} Mode =====`);

  switch (mode) {
    case 'callback':
      callbackHell();
      break;
    case 'promise':
      promiseChain();
      break;
    case 'generator':
      runGenerator(generatorFlow, [1, 2, 3], 100, 0);
      break;
    case 'async':
      asyncAwaitFlow(getPromise, [1, 2, 3], 100, 0).then(res => console.log(res));
      break;
    default:
      console.log('Invalid mode');
  }
})();
```

### 异步编程演进路线说明

1. **回调函数模式**
   - 通过嵌套回调处理异步
   - 导致"回调地狱"金字塔结构
   - 错误处理困难（需手动传递error）

2. **Promise解决方案**
   - 链式`.then()`取代嵌套回调
   - 统一`.catch()`错误处理
   - 支持`Promise.all`/`race`等并发控制

3. **Generator过渡方案**
   - `yield`暂停函数执行
   - 需要手动执行器控制流程
   - 是Async/Await的底层基础

4. **Async/Await终极方案**
   - 用同步写法处理异步
   - `try/catch`错误处理
   - 自动Promise解包机制

### 执行方式（Node.js环境）
```bash
# 回调模式
node script.js callback

# Promise模式
node script.js promise

# Generator模式
node script.js generator

# Async/Await模式（默认）
node script.js
```

### 各方案对比分析

| **特性**         | 回调函数          | Promise          | Generator        | Async/Await      |
|------------------|------------------|------------------|------------------|------------------|
| **可读性**       | ❌ 嵌套金字塔      | ✅ 链式调用       | ⚠️ 需执行器       | ✅ 类同步代码     |
| **错误处理**     | ❌ 手动传递error   | ✅ .catch()统一处理 | ❌ 手动try/catch | ✅ 原生try/catch |
| **并发控制**     | ❌ 复杂实现        | ✅ Promise.all    | ⚠️ 手动实现       | ✅ Promise.all   |
| **执行控制**     | ❌ 无暂停机制      | ✅ 状态机         | ✅ yield暂停      | ✅ await暂停     |

此Demo完整展现了JavaScript异步编程的演进历程，每个阶段都解决前一代的核心痛点，最终达到用同步思维处理异步操作的理想状态。