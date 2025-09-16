/**
 * SSE 中间件
 * 处理 SSE 连接并提供发送事件的方法
 */
export default function sseMiddleware(options = {}) {
  const {
    heartbeatInterval = 30000,
    maxConnectionTime = 0,
    retry = 10000
  } = options;

  // 存储所有活动连接
  const connections = new Map();

  // 生成唯一连接ID
  const generateConnectionId = () => {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 清理连接
  const cleanupConnection = (connectionId) => {
    connections.delete(connectionId);
    console.log(`SSE connection closed: ${connectionId}, active connections: ${connections.size}`);
  };

  // 广播事件到所有连接
  const broadcast = (event, data) => {
    const message = formatSSEMessage(event, data);
    let successCount = 0;

    for (const [connectionId, ctx] of connections.entries()) {
      try {
        ctx.res.write(message);
        successCount++;
      } catch (err) {
        cleanupConnection(connectionId);
      }
    }

    return {
      success: successCount > 0,
      count: successCount,
      total: connections.size
    };
  };

  // 发送事件到特定连接
  const sendEvent = (connectionId, event, data) => {
    const ctx = connections.get(connectionId);
    if (!ctx) return false;

    try {
      ctx.res.write(formatSSEMessage(event, data));
      return true;
    } catch (err) {
      cleanupConnection(connectionId);
      return false;
    }
  };

  // 格式化SSE消息
  const formatSSEMessage = (event, data) => {
    let message = '';

    if (event) {
      message += `event: ${event}\n`;
    }

    if (data) {
      const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
      message += `data: ${dataStr}\n`;
    }

    message += '\n'; // 消息以空行结束
    return message;
  };

  // 中间件函数
  return async (ctx, next) => {
    // 将SSE工具函数添加到ctx.state
    ctx.state.sse = {
      broadcast,
      sendEvent,
      connections,
      formatSSEMessage
    };

    // 检查请求是否为SSE请求（通过路径或头部）
    const isSSERequest = ctx.path.includes('/api/events') ||
                         ctx.path.includes('/api/stream') ||
                         ctx.headers.accept === 'text/event-stream';

    if (isSSERequest) {
      console.log('SSE request detected:', ctx.url);

      // 设置SSE响应头
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // 禁用Nginx缓冲
      });
      ctx.status = 200;

      // 发送SSE头信息
      ctx.res.write(`retry: ${retry}\n\n`);

      // 发送初始连接消息
      const connectionId = generateConnectionId();
      connections.set(connectionId, ctx);
      console.log(`New SSE connection: ${connectionId}, active connections: ${connections.size}`);
      ctx.res.write(formatSSEMessage('connected', { id: connectionId }));

      // 设置心跳定时器
      const heartbeatTimer = setInterval(() => {
        try {
          ctx.res.write(': heartbeat\n\n');
        } catch (err) {
          clearInterval(heartbeatTimer);
          cleanupConnection(connectionId);
        }
      }, heartbeatInterval);

      // 设置最大连接时间（如果指定）
      let maxConnectionTimer = null;
      if (maxConnectionTime > 0) {
        maxConnectionTimer = setTimeout(() => {
          try {
            ctx.res.write(formatSSEMessage('close', { reason: 'max-time-reached' }));
            ctx.res.end();
            clearInterval(heartbeatTimer);
            cleanupConnection(connectionId);
          } catch (err) {
            // 连接可能已关闭
          }
        }, maxConnectionTime);
      }

      // 监听连接关闭
      ctx.req.on('close', () => {
        clearInterval(heartbeatTimer);
        if (maxConnectionTimer) {
          clearTimeout(maxConnectionTimer);
        }
        cleanupConnection(connectionId);
      });

      // 继续处理路由，让路由可以发送初始数据
      await next();
    } else {
      // 不是SSE请求，继续正常处理
      await next();
    }
  };
}
