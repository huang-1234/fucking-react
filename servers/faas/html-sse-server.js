import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseUrl } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 存储所有SSE连接
const sseConnections = new Map();

// 存储消息历史
const messageHistory = [];

// 创建一个简单的HTTP服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`收到请求: ${req.method} ${pathname}`, req.data);

  // 处理SSE请求
  if (pathname === '/sse') {
    handleSSE(req, res);
    return;
  }

  // 处理API请求
  if (pathname === '/api/messages' || pathname === '/sse/messages') {
    if (req.method === 'POST') {
      handlePostMessage(req, res);
      return;
    } else if (req.method === 'GET') {
      handleGetMessages(req, res);
      return;
    } else if (req.method === 'OPTIONS') {
      // 处理预检请求
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      });
      res.end();
      return;
    }
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

  // 记录API调用
  console.log(`API调用: ${req.method} ${req.url}`);
  console.log(`请求头: ${JSON.stringify(req.headers)}`);

  // 发送重试间隔
  res.write('retry: 3000\n\n');

  // 生成唯一连接ID
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`新SSE连接: ${connectionId}`);

  // 存储连接
  sseConnections.set(connectionId, res);

  // 发送连接成功事件
  sendEvent(res, 'connected', { id: connectionId });

  // 发送初始数据
  sendEvent(res, 'init', {
    message: '连接已初始化',
    serverTime: new Date().toISOString(),
    messages: messageHistory.slice(-10) // 发送最近10条消息
  });

  // 设置心跳
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (err) {
      clearInterval(heartbeatInterval);
      sseConnections.delete(connectionId);
      console.log(`心跳失败，连接已关闭: ${connectionId}`);
    }
  }, 15000);

  // 定期发送系统状态
  const systemInterval = setInterval(() => {
    try {
      sendEvent(res, 'system', {
        cpu: Math.round(Math.random() * 100),
        memory: Math.round(Math.random() * 100),
        uptime: process.uptime(),
        connections: sseConnections.size,
        timestamp: Date.now()
      });
    } catch (err) {
      clearInterval(systemInterval);
    }
  }, 10000);

  // 处理连接关闭
  req.on('close', () => {
    console.log(`SSE连接已关闭: ${connectionId}`);
    clearInterval(heartbeatInterval);
    clearInterval(systemInterval);
    sseConnections.delete(connectionId);
  });
}

// 处理POST消息请求
function handlePostMessage(req, res) {
  console.log('处理消息POST请求:', req.url);
  console.log('请求头:', JSON.stringify(req.headers));

  // 设置CORS头
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();

    // 简单的防DoS攻击
    if (body.length > 1e6) {
      body = '';
      res.writeHead(413, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: '请求体过大' }));
      req.connection.destroy();
    }
  });

  req.on('end', () => {
    console.log('收到的消息体:', body);

    if (!body) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: '请求体为空' }));
      return;
    }

    try {
      const message = JSON.parse(body);
      console.log('解析后的消息:', message);

      // 验证消息格式
      if (!message.type || !message.content) {
        console.log('消息格式错误:', message);
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: '消息格式不正确，需要type和content字段' }));
        return;
      }

      // 添加消息ID和时间戳
      const newMessage = {
        id: Date.now(),
        type: message.type,
        content: message.content,
        timestamp: message.timestamp || Date.now(),
        date: message.date || new Date().toISOString()
      };

      // 存储消息
      messageHistory.push(newMessage);

      // 限制消息历史大小
      if (messageHistory.length > 100) {
        messageHistory.shift();
      }

      // 广播消息给所有连接
      const activeConnections = broadcastMessage('message', newMessage);

      // 返回成功响应
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        success: true,
        message: newMessage,
        activeConnections: activeConnections,
        date: message.date || new Date().toISOString()
      }));

      console.log(`消息已广播: ${JSON.stringify(newMessage)}`);
    } catch (err) {
      console.error('解析JSON错误:', err.message);
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: `无效的JSON格式: ${err.message}` }));
    }
  });
}

// 处理GET消息请求
function handleGetMessages(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({ messages: messageHistory }));
}

// 广播消息给所有连接
function broadcastMessage(event, data) {
  const message = formatSSEMessage(event, data);
  let activeConnections = 0;

  for (const [id, res] of sseConnections.entries()) {
    try {
      res.write(message);
      activeConnections++;
    } catch (err) {
      console.log(`广播失败，连接已关闭: ${id}`);
      sseConnections.delete(id);
    }
  }

  console.log(`消息已广播给 ${activeConnections} 个连接`);
  return activeConnections;
}

// 格式化SSE消息
function formatSSEMessage(event, data) {
  let message = '';

  if (event) {
    message += `event: ${event}\n`;
  }

  if (data) {
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
    message += `data: ${dataStr}\n`;
  }

  message += '\n';
  return message;
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
