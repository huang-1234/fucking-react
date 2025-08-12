/**
 * 树节点基础类
 */
export class TreeNode<T> {
  val: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  // 可视化相关属性
  x: number = 0;      // x坐标
  y: number = 0;      // y坐标
  id: string = '';    // 节点唯一标识

  constructor(val: T) {
    this.val = val;
  }
}

/**
 * 堆操作类型枚举
 */
export enum HeapOperationType {
  INSERT = 'insert',
  EXTRACT = 'extract',
  SWAP = 'swap',
  HEAPIFY_UP = 'heapify_up',
  HEAPIFY_DOWN = 'heapify_down',
  BUILD_HEAP = 'build_heap'
}

/**
 * 堆操作日志接口
 */
export interface HeapOperation<T> {
  type: HeapOperationType;
  timestamp: number;
  description: string;
  value?: T;
  affectedNodes?: string[];  // 受影响的节点ID
  beforeState?: TreeNode<T> | null;
  afterState?: TreeNode<T> | null;
}

/**
 * 堆可视化回调接口
 */
export interface HeapVisualizationCallbacks<T> {
  onNodeAdded?: (node: TreeNode<T>) => void;
  onNodeRemoved?: (nodeId: string) => void;
  onNodesSwapped?: (node1Id: string, node2Id: string) => void;
  onHeapUpdated?: (root: TreeNode<T> | null) => void;
  onOperationLogged?: (operation: HeapOperation<T>) => void;
}