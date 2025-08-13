/**
 * setTimeout vs setImmediate 执行顺序演示
 *
 * 在主模块中:
 * - setTimeout(fn, 0) 和 setImmediate(fn) 的执行顺序不确定
 * - 取决于进程性能和系统当前状态
 *
 * 在I/O回调中:
 * - setImmediate(fn) 总是先于 setTimeout(fn, 0) 执行
 * - 因为I/O回调完成后，事件循环先进入Check阶段，再进入Timers阶段
 */

function log(message) {
  console.log(`${Date.now()} - ${message}`);
}

// 1. 主模块中 setTimeout vs setImmediate
// 执行顺序不确定，取决于系统状态
log('主模块中 setTimeout vs setImmediate:');

setTimeout(() => {
  log('主模块 - setTimeout');
}, 0);

setImmediate(() => {
  log('主模块 - setImmediate');
});

// 2. I/O回调中 setTimeout vs setImmediate
// setImmediate 总是先执行
const fs = require('fs');
fs.readFile(__filename, () => {
  log('I/O回调中 setTimeout vs setImmediate:');

  setTimeout(() => {
    log('I/O回调 - setTimeout');
  }, 0);

  setImmediate(() => {
    log('I/O回调 - setImmediate');
  });
});

log('脚本执行结束');
