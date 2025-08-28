/**
 * 跳表模块导出
 * 统一导出跳表相关的所有组件和工具
 */

// 核心算法实现
export { SkipList, SkipListNode } from '../../../../../libs/algorithm/src/SkipList/al/SkipList';

// 可视化组件
export { default as SkipListVisualizer } from '../visualizer/SkipListVisualizer';

// UI 组件
export { default as SkipListConfigPanel } from '../components/SkipListConfigPanel';
export { default as SkipListDemo } from '../components/SkipListDemo';

// 工具函数
export * from '../tools/skipListUtils';

// 主页面组件
export { default as SkipListPage } from '../index';

// 类型定义
export interface SkipListConfig {
  maxLevel: number;
  probability: number;
  nodeColor: string;
  linkColor: string;
  highlightColor: string;
  animationSpeed: number;
}

export interface SkipListVisualizationProps {
  skipList: any; // SkipList<number>
  config: SkipListConfig;
  highlightedNodes: Set<number>;
  updatePath: any[]; // SkipListNode<number>[]
  isAnimating: boolean;
}

// 常量定义
export const DEFAULT_SKIP_LIST_CONFIG: SkipListConfig = {
  maxLevel: 16,
  probability: 0.5,
  nodeColor: '#1890ff',
  linkColor: '#d9d9d9',
  highlightColor: '#ff4d4f',
  animationSpeed: 1000,
};

export const SKIP_LIST_PRESETS = {
  default: {
    maxLevel: 16,
    probability: 0.5,
    nodeColor: '#1890ff',
    linkColor: '#d9d9d9',
    highlightColor: '#ff4d4f',
    animationSpeed: 1000,
  },
  teaching: {
    maxLevel: 8,
    probability: 0.25,
    nodeColor: '#52c41a',
    linkColor: '#b7eb8f',
    highlightColor: '#faad14',
    animationSpeed: 1500,
  },
  performance: {
    maxLevel: 24,
    probability: 0.75,
    nodeColor: '#722ed1',
    linkColor: '#d3adf7',
    highlightColor: '#eb2f96',
    animationSpeed: 500,
  },
};

// 工具函数
export const createSkipList = (maxLevel: number = 16, probability: number = 0.5) => {
  return new SkipList<number>(maxLevel, probability);
};

export const createSkipListWithData = (data: number[], maxLevel: number = 16, probability: number = 0.5) => {
  const skipList = new SkipList<number>(maxLevel, probability);
  data.forEach(value => skipList.insert(value));
  return skipList;
};