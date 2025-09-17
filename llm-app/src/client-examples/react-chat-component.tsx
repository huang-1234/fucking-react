import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatComponentProps {
  serverUrl?: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ serverUrl = 'http://localhost:3000' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化WebSocket连接
  useEffect(() => {
    // 客户端才加载Socket.io
    if (typeof window !== 'undefined') {
      socketRef.current = io(serverUrl, {
        transports: ['websocket'],
      });

      // 接收消息块
      socketRef.current.on('receive_message_chunk', (data: { content: string }) => {
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];

          // 如果最后一条消息是AI的回复，则追加内容
          if (lastMessage && !lastMessage.isUser) {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + data.content,
            };
            return updatedMessages;
          } else {
            // 否则创建一个新的AI消息
            return [
              ...prevMessages,
              {
                id: Date.now().toString(),
                content: data.content,
                isUser: false,
                timestamp: new Date(),
              },
            ];
          }
        });
      });

      // 消息接收完成
      socketRef.current.on('receive_message_end', () => {
        setIsLoading(false);
      });

      // 错误处理
      socketRef.current.on('error', (error: any) => {
        console.error('WebSocket错误:', error);
        setIsLoading(false);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [serverUrl]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const sendMessage = () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 通过WebSocket发送消息
    socketRef.current.emit('send_message', { message: inputValue });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading-indicator">AI正在思考...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
          发送
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 500px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background-color: #f9f9f9;
        }

        .message {
          margin-bottom: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          max-width: 80%;
        }

        .user-message {
          background-color: #007bff;
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }

        .ai-message {
          background-color: #e9e9eb;
          color: #333;
          align-self: flex-start;
        }

        .message-timestamp {
          font-size: 0.7rem;
          color: #888;
          text-align: right;
          margin-top: 4px;
        }

        .loading-indicator {
          font-style: italic;
          color: #888;
          margin: 8px 0;
        }

        .chat-input {
          display: flex;
          padding: 8px;
          background-color: #fff;
          border-top: 1px solid #ccc;
        }

        .chat-input input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 8px;
        }

        .chat-input button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .chat-input button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;
