好的，这是一个非常棒的项目！基于 Lobe UI 构建一个支持 Chat、推理和自动化 Agent 的组件库，本质上是在其强大的**展示层**之上，注入**逻辑与状态层**。

以下是为您和 Cursor 量身定制的技术方案，它将清晰地拆解任务，并提供可直接编码的模块和模式。

---

### 技术方案：基于 Lobe UI 的 AI 智能体组件库

#### 一、核心设计理念

我们将构建一个名为 `lobe-ui-agent` 的库，其架构遵循 **“展示组件”与“逻辑容器”分离** 的原则。

1.  **展示组件 (Presentational Components)**：直接使用或轻微封装 `@lobehub/ui` 的组件（如 `ChatList`, `ChatInput`）。它们只负责 UI 渲染，**不关心数据来源和业务逻辑**。 props 接收数据，回调函数发出事件。
2.  **逻辑容器/钩子 (Containers / Hooks)**：我们新建的核心。它们负责：
    *   管理聊天、推理、工具调用的复杂状态。
    *   与 LLM API（OpenAI, Anthropic, 本地模型等）通信。
    *   处理流式响应（Streaming）。
    *   执行工具（函数调用）并管理其生命周期。
    *   将最终状态和数据传递给展示组件。

**前端类比**：这就像 **React 组件 + Redux 与 Sagas/Thunks** 的关系。Lobe UI 是精美的组件，我们的逻辑层是 Redux Store 和异步中间件，负责所有脏活累活。

#### 二、技术栈定义 (Tech Stack)

| 类别 | 技术选型 | 理由 |
| ：--- | ：--- | :--- |
| **核心 UI 库** | `@lobehub/ui` `@lobehub/ui/*` | 基础展示组件，提供顶级 UX |
| **状态管理** | `Zustand` | 轻量、简单、支持异步，完美契合此类库 |
| **异步/流处理** | `TanStack Query` / `SWR` (可选) | 管理异步请求、缓存、重试（用于工具调用） |
| **流式读取** | `Vercel AI SDK` (`useChat`, `useCompletion`) | 标准化处理 AI 流式响应的最佳选择，极大简化开发 |
| **工具函数执行** | 自定义 Hook + `Zod` | Zod 用于验证工具调用的输入参数 |
| **构建工具** | `dumi` (推荐) 或 `Tsup` | 基于 Lobe 生态，dumi 是文档和构建的一体化方案 |

#### 三、核心模块设计与实现方案

以下是需要 Cursor 创建的核心文件模块。

**1. 状态存储模块 (`store/chatStore.ts`)**
```typescript
import { create } from 'zustand';
import { ChatMessage } from '@lobehub/ui/chat';
import { Message } from 'ai'; // 来自 Vercel AI SDK

interface ChatState {
  // 消息列表（兼容 Lobe UI 和 Vercel AI SDK 的类型）
  messages: (ChatMessage & Partial<Message>)[];
  // 加载状态
  isLoading: boolean;
  // 当前活动的工具调用（用于显示状态）
  activeToolCall?: {
    name: string;
    arguments: string;
    messageId: string;
  } | null;
  // 操作：追加消息
  appendMessage: (message: ChatMessage) => void;
  // 操作：更新消息（用于流式响应和工具调用）
  updateMessage: (id: string, update: Partial<ChatMessage>) => void;
  // 操作：设置加载状态
  setLoading: (isLoading: boolean) => void;
  // 操作：提交用户消息并触发 AI 推理（核心！）
  submitMessage: (message: string) => Promise<void>;
  // 操作：执行工具
  executeTool: (toolCallId: string, functionName: string, args: any) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  activeToolCall: null,

  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, update) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...update } : m)
  })),
  setLoading: (isLoading) => set({ isLoading }),

  submitMessage: async (message: string) => {
    const { appendMessage, updateMessage, setLoading } = get();
    // 1. 添加用户消息
    const userMessage: ChatMessage = { id: Date.now().toString(), content: message, role: 'user' };
    appendMessage(userMessage);

    setLoading(true);
    // 2. 添加一个空的助理消息占位符，用于流式响应
    const assistantMessage: ChatMessage = { id: Date.now().toString() + '-ai', content: '', role: 'assistant' };
    appendMessage(assistantMessage);

    try {
      // 3. 调用你的 API 路由（Next.js）或直接调用模型 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: get().messages }),
        headers: { 'Content-Type': 'application/json' },
      });
      // 4. 处理流式响应 (这里需要实现一个读流的逻辑，Vercel AI SDK 的 useChat 帮我们做了)
      // ... 伪代码：读取流，逐步更新 assistantMessage.content
      // const reader = response.body.getReader();
      // while (true) { ... decode ... updateMessage(assistantMessage.id, { content: accumulatedText }) }

    } catch (error) {
      // 5. 错误处理
      updateMessage(assistantMessage.id, { error: true, content: 'Sorry, something went wrong.' });
    } finally {
      setLoading(false);
    }
  },

  executeTool: async (toolCallId, functionName, args) => {
    // 1. 根据 functionName 找到注册的工具函数
    // 2. 执行工具（可能是异步的，如调用 API）
    // 3. 更新消息，显示工具执行结果
  }
}));
```

**2. 工具注册表 (`tools/index.ts`)**
```typescript
// 工具函数示例：获取天气
export const getWeather = {
  name: 'get_weather',
  description: 'Get the current weather in a location',
  parameters: z.object({ location: z.string() }), // 使用 Zod 定义参数模式
  execute: async (args: { location: string }) => {
    // 模拟 API 调用
    const response = await fetch(`https://api.weather.com/${args.location}`);
    const data = await response.json();
    return `The weather in ${args.location} is ${data.temperature} degrees and ${data.conditions}.`;
  }
};

// 工具注册表
export const availableTools = {
  [getWeather.name]: getWeather,
  // ... 注册其他工具
};
```

**3. 核心集成组件 (`components/ChatAgentWindow.tsx`)**
```typescript
'use client';
import { ChatList, ChatInputArea } from '@lobehub/ui/chat';
import { useChatStore } from '../store/chatStore';
import { useChat } from '@ai-sdk/react'; // 如果使用 Vercel AI SDK，它可以替代我们手写的 store 逻辑

export const ChatAgentWindow = () => {
  // 从 Store 中获取状态和操作
  const { messages, isLoading, submitMessage } = useChatStore();

  // 或者，更推荐：直接使用 Vercel AI SDK 的 useChat，它集成了流、工具调用等功能
  // const { messages, input, isLoading, handleInputChange, handleSubmit, append } = useChat({
  //   api: '/api/chat',
  //   onToolCall: ({ toolCall }) => { /* 处理工具调用 */ }
  // });

  const handleSendMessage = (message: string) => {
    submitMessage(message);
    // 或: append({ role: 'user', content: message });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 聊天消息列表 */}
      <ChatList
        data={messages}
        loadingId={isLoading ? 'thinking' : undefined} // 告知 ChatList 哪个消息正在加载
        // 利用 Lobe UI 强大的 render 属性进行自定义
        renderMessages={{
          tool: (msg) => <div>正在执行工具: {msg.toolName}</div>
        }}
      />
      {/* 输入区域 */}
      <ChatInputArea
        onSend={handleSendMessage}
        loading={isLoading}
        // 其他配置：是否允许编辑消息、快捷操作等
      />
    </div>
  );
};
```

**4. API 路由示例 (`app/api/chat/route.ts`) - Next.js App Router**
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant with access to tools.',
    messages,
    // 将前端的工具注册表映射到这里
    tools: {
      getWeather: tool({
        parameters: z.object({ location: z.string() }),
        execute: async ({ location }) => {
          // ... 执行工具逻辑
        },
      }),
    },
  });

  return result.toAIStreamResponse();
}
```

#### 四、给 Cursor 的编码任务清单

1.  **初始化项目**：
    ```bash
    # 使用 dumi 模板初始化一个组件库项目
    $ npx create-dumi@latest
    # 或使用 tsup/lib 初始化一个简单的库
    # 安装依赖：@lobehub/ui, ai, zustand, zod, @ai-sdk/openai 等
    ```

2.  **创建状态层**：
    *   `src/store/chatStore.ts`：使用 Zustand 实现包含 `messages`, `isLoading`, `submitMessage`, `executeTool` 等核心状态和方法的 Store。

3.  **实现工具系统**：
    *   `src/tools/index.ts`：定义并导出 `availableTools` 对象。
    *   每个工具应包含 `name`, `description`, `parameters` (Zod schema), `execute` 函数。

4.  **构建核心组件**：
    *   `src/components/ChatAgentWindow.tsx`：集成 Lobe UI 的 `ChatList` 和 `ChatInputArea`，并连接到 `useChatStore`。

5.  **处理流式响应**：在 `submitMessage` 方法中，实现 `fetch` 响应流的读取和消息的增量更新。**（关键难点）**

6.  **处理工具调用**：
    *   在流式读取中，解析出 `tool_calls`。
    *   调用 `executeTool`，传入参数。
    *   将工具执行结果作为新的消息追加到对话中，并让 AI 继续回复。

7.  **导出库入口**：
    *   `src/index.ts`：导出 `ChatAgentWindow`, `useChatStore`, 以及所有工具。

8.  **编写示例应用**：在 `examples/` 目录下创建一个 Next.js 应用，演示如何使用这个组件库。

#### 总结

这个方案为你和 Cursor 提供了一个清晰的、模块化的路线图。**核心思路是：用 Zustand 管理状态，用 Vercel AI SDK 处理最复杂的流和工具调用逻辑，用 Lobe UI 渲染出漂亮的界面。**

你可以指示 Cursor：“根据上述技术方案，首先创建 Zustand Store 模块 `chatStore.ts`，实现 `messages`, `isLoading` 状态和 `submitMessage` 方法骨架。” 然后逐步完成各个模块。