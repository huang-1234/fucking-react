import React from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';

/**
 * 树节点数据
 */
export interface TreeNode<T = any> {
  /**
   * 节点键
   */
  key: string;

  /**
   * 节点标题
   */
  title: React.ReactNode;

  /**
   * 节点值
   */
  value?: T;

  /**
   * 节点优先级（用于优先队列）
   */
  priority?: number;

  /**
   * 子节点
   */
  children?: TreeNode<T>[];

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 是否可选择
   */
  selectable?: boolean;

  /**
   * 是否可展开/收起
   */
  isLeaf?: boolean;

  /**
   * 是否高亮
   */
  isHighlighted?: boolean;
}

/**
 * 树可视化组件的属性
 */
export interface TreeVisualizationProps<T = any> {
  /**
   * 树节点数据
   */
  treeData: TreeNode<T>[];

  /**
   * 默认展开的节点键
   */
  defaultExpandedKeys?: string[];

  /**
   * 默认选中的节点键
   */
  defaultSelectedKeys?: string[];

  /**
   * 是否显示连接线
   */
  showLine?: boolean;

  /**
   * 是否可选择
   */
  selectable?: boolean;

  /**
   * 是否可展开/收起
   */
  expandable?: boolean;

  /**
   * 节点选择回调
   */
  onSelect?: (selectedKeys: React.Key[], info: any) => void;

  /**
   * 节点展开/收起回调
   */
  onExpand?: (expandedKeys: React.Key[], info: any) => void;

  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 将TreeNode转换为Ant Design Tree所需的DataNode
 */
const convertToDataNode = <T extends any>(node: TreeNode<T>): DataNode => {
  const dataNode: DataNode = {
    key: node.key,
    title: node.title,
    disabled: node.disabled,
    selectable: node.selectable,
    isLeaf: node.isLeaf,
    className: node.isHighlighted ? 'highlighted-tree-node' : undefined,
  };

  if (node.children && node.children.length > 0) {
    dataNode.children = node.children.map(child => convertToDataNode(child));
  }

  return dataNode;
};

/**
 * 树可视化组件
 * 用于可视化树形结构，如二叉堆
 */
const TreeVisualization = <T extends any>({
  treeData,
  defaultExpandedKeys,
  defaultSelectedKeys,
  showLine = true,
  selectable = true,
  expandable = true,
  onSelect,
  onExpand,
  style = {}
}: TreeVisualizationProps<T>) => {
  // 将TreeNode数组转换为DataNode数组
  const antdTreeData = treeData.map(node => convertToDataNode(node));

  return (
    <div style={{
      padding: '20px 0',
      ...style
    }}>
      <style>{`
        .highlighted-tree-node > .ant-tree-node-content-wrapper {
          background-color: #fff2f0;
          color: #ff4d4f;
          font-weight: bold;
        }
      `}</style>
      <Tree
        treeData={antdTreeData}
        defaultExpandedKeys={defaultExpandedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        showLine={showLine ? { showLeafIcon: false } : false}
        selectable={selectable}
        blockNode
        onSelect={onSelect}
        onExpand={onExpand}
      />
    </div>
  );
};

export default React.memo(TreeVisualization);
