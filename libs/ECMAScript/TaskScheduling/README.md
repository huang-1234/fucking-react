# 任务调度器模块集合

这个模块集合提供了多种任务调度器，用于处理不同场景下的异步任务调度需求。

## 模块列表

1. **AsyncController** - 异步控制器
   - 支持动态调整并发量
   - 支持顺序返回结果
   - 适用于大量异步任务的批处理

2. **DynamicPriorityScheduler** - 动态优先级调度器
   - 支持任务优先级随等待时间动态提升
   - 防止低优先级任务饥饿
   - 适用于需要平衡响应时间和优先级的场景

3. **DualQueueScheduler** - 双队列调度器
   - 支持普通任务和紧急任务分开调度
   - 紧急任务优先执行
   - 适用于有明确优先级区分的场景

4. **PriorityScheduler** - 优先级调度器
   - 支持按优先级排序任务
   - 支持自定义优先级
   - 适用于需要精细控制任务执行顺序的场景

## 使用方法

### 安装依赖

```bash
npm install
```

### 导入模块

```javascript
// 导入特定调度器
import { AsyncController } from './TaskScheduling';
import { DynamicPriorityScheduler } from './TaskScheduling';
import { DualQueueScheduler } from './TaskScheduling';
import { PriorityScheduler } from './TaskScheduling';

// 或导入所有模块
import * as TaskSchedulers from './TaskScheduling';
```

### 运行示例

```javascript
// 运行单个示例
import { runAsyncControllerExample } from './TaskScheduling';
runAsyncControllerExample();

// 或运行所有示例
import { runAllExamples } from './TaskScheduling';
runAllExamples();
```

## 调试功能

所有调度器都支持调试模式，可以在创建调度器时开启：

```javascript
const scheduler = new AsyncController({ debug: true });
const priorityScheduler = new PriorityScheduler({ concurrency: 4, debug: true });
const dualQueue = new DualQueueScheduler({ debug: true });
const dynamicScheduler = new DynamicPriorityScheduler({ debug: true });
```

## 测试

使用Vitest进行测试：

```bash
npm test
```

## 特性比较

| 调度器 | 优先级支持 | 并发控制 | 动态调整 | 适用场景 |
|-------|-----------|---------|---------|---------|
| AsyncController | ❌ | ✅ | ✅ | 大批量任务处理 |
| DynamicPriorityScheduler | ✅ | ✅ | ✅ | 长时间运行的任务队列 |
| DualQueueScheduler | ✅ (两级) | ✅ | ❌ | 有紧急任务的场景 |
| PriorityScheduler | ✅ | ✅ | ❌ | 需要精细优先级控制 |
