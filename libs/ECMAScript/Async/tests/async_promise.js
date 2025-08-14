(function (key) {

  const getData = () => new Promise(resolve => setTimeout(() => resolve("data"), 1000));
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

  switch (key) {
    case 1:
      testPromise();
      break;
    case 2:

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
        console.log('out:catch', error);
      }
      break;
    case 3:
      async function test() {
        const data1 = await getData();
        console.log(`data1: ${data1}`);
        const data2 = await getData();
        console.log(`data2: ${data2}`);
        const data3 = await getData();
        console.log(`data3: ${data3}`);
        const data4 = await getData();
        console.log(`data4: ${data4}`);
        const data5 = await getData();
        console.log(`data5: ${data5}`);
        const data6 = await getData();
        console.log(`data6: ${data6}`);
        const data7 = await getData();
        console.log(`data7: ${data7}`);
        const data8 = await getData();
        console.log(`data8: ${data8}`);
        const data9 = await getData();
        return 'success';
      }
      // 这样的一个函数 应该再1秒后打印data 再过一秒打印data2 最后打印success
      test().then(res => console.log(res));
      break;
    case 4:
      var test = asyncToGenerator(
        function* testG() {
          // await被编译成了yield
          const data = yield getData();
          console.log('data: ', data);
          const data2 = yield getData();
          console.log('data2: ', data2);
          return 'success';
        }
      );

      testG().then(res => console.log(res));
      break;
    default:
      break;
  }
})(4);

// 错误答案
// script start script end  async1 start promise1 async2 promise2 async1 end setTimeout

// 正确答案
//
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
