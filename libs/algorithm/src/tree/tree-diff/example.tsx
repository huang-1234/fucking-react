import React from 'react';
import DiffView from './diff-view';

const treeA = {
  root: {
    id: 'root',
    props: { title: '商品卡片' },
    children: [
      {
        id: 'price',
        props: { title: '价格', value: 99, color: 'black' }
      },
      {
        id: 'title',
        props: { title: '标题', text: '示例商品' }
      }
    ]
  }
};

const treeB = {
  root: {
    id: 'root',
    props: { title: '商品卡片' },
    children: [
      {
        id: 'price',
        props: { title: '价格', value: 199, color: 'red' }
      },
      {
        id: 'stock',
        props: { title: '库存', count: 100 }
      }
    ]
  }
};

const Example: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>树形结构对比示例</h2>
      <DiffView treeA={treeA} treeB={treeB} />
    </div>
  );
};

export default Example;