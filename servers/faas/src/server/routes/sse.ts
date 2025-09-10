/**
 * SSE 路由
 * 提供实时数据推送API
 */
import { Context } from 'koa';
import Router from 'koa-router';

const router = new Router();

/**
 * 消息队列，存储最近的消息
 */
const messageQueue: Array<{
  id: number;
  type: string;
  content: any;
  timestamp: number;
}> = [];

let messageCounter = 0;

/**
 * 添加消息到队列
 */
const addMessage = (type: string, content: any) => {
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
router.get('/api/messages', (ctx) => {
  ctx.body = {
    messages: messageQueue
  };
});

/**
 * 发布新消息
 */
router.post('/api/messages', async (ctx) => {
  const { type = 'message', content } = ctx.request.body as any;

  if (!content) {
    ctx.status = 400;
    ctx.body = { error: '消息内容不能为空' };
    return;
  }

  const message = addMessage(type, content);

  // 广播消息到所有SSE连接
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
router.get('/api/system-events', async (ctx) => {
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
 * @param ctx Koa上下文
 */
const startRandomEventGenerator = (ctx: Context) => {
  const events = ['info', 'warning', 'error', 'success'];
  const messages = [
    '系统正常运行中',
    '检测到网络波动',
    '数据库连接成功',
    '新用户注册',
    '配置更新完成',
    '后台任务执行中',
    '缓存已刷新',
    '日志轮转完成'
  ];

  // 随机生成事件
  return setInterval(() => {
    const eventType = events[Math.floor(Math.random() * events.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const data = {
      message,
      timestamp: new Date().toISOString(),
      level: eventType
    };

    // 添加到消息队列并广播
    addMessage(eventType, data);

    if (ctx.state.sse) {
      ctx.state.sse.broadcast(eventType, data);
    }
  }, 10000); // 每10秒生成一个随机事件
};

/**
 * 随机事件流
 */
router.get('/api/random-events', async (ctx) => {
  // 中间件会处理SSE连接
  if (ctx.state.sse) {
    // 启动随机事件生成器
    const generatorInterval = startRandomEventGenerator(ctx);

    // 当连接关闭时停止生成器
    ctx.req.on('close', () => {
      clearInterval(generatorInterval);
    });
  }
});

export default router;
