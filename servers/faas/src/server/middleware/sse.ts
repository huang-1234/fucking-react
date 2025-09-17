/**
 * SSE (Server-Sent Events) 中间件
 * 用于实现服务器推送事件到客户端
 */
import { Context, Next } from 'koa';

export interface SSEOptions {
  /** 心跳间隔（毫秒） */
  heartbeatInterval?: number;
  /** 是否自动重试连接 */
  retry?: number;
  /** 客户端重连超时时间（毫秒） */
  clientRetryTimeout?: number;
  /** 最大连接时间（毫秒），0表示无限制 */
  maxConnectionTime?: number;
}

/**
 * SSE 中间件
 * 处理 SSE 连接并提供发送事件的方法
 */
export default function sseMiddleware(options: SSEOptions = {}) {
  const {
    heartbeatInterval = 30000, // 默认30秒发送一次心跳
    retry = 3000, // 默认3秒重试
    clientRetryTimeout = 10000, // 默认10秒客户端重连超时
    maxConnectionTime = 0 // 默认无限制
  } = options;

  // 活跃的SSE连接
  const connections = new Map<string, Context>();
  let connectionCounter = 0;

  // 生成唯一连接ID
  const generateConnectionId = () => {
    connectionCounter++;
    return `${Date.now()}-${connectionCounter}`;
  };

  // 清理连接
  const cleanupConnection = (id: string) => {
    connections.delete(id);
  };

  // 发送事件给所有活跃连接
  const broadcast = (event: string, data: any) => {
    const payload = formatSSEMessage(event, data);
    connections.forEach((ctx) => {
      ctx.res.write(payload);
    });
  };

  // 发送事件给特定连接
  const sendEvent = (connectionId: string, event: string, data: any) => {
    const ctx = connections.get(connectionId);
    if (ctx) {
      ctx.res.write(formatSSEMessage(event, data));
      return true;
    }
    return false;
  };

  // 格式化SSE消息
  const formatSSEMessage = (event: string, data: any) => {
    let message = '';
    if (event && event !== 'message') {
      message += `event: ${event}\n`;
    }

    // 如果数据是对象，转换为JSON字符串
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);

    // 分割数据为多行（SSE格式要求）
    const dataLines = dataStr.split(/\r\n|\n|\r/);
    for (const line of dataLines) {
      message += `data: ${line}\n`;
    }

    message += '\n'; // 消息以空行结束
    return message;
  };

  // 中间件函数
  return async (ctx: Context, next: Next) => {
    // 将SSE工具函数添加到ctx.state
    ctx.state.sse = {
      broadcast,
      sendEvent,
      connections,
      formatSSEMessage
    };

    // 继续处理请求
    await next();

    // 如果路由已经处理了响应，不执行SSE设置
    if (ctx.body !== undefined || ctx.status !== 404) {
      return;
    }

    // 检查请求是否为SSE请求（通过路径或头部）
    const isSSERequest = ctx.path.endsWith('/events') ||
                         ctx.path.includes('/stream') ||
                         ctx.headers.accept === 'text/event-stream';

    if (!isSSERequest) {
      return;
    }

    // 设置SSE响应头
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // 禁用Nginx缓冲
    });
    ctx.status = 200;
    ctx.body = '';

    // 发送SSE头信息
    ctx.res.write(`retry: ${retry}\n\n`);

    // 发送初始连接消息
    const connectionId = generateConnectionId();
    connections.set(connectionId, ctx);
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
    let maxConnectionTimer: NodeJS.Timeout | null = null;
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

    // 保持连接打开
    await new Promise((resolve) => {
      ctx.req.on('close', resolve);
    });
  };
}

// 导出SSE工具函数
export const SSEUtils = {
  formatSSEMessage: (event: string, data: any) => {
    let message = '';
    if (event && event !== 'message') {
      message += `event: ${event}\n`;
    }

    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const dataLines = dataStr.split(/\r\n|\n|\r/);
    for (const line of dataLines) {
      message += `data: ${line}\n`;
    }

    message += '\n';
    return message;
  }
};
