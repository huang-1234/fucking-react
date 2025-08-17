export const eventLoopBrowserText = `
console.log('start');

Promise.resolve().then(() => {
  setTimeout(() => {
    console.log('1 timer task promise 1 then setTimeout 2');
  }, 0);
});


setTimeout(() => {
  console.log('===== timer task =====');
}, 0);

async function async1() {
  console.log('sync task: async1 start');
  await async2();
  // 这是一个一阶微任务，在async2执行完之后执行
  console.log('1 promise then resolve 1');
}

async function async2() {
  console.log('sync task: async2 start');
}

async function async3() {
  console.log('sync task: async3 start');
  await async4();
  console.log('2222 await async4 end promise then resolve 3');
}

async function async4() {
  return new Promise((resolve) => {
    console.log('sync task: async4 start');
    setTimeout(() => {
      console.log('1 timer task async4 setTimeout 4');
    }, 0);
    resolve();
  }).then(() => {
    console.log('1 promise then resolve 2');
    new Promise((resolve) => {
      resolve();
    }).then(() => {
      // 这是一个二阶微任务，并不是一个三阶微任务
      console.log('2 promise then resolve 1: 插队成功');
    }).then(() => {
      console.log('2 promise then resolve 2: 插队失败， 放入队尾');
    });
  }).then(() => {
    console.log('2 promise then resolve 1');
  });
}
async1();
async3();

new Promise((resolve) => {
  resolve();
}).then(() => {
  console.log('1 promise then resolve 3');
  setTimeout(() => {
    console.log('2 timer task async4 setTimeout 4');
  }, 0);
}).then(() => {
  console.log('2 promise then resolve 2');
  new Promise((resolve) => {
    resolve();
  }).then(() => {
    // 这是一个二阶微任务，并不是一个三阶微任务
    console.log('22 promise then resolve 1: 插队成功');
  }).then(() => {
    console.log('22 promise then resolve 2: 插队失败， 放入队尾');
  });
});

Promise.resolve().then(() => {
  console.log('1 promise then resolve 4');
});



console.log('end');
`


// == sync task ==

// start
// async1 start
// async2 start
// async1 end // error: async1 end is promise then task, but async2 is not promise then task
// async3 start
// async4 start
// end
// setTimeout(() => {
//   console.log('1 timer task async4 setTimeout 4');
// }, 0);

// == 1 async promise queue task ==
// setTimeout(() => {
//   console.log('1 promise then setTimeout 2');
// }, 0);
// console.log('1 async4 then.resolve 4');
// console.log('1 promise then 4');
// console.log('1 promise then.resolve 2');
// setTimeout(() => {
//   console.log('setTimeout 3');
// }, 0);



// == 2 async promise queue task ==
// console.log('2 promise then.resolve 4');


// == 3 async promise queue task ==
// console.log('2 promise then: async3 end');


// == 1 async timer task ==

// console.log('1 timer task setTimeout 2');
// console.log('1 timer task async4 setTimeout 4');



// == 2 async timer task ==

// console.log('2 timer task async4 setTimeout 4');