// 导出类型定义，供组件使用
export type NodeId = string | number;

export interface LinkNode {
  val: number;
  next: LinkNode | null;
}

export interface LinkTableType {
  head: LinkNode | null;
  tail: LinkNode | null;
  length: number;
  isCircular: boolean;
  isDoubly: boolean;
  isSingly: boolean;
}
