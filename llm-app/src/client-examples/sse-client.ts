/**
 * 使用SSE与后端通信的客户端示例
 *
 * 在浏览器环境中使用:
 * ```html
 * <script src="sse-client.js"></script>
 * ```
 */

class SseChatClient {
  private baseUrl: string;
  private eventSource: EventSource | null = null;
  private messageCallback: (message: string) => void;
  private errorCallback: (error: any) => void;

  constructor(
    baseUrl: string = 'http://localhost:3000/api',
    messageCallback: (message: string) => void = console.log,
    errorCallback: (error: any) => void = console.error
  ) {
    this.baseUrl = baseUrl;
    this.messageCallback = messageCallback;
    this.errorCallback = errorCallback;
  }

  /**
   * 发送消息并接收流式响应
   * @param message 用户消息
   * @param model 可选的模型名称
   */
  sendMessage(message: string, model?: string): void {
    // 关闭之前的连接（如果有）
    this.close();

    // 构建查询参数
    const params = new URLSearchParams();
    params.append('message', message);
    if (model) {
      params.append('model', model);
    }

    // 创建SSE连接
    const url = `${this.baseUrl}/chat/sse/stream?${params.toString()}`;
    this.eventSource = new EventSource(url);

    // 处理消息事件
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chunk') {
          this.messageCallback(data.content);
        }
      } catch (error) {
        // 如果不是JSON格式，直接返回原始数据
        this.messageCallback(event.data);
      }
    };

    // 处理错误
    this.eventSource.onerror = (error) => {
      this.errorCallback(error);
      this.close();
    };
  }

  /**
   * 关闭SSE连接
   */
  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// 如果在Node.js环境中，导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SseChatClient };
}
