// packages/Reconciler/src/fiber.ts
import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag, HostRoot } from './workTags';
import { NoFlags, Flags } from './fiberFlags';

export class FiberNode {
	tag: WorkTag;
	key: Key;
	stateNode: any;
	type: any;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;
	ref: Ref;
	pendingProps: Props;
	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 类型
		this.tag = tag;
		this.key = key;
		this.ref = null;
		this.stateNode = null; // 节点对应的实际 DOM 节点或组件实例
		this.type = null; // 节点的类型，可以是原生 DOM 元素、函数组件或类组件等

		// 构成树状结构
		this.return = null; // 指向节点的父节点
		this.sibling = null; // 指向节点的下一个兄弟节点
		this.child = null; // 指向节点的第一个子节点
		this.index = 0; // 索引

		// 作为工作单元
		this.pendingProps = pendingProps; // 表示节点的新属性，用于在协调过程中进行更新
		this.memoizedProps = null; // 已经更新完的属性
		this.memoizedState = null; // 更新完成后新的 State

		this.alternate = null; // 指向节点的备份节点，用于在协调过程中进行比较
		this.flags = NoFlags; // 表示节点的副作用类型，如更新、插入、删除等
		this.subtreeFlags = NoFlags; // 表示子节点的副作用类型，如更新、插入、删除等
		this.updateQueue = null; // 更新计划队列
	}
}

// 创建工作中的Fiber节点
export function createWorkInProgress(current: FiberNode, pendingProps: Props): FiberNode {
	let workInProgress = current.alternate;

	if (workInProgress === null) {
		// 创建新的Fiber节点
		workInProgress = new FiberNode(
			current.tag,
			pendingProps,
			current.key
		);

		workInProgress.type = current.type;
		workInProgress.stateNode = current.stateNode;

		workInProgress.alternate = current;
		current.alternate = workInProgress;
	} else {
		// 复用现有Fiber节点
		workInProgress.pendingProps = pendingProps;
		workInProgress.type = current.type;
		workInProgress.flags = NoFlags;
		workInProgress.subtreeFlags = NoFlags;
	}

	// 复制字段
	workInProgress.child = current.child;
	workInProgress.memoizedProps = current.memoizedProps;
	workInProgress.memoizedState = current.memoizedState;
	workInProgress.updateQueue = current.updateQueue;
	workInProgress.sibling = current.sibling;
	workInProgress.index = current.index;

	return workInProgress;
}

// 创建HostRootFiber节点
export function createHostRootFiber(): FiberNode {
	return new FiberNode(HostRoot, {}, null);
}