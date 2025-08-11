# React Reconciler 实现

这个包实现了React的协调器（Reconciler），负责处理React元素的更新并在内部构建虚拟DOM。

## 功能特点

- 基于Fiber架构实现的协调器
- 支持函数组件、宿主组件和文本节点
- 实现了深度优先遍历的工作循环
- 支持更新队列和批量更新

## 核心概念

### Fiber节点

Fiber节点是协调器的核心数据结构，用于构建协调树。每个Fiber节点包含以下重要字段：

- **tag**: 节点的类型（函数组件、宿主组件等）
- **key**: 节点的唯一标识
- **type**: 节点的类型（DOM元素、函数组件等）
- **stateNode**: 节点对应的实际DOM节点或组件实例
- **child**: 指向节点的第一个子节点
- **sibling**: 指向节点的下一个兄弟节点
- **return**: 指向节点的父节点
- **alternate**: 指向节点的备份节点，用于在协调过程中进行比较
- **flags**: 表示节点的副作用类型（更新、插入、删除等）

### 工作流程

Reconciler的工作流程是对Fiber树进行一次深度优先遍历：

1. **beginWork**: 处理当前Fiber节点，并返回子Fiber节点
2. **completeWork**: 处理当前Fiber节点的完成阶段，生成更新计划
3. **workLoop**: 深度优先遍历Fiber树，调用beginWork和completeWork

### 更新机制

更新机制基于更新队列实现：

1. 创建更新对象
2. 将更新对象加入更新队列
3. 调度更新
4. 处理更新队列，生成新的状态

## 使用方法

```javascript
import { createContainer, updateContainer } from 'react-reconciler';

// 创建容器
const container = document.getElementById('root');
const root = createContainer(container);

// 更新容器
const element = <App />;
updateContainer(element, root);
```

## 文件结构

- **fiber.ts**: 定义Fiber节点结构
- **workTags.ts**: 定义不同类型的工作单元
- **fiberFlags.ts**: 定义不同类型的副作用
- **workLoop.ts**: 实现工作循环
- **beginWork.ts**: 实现beginWork函数
- **completeWork.ts**: 实现completeWork函数
- **updateQueue.ts**: 实现更新队列
- **childFibers.ts**: 实现子节点协调
- **fiberReconciler.ts**: 实现Fiber协调器
- **fiberRoot.ts**: 定义FiberRootNode结构