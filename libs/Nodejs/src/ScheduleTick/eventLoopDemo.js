/**
 * Node.js 事件循环演示
 *
 * 事件循环六个阶段:
 * 1. Timers: setTimeout/setInterval 回调
 * 2. Pending I/O Callbacks: 系统级I/O回调
 * 3. Idle/Prepare: 内部使用
 * 4. Poll: I/O事件轮询(主要阶段)
 * 5. Check: setImmediate回调
 * 6. Close Callbacks: 关闭事件回调
 */

// 辅助函数 - 打印带时间戳的日志
function log(message) {
  console.log(`${Date.now()} - ${message}`);
}

log('开始执行脚本');

// 5. Check 阶段 (setImmediate)
setImmediate(() => {
  log('5. Check 阶段 (setImmediate)');

  // 嵌套的 Timer 和 Check
  setTimeout(() => {
    log('嵌套的 Timer (setTimeout in setImmediate)');
  }, 0);

  setImmediate(() => {
    log('嵌套的 Check (setImmediate in setImmediate)');
  });
});

// 1. Timers 阶段 (setTimeout)
setTimeout(() => {
  log('1. Timer 阶段 (setTimeout 0ms)');
}, 0);

setTimeout(() => {
  log('1. Timer 阶段 (setTimeout 10ms)');
}, 10);


// 4. Poll 阶段 (I/O操作)
const fs = require('fs');
fs.readFile(__filename, () => {
  log('4. Poll 阶段 (文件I/O回调)');

  // I/O回调内的Timer和Check
  setTimeout(() => {
    log('I/O回调内的 Timer (setTimeout in I/O)');
  }, 0);

  setImmediate(() => {
    log('I/O回调内的 Check (setImmediate in I/O)');
  });
});

// 6. Close 阶段
const server = require('http').createServer();
server.listen(0, () => {
  log('服务器启动');
  server.close(() => {
    log('6. Close 阶段 (server.close回调)');
  });
});


// 微任务: Promise (优先级低于nextTick)
Promise.resolve().then(() => {
  log('微任务: Promise');
});

// 微任务: process.nextTick (优先级高于Promise)
process.nextTick(() => {
  log('微任务: process.nextTick');
});
// 同步代码
log('同步代码执行结束');
