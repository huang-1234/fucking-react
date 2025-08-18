/**
 * I/O操作与Poll阶段演示
 *
 * Poll阶段是事件循环中最重要的阶段，负责处理I/O回调
 * 当没有更多I/O回调时，Poll阶段会:
 * 1. 如果有setImmediate回调，立即进入Check阶段
 * 2. 如果有Timer到期，回到Timer阶段
 * 3. 如果既没有setImmediate也没有Timer，会在Poll阶段等待新的I/O事件
 */

const fs = require('fs');
const http = require('http');

function log(message) {
  console.log(`${Date.now()} - ${message}`);
}

log('开始执行');

// 文件I/O操作
fs.readFile(__filename, () => {
  log('文件读取完成回调');
});

// 网络I/O操作
const server = http.createServer((req, res) => {
  log('收到HTTP请求');
  res.end('Hello World');
});

// 启动服务器(异步操作)
server.listen(0, () => {
  const port = server.address().port;
  log(`服务器启动在端口 ${port}`);

  // 发起HTTP请求(触发网络I/O)
  http.get(`http://localhost:${port}`, (res) => {
    log('HTTP请求响应状态: ' + res.statusCode);

    // 读取响应数据
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      log('响应数据: ' + data);

      // 关闭服务器
      server.close(() => {
        log('服务器已关闭');
      });
    });
  });
});

// 在Poll阶段等待时，如果有Timer或setImmediate，会离开Poll阶段
setTimeout(() => {
  log('Timer回调 (可能在Poll阶段之后执行)');
}, 100);

setImmediate(() => {
  log('Immediate回调 (在Poll阶段之后的Check阶段执行)');
});

log('同步代码执行结束');
