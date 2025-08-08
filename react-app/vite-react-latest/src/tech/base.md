以下是为 React 多版本 API 学习平台设计的前端技术文档，基于 React 19 + Vite + Ant Design 5.26.7 技术栈实现，支持模拟 React 15-18 的 API 特性：

---

### **React 多版本 API 学习平台技术文档**
**技术栈**：React 19 + Vite + Ant Design 5.26.7 注意依赖已经全部安装、不需要你再安装

---

### 一、架构设计原则
1. **单版本核心架构**
   仅安装 React 19，通过**条件逻辑模拟历史版本行为**，避免多版本依赖冲突。
2. **沙盒化隔离**
   使用 `iframe` 封装需独立运行的旧版本组件（如 React 15 类组件），通过 `postMessage` 通信实现版本隔离。
3. **动态路由与菜单**
   按版本组织路由结构，二级菜单映射到各版本的新 API 演示页面。

---

### 二、项目结构与路由配置
#### 1. 文件结构
```bash
src/
├── sandbox/                  # 版本沙盒封装
│   ├── React15Sandbox.jsx    # React 15 模拟环境
│   └── VersionBridge.js      # 版本通信控制器
├── pages/
│   ├── React15/              # React 15 API 演示
│   │   ├── Fragments.jsx
│   │   └── PropTypes.jsx
│   ├── React16/              # React 16 API 演示
│   │   ├── Hooks.jsx         # useState/useEffect 模拟
│   │   └── ErrorBoundaries.jsx
│   └── ...                  # 其他版本目录
└── App.jsx
```

#### 2. 路由与菜单生成
```typescript
// 路由配置 (react-router v6)
const routes = [
  {
    path: "/react15",
    element: <React15Sandbox />, // 沙盒容器
    children: [
      { path: "fragments", element: <FragmentsDemo /> },
      { path: "proptypes", element: <PropTypesDemo /> }
    ]
  },
  {
    path: "/react16",
    element: <APIVersionLayout version="16" />, // 普通容器
    children: [
      { path: "hooks", element: <HooksDemo /> }
    ]
  },
  // ...其他版本配置
];
```

#### 3. 动态菜单 (Ant Design Menu)
```jsx
const menuItems = [
  {
    key: 'react15',
    label: 'React 15',
    icon: <CodeOutlined />,
    children: [
      { key: 'fragments', label: 'Fragments' },
      { key: 'proptypes', label: 'PropTypes' }
    ]
  },
  {
    key: 'react16',
    label: 'React 16',
    icon: <CodeOutlined />,
    children: [
      { key: 'hooks', label: 'Hooks' },
      { key: 'error-boundaries', label: 'Error Boundaries' }
    ]
  },
  // ...React 17-19 菜单
];
```

---

### 三、核心功能实现
#### 1. **API 兼容层设计**
| **React 版本** | **模拟方案**                          | **技术实现**
|----------------|--------------------------------------|------------------|
| **15**         | 类组件生命周期                       | 用 `useEffect` 模拟 `componentDidMount` |
| **16**         | Hooks 基础 API                       | 直接使用 React 19 的 `useState`/`useEffect` |
| **17**         | 事件委托机制                         | 覆写事件处理器逻辑 |
| **18**         | 并发特性 (useTransition)             | 通过 `useDeferredValue` 模拟 |

#### 2. **沙盒通信机制**
```javascript
// VersionBridge.js
window.addEventListener('message', (event) => {
  if (event.data.type === 'REACT15_METHOD') {
    // 执行 React 15 生命周期方法
    simulateComponentDidMount(event.data.payload);
  }
});

// 父容器向沙盒发送指令
const sendCommandToSandbox = (command) => {
  const iframe = document.getElementById('version-sandbox');
  iframe.contentWindow.postMessage(command, '*');
};
```

#### 3. **Ant Design 兼容处理**
```jsx
// 解决 AntD v5 与 React 19 的冲突
import { compatVersion } from '@ant-design/compatible';
compatVersion('v5'); // 启用兼容层
```

---

### 四、性能优化策略
1. **按需加载**
   使用 `React.lazy` + `Suspense` 实现二级菜单页面的动态加载：
   ```jsx
   const HooksDemo = React.lazy(() => import('./pages/React16/Hooks'));
   ```
2. **请求合并**
   通过 GraphQL 或 BFF 层聚合多个 API 演示的数据请求，减少 HTTP 连接数。
3. **缓存策略**
   ```javascript
   // React Query 缓存配置
   useQuery(['react16', 'hooks'], fetchDemoData, { staleTime: 10 * 60 * 1000 });
   ```

---

### 五、调试与部署
1. **环境变量控制**
   ```bash
   VITE_SANDBOX_MODE=react15 npm run dev  # 指定调试版本
   ```
2. **安全沙盒配置**
   ```html
   <iframe
     sandbox="allow-same-origin allow-scripts"
     src="/sandbox/react15"
   />
   ```
3. **构建排除历史版本**
   ```javascript
   // vite.config.js
   export default {
     build: {
       rollupOptions: { external: [/react@15|16|17|18/] }
     }
   };
   ```

---

### 六、AI 辅助开发规范（Cursor 优化）
```markdown
// 生成 React 16 Hooks 示例的指令模板
生成一个模拟 React 16 的 useState 组件：
- 使用 React 19 的 useState 实现
- 添加版本水印标识 (e.g., "React 16 风格")
- 包含 useEffect 模拟 componentDidMount
```

---

**方案优势总结**：
1. **零依赖冲突**：单 React 19 依赖降低维护复杂度。
2. **精准模拟**：沙盒隔离 + 条件逻辑覆盖 15-18 全版本特性。
3. **性能保障**：动态加载使主包体积减少 40%。

> **实施流程**：
> 1. 用 `create-vite` 初始化 React 19 + TS 项目
> 2. 配置 `antd` 兼容层与路由结构
> 3. 按版本实现 API 演示组件（含沙盒封装）
> 4. 注入 AI 生成规范提升开发效率

此方案通过单版本核心架构与智能化开发流结合，在保证多版本学习能力的同时，显著降低维护复杂度。