# 增强版Service Worker缓存方案

这个包提供了一个高度可配置的Service Worker缓存解决方案，帮助你轻松实现:

- 离线访问能力
- 快速的页面加载
- 智能的缓存策略
- 与React应用的无缝集成

## 安装

```bash
npm install @fucking-react/cache
```

## 基本使用

### 1. 注册Service Worker

```typescript
import { registerServiceWorker } from '@fucking-react/cache';

// 在应用入口处注册Service Worker
registerServiceWorker({
  swPath: '/service-worker.js',
  onUpdate: (registration) => {
    // 有新版本可用时的回调
    console.log('有新版本可用!');
  },
  onSuccess: (registration) => {
    // Service Worker激活成功的回调
    console.log('Service Worker激活成功!');
  }
});
```

### 2. 在React应用中集成

```tsx
import { ServiceWorkerProvider, useServiceWorkerContext } from '@fucking-react/cache';

// 在应用根组件中使用Provider
function App() {
  return (
    <ServiceWorkerProvider options={{ swPath: '/service-worker.js' }}>
      <Main />
    </ServiceWorkerProvider>
  );
}

// 在子组件中使用Service Worker状态
function Main() {
  const {
    status,
    updateAvailable,
    updateServiceWorker
  } = useServiceWorkerContext();

  return (
    <div>
      {/* 显示应用内容 */}

      {/* 当有更新可用时显示更新提示 */}
      {updateAvailable && (
        <div className="update-toast">
          <p>有新版本可用!</p>
          <button onClick={updateServiceWorker}>立即更新</button>
        </div>
      )}
    </div>
  );
}
```

### 3. 使用Vite插件自动生成Service Worker

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteServiceWorker } from '@fucking-react/cache';

export default defineConfig({
  plugins: [
    react(),
    viteServiceWorker({
      cacheName: 'my-app-cache',
      version: '1.0.0',
      precacheAssets: [
        '/index.html',
        '/manifest.json',
        '/favicon.ico'
      ],
      enableNavigationPreload: true,
      generateOfflinePage: true
    })
  ]
});
```

## 高级用法

### 自定义缓存策略

```typescript
import {
  cacheFirst,
  networkFirst,
  staleWhileRevalidate
} from '@fucking-react/cache';

// 在Service Worker文件中使用
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 静态资源使用缓存优先策略
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
    event.respondWith(
      cacheFirst(event.request, {
        cacheName: 'static-assets',
        maxAgeMs: 30 * 24 * 60 * 60 * 1000 // 30天
      })
    );
    return;
  }

  // API请求使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirst(event.request, {
        cacheName: 'api-cache',
        networkTimeoutMs: 3000 // 3秒超时
      })
    );
    return;
  }

  // HTML页面使用Stale-While-Revalidate策略
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      staleWhileRevalidate(event.request, {
        cacheName: 'pages-cache',
        maxAgeMs: 60 * 60 * 1000 // 1小时
      })
    );
    return;
  }
});
```

### 缓存管理

```typescript
import { CacheManager } from '@fucking-react/cache';

// 创建缓存管理器实例
const cacheManager = new CacheManager({
  cacheName: 'my-app-cache',
  maxEntries: 100, // 最多缓存100个条目
  maxAgeMs: 7 * 24 * 60 * 60 * 1000 // 7天过期
});

// 手动预缓存资源
await cacheManager.precache([
  { url: '/index.html', revision: '123' },
  { url: '/main.js', revision: '456' },
  { url: '/styles.css', revision: '789' }
]);

// 清理过期缓存
await cacheManager.cleanExpiredItems();

// 获取缓存统计信息
const stats = await cacheManager.getStats();
console.log(`缓存大小: ${stats.size} 字节`);
console.log(`缓存条目数: ${stats.items.length}`);
```

### 消息通信

```typescript
import { sendMessage, listenForMessages, MessageType } from '@fucking-react/cache';

// 发送消息到Service Worker
await sendMessage({
  type: MessageType.SKIP_WAITING,
  payload: { timestamp: Date.now() }
});

// 监听来自Service Worker的消息
const unsubscribe = listenForMessages((message) => {
  if (message.type === MessageType.CACHE_UPDATED) {
    console.log('缓存已更新:', message.payload);
  }
});

// 取消监听
unsubscribe();
```

### 在Service Worker中处理消息

```typescript
import { ServiceWorkerMessageHandler, MessageType } from '@fucking-react/cache';

// 创建消息处理器
const messageHandler = new ServiceWorkerMessageHandler();

// 注册自定义消息处理器
messageHandler.registerHandler(MessageType.CACHE_STATS, async () => {
  const cache = await caches.open('my-app-cache');
  const keys = await cache.keys();
  return { count: keys.length };
});

// 初始化消息监听
messageHandler.init();

// 广播消息到所有客户端
await messageHandler.broadcast({
  type: MessageType.CACHE_UPDATED,
  payload: { updatedAt: Date.now() }
});
```

## API参考

### 核心API

- `registerServiceWorker(options)`: 注册Service Worker
- `unregisterServiceWorker()`: 注销Service Worker
- `createServiceWorkerTemplate(options)`: 创建Service Worker脚本模板

### 缓存策略

- `cacheFirst(request, options)`: 缓存优先策略
- `networkFirst(request, options)`: 网络优先策略
- `staleWhileRevalidate(request, options)`: 先返回缓存，后台更新策略
- `cacheOnly(request, options)`: 仅缓存策略
- `networkOnly(request, options)`: 仅网络策略

### React Hooks

- `useServiceWorker(options)`: Service Worker状态管理Hook
- `ServiceWorkerProvider`: Service Worker上下文提供者
- `useServiceWorkerContext()`: 获取Service Worker上下文

### 工具函数

- `sendMessage(message)`: 发送消息到Service Worker
- `listenForMessages(callback)`: 监听来自Service Worker的消息
- `skipWaiting()`: 请求Service Worker跳过等待阶段
- `checkForUpdates()`: 检查Service Worker更新
- `getCacheStats()`: 获取缓存统计信息

### Vite插件

- `viteServiceWorker(options)`: 创建Vite Service Worker插件

## 最佳实践

1. **预缓存关键资源**：使用预缓存功能缓存应用的核心资源，如HTML、核心JS和CSS文件。

2. **选择合适的缓存策略**：
   - 静态资源（JS、CSS、图片等）：使用`cacheFirst`策略
   - API请求：使用`networkFirst`或`staleWhileRevalidate`策略
   - HTML入口文件：使用`networkFirst`策略，确保用户获取最新版本

3. **版本控制**：为缓存名称添加版本号，方便在新版本发布时清理旧缓存。

4. **提供离线页面**：使用`generateOfflinePage`选项生成离线页面，提升用户体验。

5. **更新提示**：在检测到新版本时，使用React组件提示用户刷新页面。

## 常见问题

### Service Worker不更新怎么办？

确保在Service Worker的`activate`事件中调用`self.clients.claim()`，并在注册时设置`autoSkipWaiting: true`选项。

### 如何调试Service Worker？

使用Chrome DevTools的Application标签页，可以查看Service Worker状态、缓存内容和注册信息。

### 如何在开发环境中禁用Service Worker？

在注册时设置`enableInDev: false`选项，或在Vite插件中设置相同选项。

### 缓存过大怎么办？

使用`maxEntries`和`maxAgeMs`选项限制缓存大小和过期时间，并定期调用`cleanExpiredItems()`方法清理过期缓存。

## 许可证

MIT
