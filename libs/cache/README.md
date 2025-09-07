# web-cache

前端web缓存方案集合，提供多种缓存策略和实现方式。

## 安装

```bash
npm install web-cache
```

## 子包

### service-work

增强版Service Worker缓存方案，提供高度可配置的缓存策略、生命周期管理和与React集成的工具。

```bash
# 安装子包
npm install web-service-work
```

或者通过主包引入：

```javascript
import { serviceWork } from 'web-cache';
```

详细使用方法请查看 [service-work 文档](./src/service-work/README.md)。

## 特性

- 多种缓存策略
- 支持离线访问
- 与React集成
- 类型安全

## 使用示例

```javascript
// 导入service-work子包
import { serviceWork } from 'web-cache';

// 注册Service Worker
serviceWork.registerServiceWorker({
  swPath: '/service-worker.js',
  onUpdate: (registration) => {
    console.log('有新版本可用!');
  },
  onSuccess: (registration) => {
    console.log('Service Worker激活成功!');
  }
});
```

## 许可证

ISC
