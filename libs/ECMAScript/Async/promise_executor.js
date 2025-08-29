
/**
 * @desc 封装为Promise
 * @param {Number} id 数据id
 * @param {Number} time 时间
 * @param {Number} error 失败的概率，0-100
 * @returns {Promise}
 */
function getPromise(id, time = 500, error = 0) {
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
(function executor() {
  // ======== promise executor ========
  const mode = process.argv[2] || 'async';
  console.log(`\n===== Running ${mode.toUpperCase()} Mode =====`);

  function basic() {
    console.log('start');
    const promise = new Promise(resolve => {
      console.log(1);
      resolve(2);
      console.log(3);
    });
    promise.then(console.log);
    console.log('end');
  }

  /**
   * @desc 🔵 ​​2. 微任务 vs 宏任务​
   */
  function microTask() {
    async function async1() {
      console.log('async1 start')
      await async2()
      console.log('async1 end')
    }
    async function async2() {
      console.log('async2')
    }
    console.log('script start')
    setTimeout(function () {
      console.log('setTimeout')
    }, 0)
    async1()
    new Promise((resolve) => {
      console.log('promise1')
      resolve()
    }).then(function () {
      console.log('promise2')
    })
    console.log('script end')
  }


  /**
   * @desc 🔵 ​​3. 宏任务 vs 微任务
   */
  function macroTask() {
    console.log('script start')
    setTimeout(function () {
      console.log('setTimeout')
    }, 0)
    new Promise((resolve) => {
      console.log('promise1')
      resolve()
    }).then(function () {
      console.log('promise2')
    })
    console.log('script end')
  }

  /**
   * @desc 🔵 ​​3. Promise状态不可变​
   */
  function promiseStatus() {
    const promise = new Promise((resolve, reject) => {
      resolve('success')
      reject('error')
    })
    promise.then(console.log).catch(console.log)
  }

  /**
   * @desc 🔵 ​​4. 值穿透（非函数参数）
   */
  function valueTransmission() {
    Promise.resolve(1)
      .then(2)
      .then(Promise.resolve(3))
      .then(console.log);
  }

  /**
   * @desc 🔵 ​​5. 链式调用与错误处理​
   */
  function chainError() {
    Promise.resolve()
      .then(() => { throw new Error('err1 ->'); })
      .catch(() => console.log('caught ->'))
      .then(() => { throw new Error('err2 ->'); })
      .catch(console.error);
  }

  /**
   * @desc 🔵 ​​6. Promise.all 并发执行、使用 time 记录执行时间 、使用 catch 捕获错误
   */
  function promiseAll() {
    console.time('Promise.all');
    Promise.all([
      getPromise(1, 500, 0),
      getPromise(2, 500, 0),
      getPromise(3, 500, 0)
    ]).then(console.log).catch(console.error);
    console.timeEnd('Promise.all');
  }
  /**
   * @desc 🔵 ​​7. Promise.race 竞速、使用 time 记录执行时间
   */
  function promiseRace() {
    console.time('Promise.race');
    Promise.race([
      getPromise(1, 100, 0),
      getPromise(2, 200, 0),
      getPromise(3, 300, 10)
    ]).then(console.log).catch(console.error);
    console.timeEnd('Promise.race');
  }
  /**
   * @desc 🔵 ​​8. Promise.allSettled 并发执行、使用 time 记录执行时间
   */
  function promiseAllSettled() {
    console.time('Promise.allSettled');
    Promise.allSettled([
      getPromise(1, 500, 0),
      getPromise(2, 500, 0),
      getPromise(3, 500, 0)
    ]).then(console.log).catch(console.error);
    console.timeEnd('Promise.allSettled');
  }

  /**
   * @desc 🔵 ​​9. Promise.any 竞速、使用 time 记录执行时间
   */
  function promiseAny() {
    console.time('Promise.any');
    Promise.any([
      getPromise(1, 500, 0),
      getPromise(2, 500, 0),
      getPromise(3, 500, 0)
    ]).then(console.log).catch(console.error);
    console.timeEnd('Promise.any');
  }


  /**
   * @desc 🔵 ​​10. Promise.finally 无论成功或失败都会执行
   */
  function promiseFinally() {
    console.time('Promise.finally');
    Promise.resolve().finally(() => console.log('finally'));
    console.timeEnd('Promise.finally');
  }

  /**
   * @desc 🔵 ​​11. Promise.resolve 和 Promise.reject
   */
  function promiseResolve() {
    console.time('Promise.resolve');
    Promise.resolve().then(console.log).catch(console.error);
    console.timeEnd('Promise.resolve');
  }
  /**
   * @desc 🔵 ​​12. async/await 与执行顺序​
   */
  function asyncAwait() {
    console.time('async/await');
    async function async1() {
      console.log('async1 start')
      await async2()
      console.log('async1 end')
    }
    async function async2() {
      console.log('async2')
    }
    console.log('script start')
    async1()
    console.log('script end')
    console.timeEnd('async/await');
  }
  /**
   * @desc 🔵 ​​13. 循环中的异步处理​
   */
  function loopAsync() {
    console.log('start');
    console.time('loopAsync');
    for (let i = 0;i < 3;i++) {
      getPromise(i, 500, 0).then(console.log);
    }
    console.timeEnd('loopAsync');
    console.log('end');
  }
  /**
   * @desc 🔵 ​​14. 手动实现 Promise.all​
   */
  function myPromiseAll(promises) {
    console.time('myPromiseAll');
    const result = [];
    let count = 0;
    return new Promise((resolve, reject) => {
      promises.forEach((promise, index) => {
        promise.then(data => {
          result[index] = data;
          count++;
          if (count === promises.length) {
            resolve(result);
          }
        }).catch(reject);
      });
    });
  }

  /**
   * @desc 🔵 ​​15. 手动实现 Promise.race​
   */
  function myPromiseRace(promises) {
    console.time('myPromiseRace');
    return new Promise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve, reject);
      });
    });
    console.timeEnd('myPromiseRace');
  }

  switch (mode) {
    case 'basic':
      basic();
      break;
    case 'microTask':
      microTask();
      break;
    case 'macroTask':
      macroTask();
      break;
    case 'promiseStatus':
      promiseStatus();
      break;
    case 'valueTransmission':
      valueTransmission();
      break;
    case 'chainError':
      chainError();
      break;
    case 'errorHandling':
      errorHandling();
      break;
    case 'promiseAll':
      promiseAll();
      break;
    case 'promiseRace':
      promiseRace();
      break;
    case 'promiseAllSettled':
      promiseAllSettled();
      break;
    case 'promiseAny':
      promiseAny();
      break;
    case 'promiseFinally':
      promiseFinally();
      break;
    case 'promiseResolve':
      promiseResolve();
      break;
    default:
    case 'asyncAwait':
      asyncAwait();
      break;
    case 'loopAsync':
      loopAsync();
      break;
    case 'myPromiseAll':
      myPromiseAll([
        getPromise(1, 500, 0),
        getPromise(2, 500, 0),
        getPromise(3, 500, 0)
      ]).then(console.log).catch(console.error);
      break;
    case 'myPromiseRace':
      myPromiseRace([
        getPromise(1, 500, 0),
        getPromise(2, 500, 0),
        getPromise(3, 500, 0)
      ]).then(console.log).catch(console.error);
      break;
  }
})();