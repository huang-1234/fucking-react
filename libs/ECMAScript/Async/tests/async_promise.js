(function (k) {
  console.log(process.argv);
  const key = process.argv[2] ? parseInt(process.argv[2]) : k;
  const PromiesTimeOut = (idx, time = 1000) => new Promise(resolve => setTimeout(() => resolve(`data${idx}`), time))
  const PromiesTimeOut2 = (idx, time = 1000) => new Promise(resolve => resolve(`data${idx}`))
  let getData = PromiesTimeOut, allData = [];
  const chooicePromise = 1, time = 1000;
  switch (chooicePromise) {
    case 1:
      getData = PromiesTimeOut;
      break;
    case 2:
      getData = PromiesTimeOut2;
      break;
    case 3:
      getData = PromiesTimeOut;
      break;
    case 4:
      getData = PromiesTimeOut;
      break;
    default:
      getData = PromiesTimeOut;
      break;
  }
  // 测试 promise 顺序传递结果给调用方
  function testPromise() {
    async function async1() {
      console.log('async1 start');
      await async2();
      console.log('async1 end');
    }
    async function async2() {
      console.log('async2');
      new Promise((resolve) => {
        resolve(1);
      });
      console.log('async2 end');
    }
    console.log('script start');
    async1();
    new Promise((resolve) => {
      console.log('promise1');
      resolve(2);
    }).then(function () {
      console.log('promise2');
    });
  }

  function testTryCatch() {
    try {
      new Promise((rs, rj) => {
        console.log('Promise:start');
        // rs(new Error('manual error'));
        throw new Error('error');
      }).then(res => {
        console.log('Promise:then', res);
      }).catch(err => {
        console.log('Promise:catch', err);
      }).finally(() => {
        console.log('finally');
      });
    } catch (error) {
      // 无法捕获到错误、因为promise的错误不会被catch捕获到
      console.log('out:catch', error);
    }
  }

  /**
   * @desc promise 的并发执行
   */
  function testPromiseConcurrent() {
    (() => {
      const data = getData(1);
      console.log('data: ', data);
      const data2 = getData(2);
      console.log('data2: ', data2);
      const data3 = getData(3);
      console.log('data3: ', data3);
      const data4 = getData(4);
      console.log('data4: ', data4);
      const data5 = getData(5);
      console.log('data5: ', data5);
      const allData = [data, data2, data3, data4, data5];
      console.log('all data: ', allData);
    })()
  }


  /**
   * @desc promise 的顺序执行、使用then的嵌套、不使用async/await
   */
  function testPromiseChain1() {
    getData(1).then(res => {
      console.log('data: ', res);
      allData.push(res);
      getData(2).then(res => {
        allData.push(res);
        console.log('data: ', res);
        getData(3).then(res => {
          allData.push(res);
          console.log('data: ', res);
          getData(4).then(res => {
            allData.push(res);
            console.log('data: ', res);
            getData(5).then(res => {
              allData.push(res);
              console.log('data: ', res);
              console.log('all data: ', allData);
            });
          });
        });
      });
    });
  }


  /**
   * 使用generator 实现promise的顺序执行
   * @returns
   */
  function* testPromiseGenerator() {
    const data1 = yield getData(1);
    console.log('data1: ', data1);
    allData.push(data1);
    const data2 = yield getData(2);
    console.log('data2: ', data2);
    allData.push(data2);
    const data3 = yield getData(3);
    console.log('data3: ', data3);
    allData.push(data3);
    const data4 = yield getData(4);
    console.log('data4: ', data4);
    allData.push(data4);
    const data5 = yield getData(5);
    console.log('data5: ', data5);
    allData.push(data5);
    const data6 = yield getData(6);
    console.log('data6: ', data6);
    allData.push(data6);
    console.log('all data: ', allData);
    allData = [];
    return 'success';
  }

  /**
   * @desc promise 的顺序执行、使用async/await
   * @returns
   */
  async function testPromiseAsyncAwait1() {
    const data = await getData(1);
    console.log('data: ', data);
    const data2 = await getData(2);
    console.log('data2: ', data2);
    const data3 = await getData(3);
    console.log('data3: ', data3);
    const data4 = await getData(4);
    console.log('data4: ', data4);
    const data5 = await getData(5);
    console.log('data5: ', data5);
    const data6 = await getData(6);
    console.log('data6: ', data6);
    allData = [data, data2, data3, data4, data5, data6];
    console.log('all data: ', allData);
    allData = [];
    return 'success';
  }
  switch (key) {
    case -1:
      testPromise();
      break;
    case 0:
      testTryCatch();
      break;
    case 1:
      testPromiseChain1();
      break;
    case 2:
      testPromiseConcurrent();
      break;
    case 3:
      const gen = testPromiseGenerator();
      gen.next();
      gen.next();
      gen.next();
      gen.next();
      gen.next();
      break;
    case 4:
      break;
    case 5:
      testPromiseAsyncAwait1();
      break;
    case 6:
      break;
    default:
      break;
  }
})();