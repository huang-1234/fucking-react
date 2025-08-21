/**
 * Close Callbacks 阶段演示
 *
 * Close Callbacks 是事件循环的最后一个阶段
 * 处理如 socket.on('close', ...) 等关闭事件的回调
 */

const net = require('net');
const fs = require('fs');

function log(message) {
  console.log(`${Date.now()} - ${message}`);
}

log('开始执行');

// 创建TCP服务器
const server = net.createServer();

// 监听连接事件
server.on('connection', (socket) => {
  log('新的客户端连接');

  // 监听数据事件
  socket.on('data', (data) => {
    log(`收到数据: ${data}`);
    socket.end('再见!'); // 关闭连接
  });

  // 监听关闭事件 (将在Close Callbacks阶段执行)
  socket.on('close', (hadError) => {
    log(`客户端连接关闭 (发生错误: ${hadError})`);
  });
});

// 启动服务器
server.listen(0, () => {
  const port = server.address().port;
  log(`服务器启动在端口 ${port}`);

  // 创建客户端连接
  const client = net.createConnection({ port }, () => {
    log('客户端已连接');
    client.write('你好，服务器!');
  });

  // 客户端接收数据
  client.on('data', (data) => {
    log(`客户端收到: ${data}`);
  });

  // 客户端连接关闭事件 (将在Close Callbacks阶段执行)
  client.on('close', () => {
    log('客户端连接关闭');

    // 关闭服务器
    server.close(() => {
      log('服务器已关闭');
    });
  });

  // 客户端错误处理
  client.on('error', (err) => {
    log(`客户端错误: ${err.message}`);
  });
});

// 文件关闭回调演示
const fd = fs.openSync(__filename, 'r');
fs.close(fd, () => {
  log('文件描述符关闭回调');
});

// 其他事件循环阶段的回调
setTimeout(() => log('Timer 回调'), 0);
setImmediate(() => log('Immediate 回调'));
process.nextTick(() => log('nextTick 回调'));

log('同步代码执行结束');
