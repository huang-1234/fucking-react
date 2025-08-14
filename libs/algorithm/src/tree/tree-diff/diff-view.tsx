import React, { useMemo } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { mergeProtocolTrees, type TreeNode, type TreeData } from './mergeProtocolTrees';

interface DiffViewProps {
  treeA: TreeData;
  treeB: TreeData;
}

const DiffView: React.FC<DiffViewProps> = ({ treeA, treeB }) => {
  const convertToAntdTree = (node: TreeNode): DataNode => {
    let titleColor = '#1677ff';
    if (node._status === 'added') titleColor = '#f5222d';
    else if (node._status === 'modified') titleColor = '#52c41a';

    return {
      key: node.id,
      title: (
        <span style={{ color: titleColor }}>
          {node?.props?.title} {node._status ? `(${node._status})` : ''}
        </span>
      ),
      children: node.children?.map(convertToAntdTree)
    };
  };

  // 使用mergeProtocolTrees合并树
  const { mergedTree } = useMemo(() => {
    const result = mergeProtocolTrees(treeA, treeB);
    return result;
  }, [treeA, treeB]);

  const antdTreeA = useMemo(() => [convertToAntdTree(treeA.root)], [treeA]);
  const antdTreeB = useMemo(() => [convertToAntdTree(treeB.root)], [treeB]);
  const antdMergedTree = useMemo(() => [convertToAntdTree(mergedTree.root)], [mergedTree]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <h3>Tree A</h3>
        <Tree treeData={antdTreeA} defaultExpandAll />
      </div>
      <div style={{ flex: 1 }}>
        <h3>Tree B</h3>
        <Tree treeData={antdTreeB} defaultExpandAll />
      </div>
      <div style={{ flex: 1 }}>
        <h3>Merged Tree</h3>
        <Tree treeData={antdMergedTree} defaultExpandAll />
      </div>
    </div>
  );
};

export default DiffView;