import { SkipList, SkipListNode } from '@fucking-algorithm/algorithm/SkipList/al/SkipList';

/**
 * 跳表可视化工具函数
 */

export interface VisualizationNode {
  value: number;
  level: number;
  x: number;
  y: number;
  id: string;
  isHighlighted?: boolean;
  isInPath?: boolean;
}

export interface VisualizationLink {
  source: VisualizationNode;
  target: VisualizationNode;
  level: number;
  id: string;
  isHighlighted?: boolean;
}

export interface LayoutConfig {
  nodeSpacing: number;
  levelHeight: number;
  startX: number;
  startY: number;
  nodeRadius: number;
}

/**
 * 计算跳表的可视化布局
 */
export function calculateSkipListLayout(
  skipList: SkipList<number>,
  config: LayoutConfig,
  highlightedNodes: Set<number> = new Set(),
  pathNodes: Set<number> = new Set()
): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
  const levels = skipList.getLevels();
  const nodes: VisualizationNode[] = [];
  const links: VisualizationLink[] = [];

  if (levels.length === 0) {
    return { nodes, links };
  }

  // 收集所有唯一的值并排序
  const allValues = new Set<number>();
  levels.forEach(level => {
    level.forEach(({ node }) => {
      allValues.add(node.value);
    });
  });

  const sortedValues = Array.from(allValues).sort((a, b) => a - b);
  const valueToIndex = new Map(sortedValues.map((value, index) => [value, index]));

  // 创建节点
  levels.forEach((level, levelIndex) => {
    const actualLevel = levels.length - 1 - levelIndex;
    const y = config.startY - actualLevel * config.levelHeight;

    level.forEach(({ node }) => {
      const x = config.startX + (valueToIndex.get(node.value) || 0) * config.nodeSpacing;
      nodes.push({
        value: node.value,
        level: actualLevel,
        x,
        y,
        id: `node-${node.value}-${actualLevel}`,
        isHighlighted: highlightedNodes.has(node.value),
        isInPath: pathNodes.has(node.value),
      });
    });
  });

  // 创建连接线
  levels.forEach((level, levelIndex) => {
    const actualLevel = levels.length - 1 - levelIndex;

    for (let i = 0; i < level.length - 1; i++) {
      const sourceValue = level[i].node.value;
      const targetValue = level[i + 1].node.value;

      const sourceNode = nodes.find(n => n.value === sourceValue && n.level === actualLevel);
      const targetNode = nodes.find(n => n.value === targetValue && n.level === actualLevel);

      if (sourceNode && targetNode) {
        links.push({
          source: sourceNode,
          target: targetNode,
          level: actualLevel,
          id: `link-${sourceValue}-${targetValue}-${actualLevel}`,
          isHighlighted: highlightedNodes.has(sourceValue) || highlightedNodes.has(targetValue),
        });
      }
    }
  });

  return { nodes, links };
}

/**
 * 生成随机测试数据
 */
export function generateRandomData(count: number, min: number = 1, max: number = 100): number[] {
  const data: number[] = [];
  const used = new Set<number>();

  while (data.length < count && used.size < (max - min + 1)) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!used.has(value)) {
      used.add(value);
      data.push(value);
    }
  }

  return data;
}

/**
 * 计算跳表的统计信息
 */
export function calculateSkipListStats(skipList: SkipList<number>) {
  const levels = skipList.getLevels();
  const totalNodes = skipList.getSize();
  const currentLevel = skipList.getCurrentLevel();
  const maxLevel = skipList.getMaxLevel();

  // 计算每层的节点数
  const levelCounts = levels.map(level => level.length);

  // 计算平均层数
  let totalLevels = 0;
  levels.forEach((level, index) => {
    const actualLevel = levels.length - index;
    totalLevels += level.length * actualLevel;
  });
  const averageLevel = totalNodes > 0 ? totalLevels / totalNodes : 0;

  // 计算空间效率
  const totalPointers = levels.reduce((sum, level, index) => {
    const actualLevel = levels.length - index;
    return sum + level.length * actualLevel;
  }, 0);
  const spaceEfficiency = totalNodes > 0 ? totalNodes / totalPointers : 0;

  return {
    totalNodes,
    currentLevel: currentLevel + 1,
    maxLevel,
    levelCounts,
    averageLevel: Math.round(averageLevel * 100) / 100,
    spaceEfficiency: Math.round(spaceEfficiency * 100) / 100,
    data: skipList.toArray(),
  };
}

/**
 * 验证跳表的正确性
 */
export function validateSkipList(skipList: SkipList<number>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = skipList.toArray();

  // 检查数据是否有序
  for (let i = 1; i < data.length; i++) {
    if (data[i] <= data[i - 1]) {
      errors.push(`数据不是有序的: ${data[i - 1]} >= ${data[i]} at index ${i}`);
    }
  }

  // 检查是否有重复数据
  const uniqueData = new Set(data);
  if (uniqueData.size !== data.length) {
    errors.push('存在重复数据');
  }

  // 检查层级结构
  const levels = skipList.getLevels();
  if (levels.length > 0) {
    const bottomLevel = levels[levels.length - 1];
    const bottomValues = bottomLevel.map(({ node }) => node.value).sort((a, b) => a - b);

    if (JSON.stringify(bottomValues) !== JSON.stringify(data)) {
      errors.push('底层数据与toArray()结果不一致');
    }

    // 检查上层是否是下层的子集
    for (let i = 0; i < levels.length - 1; i++) {
      const upperLevel = levels[i].map(({ node }) => node.value);
      const lowerLevel = levels[i + 1].map(({ node }) => node.value);

      for (const value of upperLevel) {
        if (!lowerLevel.includes(value)) {
          errors.push(`第${levels.length - i - 1}层包含不在下层的值: ${value}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 性能测试工具
 */
export function performanceTest(skipList: SkipList<number>, operations: number = 1000) {
  const results = {
    insertTime: 0,
    searchTime: 0,
    deleteTime: 0,
  };

  // 准备测试数据
  const testData = generateRandomData(operations, 1, operations * 10);

  // 测试插入性能
  const insertStart = performance.now();
  testData.forEach(value => skipList.insert(value));
  results.insertTime = performance.now() - insertStart;

  // 测试搜索性能
  const searchStart = performance.now();
  testData.forEach(value => skipList.search(value));
  results.searchTime = performance.now() - searchStart;

  // 测试删除性能
  const deleteStart = performance.now();
  testData.slice(0, operations / 2).forEach(value => skipList.delete(value));
  results.deleteTime = performance.now() - deleteStart;

  return {
    operations,
    insertTime: Math.round(results.insertTime * 100) / 100,
    searchTime: Math.round(results.searchTime * 100) / 100,
    deleteTime: Math.round(results.deleteTime * 100) / 100,
    insertOpsPerMs: Math.round((operations / results.insertTime) * 100) / 100,
    searchOpsPerMs: Math.round((operations / results.searchTime) * 100) / 100,
    deleteOpsPerMs: Math.round((operations / 2 / results.deleteTime) * 100) / 100,
  };
}

/**
 * 导出跳表数据为JSON
 */
export function exportSkipListData(skipList: SkipList<number>) {
  return {
    timestamp: new Date().toISOString(),
    config: {
      maxLevel: skipList.getMaxLevel(),
      currentLevel: skipList.getCurrentLevel(),
      size: skipList.getSize(),
    },
    data: skipList.toArray(),
    levels: skipList.getLevels().map((level, index) => ({
      level: skipList.getLevels().length - index - 1,
      nodes: level.map(({ node }) => node.value),
    })),
    serialized: skipList.serialize(),
  };
}

/**
 * 从JSON导入跳表数据
 */
export function importSkipListData(skipList: SkipList<number>, jsonData: any) {
  try {
    if (jsonData.serialized) {
      skipList.deserialize(jsonData.serialized);
      return { success: true, message: '导入成功' };
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      skipList.clear();
      jsonData.data.forEach((value: number) => {
        skipList.insert(value);
      });
      return { success: true, message: '导入成功' };
    } else {
      return { success: false, message: '无效的数据格式' };
    }
  } catch (error) {
    return { success: false, message: `导入失败: ${error}` };
  }
}