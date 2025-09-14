import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@WebSocketGateway({
  cors: {
    origin: '*', // 生产环境应指定确切来源
  },
  // transports: ['websocket'] // 可选：指定传输协议
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly aiService: AiService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket服务器已初始化');
  }

  handleConnection(client: Socket) {
    this.logger.log(`客户端已连接: ${client.id}`);
    // 可在此进行身份验证 client.handshake.auth.token
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端已断开连接: ${client.id}`);
  }

  @SubscribeMessage('send_message') // 监听客户端 'send_message' 事件
  async handleMessage(
    @MessageBody() data: { message: string; model?: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.debug(`收到来自 ${client.id} 的消息: ${data.message}`);

    const messages = [{ role: 'user' as const, content: data.message }];

    try {
      // 直接向发送消息的客户端实时回传AI响应流
      for await (const chunk of this.aiService.createStreamChatCompletion(messages, data.model)) {
        client.emit('receive_message_chunk', { // 发射事件到客户端
          content: chunk,
        });
      }
      client.emit('receive_message_end'); // 发送结束信号
    } catch (error) {
      this.logger.error('WebSocket聊天错误', error);
      client.emit('error', { message: 'AI处理失败' });
    }
  }

  // 广播消息给所有连接的客户端
  broadcastMessage(data: any): void {
    this.server.emit('broadcast', data); // 广播给所有人
  }
}