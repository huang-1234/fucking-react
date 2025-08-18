/**
 * 微任务演示
 *
 * 微任务不属于事件循环的阶段，但在事件循环的每个阶段完成后立即执行
 * 优先级: process.nextTick > Promise.then/catch/finally
 */

function log(message) {
  console.log(`${Date.now()} - ${message}`);
}

log('开始执行');

// setTimeout (宏任务)
setTimeout(() => {
  log('Timer 阶段 (setTimeout)');

  // 在Timer回调中添加微任务
  process.nextTick(() => {
    log('Timer回调中的 nextTick');
  });

  Promise.resolve().then(() => {
    log('Timer回调中的 Promise');
  });
}, 0);

// setImmediate (宏任务)
setImmediate(() => {
  log('Check 阶段 (setImmediate)');

  // 在Check回调中添加微任务
  process.nextTick(() => {
    log('Check回调中的 nextTick');
  });

  Promise.resolve().then(() => {
    log('Check回调中的 Promise');
  });
});

// 微任务队列
process.nextTick(() => {
  log('第一个 nextTick');

  // 嵌套的nextTick会在当前nextTick队列全部执行完后立即执行
  process.nextTick(() => {
    log('嵌套的 nextTick');
  });
});

Promise.resolve().then(() => {
  log('第一个 Promise');

  // 嵌套的Promise会进入下一轮微任务队列
  Promise.resolve().then(() => {
    log('嵌套的 Promise');
  });
});

// 微任务队列 - 第二批
process.nextTick(() => {
  log('第二个 nextTick');
});

Promise.resolve().then(() => {
  log('第二个 Promise');
});

log('同步代码执行结束');
