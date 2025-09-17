/**
 * SSE 路由
 * 提供实时数据推送API
 */
import Router from 'koa-router';

const router = new Router();

/**
 * 消息队列，存储最近的消息
 */
const messageQueue = [];

let messageCounter = 0;

/**
 * 添加消息到队列
 */
const addMessage = (type, content) => {
  const message = {
    id: ++messageCounter,
    type,
    content,
    timestamp: Date.now()
  };

  messageQueue.push(message);

  // 保持队列在合理大小
  if (messageQueue.length > 100) {
    messageQueue.shift();
  }

  return message;
};

/**
 * 获取消息队列
 */
router.get('/api/messages', async (ctx) => {
  ctx.body = {
    success: true,
    messages: messageQueue
  };
});

/**
 * 发送新消息
 */
router.post('/api/messages', async (ctx) => {
  const { type, content } = ctx.request.body;

  if (!type || !content) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: '消息类型和内容不能为空'
    };
    return;
  }

  const message = addMessage(type, content);

  // 广播消息给所有SSE连接
  if (ctx.state.sse) {
    ctx.state.sse.broadcast('message', message);
  }

  ctx.body = { success: true, message };
});

/**
 * SSE 事件流端点
 */
router.get('/api/events', async (ctx) => {
  // 中间件会处理SSE连接
  // 这里可以发送初始数据
  if (ctx.state.sse) {
    // 发送最近的10条消息
    const recentMessages = messageQueue.slice(-10);
    ctx.res.write(ctx.state.sse.formatSSEMessage('init', { messages: recentMessages }));
  }
});

/**
 * 系统状态事件流
 */
router.get('/api/stream/system', async (ctx) => {
  // 中间件会处理SSE连接
  // 定期发送系统状态信息
  if (ctx.state.sse) {
    const connectionId = Array.from(ctx.state.sse.connections.keys()).find(id =>
      ctx.state.sse.connections.get(id) === ctx
    );

    if (!connectionId) return;

    // 发送初始系统状态
    const initialStatus = {
      cpu: Math.round(Math.random() * 100),
      memory: Math.round(Math.random() * 100),
      connections: ctx.state.sse.connections.size,
      uptime: process.uptime()
    };

    ctx.state.sse.sendEvent(connectionId, 'system', initialStatus);

    // 每5秒发送一次系统状态更新
    const statusInterval = setInterval(() => {
      const status = {
        cpu: Math.round(Math.random() * 100),
        memory: Math.round(Math.random() * 100),
        connections: ctx.state.sse.connections.size,
        uptime: process.uptime()
      };

      const success = ctx.state.sse.sendEvent(connectionId, 'system', status);
      if (!success) {
        clearInterval(statusInterval);
      }
    }, 5000);

    // 当连接关闭时清除定时器
    ctx.req.on('close', () => {
      clearInterval(statusInterval);
    });
  }
});

/**
 * 模拟随机事件生成器
 */
let randomEventGenerator = null;

/**
 * 启动随机事件生成器
 */
router.post('/api/events/start-generator', async (ctx) => {
  if (randomEventGenerator) {
    ctx.body = {
      success: false,
      error: '随机事件生成器已在运行'
    };
    return;
  }

  const interval = ctx.request.body.interval || 3000;

  randomEventGenerator = setInterval(() => {
    if (!ctx.state.sse) return;

    const eventTypes = ['info', 'warning', 'error', 'success'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const message = addMessage(type, {
      message: `随机生成的${type}消息 - ${new Date().toLocaleTimeString()}`,
      value: Math.round(Math.random() * 100)
    });

    ctx.state.sse.broadcast('message', message);
  }, interval);

  ctx.body = {
    success: true,
    message: '随机事件生成器已启动'
  };
});

/**
 * 停止随机事件生成器
 */
router.post('/api/events/stop-generator', async (ctx) => {
  if (!randomEventGenerator) {
    ctx.body = {
      success: false,
      error: '随机事件生成器未运行'
    };
    return;
  }

  clearInterval(randomEventGenerator);
  randomEventGenerator = null;

  ctx.body = {
    success: true,
    message: '随机事件生成器已停止'
  };
});

export default router;
