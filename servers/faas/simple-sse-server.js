import http from 'http';

// 创建一个简单的HTTP服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const origin = req.headers.origin || '*';

  console.log(`收到请求: ${req.method} ${req.url}`);
  console.log(`请求头: ${JSON.stringify(req.headers)}`);

  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end();
    return;
  }

  // 处理SSE请求
  if (url.pathname === '/events') {
    console.log('处理SSE请求');

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    });

    // 发送初始重试间隔
    res.write('retry: 3000\n\n');

    // 发送连接成功事件
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.write(`event: connected\ndata: {"id":"${connectionId}"}\n\n`);

    // 发送初始数据
    res.write(`event: init\ndata: {"messages":[]}\n\n`);

    // 设置心跳
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 10000);

    // 定期发送消息
    const messageInterval = setInterval(() => {
      const message = {
        id: Date.now(),
        type: 'info',
        content: `服务器时间: ${new Date().toISOString()}`,
        timestamp: Date.now()
      };
      res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
    }, 5000);

    // 处理连接关闭
    req.on('close', () => {
      console.log(`SSE连接已关闭: ${connectionId}`);
      clearInterval(heartbeatInterval);
      clearInterval(messageInterval);
    });

    // 处理错误
    req.on('error', (err) => {
      console.error(`SSE连接错误: ${err.message}`);
      clearInterval(heartbeatInterval);
      clearInterval(messageInterval);
    });

    return;
  }

  // 处理根路径请求
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSE测试</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            #events { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-top: 10px; }
            .event { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>SSE测试页面</h1>
          <button id="connect">连接</button>
          <button id="disconnect" disabled>断开</button>
          <div id="status">未连接</div>
          <div id="events"></div>

          <script>
            const connectBtn = document.getElementById('connect');
            const disconnectBtn = document.getElementById('disconnect');
            const statusDiv = document.getElementById('status');
            const eventsDiv = document.getElementById('events');
            let eventSource = null;

            function addEvent(type, data) {
              const div = document.createElement('div');
              div.className = 'event';
              div.textContent = \`[\${new Date().toLocaleTimeString()}] \${type}: \${JSON.stringify(data)}\`;
              eventsDiv.appendChild(div);
              eventsDiv.scrollTop = eventsDiv.scrollHeight;
            }

            function connect() {
              if (eventSource) {
                eventSource.close();
              }

              statusDiv.textContent = '正在连接...';

              try {
                eventSource = new EventSource('/events');

                eventSource.onopen = function() {
                  addEvent('open', '连接已建立');
                };

                eventSource.addEventListener('connected', function(e) {
                  const data = JSON.parse(e.data);
                  statusDiv.textContent = \`已连接 (ID: \${data.id})\`;
                  connectBtn.disabled = true;
                  disconnectBtn.disabled = false;
                  addEvent('connected', data);
                });

                eventSource.addEventListener('message', function(e) {
                  addEvent('message', JSON.parse(e.data));
                });

                eventSource.addEventListener('init', function(e) {
                  addEvent('init', JSON.parse(e.data));
                });

                eventSource.onerror = function(err) {
                  statusDiv.textContent = '连接错误';
                  connectBtn.disabled = false;
                  disconnectBtn.disabled = true;
                  addEvent('error', '连接出错或已关闭');

                  if (eventSource) {
                    eventSource.close();
                    eventSource = null;
                  }
                };
              } catch (err) {
                statusDiv.textContent = \`错误: \${err.message}\`;
                addEvent('exception', err.message);
              }
            }

            function disconnect() {
              if (eventSource) {
                eventSource.close();
                eventSource = null;
                statusDiv.textContent = '已断开连接';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
                addEvent('info', '已手动断开连接');
              }
            }

            connectBtn.addEventListener('click', connect);
            disconnectBtn.addEventListener('click', disconnect);
          </script>
        </body>
      </html>
    `);
    return;
  }

  // 处理其他请求
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = 5179;
server.listen(PORT, () => {
  console.log(`简单SSE服务器运行在 http://localhost:${PORT}`);
  console.log(`SSE端点: http://localhost:${PORT}/events`);
});

// 处理服务器错误
server.on('error', (err) => {
  console.error(`服务器错误: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请尝试其他端口`);
  }
});
