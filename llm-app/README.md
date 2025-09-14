# NestJS 大模型应用服务

这是一个基于NestJS框架构建的大模型应用服务，支持SSE、WebSocket、React SSR和Serverless部署。项目集成了OpenAI API，提供了实时聊天、知识库检索等功能。

## 项目特点

- **NestJS框架**：模块化设计、依赖注入、TypeScript支持
- **实时通信**：支持Server-Sent Events (SSE)和WebSocket
- **大模型集成**：OpenAI API集成，支持流式输出
- **知识库与RAG**：检索增强生成，提升回答准确性
- **Serverless支持**：适配AWS Lambda等Serverless环境
- **Next.js SSR**：前端服务端渲染支持

## 项目结构

```
nestjs-llm-app/
├── src/
│   ├── modules/
│   │   ├── ai/              # AI核心模块
│   │   ├── chat/            # 聊天/会话模块
│   │   └── knowledge-base/  # 知识库模块 (RAG)
│   ├── common/              # 通用模块（装饰器、过滤器、守卫等）
│   ├── config/              # 配置文件
│   ├── client-examples/     # 客户端示例代码
│   ├── app.module.ts        # 主应用模块
│   ├── main.ts              # 应用入口
│   └── serverless.ts        # Serverless适配器
├── serverless.yml           # Serverless配置
└── README.md
```

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 10.0.0

## 安装依赖

```bash
# 安装依赖
pnpm install
```

## 配置环境变量

创建一个`.env`文件，参考`.env.example`的格式：

```
# 应用配置
PORT=3000
NODE_ENV=development

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

# 数据库配置 (可选)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=llm_app

# Redis配置 (可选)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS配置
CORS_ORIGIN=*
```

## 启动服务

```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start

# Serverless本地模拟
pnpm run start:serverless
```

## API接口

### 聊天接口

#### SSE流式聊天

```
GET /api/chat/sse/stream?message=你好
```

#### WebSocket聊天

连接WebSocket服务器，监听和发送以下事件：

- 发送消息：`send_message` 事件，数据格式 `{ message: string, model?: string }`
- 接收消息块：`receive_message_chunk` 事件，数据格式 `{ content: string }`
- 接收结束信号：`receive_message_end` 事件
- 错误处理：`error` 事件，数据格式 `{ message: string }`

### 知识库接口

#### 添加文档

```
POST /api/knowledge-base/add
Content-Type: application/json

{
  "content": "文档内容..."
}
```

#### 查询知识库

```
GET /api/knowledge-base/query?query=你的问题
```

## 客户端示例

项目提供了多种客户端示例代码，位于`src/client-examples/`目录：

- `sse-client.ts`：使用SSE与后端通信的客户端示例
- `websocket-client.ts`：使用WebSocket与后端通信的客户端示例
- `react-chat-component.tsx`：React聊天组件示例
- `next-js-page-example.tsx`：Next.js页面示例

## Serverless部署

本项目使用`@codegenie/serverless-express`实现Serverless部署，提供更好的性能和功能支持。

### 基本部署

```bash
# 打包
pnpm run build:serverless

# 部署到AWS
serverless deploy
```

### @codegenie/serverless-express 高级功能

`@codegenie/serverless-express`提供了多种高级功能，包括：

- **二进制支持**：处理图片、PDF等二进制内容
- **自定义事件解析**：自定义处理API Gateway事件
- **响应格式化**：定制API响应格式
- **错误处理**：全局错误处理机制
- **性能优化**：针对Lambda环境优化的性能设置

示例代码位于`src/examples/serverless-express-advanced.ts`。

### 常见Serverless部署问题

1. **冷启动优化**：
   - 使用`context.callbackWaitsForEmptyEventLoop = false`
   - 缓存数据库连接和服务实例

2. **超时处理**：
   - Lambda默认超时为30秒，可在`serverless.yml`中调整
   - 对于长时间运行的任务，考虑使用消息队列

3. **内存配置**：
   - 根据应用需求调整Lambda内存大小
   - 内存越大，CPU性能也越好

## 许可证

ISC
