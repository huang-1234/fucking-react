import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建一个简单的HTTP服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`收到请求: ${req.method} ${pathname}`);

  // 处理SSE请求
  if (pathname === '/sse') {
    handleSSE(req, res);
    return;
  }

  // 处理静态文件请求
  if (pathname === '/' || pathname === '/index.html') {
    serveFile(res, path.join(__dirname, 'public', 'sse-template.html'), 'text/html');
    return;
  }

  // 处理其他静态文件
  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    const extname = path.extname(filePath);
    const contentType = getContentType(extname);
    serveFile(res, filePath, contentType);
    return;
  }

  // 处理404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1>');
});

// 处理SSE连接
function handleSSE(req, res) {
  const origin = req.headers.origin || '*';

  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true'
  });

  // 发送重试间隔
  res.write('retry: 3000\n\n');

  // 生成唯一连接ID
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`新SSE连接: ${connectionId}`);

  // 发送连接成功事件
  sendEvent(res, 'connected', { id: connectionId });

  // 发送初始数据
  sendEvent(res, 'init', {
    message: '连接已初始化',
    serverTime: new Date().toISOString()
  });

  // 设置心跳
  const heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  // 定期发送消息
  const messageInterval = setInterval(() => {
    sendEvent(res, 'message', {
      id: Date.now(),
      type: 'update',
      content: `服务器时间: ${new Date().toISOString()}`,
      timestamp: Date.now()
    });
  }, 5000);

  // 定期发送系统状态
  const systemInterval = setInterval(() => {
    sendEvent(res, 'system', {
      cpu: Math.round(Math.random() * 100),
      memory: Math.round(Math.random() * 100),
      uptime: process.uptime(),
      connections: 1, // 简化版只有一个连接
      timestamp: Date.now()
    });
  }, 10000);

  // 处理连接关闭
  req.on('close', () => {
    console.log(`SSE连接已关闭: ${connectionId}`);
    clearInterval(heartbeatInterval);
    clearInterval(messageInterval);
    clearInterval(systemInterval);
  });
}

// 发送SSE事件
function sendEvent(res, event, data) {
  let message = '';

  if (event) {
    message += `event: ${event}\n`;
  }

  if (data) {
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
    message += `data: ${dataStr}\n`;
  }

  message += '\n';
  res.write(message);
}

// 提供静态文件
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>500 Server Error</h1><p>${err.code}</p>`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// 获取内容类型
function getContentType(extname) {
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpeg';
    default:
      return 'text/plain';
  }
}

// 启动服务器
const PORT = 5180;
server.listen(PORT, () => {
  console.log(`HTML SSE服务器运行在 http://localhost:${PORT}`);
  console.log(`SSE端点: http://localhost:${PORT}/sse`);
});

// 处理服务器错误
server.on('error', (err) => {
  console.error(`服务器错误: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请尝试其他端口`);
  }
});
