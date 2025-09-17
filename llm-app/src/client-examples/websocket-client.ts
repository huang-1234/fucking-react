/**
 * 使用WebSocket与后端通信的客户端示例
 *
 * 在浏览器环境中使用:
 * ```html
 * <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
 * <script src="websocket-client.js"></script>
 * ```
 */

class WebSocketChatClient {
  private socket: any; // Socket.IO 客户端实例
  private messageCallback: (message: string) => void;
  private errorCallback: (error: any) => void;
  private completeCallback: () => void;

  constructor(
    serverUrl: string = 'http://localhost:3000',
    messageCallback: (message: string) => void = console.log,
    errorCallback: (error: any) => void = console.error,
    completeCallback: () => void = () => console.log('消息接收完成')
  ) {
    // 在浏览器环境中，使用全局的io对象
    const io = (window as any).io || require('socket.io-client');

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.messageCallback = messageCallback;
    this.errorCallback = errorCallback;
    this.completeCallback = completeCallback;

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 连接事件
    this.socket.on('connect', () => {
      console.log('已连接到WebSocket服务器');
    });

    // 断开连接事件
    this.socket.on('disconnect', () => {
      console.log('与WebSocket服务器断开连接');
    });

    // 接收消息块
    this.socket.on('receive_message_chunk', (data: { content: string }) => {
      this.messageCallback(data.content);
    });

    // 消息接收完成
    this.socket.on('receive_message_end', () => {
      this.completeCallback();
    });

    // 错误处理
    this.socket.on('error', (error: any) => {
      this.errorCallback(error);
    });
  }

  /**
   * 发送消息
   * @param message 用户消息
   * @param model 可选的模型名称
   */
  sendMessage(message: string, model?: string): void {
    this.socket.emit('send_message', { message, model });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * 重新连接
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

// 如果在Node.js环境中，导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebSocketChatClient };
}
