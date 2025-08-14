(function () {
  let allData = [];
  /**
   * @desc 1. 基础回调函数实现（原始模式）
   * @returns {void}
   */
  function callbackHell() {
    getAsyncData(1, (data1) => {
      console.log('Callback 1:', data1);
      allData.push(data1);
      getAsyncData(2, (data2) => {
        console.log('Callback 2:', data2);
        allData.push(data2);
        getAsyncData(3, (data3) => {
          console.log('Callback 3:', data3);
          allData.push(data3);
          console.log('all data: ', allData);
          allData = [];
          // 更多嵌套...
        });
      });
    });
  }

  /**
   * @desc 2. Promise链式调用（ES6解决方案）、使用 allData 存储数据
   * @param {Function} getPromise
   * @param {Array<Number>} array
   * @param {Number} time
   * @param {Number} error
   * @returns {Promise<void>}
   */
  function promiseChain(getPromise, array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], time = 500, error = 0) {
    for (let i = 0; i < array.length; i++) {
      getPromise(array[i], time, error)
        .then(data => {
          console.log(`Promise ${array[i]}:`, data);
          allData.push(data);
        })
        .catch(err => {
          console.error('Promise Error:', err);
        })
        .finally(() => {
          console.log('all data: ', allData);
          allData = [];
        });
    }
    console.log('all data: ', allData);
    allData = [];
    // getPromise(1, 500, 0)
    //   .then(data => {
    //     console.log('Promise 1:', data);
    //     allData.push(data);
    //     return getPromise(2, 500, 0);
    //   })
    //   .then(data => {
    //     console.log('Promise 2:', data);
    //     allData.push(data);
    //     return getPromise(3, 500, 0);
    //   })
    //   .then(data => {
    //     console.log('Promise 3:', data);
    //     allData.push(data);
    //     console.log('all data: ', allData);
    //     allData = [];
    //   })
    //   .catch(err => console.error('Promise Error:', err));
  }

  /**
   * @desc 3. Generator+yield（过渡方案）
   * @param {Function} getPromise 获取数据
   * @param {Array<Number>} array 数据数组
   * @param {Number} time 时间
   * @param {Number} error 错误率
   * @returns {Generator<any, any, any>}
   */
  function* generatorFlow(getPromise, array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], time = 100, error = 0) {
    for (let i = 0; i < array.length; i++) {
      const data = yield getPromise(array[i], time, error);
      console.log(`Generator ${array[i]}:`, data);
      allData.push(data);
    }
    console.log('all data: ', allData);
    allData = [];
    return 'Generator Complete';
    // const data1 = yield getPromise(array[0], time, error);
    // console.log('Generator 1:', data1);
    // allData.push(data1);

    // const data2 = yield getPromise(array[1], time, error);
    // console.log('Generator 2:', data2);
    // allData.push(data2);

    // const data3 = yield getPromise(3);
    // console.log('Generator 3:', data3);
    // allData.push(data3);

    // const data4 = yield getPromise(4);
    // console.log('Generator 4:', data4);
    // allData.push(data4);

    // const data5 = yield getPromise(5);
    // console.log('Generator 5:', data5);
    // allData.push(data5);

    // const data6 = yield getPromise(6);
    // console.log('Generator 6:', data6);
    // allData.push(data6);

    // const data10 = yield getPromise(10);
    // console.log('Generator 10:', data10);
    // allData.push(data10);

    // const data11 = yield getPromise(11, 1000, 0);
    // console.log('Generator 11:', data11);
    // allData.push(data11);

    // const data12 = yield getPromise(12, 1000, 0);
    // console.log('Generator 12:', data12);
    // allData.push(data12);

    // const data13 = yield getPromise(13, 1000, 30);
    // console.log('Generator 13:', data13);
    // allData.push(data13);

    // const data14 = yield getPromise(14);
    // console.log('Generator 14:', data14);
    // allData.push(data14);

    // const data15 = yield getPromise(15, 1000, 40);
    // console.log('Generator 15:', data15);
    // allData.push(data15);

    // const data16 = yield getPromise(16, 1000, 50);
    // console.log('Generator 16:', data16);
    // allData.push(data16);

    // const data17 = yield getPromise(17, 1000, 60);
    // console.log('Generator 17:', data17);
    // allData.push(data17);

    // const data18 = yield getPromise(18, 1000, 70);
    // console.log('Generator 18:', data18);
    // allData.push(data18);

    // console.log('all data: ', allData);
    // allData = [];
    // return 'Generator Complete';
  }

  /**
   * @desc 4. Async/Await（现代终极方案）Async/Await 顺序执行、使用try/catch捕获错误
   * @param {Function} getPromise 获取数据
   * @param {Array<Number>} array 数据数组
   * @param {Number} time 时间
   * @param {Number} error 错误率
   * @returns {Promise<string>}
   */
  async function asyncAwaitFlow(getPromise, array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], time = 500, error = 0) {
    try {
      for (let i = 0; i < array.length; i++) {
        const data = await getPromise(array[i], time, error);
        console.log(`Async ${array[i]}:`, data);
        allData.push(data);
      }
      console.log('all data: ', allData);
      allData = [];
      // const data1 = await getPromise(1);
      // console.log('Async 1:', data1);
      // const data2 = await getPromise(2);
      // console.log('Async 2:', data2);
      // const data3 = await getPromise(3, 800, 50);
      // console.log('Async 3:', data3);
      // const data4 = await getPromise(4, 1200, 100);
      // console.log('Async 4:', data4);
      // const data5 = await getPromise(5);
      // console.log('Async 5:', data5);
      // const data6 = await getPromise(6);
      // console.log('Async 6:', data6);
      return 'Async Complete';
    } catch (err) {
      console.error('Async Error:', err);
    }
  }

  // ======== 工具函数 ========
  // 模拟传统回调函数
  function getAsyncData(id, callback) {
    setTimeout(() => callback(`Data${id}`), 100);
  }

  /**
   * @desc 封装为Promise
   * @param {Number} id
   * @param {Number} time
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

  /**
   * @desc Generator执行器
   * @param {() => Generator<any, any, any>} genFunc
   * @param {Array<Number>} array
   * @param {Number} time
   * @param {Number} error
   * @returns {void}
   */
  function runGenerator(genFunc, array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], time = 100, error = 0) {
    const gen = genFunc(getPromise, array, time, error);
    /**
     * @desc 递归执行生成器的下一步
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
      promiseChain(getPromise);
      break;
    case 'generator':
      runGenerator(generatorFlow, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 500, 0);
      break;
    case 'async':
      asyncAwaitFlow(getPromise, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 500, 0).then(res => console.log(res));
      break;
    default:
      console.log('Invalid mode');
  }
})();

// test
// node Async/async_promise.js  async