基于你构建大模型应用服务的需求，结合 NestJS 框架的特性和现代服务体系建设要求，我为你设计了一套完整的项目架构和技术方案。这套方案融合了**模块化设计、实时通信、服务端渲染和云原生部署**，能支撑起一个高性能、可扩展的大模型应用。

### 🧱 一、项目总体架构与技术栈

#### 1. 核心架构模式
采用 **分层架构** 与 **微服务设计**，确保系统解耦和高内聚：
```
▸ 表示层（View Layer）: Next.js SSR + React
▸ 网关/接入层（Gateway Layer）: NestJS HTTP Server + WebSocket/SSE
▸ 应用/业务层（Application Layer）: NestJS Services + Controllers
▸ 领域层（Domain Layer）: 实体、值对象、领域服务
▸ 基础设施层（Infrastructure Layer）：数据库、缓存、外部API（如LLM）
```

#### 2. 技术栈选型
| 层级           | 技术选型                                                                                                                              | 说明                                                                 |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------- |
| **后端框架**   | **NestJS** (基于Express/Fastify)                                                                                | 提供模块化、依赖注入、AOP、TypeScript支持                          |
| **前端/SSR**   | **Next.js** (React)                                                                                                      | 服务端渲染(SSR)、静态生成(SSG)、API Routes                           |
| **实时通信**   | **WebSocket** (`@nestjs/websockets`), **SSE** (Server-Sent Events)                        | 双向实时通信（如聊天室）、单向实时推送（如状态更新、日志流）         |
| **LLM集成**    | **OpenAI API**、**LangChain**、或**本地模型** (通过Transformers.js等)                                             | 大语言模型调用与编排                                               |
| **数据库**     | 主数据库: **PostgreSQL** 或 **MySQL**, 缓存: **Redis**                                                           | 结构化数据存储、会话缓存、消息队列（BullMQ）                       |
| **向量数据库** | **Elasticsearch** (带`dense_vector`), **Chroma**, **Weaviate** 或 **Pinecone**                                               | 用于RAG（检索增强生成）、语义搜索                                 |
| **文件存储**   | **本地存储** (开发), **S3兼容存储** (生产, 如AWS S3, MinIO)                                                                               | 存储上传的文档、图片等                                             |
| **部署与运维** | **Serverless Framework** 或 **AWS CDK**/**Terraform**, **Docker**, **Kubernetes** (可选)                                                | 基础设施即代码、容器化、云原生部署                                 |
| **监控与日志** | **Prometheus** + **Grafana**, **OpenTelemetry**, **Winston** (NestJS Logger)                                                              | 应用性能监控(APM)、日志聚合                                        |

#### 3. 系统架构图
```
用户请求
│
▼
┌─────────────────┐    ┌──────────────────────────────────┐
│  客户端 (Browser)  │◄──┤  Next.js SSR (React App)        │
└─────────────────┘    └──────────────────────────────────┘
│                                   │
│ HTTP/HTTPS                       │ API Proxy (可选)
▼                                   ▼
┌─────────────────┐    ┌──────────────────────────────────┐
│  反向代理 (Nginx)  │───►│  NestJS Server (API Gateway)    │
└─────────────────┘    └──────────────────────────────────┘
│                                   │
│                           ┌───────┴───────┐
│                           ▼               ▼
│                    ┌─────────────┐ ┌─────────────┐
│                    │ WebSocket   │ │    SSE      │
│                    │  Gateway    │ │  Controller │
│                    └─────────────┘ └─────────────┘
│                           │               │
│                           └───────┬───────┘
│                                   ▼
│                          ┌─────────────────┐
│                          │  业务逻辑层      │
│                          │ (Services,      │
│                          │  Modules)       │
│                          └─────────────────┘
│                                   │
│                           ┌───────┴───────┐
│                           ▼               ▼
│                    ┌─────────────┐ ┌─────────────┐
│                    │   数据库      │ │  外部服务    │
│                    │ (PostgreSQL, │ │ (LLM API,   │
│                    │   Redis)     │ │  Elastic)   │
│                    └─────────────┘ └─────────────┘
│                                   │
▼                                   ▼
┌─────────────────┐            ┌─────────────────┐
│  静态资源        │            │  模型推理服务    │
│ (S3/CDN)        │            │ (Python/Node)   │
└─────────────────┘            └─────────────────┘
```

### 📁 二、项目结构（Monorepo 推荐）
```bash
nestjs-llm-app/
├── 📁 apps/
│   ├── 📁 api-server/                 # NestJS 主应用
│   │   ├── src/
│   │   │   ├── 📁 modules/
│   │   │   │   ├── 📁 ai/              # AI核心模块
│   │   │   │   ├── 📁 chat/            # 聊天/会话模块
│   │   │   │   ├── 📁 knowledge-base/  # 知识库模块 (RAG)
│   │   │   │   ├── 📁 auth/            # 认证授权模块
│   │   │   │   ├── 📁 user/            # 用户管理模块
│   │   │   │   └── 📁 file/            # 文件上传模块
│   │   │   ├── 📁 common/              # 通用模块（装饰器、过滤器、守卫等）
│   │   │   ├── 📁 config/              # 配置文件
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── 📁 web-app/                     # Next.js 前端应用
│       ├── src/
│       │   ├── 📁 pages/               # 页面路由（SSR）
│       │   ├── 📁 components/          # 通用组件
│       │   ├── 📁 styles/              # 样式文件
│       │   ├── 📁 utils/               # 工具函数
│       │   └── 📁 types/               # TypeScript 类型定义
│       ├── public/
│       ├── package.json
│       └── next.config.js
│
├── 📁 packages/                        # 共享包（可选）
│   └── 📁 shared-types/                # 共享的TypeScript类型定义
│
├── 📁 infrastructure/                  # 基础设施即代码（IaC）
│   ├── serverless/                     # Serverless Framework 配置
│   └── terraform/                      # Terraform 配置（可选）
│
├── 📁 docs/                            # 项目文档
├── package.json (workspace root)
├── lerna.json 或 pnpm-workspace.yaml   # Monorepo 管理工具配置
└── docker-compose.yml                  # 本地开发环境 Docker 配置
```

### ⚙️ 三、核心模块设计与实现要点

#### 1. AI 服务模块 (`/apps/api-server/src/modules/ai`)
这是与大模型交互的核心。

*   **Service 层 (`ai.service.ts`)**:
```typescript
// 示例：流式聊天实现 (基于 OpenAI API，其他模型类似)
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      // 可配置baseURL用于其他兼容API
      baseURL: this.configService.get('OPENAI_BASE_URL'),
    });
  }

  // 非流式调用（用于简单问答）
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('AI调用失败', error);
      throw new Error(`AI服务暂时不可用: ${error.message}`);
    }
  }

  // 🔥 核心：流式响应（用于逐字输出，支持SSE和WebSocket）
  async *createStreamChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        stream: true, // 启用流式
        temperature: 0.7,
        max_tokens: 1000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content; // 逐字产出
        }
      }
    } catch (error) {
      this.logger.error('AI流式调用失败', error);
      throw new Error(`AI流式服务错误: ${error.message}`);
    }
  }

  // 可扩展其他方法：生成嵌入向量（Embeddings）
  // async generateEmbedding(text: string): Promise<number[]> { ... }
}
```

#### 2. SSE 控制器 (`/apps/api-server/src/modules/chat/sse.controller.ts`)
实现服务器发送事件，用于单向实时流推送。
```typescript
import { Controller, Post, Body, Sse, MessageEvent } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AiService } from '../ai/ai.service';
import { Public } from '../../common/decorators/public.decorator';

interface ChatRequest {
message: string;
model?: string;
}

@Public() // 示例：可能跳过认证，实际应根据需要添加守卫(Guard)
@Controller('chat/sse')
export class SseChatController {
constructor(private readonly aiService: AiService) {}

@Sse('stream') // NestJS 内置的 @Sse 装饰器
async streamChat(@Body() body: ChatRequest): Promise<Observable<MessageEvent>> {
const { message, model } = body;
const messages = [{ role: 'user' as const, content: message }];

// 将异步生成器转换为 Observable
// 注意：SSE 数据格式为 `data: <message>\n\n`
return from(this.aiService.createStreamChatCompletion(messages, model)).pipe(
  map((chunk) => ({
    data: JSON.stringify({ type: 'chunk', content: chunk }), // 发送数据块
    // data: chunk // 也可直接发送文本
  })),
);
}
}
```

#### 3. WebSocket 网关 (`/apps/api-server/src/modules/chat/chat.gateway.ts`)
处理双向实时通信，如聊天室、协作编辑。
```typescript
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
this.logger.log('WebSocket Server Initialized');
}

handleConnection(client: Socket) {
this.logger.log(`Client connected: ${client.id}`);
// 可在此进行身份验证 client.handshake.auth.token
}

handleDisconnect(client: Socket) {
this.logger.log(`Client disconnected: ${client.id}`);
}

@SubscribeMessage('send_message') // 监听客户端 'send_message' 事件
async handleMessage(
@MessageBody() data: { message: string; model?: string },
@ConnectedSocket() client: Socket,
): Promise<void> {
this.logger.debug(`Received message from ${client.id}: ${data.message}`);

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
  this.logger.error('WebSocket chat error', error);
  client.emit('error', { message: 'AI处理失败' });
}
}

// 示例：广播消息给所有连接的客户端
// @SubscribeMessage('broadcast')
// handleBroadcast(@MessageBody() data: string): void {
//   this.server.emit('broadcast', data); // 广播给所有人
//   // this.server.to('room1').emit('broadcast', data); // 广播给特定房间
// }
}
```

#### 4. 知识库与 RAG 服务 (`/apps/api-server/src/modules/knowledge-base`)
实现检索增强生成，提升回答准确性。
```typespace
// 简要逻辑
// 1. 文档上传与处理 (TXT, PDF, Word等)
// 2. 文本分割 (Text Splitting)
// 3. 向量化 (Embedding) - 调用 embedding API 或本地模型
// 4. 存储到向量数据库 (Elasticsearch, Pinecone等)
// 5. 用户提问时，先检索相关文档片段
// 6. 将片段作为上下文与问题一同发送给LLM

// knowledge-base.service.ts 核心方法示例
async retrieveAndGenerate(query: string): Promise<string> {
// 1. 为查询生成向量
const queryEmbedding = await this.embeddingService.generateEmbedding(query);
// 2. 从向量数据库检索最相关的K个文档片段
const relevantDocs = await this.vectorStore.similaritySearch(queryEmbedding, 5);
// 3. 构建Prompt，将检索到的文档作为上下文
const context = relevantDocs.map(doc => doc.pageContent).join('\n---\n');
const prompt = `
请根据以下上下文信息回答问题。如果上下文不包含答案，请如实告知。
上下文：
${context}
问题：${query}
答案：`;
// 4. 调用LLM生成最终答案
return await this.aiService.createChatCompletion([{ role: 'user', content: prompt }]);
}
```

#### 5. Serverless 准备 (`/apps/api-server/src/main.ts` 和配置)
NestJS 应用需稍作调整以适应 Serverless 环境（如 AWS Lambda）。
```typescript
// 常规启动方式 (用于传统服务器或容器)
async function bootstrap() {
const app = await NestFactory.create(AppModule);
// ...中间件等配置
await app.listen(process.env.PORT || 3000);
}
bootstrap();

// 为Lambda创建适配器
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';
import { Context, Handler } from 'aws-lambda';

let server: Handler;

async function createServer(): Promise<Handler> {
const expressApp = require('express')();
const adapter = new ExpressAdapter(expressApp);
const app = await NestFactory.create(AppModule, adapter);
// ...应用配置
await app.init();
return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: Context, context: Context) => {
server = server ?? (await createServer());
return server(event, context);
};
```
需安装 `@vendia/serverless-express` 并在 `serverless.yml` 中配置函数和事件。

### 📖 四、给 Cursor 的编码指导规则

为了让 Cursor 高效、准确地辅助你编码，请在项目根目录或 `docs/` 下创建 `CURSOR_GUIDELINES.md` 文件，包含以下内容：

```markdown
# Cursor 编码指南

## 项目技术栈与规范
- **框架**: NestJS v9+ with TypeScript strict mode.
- **代码风格**: 使用项目配置的 ESLint 和 Prettier。
- **模块组织**: 遵循 NestJS 模块化架构。每个功能一个模块 (`Module`), 包含自己的 `Service`, `Controller`, `DTO`, `Entity` (如果适用)。
- **依赖注入**: 优先使用构造函数注入。
- **API 响应**: 统一使用 NestJS 内置的 `HttpException` 或自定义异常过滤器进行错误处理。成功响应格式为 `{ data: T, code: number, message: string }`。

## 特定功能实现模式
1.  **SSE 端点**:
- 使用 `@Sse()` 装饰器。
- 返回 `Observable<MessageEvent>`。
- 数据格式参考 `data: {type: 'chunk', content: string}\n\n`。
2.  **WebSocket 网关**:
- 使用 `@WebSocketGateway()`, `@WebSocketServer()`, `@SubscribeMessage()`。
- 事件名使用蛇形命名法 (e.g., `send_message`)。
- 注入 `AiService` 处理流式逻辑。
3.  **数据库交互**:
- 使用 TypeORM 或 Prisma。实体文件放在对应模块的 `entities/` 子目录。
4.  **环境变量**:
- 通过 `ConfigService` 获取，配置于 `.env` 和 `config/` 目录下的配置文件。

## 避免的陷阱 (Anti-Patterns)
- ❌ 不要在 Controller 中写大量业务逻辑。
- ❌ 避免手动管理连接 (如数据库、Redis)，使用 NestJS 生命周期钩子或专用模块。
- ❌ 不要在 SSE 或 WS 处理器中阻塞事件循环，确保流处理是异步的。
- ❌ 避免硬编码配置值和密钥。

## 常用命令
- `npm run start:dev` (启动开发服务器)
- `npm run test` (运行测试)
- `npm run build` (构建项目)

## 架构决策记录 (ADR)
- `ADR-001`: 选择 SSE 和 WebSocket 用于不同实时场景。
- `ADR-002`: 采用 Monorepo 管理前后端代码。
- `ADR-003`: 使用 Serverless Framework 进行部署。
```

### 🚀 五、本地开发与部署流程

1.  **环境准备**:
```bash
node --version # 确保 Node.js 版本 >= 18
npm install -g @nestjs/cli
# 或使用 pnpm/npm 安装项目依赖
pnpm install
```

2.  **环境变量**:
在 `apps/api-server/` 下创建 `.env` 文件：
```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_connection_string
REDIS_URL=your_redis_connection_string
```

3.  **启动**:
```bash
# 启动 NestJS API 服务器 (开发模式，支持热重载)
pnpm --filter api-server run start:dev

# 启动 Next.js 前端 (开发模式)
pnpm --filter web-app run dev
```

4.  **部署 (Serverless 示例)**:
*   安装 Serverless Framework: `npm install -g serverless`
*   在 `infrastructure/serverless/` 目录下配置 `serverless.yml`
*   部署: `serverless deploy`

### 💎 总结

这套基于 **NestJS** 的架构为你提供了一个**高性能、模块化、可扩展**的起点，完美支持**SSE、WebSocket、React SSR 和 Serverless**部署。**RAG** 的集成能显著提升大模型回答的准确性和专业性。

**下一步建议**：
1.  使用 `nest new` 和 `create-next-app` 初始化项目结构。
2.  优先实现 `AiService` 和 `SSE` 控制器，快速验证流式响应。
3.  集成向量数据库（如 Elasticsearch）实现 RAG。
4.  根据业务需求，逐步完善用户认证、文件上传等功能。
5.  配置 `serverless.yml`，实现云原生部署。

希望这份详细的设计和文档能助你的项目顺利启动！