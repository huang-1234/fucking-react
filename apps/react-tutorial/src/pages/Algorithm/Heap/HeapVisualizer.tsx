import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { TreeNode } from './base';
import './HeapVisualizer.css';

interface HeapVisualizerProps<T> {
  root: TreeNode<T> | null;
  width?: number;
  height?: number;
  nodeRadius?: number;
  animationDuration?: number;
  highlightedNodes?: string[];
  onNodeClick?: (node: TreeNode<T>) => void;
}

/**
 * 堆可视化组件
 */
export function HeapVisualizer<T>({
  root,
  width = 800,
  height = 600,
  nodeRadius = 30,
  animationDuration = 500,
  highlightedNodes = [],
  onNodeClick
}: HeapVisualizerProps<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<d3.HierarchyNode<TreeNode<T>>[]>([]);
  const [links, setLinks] = useState<d3.HierarchyLink<TreeNode<T>>[]>([]);

  // 将树结构转换为D3层次结构
  useEffect(() => {
    if (!root) {
      setNodes([]);
      setLinks([]);
      return;
    }

    // 将树结构转换为D3可用的层次结构
    const hierarchy = d3.hierarchy(root, node => {
      const children: TreeNode<T>[] = [];
      if (node.left) children.push(node.left);
      if (node.right) children.push(node.right);
      return children.length > 0 ? children : null;
    });

    // 计算树布局
    const treeLayout = d3.tree<TreeNode<T>>()
      .size([width - nodeRadius * 4, height - nodeRadius * 4])
      .nodeSize([nodeRadius * 3, nodeRadius * 5]);

    const treeData = treeLayout(hierarchy);

    // 更新节点和连线数据
    setNodes(treeData.descendants());
    setLinks(treeData.links());

    // 保存计算后的坐标到原始节点，用于动画
    treeData.descendants().forEach(d => {
      if (d.data) {
        d.data.x = d.x + width / 2;
        d.data.y = d.y + nodeRadius * 2;
      }
    });
  }, [root, width, height, nodeRadius]);

  // 渲染D3可视化
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);

    // 清除现有内容
    svg.selectAll("*").remove();

    // 创建根容器并添加缩放平移功能
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${nodeRadius * 2})`);

    // 添加缩放功能
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // 绘制连接线
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d => {
        const sourceY = d.source.y || 0;
        const targetY = d.target.y || 0;
        return `M${d.source.x},${sourceY}C${d.source.x},${(sourceY + targetY) / 2} ${d.target.x},${(sourceY + targetY) / 2} ${d.target.x},${targetY}`;
      });

    // 创建节点组
    const nodeGroups = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", d => {
        const isHighlighted = d.data.id && highlightedNodes.includes(d.data.id);
        return `node ${isHighlighted ? 'highlighted' : ''}`;
      })
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .on("click", (event, d) => {
        console.log('event', event);
        if (onNodeClick) {
          onNodeClick(d.data);
        }
      });

    // 添加节点圆形
    nodeGroups.append("circle")
      .attr("r", nodeRadius)
      .attr("class", d => {
        const isHighlighted = d.data.id && highlightedNodes.includes(d.data.id);
        return `node-circle ${isHighlighted ? 'highlighted' : ''}`;
      });

    // 添加节点文本
    nodeGroups.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(d => String(d.data.val))
      .attr("class", "node-text");

    // 添加节点索引/ID
    nodeGroups.append("text")
      .attr("dy", nodeRadius + 15)
      .attr("text-anchor", "middle")
      .text(d => d.data.id.replace('node-', ''))
      .attr("class", "node-id");

  }, [nodes, links, width, height, nodeRadius, highlightedNodes, onNodeClick]);

  // 节点交换动画
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || highlightedNodes.length !== 2) return;

    const svg = d3.select(svgRef.current);

    // 高亮显示节点
    svg.selectAll(".node")
      // @ts-ignore
      .filter((d: any) => {
        const node = d as d3.HierarchyNode<TreeNode<T>>;
        return node.data.id && highlightedNodes.includes(node.data.id);
      })
      .select("circle")
      .classed("highlighted", true);

  }, [highlightedNodes, nodes]);

  // use animationDuration
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll(".node").transition().duration(animationDuration).attr("transform", (d: any) => `translate(${d.x},${d.y})`);
  }, [nodes, animationDuration]);

  return (
    <div className="heap-visualizer">
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}