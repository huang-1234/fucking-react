import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SkipList, SkipListNode } from '@fucking-algorithm/algorithm/SkipList/al/SkipList';

interface SkipListConfig {
  maxLevel: number;
  probability: number;
  nodeColor: string;
  linkColor: string;
  highlightColor: string;
  animationSpeed: number;
}

interface SkipListVisualizerProps {
  skipList: SkipList<number>;
  config: SkipListConfig;
  highlightedNodes: Set<number>;
  updatePath: SkipListNode<number>[];
  isAnimating: boolean;
}

interface NodeData {
  value: number;
  level: number;
  x: number;
  y: number;
  id: string;
}

interface LinkData {
  source: NodeData;
  target: NodeData;
  level: number;
  id: string;
}

const SkipListVisualizer: React.FC<SkipListVisualizerProps> = ({
  skipList,
  config,
  highlightedNodes,
  updatePath,
  isAnimating,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // 计算布局数据
  const calculateLayout = (): { nodes: NodeData[]; links: LinkData[] } => {
    const levels = skipList.getLevels();
    const nodes: NodeData[] = [];
    const links: LinkData[] = [];

    const nodeSpacing = 80;
    const levelHeight = 60;
    const startX = 50;
    const startY = dimensions.height - 50;

    // 收集所有唯一的值
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
      const y = startY - actualLevel * levelHeight;

      level.forEach(({ node }) => {
        const x = startX + (valueToIndex.get(node.value) || 0) * nodeSpacing;
        nodes.push({
          value: node.value,
          level: actualLevel,
          x,
          y,
          id: `node-${node.value}-${actualLevel}`,
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
          });
        }
      }
    });

    return { nodes, links };
  };

  // 渲染可视化
  const renderVisualization = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = calculateLayout();

    // 创建主容器
    const container = svg.append('g').attr('class', 'skip-list-container');

    // 绘制层级标签
    const maxLevel = Math.max(...nodes.map(n => n.level), -1);
    for (let level = 0; level <= maxLevel; level++) {
      container
        .append('text')
        .attr('x', 10)
        .attr('y', dimensions.height - 50 - level * 60)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(`L${level}`);
    }

    // 绘制连接线
    const linkGroup = container.append('g').attr('class', 'links');

    linkGroup
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .style('stroke', config.linkColor)
      .style('stroke-width', 2)
      .style('opacity', 0.8);

    // 绘制节点
    const nodeGroup = container.append('g').attr('class', 'nodes');

    const nodeElements = nodeGroup
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // 节点圆圈
    nodeElements
      .append('circle')
      .attr('r', 20)
      .style('fill', d =>
        highlightedNodes.has(d.value) ? config.highlightColor : config.nodeColor
      )
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('opacity', 0.9);

    // 节点文本
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .text(d => d.value);

    // 添加动画效果
    if (isAnimating) {
      nodeElements
        .style('opacity', 0)
        .transition()
        .duration(config.animationSpeed / 2)
        .style('opacity', 1);

      linkGroup
        .selectAll('.link')
        .style('opacity', 0)
        .transition()
        .duration(config.animationSpeed / 2)
        .delay(config.animationSpeed / 4)
        .style('opacity', 0.8);
    }

    // 高亮更新路径
    if (updatePath.length > 0) {
      const pathValues = new Set(updatePath.map(node => node.value));

      nodeElements
        .selectAll('circle')
        .style('fill', (d) =>
          pathValues.has(d.value) ? config.highlightColor :
          highlightedNodes.has(d.value) ? config.highlightColor : config.nodeColor
        );
    }
  };

  // 监听尺寸变化
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          setDimensions({
            width: rect.width - 20,
            height: Math.max(400, rect.height - 20),
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 重新渲染
  useEffect(() => {
    renderVisualization();
  }, [skipList, config, highlightedNodes, updatePath, isAnimating, dimensions]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
          background: '#fafafa',
        }}
      />

      {/* 空状态提示 */}
      {skipList.isEmpty() && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          <div>跳表为空</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            请在右侧输入数字并点击"插入"按钮添加节点
          </div>
        </div>
      )}

      {/* 图例 */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '11px',
          border: '1px solid #e8e8e8',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: config.nodeColor,
              borderRadius: '50%',
              marginRight: '6px',
              verticalAlign: 'middle',
            }}
          />
          普通节点
        </div>
        <div>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: config.highlightColor,
              borderRadius: '50%',
              marginRight: '6px',
              verticalAlign: 'middle',
            }}
          />
          高亮节点
        </div>
      </div>

      {/* 性能提示 */}
      {skipList.getSize() > 50 && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(255, 193, 7, 0.1)',
            color: '#fa8c16',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            border: '1px solid #ffd666',
          }}
        >
          节点较多，可能影响渲染性能
        </div>
      )}
    </div>
  );
};

export default React.memo(SkipListVisualizer);