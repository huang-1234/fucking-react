# web-cache 使用指南

## 安装

### 安装主包

```bash
# 安装最新正式版
npm install web-cache

# 安装最新测试版
npm install web-cache@beta

# 安装最新预览版
npm install web-cache@alpha

# 安装最新内部版
npm install web-cache@inner
```

### 安装子包

```bash
# 安装最新正式版
npm install web-service-work

# 安装最新测试版
npm install web-service-work@beta

# 安装最新预览版
npm install web-service-work@alpha

# 安装最新内部版
npm install web-service-work@inner
```

## 使用方式

### 通过主包使用

```javascript
// 导入主包
import { serviceWork } from 'web-cache';

// 注册Service Worker
serviceWork.registerServiceWorker({
  swPath: '/service-worker.js',
  onUpdate: (registration) => {
    console.log('有新版本可用!');
  }
});
```

### 直接使用子包

```javascript
// 直接导入子包
import { registerServiceWorker } from 'web-service-work';

// 注册Service Worker
registerServiceWorker({
  swPath: '/service-worker.js',
  onUpdate: (registration) => {
    console.log('有新版本可用!');
  }
});
```

### 在React应用中使用

```jsx
import { ServiceWorkerProvider, useServiceWorkerContext } from 'web-service-work';
// 或者
// import { serviceWork } from 'web-cache';
// const { ServiceWorkerProvider, useServiceWorkerContext } = serviceWork;

function App() {
  return (
    <ServiceWorkerProvider options={{ swPath: '/service-worker.js' }}>
      <Main />
    </ServiceWorkerProvider>
  );
}

function Main() {
  const { status, updateAvailable, updateServiceWorker } = useServiceWorkerContext();

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

## 版本说明

- **latest**: 正式版本，稳定可靠
- **beta**: 测试版本，包含新功能，但可能存在一些问题
- **alpha**: 预览版本，包含最新功能，但不稳定
- **inner**: 内部版本，用于特定客户或场景

## 版本查看

查看当前安装的版本：

```bash
npm list web-cache
# 或
npm list web-service-work
```

查看npm上可用的版本：

```bash
npm view web-cache versions
# 或
npm view web-service-work versions
```

查看不同标签对应的版本：

```bash
npm view web-cache dist-tags
# 或
npm view web-service-work dist-tags
```
